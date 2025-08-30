-- ============================================
-- Supabase Schema Update: Subscriptions & Credits
-- Apply this SQL in your Supabase SQL Editor
-- ============================================

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro')),
    start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_date TIMESTAMPTZ,
    payment_status TEXT DEFAULT 'active' CHECK (payment_status IN ('active', 'expired', 'cancelled', 'pending')),
    onepay_transaction_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create credits table
CREATE TABLE IF NOT EXISTS public.credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    available_credits INTEGER NOT NULL DEFAULT 100,
    used_credits INTEGER NOT NULL DEFAULT 0,
    reset_date TIMESTAMPTZ NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_user_id ON public.credits(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_type ON public.subscriptions(plan_type);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON public.subscriptions(end_date);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own credits" ON public.credits;
DROP POLICY IF EXISTS "Users can insert own credits" ON public.credits;
DROP POLICY IF EXISTS "Users can update own credits" ON public.credits;

-- RLS Policies for subscriptions table
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for credits table
CREATE POLICY "Users can view own credits" ON public.credits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits" ON public.credits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON public.credits
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert default subscription (free plan)
    INSERT INTO public.subscriptions (user_id, plan_type, start_date)
    VALUES (NEW.id, 'free', now())
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Insert default credits (100 credits)
    INSERT INTO public.credits (user_id, available_credits, used_credits, reset_date)
    VALUES (NEW.id, 100, 0, date_trunc('month', now()) + interval '1 month')
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
DROP TRIGGER IF EXISTS update_credits_updated_at ON public.credits;

-- Triggers for updated_at
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON public.subscriptions 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credits_updated_at 
    BEFORE UPDATE ON public.credits 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Migrate existing users (run after creating tables)
-- ============================================

-- Create default subscriptions and credits for existing users
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM auth.users LOOP
        -- Insert default subscription if not exists
        INSERT INTO public.subscriptions (user_id, plan_type, start_date)
        VALUES (user_record.id, 'free', now())
        ON CONFLICT DO NOTHING;
        
        -- Insert default credits if not exists
        INSERT INTO public.credits (user_id, available_credits, used_credits, reset_date)
        VALUES (user_record.id, 100, 0, date_trunc('month', now()) + interval '1 month')
        ON CONFLICT (user_id) DO NOTHING;
    END LOOP;
END $$;

-- ============================================
-- CRON JOB SETUP INSTRUCTIONS
-- ============================================
-- 
-- To set up the monthly credit reset, you need to:
-- 
-- 1. Install the pg_cron extension in Supabase:
--    Run: CREATE EXTENSION IF NOT EXISTS pg_cron;
-- 
-- 2. Schedule the monthly reset (runs on 1st of each month at 00:00 UTC):
--    Run the following command after deploying the reset-monthly-credits edge function:
-- 
--    SELECT cron.schedule(
--        'monthly-credit-reset',
--        '0 0 1 * *',
--        'SELECT net.http_post(
--            url:=''https://YOUR_PROJECT_ID.supabase.co/functions/v1/reset-monthly-credits'',
--            headers:=''{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}''::jsonb,
--            body:=''{}''::jsonb
--        );'
--    );
-- 
-- Replace YOUR_PROJECT_ID and YOUR_SERVICE_ROLE_KEY with your actual values.
-- 
-- Alternative: You can also trigger this function manually or via a webhook
-- by calling: POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/reset-monthly-credits
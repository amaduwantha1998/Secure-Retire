-- Create custom types for better data consistency
CREATE TYPE public.income_frequency AS ENUM ('weekly', 'biweekly', 'monthly', 'quarterly', 'annually');
CREATE TYPE public.asset_type AS ENUM ('checking', 'savings', 'investment', 'retirement', 'crypto', 'other');
CREATE TYPE public.property_type AS ENUM ('primary_residence', 'vacation_home', 'rental_property', 'land', 'commercial');
CREATE TYPE public.debt_type AS ENUM ('mortgage', 'credit_card', 'auto_loan', 'student_loan', 'personal_loan', 'other');
CREATE TYPE public.account_type AS ENUM ('401k', '403b', 'ira', 'roth_ira', 'pension', 'sep_ira', 'simple_ira');
CREATE TYPE public.document_type AS ENUM ('will', 'trust', 'insurance_policy', 'tax_return', 'bank_statement', 'investment_statement', 'other');
CREATE TYPE public.consultation_status AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled');
CREATE TYPE public.relationship_type AS ENUM ('spouse', 'child', 'parent', 'sibling', 'friend', 'other');

-- Create users table (extends auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    phone TEXT,
    full_name TEXT,
    date_of_birth DATE,
    ssn TEXT, -- Should be encrypted in production
    address JSONB, -- Store structured address data
    country TEXT DEFAULT 'US',
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create income_sources table
CREATE TABLE public.income_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    frequency income_frequency NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create assets table
CREATE TABLE public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type asset_type NOT NULL,
    institution_name TEXT,
    amount DECIMAL(15,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    account_number TEXT, -- Should be encrypted in production
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create properties table
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    property_type property_type NOT NULL,
    address JSONB NOT NULL,
    estimated_value DECIMAL(15,2),
    mortgage_balance DECIMAL(15,2) DEFAULT 0,
    mortgage_rate DECIMAL(5,3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create debts table
CREATE TABLE public.debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    debt_type debt_type NOT NULL,
    balance DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,3),
    monthly_payment DECIMAL(10,2),
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create retirement_savings table
CREATE TABLE public.retirement_savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    account_type account_type NOT NULL,
    institution_name TEXT,
    balance DECIMAL(15,2) NOT NULL,
    contribution_amount DECIMAL(10,2),
    contribution_frequency income_frequency,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create beneficiaries table
CREATE TABLE public.beneficiaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    relationship relationship_type NOT NULL,
    date_of_birth DATE,
    percentage DECIMAL(5,2) CHECK (percentage >= 0 AND percentage <= 100),
    is_primary BOOLEAN DEFAULT false,
    contact_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type document_type NOT NULL,
    file_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create consultations table
CREATE TABLE public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    consultant_id UUID, -- Could reference a consultants table later
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    status consultation_status DEFAULT 'scheduled',
    notes TEXT,
    meeting_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create settings table
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    notifications JSONB DEFAULT '{}',
    privacy JSONB DEFAULT '{}',
    language TEXT DEFAULT 'en',
    currency TEXT DEFAULT 'USD',
    accessibility JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id) -- One settings record per user
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retirement_savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for income_sources
CREATE POLICY "Users can view their own income sources" ON public.income_sources
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own income sources" ON public.income_sources
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own income sources" ON public.income_sources
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own income sources" ON public.income_sources
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for assets
CREATE POLICY "Users can view their own assets" ON public.assets
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own assets" ON public.assets
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own assets" ON public.assets
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own assets" ON public.assets
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for properties
CREATE POLICY "Users can view their own properties" ON public.properties
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own properties" ON public.properties
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own properties" ON public.properties
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own properties" ON public.properties
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for debts
CREATE POLICY "Users can view their own debts" ON public.debts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own debts" ON public.debts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own debts" ON public.debts
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own debts" ON public.debts
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for retirement_savings
CREATE POLICY "Users can view their own retirement savings" ON public.retirement_savings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own retirement savings" ON public.retirement_savings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own retirement savings" ON public.retirement_savings
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own retirement savings" ON public.retirement_savings
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for beneficiaries
CREATE POLICY "Users can view their own beneficiaries" ON public.beneficiaries
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own beneficiaries" ON public.beneficiaries
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own beneficiaries" ON public.beneficiaries
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own beneficiaries" ON public.beneficiaries
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for documents
CREATE POLICY "Users can view their own documents" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON public.documents
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON public.documents
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for consultations
CREATE POLICY "Users can view their own consultations" ON public.consultations
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own consultations" ON public.consultations
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own consultations" ON public.consultations
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own consultations" ON public.consultations
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for settings
CREATE POLICY "Users can view their own settings" ON public.settings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON public.settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.settings
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON public.settings
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance optimization
CREATE INDEX idx_income_sources_user_id ON public.income_sources(user_id);
CREATE INDEX idx_income_sources_created_at ON public.income_sources(created_at);
CREATE INDEX idx_assets_user_id ON public.assets(user_id);
CREATE INDEX idx_assets_created_at ON public.assets(created_at);
CREATE INDEX idx_properties_user_id ON public.properties(user_id);
CREATE INDEX idx_debts_user_id ON public.debts(user_id);
CREATE INDEX idx_retirement_savings_user_id ON public.retirement_savings(user_id);
CREATE INDEX idx_beneficiaries_user_id ON public.beneficiaries(user_id);
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_created_at ON public.documents(created_at);
CREATE INDEX idx_consultations_user_id ON public.consultations(user_id);
CREATE INDEX idx_consultations_date ON public.consultations(date);
CREATE INDEX idx_settings_user_id ON public.settings(user_id);

-- Partial indexes for frequently queried fields
CREATE INDEX idx_consultations_scheduled ON public.consultations(user_id, date) WHERE status = 'scheduled';
CREATE INDEX idx_beneficiaries_primary ON public.beneficiaries(user_id) WHERE is_primary = true;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_income_sources_updated_at BEFORE UPDATE ON public.income_sources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON public.debts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_retirement_savings_updated_at BEFORE UPDATE ON public.retirement_savings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_beneficiaries_updated_at BEFORE UPDATE ON public.beneficiaries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON public.consultations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create audit log table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (table_name, record_id, operation, old_data, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (table_name, record_id, operation, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (table_name, record_id, operation, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for users and documents tables
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_documents_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policy for audit_logs (users can only see their own audit logs)
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
    FOR SELECT USING (user_id = auth.uid());

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data ->> 'full_name'
    );
    
    -- Create default settings for new user
    INSERT INTO public.settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
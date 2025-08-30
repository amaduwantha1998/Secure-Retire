-- Create investment_options table for pre-curated investment products
CREATE TABLE public.investment_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('etf', 'bond', 'stock', 'mutual_fund', 'index_fund')),
  expense_ratio NUMERIC(5,4),
  asset_class TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'US',
  risk_level INTEGER CHECK (risk_level BETWEEN 1 AND 5),
  description TEXT,
  performance_1y NUMERIC(8,4),
  performance_3y NUMERIC(8,4),
  performance_5y NUMERIC(8,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create portfolio_allocations table for user portfolio management
CREATE TABLE public.portfolio_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_class TEXT NOT NULL,
  target_percentage NUMERIC(5,2) NOT NULL CHECK (target_percentage >= 0 AND target_percentage <= 100),
  current_percentage NUMERIC(5,2) DEFAULT 0,
  rebalance_threshold NUMERIC(5,2) DEFAULT 5.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create portfolio_performance table for tracking investment performance
CREATE TABLE public.portfolio_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  total_value NUMERIC(15,2) NOT NULL,
  daily_return NUMERIC(8,4),
  total_return NUMERIC(8,4),
  benchmark_return NUMERIC(8,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.investment_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_performance ENABLE ROW LEVEL SECURITY;

-- RLS policies for investment_options (public read access)
CREATE POLICY "Anyone can view investment options"
ON public.investment_options
FOR SELECT
USING (true);

-- RLS policies for portfolio_allocations
CREATE POLICY "Users can view their own portfolio allocations"
ON public.portfolio_allocations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolio allocations"
ON public.portfolio_allocations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio allocations"
ON public.portfolio_allocations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio allocations"
ON public.portfolio_allocations
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for portfolio_performance
CREATE POLICY "Users can view their own portfolio performance"
ON public.portfolio_performance
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolio performance"
ON public.portfolio_performance
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_investment_options_updated_at
BEFORE UPDATE ON public.investment_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_allocations_updated_at
BEFORE UPDATE ON public.portfolio_allocations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_investment_options_type ON public.investment_options(type);
CREATE INDEX idx_investment_options_region ON public.investment_options(region);
CREATE INDEX idx_investment_options_asset_class ON public.investment_options(asset_class);
CREATE INDEX idx_portfolio_allocations_user_id ON public.portfolio_allocations(user_id);
CREATE INDEX idx_portfolio_performance_user_id ON public.portfolio_performance(user_id);
CREATE INDEX idx_portfolio_performance_date ON public.portfolio_performance(date);

-- Insert sample investment options
INSERT INTO public.investment_options (symbol, name, type, expense_ratio, asset_class, region, risk_level, description, performance_1y, performance_3y, performance_5y) VALUES
('VTI', 'Vanguard Total Stock Market ETF', 'etf', 0.0003, 'US Equity', 'US', 3, 'Tracks the entire US stock market', 12.5, 10.2, 11.8),
('VXUS', 'Vanguard Total International Stock ETF', 'etf', 0.0008, 'International Equity', 'Global', 4, 'Tracks international developed and emerging markets', 8.9, 6.4, 7.2),
('BND', 'Vanguard Total Bond Market ETF', 'etf', 0.0003, 'Fixed Income', 'US', 2, 'Tracks the total US bond market', -2.1, 1.8, 2.4),
('VNQ', 'Vanguard Real Estate ETF', 'etf', 0.0012, 'Real Estate', 'US', 4, 'Tracks US real estate investment trusts', 15.2, 8.7, 9.1),
('VDC', 'Vanguard Consumer Staples ETF', 'etf', 0.0010, 'Consumer Staples', 'US', 2, 'Tracks consumer staples sector', 5.8, 7.3, 8.9),
('VGT', 'Vanguard Information Technology ETF', 'etf', 0.0010, 'Technology', 'US', 5, 'Tracks technology sector', 28.4, 15.6, 18.2),
('VTEB', 'Vanguard Tax-Exempt Bond ETF', 'etf', 0.0005, 'Municipal Bonds', 'US', 1, 'Tax-exempt municipal bonds', -1.8, 2.1, 2.9),
('VGIT', 'Vanguard Intermediate-Term Treasury ETF', 'etf', 0.0004, 'Government Bonds', 'US', 1, 'Intermediate-term US Treasury bonds', -3.2, 1.2, 2.1);
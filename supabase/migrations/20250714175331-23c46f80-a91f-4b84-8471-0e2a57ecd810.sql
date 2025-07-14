
-- Create finance_tracker table for monthly financial tracking
CREATE TABLE IF NOT EXISTS public.finance_tracker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month_year DATE NOT NULL, -- Store as first day of the month (e.g., 2024-01-01 for January 2024)
  monthly_salary NUMERIC NOT NULL DEFAULT 80000,
  loan_amount NUMERIC NOT NULL DEFAULT 300000, -- 3L or 3.5L
  loan_interest_rate NUMERIC NOT NULL DEFAULT 10.0, -- 10%
  loan_tenure_months INTEGER NOT NULL DEFAULT 12,
  monthly_emi NUMERIC NOT NULL DEFAULT 26375, -- Auto-calculated but stored
  cash_hdfc NUMERIC NOT NULL DEFAULT 0,
  cash_boi NUMERIC NOT NULL DEFAULT 0,
  credit_card_spent_idfc NUMERIC NOT NULL DEFAULT 0,
  bonus_income NUMERIC NOT NULL DEFAULT 0,
  available_funds_month NUMERIC NOT NULL DEFAULT 0, -- Auto-calculated
  cumulative_available NUMERIC NOT NULL DEFAULT 0, -- Auto-calculated
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(month_year) -- Ensure one record per month
);

-- Add RLS policies for the finance_tracker table
ALTER TABLE public.finance_tracker ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all users to manage finance data
CREATE POLICY "Allow all operations on finance_tracker" 
  ON public.finance_tracker 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create function to calculate EMI
CREATE OR REPLACE FUNCTION calculate_emi(
  principal NUMERIC,
  annual_rate NUMERIC,
  tenure_months INTEGER
) RETURNS NUMERIC AS $$
DECLARE
  monthly_rate NUMERIC;
  emi NUMERIC;
BEGIN
  monthly_rate := annual_rate / (12 * 100);
  
  IF monthly_rate = 0 THEN
    RETURN principal / tenure_months;
  END IF;
  
  emi := principal * monthly_rate * POWER(1 + monthly_rate, tenure_months) / 
         (POWER(1 + monthly_rate, tenure_months) - 1);
  
  RETURN ROUND(emi, 0);
END;
$$ LANGUAGE plpgsql;

-- Create function to update calculated fields
CREATE OR REPLACE FUNCTION update_finance_calculations()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate EMI
  NEW.monthly_emi := calculate_emi(NEW.loan_amount, NEW.loan_interest_rate, NEW.loan_tenure_months);
  
  -- Calculate available funds for this month
  NEW.available_funds_month := NEW.monthly_salary - NEW.monthly_emi + NEW.cash_hdfc + NEW.cash_boi - NEW.credit_card_spent_idfc + NEW.bonus_income;
  
  -- Calculate cumulative available (sum of all previous months + current)
  SELECT COALESCE(SUM(available_funds_month), 0) + NEW.available_funds_month
  INTO NEW.cumulative_available
  FROM finance_tracker 
  WHERE month_year < NEW.month_year;
  
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update calculations
CREATE TRIGGER finance_calculations_trigger
  BEFORE INSERT OR UPDATE ON finance_tracker
  FOR EACH ROW
  EXECUTE FUNCTION update_finance_calculations();

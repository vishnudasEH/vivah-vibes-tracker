
-- Create budget_items table for detailed budget tracking
CREATE TABLE IF NOT EXISTS public.budget_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL, -- 'Marriage at Mahal', 'Reception at Mahal', 'Engagement', 'Home Setup'
  item_name TEXT NOT NULL,
  budgeted_amount NUMERIC NOT NULL DEFAULT 0,
  actual_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planned', -- 'planned', 'pending', 'paid'
  notes TEXT,
  vendor_name TEXT,
  payment_mode TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for the budget_items table
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all users to manage budget items
CREATE POLICY "Allow all operations on budget_items" 
  ON public.budget_items 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Insert the pre-filled budget data
INSERT INTO public.budget_items (category, item_name, budgeted_amount) VALUES
-- Marriage at Mahal
('Marriage at Mahal', 'Mahal Rent', 45000),
('Marriage at Mahal', 'Decoration', 15000),
('Marriage at Mahal', 'Music', 15000),
('Marriage at Mahal', 'Iyer', 15000),
('Marriage at Mahal', 'Food', 35000),
('Marriage at Mahal', 'Photography', 35000),
('Marriage at Mahal', 'Miscellaneous', 6000),
('Marriage at Mahal', 'Dress', 3000),
('Marriage at Mahal', 'Travel', 6000),

-- Reception at Mahal
('Reception at Mahal', 'Mahal Rent', 45000),
('Reception at Mahal', 'Decoration', 15000),
('Reception at Mahal', 'Music', 10000),
('Reception at Mahal', 'Food', 125000),
('Reception at Mahal', 'Photography', 35000),
('Reception at Mahal', 'Dress', 8000),
('Reception at Mahal', 'Travel', 3000),
('Reception at Mahal', 'Return Gift', 5000),
('Reception at Mahal', 'Invitation', 15000),

-- Engagement
('Engagement', 'Jewels', 300000),
('Engagement', 'Seer Items', 15000),
('Engagement', 'Dress', 20000),
('Engagement', 'Travel', 3000),

-- Home Setup
('Home Setup', 'House Advance', 100000),
('Home Setup', 'Home Appliances', 40000);

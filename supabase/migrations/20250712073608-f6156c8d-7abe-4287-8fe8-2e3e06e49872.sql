
-- Create pooja_items table for tracking traditional Tamil wedding ceremony items
CREATE TABLE IF NOT EXISTS public.pooja_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ceremony_name TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' or 'purchased'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for the pooja_items table
ALTER TABLE public.pooja_items ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all users to manage pooja items (since this is a single-user wedding app)
CREATE POLICY "Allow all operations on pooja_items" 
  ON public.pooja_items 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

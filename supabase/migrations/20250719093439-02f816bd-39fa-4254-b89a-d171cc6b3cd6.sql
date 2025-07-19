
-- Create table for home setup items
CREATE TABLE public.home_setup_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  estimated_price NUMERIC DEFAULT 0,
  actual_price NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planned',
  priority TEXT NOT NULL DEFAULT 'medium',
  notes TEXT,
  photo_url TEXT,
  receipt_url TEXT,
  reminder_date TIMESTAMP WITH TIME ZONE,
  purchase_date DATE,
  delivery_date DATE,
  vendor_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.home_setup_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on home_setup_items" 
  ON public.home_setup_items 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create table for home setup categories
CREATE TABLE public.home_setup_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.home_setup_categories (name, icon, sort_order) VALUES
('Rental Setup', '🏠', 1),
('Bedroom Essentials', '🛏️', 2),
('Kitchen Essentials', '🍳', 3),
('Bathroom Essentials', '🧼', 4),
('Living Room & Utilities', '🛋️', 5),
('Miscellaneous', '🧺', 6);

-- Add RLS policies for categories
ALTER TABLE public.home_setup_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on home_setup_categories" 
  ON public.home_setup_categories 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create table for home setup documents
CREATE TABLE public.home_setup_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for documents
ALTER TABLE public.home_setup_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on home_setup_documents" 
  ON public.home_setup_documents 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

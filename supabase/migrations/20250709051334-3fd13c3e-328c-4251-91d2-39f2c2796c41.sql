
-- Create vendors table
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  agreed_price DECIMAL(10,2),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid')),
  booking_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create budget categories table
CREATE TABLE public.budget_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  estimated_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  actual_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.budget_categories(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  venue TEXT,
  dress_code TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('wedding-media', 'wedding-media', true);

-- Create storage policies for the bucket
CREATE POLICY "Anyone can view wedding media" ON storage.objects
  FOR SELECT USING (bucket_id = 'wedding-media');

CREATE POLICY "Anyone can upload wedding media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'wedding-media');

CREATE POLICY "Anyone can update wedding media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'wedding-media');

CREATE POLICY "Anyone can delete wedding media" ON storage.objects
  FOR DELETE USING (bucket_id = 'wedding-media');

-- Insert some default budget categories
INSERT INTO public.budget_categories (name, estimated_amount) VALUES
  ('Venue', 150000),
  ('Catering', 200000),
  ('Photography', 75000),
  ('Decoration', 100000),
  ('Clothing & Jewelry', 150000),
  ('Music & Entertainment', 50000),
  ('Transportation', 30000),
  ('Miscellaneous', 45000);

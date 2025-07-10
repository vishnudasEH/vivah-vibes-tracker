
-- Add members field to guests table
ALTER TABLE public.guests ADD COLUMN members INTEGER NOT NULL DEFAULT 1;

-- Create tags table for custom categories
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for guest-tag relationships (many-to-many)
CREATE TABLE public.guest_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(guest_id, tag_id)
);

-- Insert default tags
INSERT INTO public.tags (name) VALUES 
  ('School'),
  ('Bharathiar University'),
  ('UG'),
  ('PG'),
  ('Amvion'),
  ('Temenos'),
  ('Vishnu Dad Side'),
  ('Vishnu Mom Side'),
  ('Durga Dad Side'),
  ('Durga Mom Side'),
  ('Durga Relatives'),
  ('Durga Friends'),
  ('Durga Family'),
  ('Kolkata'),
  ('Kerala'),
  ('Shriram Finance');

-- Remove the old category constraint since we're moving to tags
ALTER TABLE public.guests DROP CONSTRAINT IF EXISTS guests_category_check;

-- We'll keep the category column for now for backward compatibility but make it optional
ALTER TABLE public.guests ALTER COLUMN category DROP NOT NULL;

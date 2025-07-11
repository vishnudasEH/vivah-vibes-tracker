
-- Create seer_items table for traditional gift items tracking
CREATE TABLE public.seer_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'bride' or 'groom'
  quantity_needed INTEGER NOT NULL DEFAULT 1,
  quantity_bought INTEGER NOT NULL DEFAULT 0,
  price_per_item NUMERIC,
  total_cost NUMERIC,
  delivery_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'ordered', 'delivered'
  delivery_date DATE,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pooja_items table for ritual items tracking
CREATE TABLE public.pooja_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  ritual_name TEXT NOT NULL,
  quantity_needed INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'needed', -- 'needed', 'bought', 'pending'
  source_info TEXT, -- where to buy from
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tamil_ceremonies table for ceremony management
CREATE TABLE public.tamil_ceremonies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ceremony_name TEXT NOT NULL,
  ceremony_date DATE,
  ceremony_time TIME,
  venue TEXT,
  temple_info TEXT,
  items_needed TEXT,
  family_roles TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

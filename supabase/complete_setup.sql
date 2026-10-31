-- ==============================================================================
-- MYFARM COMPLETE DATABASE SETUP SCRIPT (SCHEMA + POLICIES + SEED DATA)
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/kmrpzqxkpuedgtuntcyg
-- 2. Click on "SQL Editor" on the left menu.
-- 3. Click "New query", paste the entire contents of this file, and click "Run".
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUM TYPES
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('consumer', 'farmer', 'admin', 'buyer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE cycle_status AS ENUM (
    'awaiting_payment',
    'awaiting_allocation',
    'allocated',
    'land_preparation',
    'planting',
    'growing',
    'maintenance',
    'harvest_ready',
    'harvested',
    'completed',
    'disrupted',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'successful', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE activity_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE post_harvest_option AS ENUM ('delivery', 'marketplace', 'split');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE delivery_status AS ENUM (
    'awaiting_confirmation',
    'ready_for_dispatch',
    'dispatched',
    'in_transit',
    'delivered',
    'failed',
    'returned'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE settlement_status AS ENUM ('pending', 'processing', 'completed', 'disputed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABLES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'consumer',
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  preferred_location TEXT DEFAULT 'Ibadan',
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Oyo',
  lga TEXT NOT NULL,
  address_description TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  total_area_sqm NUMERIC(12, 2) NOT NULL,
  available_area_sqm NUMERIC(12, 2) NOT NULL,
  soil_type TEXT NOT NULL,
  water_source TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  cover_image_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.farm_operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  years_of_experience INTEGER NOT NULL,
  id_document_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.farm_plots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  plot_code TEXT NOT NULL,
  area_sqm NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'allocated', 'fallow', 'under_maintenance')),
  current_crop_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(farm_id, plot_code)
);

CREATE TABLE IF NOT EXISTS public.crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  botanical_name TEXT,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  growth_duration_days INTEGER NOT NULL,
  planting_season TEXT NOT NULL,
  water_requirement TEXT NOT NULL,
  soil_requirement TEXT NOT NULL,
  pest_and_disease_notes TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.crop_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  plot_size_sqm NUMERIC(10, 2) NOT NULL,
  target_yield_min_kg NUMERIC(10, 2) NOT NULL,
  target_yield_max_kg NUMERIC(10, 2) NOT NULL,
  base_production_cost NUMERIC(12, 2) NOT NULL,
  platform_fee NUMERIC(12, 2) NOT NULL,
  total_price NUMERIC(12, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.package_cost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.crop_packages(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  estimated_cost NUMERIC(12, 2) NOT NULL,
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_code TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE RESTRICT,
  crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE RESTRICT,
  package_id UUID NOT NULL REFERENCES public.crop_packages(id) ON DELETE RESTRICT,
  plot_id UUID REFERENCES public.farm_plots(id) ON DELETE SET NULL,
  farmer_id UUID REFERENCES public.farm_operators(id) ON DELETE SET NULL,
  status cycle_status NOT NULL DEFAULT 'awaiting_payment',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(12, 2) NOT NULL,
  target_start_date DATE,
  actual_start_date DATE,
  estimated_harvest_start DATE,
  estimated_harvest_end DATE,
  actual_harvest_date DATE,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.farming_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.farm_operators(id) ON DELETE RESTRICT,
  stage_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  activity_date DATE NOT NULL,
  inputs_applied JSONB DEFAULT '{}',
  weather_condition TEXT,
  status activity_status NOT NULL DEFAULT 'pending_approval',
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.activity_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.farming_activities(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.harvest_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_id UUID UNIQUE NOT NULL REFERENCES public.production_orders(id) ON DELETE RESTRICT,
  harvest_date DATE NOT NULL,
  gross_quantity_kg NUMERIC(10, 2) NOT NULL,
  grade_a_quantity_kg NUMERIC(10, 2) NOT NULL,
  grade_b_quantity_kg NUMERIC(10, 2) NOT NULL,
  rejected_quantity_kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
  proof_image_urls TEXT[] DEFAULT '{}',
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES public.farm_operators(id),
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.post_harvest_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  harvest_record_id UUID UNIQUE NOT NULL REFERENCES public.harvest_records(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  decision post_harvest_option NOT NULL,
  delivery_quantity_kg NUMERIC(10, 2) DEFAULT 0,
  marketplace_quantity_kg NUMERIC(10, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'fulfilled', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  harvest_record_id UUID REFERENCES public.harvest_records(id),
  crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_per_kg NUMERIC(10, 2) NOT NULL,
  total_quantity_kg NUMERIC(10, 2) NOT NULL,
  available_quantity_kg NUMERIC(10, 2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  image_urls TEXT[] DEFAULT '{}',
  is_approved BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold_out', 'delisted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT UNIQUE NOT NULL,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'preparing', 'dispatched', 'delivered', 'cancelled')),
  subtotal NUMERIC(12, 2) NOT NULL,
  delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL,
  delivery_address JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.marketplace_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE RESTRICT,
  quantity_kg NUMERIC(10, 2) NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.delivery_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number TEXT UNIQUE NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('harvest_choice', 'marketplace_order')),
  source_id UUID NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Ibadan',
  state TEXT NOT NULL DEFAULT 'Oyo',
  status delivery_status NOT NULL DEFAULT 'awaiting_confirmation',
  dispatch_notes TEXT,
  dispatched_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_ref TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  purpose TEXT NOT NULL CHECK (purpose IN ('production_order', 'marketplace_order', 'delivery_fee')),
  reference_id UUID NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  provider TEXT NOT NULL DEFAULT 'paystack',
  status payment_status NOT NULL DEFAULT 'pending',
  gateway_response JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.seller_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id),
  gross_sales NUMERIC(12, 2) NOT NULL,
  platform_commission NUMERIC(12, 2) NOT NULL,
  net_payable NUMERIC(12, 2) NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  status settlement_status NOT NULL DEFAULT 'pending',
  payout_reference TEXT,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  link_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3. FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'consumer'::user_role)
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_cost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farming_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.harvest_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_harvest_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Permissive Read Policies for Catalog
DROP POLICY IF EXISTS "Farms are publicly readable" ON public.farms;
CREATE POLICY "Farms are publicly readable" ON public.farms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Crops are publicly readable" ON public.crops;
CREATE POLICY "Crops are publicly readable" ON public.crops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Packages are publicly readable" ON public.crop_packages;
CREATE POLICY "Packages are publicly readable" ON public.crop_packages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Cost items are publicly readable" ON public.package_cost_items;
CREATE POLICY "Cost items are publicly readable" ON public.package_cost_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Farm plots are readable" ON public.farm_plots;
CREATE POLICY "Farm plots are readable" ON public.farm_plots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Farm operators are readable" ON public.farm_operators;
CREATE POLICY "Farm operators are readable" ON public.farm_operators FOR SELECT USING (true);

DROP POLICY IF EXISTS "Activity media is readable" ON public.activity_media;
CREATE POLICY "Activity media is readable" ON public.activity_media FOR SELECT USING (true);

DROP POLICY IF EXISTS "Active listings are public" ON public.marketplace_listings;
CREATE POLICY "Active listings are public" ON public.marketplace_listings FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Delivery requests viewable" ON public.delivery_requests;
CREATE POLICY "Delivery requests viewable" ON public.delivery_requests FOR SELECT USING (true);

-- User-Specific Policies
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users view own orders" ON public.production_orders;
CREATE POLICY "Users view own orders" ON public.production_orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users create orders" ON public.production_orders;
CREATE POLICY "Users create orders" ON public.production_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own allocations" ON public.post_harvest_allocations;
CREATE POLICY "Users manage own allocations" ON public.post_harvest_allocations FOR ALL USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own transactions" ON public.payment_transactions;
CREATE POLICY "Users view own transactions" ON public.payment_transactions FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Approved activities readable" ON public.farming_activities;
CREATE POLICY "Approved activities readable" ON public.farming_activities FOR SELECT USING (status = 'approved' OR public.is_admin());

DROP POLICY IF EXISTS "Harvest records readable" ON public.harvest_records;
CREATE POLICY "Harvest records readable" ON public.harvest_records FOR SELECT USING (true);

DROP POLICY IF EXISTS "Buyers view own orders" ON public.marketplace_orders;
CREATE POLICY "Buyers view own orders" ON public.marketplace_orders FOR SELECT USING (auth.uid() = buyer_id OR public.is_admin());

DROP POLICY IF EXISTS "Buyers create orders" ON public.marketplace_orders;
CREATE POLICY "Buyers create orders" ON public.marketplace_orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Order items readable" ON public.marketplace_order_items;
CREATE POLICY "Order items readable" ON public.marketplace_order_items FOR SELECT USING (true);

-- 5. SEED DATA (Ibadan, Oyo State)
INSERT INTO public.farms (
  id, name, slug, description, state, lga, address_description,
  latitude, longitude, total_area_sqm, available_area_sqm,
  soil_type, water_source, is_verified, verified_at,
  cover_image_url, gallery_urls
) VALUES
(
  'a1111111-1111-1111-1111-111111111111',
  'Ido Agro Precision Farm',
  'ido-agro-precision-farm',
  'A high-tech horticulture and vegetable production farm situated in Ido Local Government Area, Ibadan. Equipped with solar-powered drip irrigation, high-grade nursery tunnels, and continuous soil testing.',
  'Oyo',
  'Ido',
  'Off Eleyele-Eruwa Road, Ido LGA, Ibadan',
  7.4589000,
  3.7654000,
  25000.00,
  18500.00,
  'Sandy Loam (pH 6.5)',
  'Industrial Solar Borehole & Drip Irrigation',
  true,
  timezone('utc', now() - interval '30 days'),
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80'
  ]
),
(
  'a2222222-2222-2222-2222-222222222222',
  'Akinyele Organic Agri-Hub',
  'akinyele-organic-agri-hub',
  'Located along the IITA agricultural corridor in Akinyele, Ibadan. Specializes in organic open-field and semi-protected cultivation of solanaceous crops and grains using certified bio-inputs.',
  'Oyo',
  'Akinyele',
  'Near Moniya Station, Akinyele LGA, Ibadan',
  7.5312000,
  3.9145000,
  45000.00,
  32000.00,
  'Rich Alluvial Loam (pH 6.8)',
  'Stream Dam & Solar Submersible Pumping System',
  true,
  timezone('utc', now() - interval '45 days'),
  'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1200&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80'
  ]
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.crops (
  id, name, botanical_name, category, description,
  growth_duration_days, planting_season, water_requirement,
  soil_requirement, pest_and_disease_notes, image_url, is_active
) VALUES
(
  'c1111111-1111-1111-1111-111111111111',
  'Roma Tomato (F1 Hybrid)',
  'Solanum lycopersicum',
  'Vegetable',
  'High-yielding, firm-skinned determinate tomato variety with exceptional disease resistance and strong consumer demand across Ibadan markets.',
  75,
  'All-year (with irrigation), March-October (rainfed)',
  'High (Regular drip moisture)',
  'Well-drained sandy loam rich in organic compost',
  'Scouted for Tuta absoluta and early blight. Managed with botanical neem extracts.',
  'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
  true
),
(
  'c2222222-2222-2222-2222-222222222222',
  'Habanero Pepper (Atarodo)',
  'Capsicum chinense',
  'Vegetable',
  'Aromatic, pungent Scotch Bonnet/Atarodo pepper with deep red fruit color and extended shelf life.',
  90,
  'All-year (Irrigated)',
  'Moderate',
  'Deep, loamy, fertile soil with good organic matter',
  'Preventive biological management during humid weather; insect traps for thrips.',
  'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80',
  true
),
(
  'c3333333-3333-3333-3333-333333333333',
  'Sweet Corn (Hybrid Maize)',
  'Zea mays var. saccharata',
  'Grain',
  'Fast-maturing sweet corn with tender golden kernels and rapid market turnaround.',
  70,
  'March-June (Early season), August-October (Late season)',
  'Moderate',
  'Medium-textured, aerated loam with balanced nitrogen',
  'Armyworm monitoring with pheromone traps and biopesticides.',
  'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
  true
),
(
  'c4444444-4444-4444-4444-444444444444',
  'Improved Cassava (TME 419)',
  'Manihot esculenta',
  'Root/Tuber',
  'Elite high-starch cassava variety developed by IITA. Drought hardy, resistant to CMD, producing bulky tubers ideal for garri.',
  270,
  'April-November',
  'Low to Moderate',
  'Tolerant to varied soils; thrives in light sandy loam',
  'Early weed management in first 3 months; minimal pest issues.',
  'https://images.unsplash.com/photo-1598512752271-33f913a5af13?auto=format&fit=crop&w=800&q=80',
  true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.crop_packages (
  id, crop_id, name, plot_size_sqm, target_yield_min_kg, target_yield_max_kg,
  base_production_cost, platform_fee, total_price, is_active
) VALUES
(
  'e1111111-1111-1111-1111-111111111111',
  'c1111111-1111-1111-1111-111111111111',
  'Starter Tomato Plot (50 sqm)',
  50.00,
  160.00,
  220.00,
  58000.00,
  7000.00,
  65000.00,
  true
),
(
  'e1111111-1111-1111-1111-111111111112',
  'c1111111-1111-1111-1111-111111111111',
  'Family Harvest Tomato Unit (100 sqm)',
  100.00,
  350.00,
  460.00,
  105000.00,
  13000.00,
  118000.00,
  true
),
(
  'e2222222-2222-2222-2222-222222222221',
  'c2222222-2222-2222-2222-222222222222',
  'Starter Pepper Plot (50 sqm)',
  50.00,
  120.00,
  170.00,
  52000.00,
  6000.00,
  58000.00,
  true
),
(
  'e3333333-3333-3333-3333-333333333331',
  'c3333333-3333-3333-3333-333333333333',
  'Sweet Corn Standard Unit (100 sqm)',
  100.00,
  220.00,
  300.00,
  45000.00,
  5000.00,
  50000.00,
  true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.package_cost_items (
  id, package_id, category, item_name, estimated_cost, is_mandatory, sort_order
) VALUES
('b1111111-1111-1111-1111-111111111101', 'e1111111-1111-1111-1111-111111111111', 'Land Preparation', 'Tillage, Bed Formation & Ridging (50 sqm)', 9500.00, true, 1),
('b1111111-1111-1111-1111-111111111102', 'e1111111-1111-1111-1111-111111111111', 'Seeds & Nursery', 'Certified F1 Roma Seedlings (160 plants)', 12500.00, true, 2),
('b1111111-1111-1111-1111-111111111103', 'e1111111-1111-1111-1111-111111111111', 'Soil Nutrition', 'Enriched Poultry Compost & Organic Bio-Stimulant', 11000.00, true, 3),
('b1111111-1111-1111-1111-111111111104', 'e1111111-1111-1111-1111-111111111111', 'Irrigation & Water', 'Solar Drip Irrigation Access (75 days cycle)', 8000.00, true, 4),
('b1111111-1111-1111-1111-111111111105', 'e1111111-1111-1111-1111-111111111111', 'Crop Protection', 'Preventive Botanical Neem Sprays & Monitoring', 7000.00, true, 5),
('b1111111-1111-1111-1111-111111111106', 'e1111111-1111-1111-1111-111111111111', 'Labor & Care', 'Staking, Pruning, Weeding & Harvesting Labor', 10000.00, true, 6),
('b1111111-1111-1111-1111-111111111107', 'e1111111-1111-1111-1111-111111111111', 'Platform Service', 'Digital Tracking, Photo Evidence & Quality Audit', 7000.00, true, 7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.farm_plots (id, farm_id, plot_code, area_sqm, status) VALUES
('d1111111-1111-1111-1111-111111111101', 'a1111111-1111-1111-1111-111111111111', 'IDO-BLK-A01', 50.00, 'available'),
('d1111111-1111-1111-1111-111111111102', 'a1111111-1111-1111-1111-111111111111', 'IDO-BLK-A02', 50.00, 'available'),
('d1111111-1111-1111-1111-111111111103', 'a1111111-1111-1111-1111-111111111111', 'IDO-BLK-A03', 100.00, 'available'),
('d2222222-2222-2222-2222-222222222201', 'a2222222-2222-2222-2222-222222222222', 'AKN-BLK-B01', 50.00, 'available'),
('d2222222-2222-2222-2222-222222222202', 'a2222222-2222-2222-2222-222222222222', 'AKN-BLK-B02', 100.00, 'available')
ON CONFLICT (id) DO NOTHING;

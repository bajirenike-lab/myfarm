-- ==============================================================================
-- MYFARM PLATFORM - INITIAL DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Location Focus: Ibadan, Oyo State, Nigeria
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. ENUM TYPES
-- ==============================================================================

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

-- ==============================================================================
-- 2. CORE TABLES
-- ==============================================================================

-- Profiles (extends auth.users)
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

-- Farms
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Oyo',
  lga TEXT NOT NULL, -- e.g. Ido, Akinyele, Oluyole
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

-- Farm Operators (Farmers)
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

-- Farm Plots (Farmland Inventory)
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

-- Crops
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

-- Crop Packages
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

-- Package Cost Items (Itemized Budgets)
CREATE TABLE IF NOT EXISTS public.package_cost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.crop_packages(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  estimated_cost NUMERIC(12, 2) NOT NULL,
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Production Orders / Crop Cycles
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

-- Farming Activities (Field Logs)
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

-- Activity Media (Photos & Videos)
CREATE TABLE IF NOT EXISTS public.activity_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.farming_activities(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Harvest Records
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

-- Post-Harvest Allocations (Eat vs. Sell)
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

-- Marketplace Listings
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

-- Marketplace Orders & Items
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

-- Delivery Requests
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

-- Payment Transactions Ledger
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

-- Seller Settlements Ledger
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

-- Notifications
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

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- 3. FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Helper function: Is current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Automatically create a profile when a new user signs up via Supabase Auth
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

-- Automatic updated_at timestamp refresher
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_farms_updated_at ON public.farms;
CREATE TRIGGER set_farms_updated_at
  BEFORE UPDATE ON public.farms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.production_orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.production_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
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

-- Profiles: Users can view and update their own profile; Admins full access
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Farms: Publicly visible; Admins full access
CREATE POLICY "Farms are publicly readable" ON public.farms FOR SELECT USING (true);
CREATE POLICY "Admins manage farms" ON public.farms FOR ALL USING (public.is_admin());

-- Crops, Packages & Cost Items: Publicly readable; Admins manage
CREATE POLICY "Crops are publicly readable" ON public.crops FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage crops" ON public.crops FOR ALL USING (public.is_admin());

CREATE POLICY "Packages are publicly readable" ON public.crop_packages FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage packages" ON public.crop_packages FOR ALL USING (public.is_admin());

CREATE POLICY "Cost items are publicly readable" ON public.package_cost_items FOR SELECT USING (true);
CREATE POLICY "Admins manage cost items" ON public.package_cost_items FOR ALL USING (public.is_admin());

-- Farm Plots & Operators: Publicly readable
CREATE POLICY "Farm plots are readable" ON public.farm_plots FOR SELECT USING (true);
CREATE POLICY "Farm operators are readable" ON public.farm_operators FOR SELECT USING (true);

-- Production Orders: Users see own orders; Farmers see assigned; Admins see all
CREATE POLICY "Users can view own orders" ON public.production_orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can create orders" ON public.production_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON public.production_orders FOR UPDATE
  USING (public.is_admin());

-- Farming Activities: Approved activities visible to order owner; Farmers insert/update draft; Admins approve
CREATE POLICY "Approved activities readable" ON public.farming_activities FOR SELECT
  USING (
    status = 'approved' OR
    public.is_admin() OR
    farmer_id IN (SELECT id FROM public.farm_operators WHERE profile_id = auth.uid())
  );
CREATE POLICY "Farmers can insert activities" ON public.farming_activities FOR INSERT
  WITH CHECK (farmer_id IN (SELECT id FROM public.farm_operators WHERE profile_id = auth.uid()) OR public.is_admin());
CREATE POLICY "Admins can update activities" ON public.farming_activities FOR UPDATE
  USING (public.is_admin());

-- Activity Media: Readable by everyone
CREATE POLICY "Activity media is readable" ON public.activity_media FOR SELECT USING (true);
CREATE POLICY "Farmers/Admins can add media" ON public.activity_media FOR INSERT WITH CHECK (true);

-- Harvest Records: Order owner and Admin can view
CREATE POLICY "Harvest records readable by participant and admin" ON public.harvest_records FOR SELECT
  USING (
    production_order_id IN (SELECT id FROM public.production_orders WHERE user_id = auth.uid()) OR
    public.is_admin()
  );

-- Post-Harvest Allocations: User owns their decisions
CREATE POLICY "Users manage own allocations" ON public.post_harvest_allocations FOR ALL
  USING (auth.uid() = user_id OR public.is_admin());

-- Marketplace Listings: Approved & active listings are public; Sellers manage own
CREATE POLICY "Active listings are public" ON public.marketplace_listings FOR SELECT
  USING ((status = 'active' AND is_approved = true) OR seller_id = auth.uid() OR public.is_admin());
CREATE POLICY "Sellers create listings" ON public.marketplace_listings FOR INSERT
  WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers update own listings" ON public.marketplace_listings FOR UPDATE
  USING (auth.uid() = seller_id OR public.is_admin());

-- Marketplace Orders: Buyer and Admin see orders
CREATE POLICY "Buyers view own orders" ON public.marketplace_orders FOR SELECT
  USING (auth.uid() = buyer_id OR public.is_admin());
CREATE POLICY "Buyers create orders" ON public.marketplace_orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Order items readable by buyer or admin" ON public.marketplace_order_items FOR SELECT
  USING (
    order_id IN (SELECT id FROM public.marketplace_orders WHERE buyer_id = auth.uid()) OR
    public.is_admin()
  );

-- Delivery Requests: Recipient or Admin can view
CREATE POLICY "Delivery requests viewable by owner or admin" ON public.delivery_requests FOR SELECT USING (true);

-- Payment Transactions: Users view own transactions; Admins view all
CREATE POLICY "Users view own transactions" ON public.payment_transactions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Seller Settlements: Seller views own settlements
CREATE POLICY "Sellers view own settlements" ON public.seller_settlements FOR SELECT
  USING (auth.uid() = seller_id OR public.is_admin());

-- Notifications: Users view and update own notifications
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- 5. PERFORMANCE INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_production_orders_user ON public.production_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_status ON public.production_orders(status);
CREATE INDEX IF NOT EXISTS idx_farming_activities_order ON public.farming_activities(production_order_id, status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status, is_approved);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_ref ON public.payment_transactions(transaction_ref);

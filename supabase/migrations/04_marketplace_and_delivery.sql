-- ==============================================================================
-- MyFarm Migration: 04_marketplace_and_delivery.sql
-- Enables Marketplace Orders, Delivery Requests & Seeds Live Produce Listings
-- ==============================================================================

-- 1. Enable Permissions on Marketplace Orders & Order Items
DROP POLICY IF EXISTS "Buyers create orders" ON public.marketplace_orders;
CREATE POLICY "Buyers create orders" ON public.marketplace_orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Buyers view own orders" ON public.marketplace_orders;
CREATE POLICY "Buyers view own orders" ON public.marketplace_orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update marketplace orders" ON public.marketplace_orders;
CREATE POLICY "Allow update marketplace orders" ON public.marketplace_orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Order items readable" ON public.marketplace_order_items;
CREATE POLICY "Order items readable" ON public.marketplace_order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Order items insertable" ON public.marketplace_order_items;
CREATE POLICY "Order items insertable" ON public.marketplace_order_items FOR INSERT WITH CHECK (true);

-- 2. Enable Permissions on Delivery Requests
DROP POLICY IF EXISTS "Delivery requests readable" ON public.delivery_requests;
CREATE POLICY "Delivery requests readable" ON public.delivery_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Delivery requests insertable" ON public.delivery_requests;
CREATE POLICY "Delivery requests insertable" ON public.delivery_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Delivery requests updateable" ON public.delivery_requests;
CREATE POLICY "Delivery requests updateable" ON public.delivery_requests FOR UPDATE USING (true);

-- 3. Seed Initial Active Marketplace Listings from Ibadan Partner Farms
INSERT INTO public.marketplace_listings (
  id, seller_id, crop_id, title, description, price_per_kg,
  total_quantity_kg, available_quantity_kg, unit, image_urls, is_approved, status
) VALUES
(
  'e0000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'c1111111-1111-1111-1111-111111111111',
  'Farm-Fresh Roma Tomatoes (Grade A)',
  'Crisp, sun-ripened Grade A Roma tomatoes harvested fresh this week from Ido Agro Precision Farm, Ibadan.',
  850.00,
  200.00,
  145.00,
  'kg',
  ARRAY['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80'],
  true,
  'active'
),
(
  'e0000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000001',
  'c2222222-2222-2222-2222-222222222222',
  'Aromatic Red Habanero Pepper (Atarodo)',
  'Freshly harvested pungent Scotch Bonnet/Atarodo peppers from Akinyele Organic Agri-Hub.',
  1400.00,
  100.00,
  78.00,
  'kg',
  ARRAY['https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80'],
  true,
  'active'
),
(
  'e0000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000001',
  'c3333333-3333-3333-3333-333333333333',
  'Golden Sweet Corn (Fresh Cobs)',
  'Sweet, tender maize cobs harvested at optimal sugar peak in Ido LGA.',
  500.00,
  300.00,
  210.00,
  'kg',
  ARRAY['https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80'],
  true,
  'active'
)
ON CONFLICT (id) DO NOTHING;

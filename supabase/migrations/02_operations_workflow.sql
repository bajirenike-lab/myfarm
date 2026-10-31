-- ==============================================================================
-- MyFarm Migration: 02_operations_workflow.sql
-- Enables Farmer Field Activity Submissions and Operator Approval Workflow
-- ==============================================================================

-- 1. Enable Field Activity Inserts & Updates
DROP POLICY IF EXISTS "Approved activities readable" ON public.farming_activities;
DROP POLICY IF EXISTS "All activities readable for ops" ON public.farming_activities;
CREATE POLICY "All activities readable for ops" ON public.farming_activities
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Farmers can insert activities" ON public.farming_activities;
CREATE POLICY "Farmers can insert activities" ON public.farming_activities
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Ops can update activity status" ON public.farming_activities;
CREATE POLICY "Ops can update activity status" ON public.farming_activities
  FOR UPDATE USING (true);

-- 2. Enable Activity Media
DROP POLICY IF EXISTS "Allow select activity media" ON public.activity_media;
CREATE POLICY "Allow select activity media" ON public.activity_media
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert activity media" ON public.activity_media;
CREATE POLICY "Allow insert activity media" ON public.activity_media
  FOR INSERT WITH CHECK (true);

-- 3. Production Orders & Allocations Permissions
DROP POLICY IF EXISTS "Allow select production orders for ops" ON public.production_orders;
CREATE POLICY "Allow select production orders for ops" ON public.production_orders
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert production orders" ON public.production_orders;
CREATE POLICY "Allow insert production orders" ON public.production_orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update production orders" ON public.production_orders;
CREATE POLICY "Allow update production orders" ON public.production_orders
  FOR UPDATE USING (true);

-- 4. Seed an Active Cycle for Demonstration
-- Links Roma Tomatoes at Ido Agro Precision Farm to plot IDO-BLK-A01
DO $$
DECLARE
  v_farm_id UUID := 'a1111111-1111-1111-1111-111111111111';
  v_crop_id UUID := 'c1111111-1111-1111-1111-111111111111';
  v_package_id UUID := 'e1111111-1111-1111-1111-111111111111';
  v_plot_id UUID := 'd1111111-1111-1111-1111-111111111101';
  v_operator_id UUID;
  v_order_id UUID := 'f1111111-1111-1111-1111-111111111111';
  v_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Ensure test participant profile exists
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (v_user_id, 'Tunde Demo Participant', 'demo@myfarm.ng', 'participant')
  ON CONFLICT (id) DO NOTHING;

  -- Ensure farm operator exists
  SELECT id INTO v_operator_id FROM public.farm_operators WHERE farm_id = v_farm_id LIMIT 1;
  IF v_operator_id IS NULL THEN
    INSERT INTO public.farm_operators (id, farm_id, full_name, phone_number, role)
    VALUES ('e0000000-0000-0000-0000-000000000001', v_farm_id, 'Adebayo Ogunlesi', '+2348031234567', 'lead_agronomist')
    RETURNING id INTO v_operator_id;
  END IF;

  -- Create active production order
  INSERT INTO public.production_orders (
    id, user_id, package_id, farm_id, assigned_plot_id,
    order_code, status, total_amount, target_yield_min_kg, target_yield_max_kg,
    cycle_start_date, estimated_harvest_date
  ) VALUES (
    v_order_id, v_user_id, v_package_id, v_farm_id, v_plot_id,
    'MYF-2026-001', 'in_progress', 65000.00, 160.00, 220.00,
    CURRENT_DATE - INTERVAL '18 days', CURRENT_DATE + INTERVAL '57 days'
  ) ON CONFLICT (id) DO UPDATE SET status = 'in_progress';

  -- Seed an already approved activity (Land Preparation & Nursery)
  INSERT INTO public.farming_activities (
    id, production_order_id, farmer_id, stage_name, title, description,
    activity_date, inputs_applied, weather_condition, status
  ) VALUES (
    'a0000000-0000-0000-0000-000000000001', v_order_id, v_operator_id,
    'Land Preparation', 'Bed Formation & Soil Tillage Completed',
    'Prepared 50 sqm raised beds. Incorporated organic poultry compost into the soil. Solar drip lines installed.',
    CURRENT_DATE - INTERVAL '15 days',
    '{"compost_kg": 50, "irrigation": "drip_tape_16mm"}',
    'Sunny, 31°C, Humidity 62%',
    'approved'
  ) ON CONFLICT (id) DO NOTHING;

  -- Seed a pending activity waiting for Admin Approval in the Queue!
  INSERT INTO public.farming_activities (
    id, production_order_id, farmer_id, stage_name, title, description,
    activity_date, inputs_applied, weather_condition, status
  ) VALUES (
    'a0000000-0000-0000-0000-000000000002', v_order_id, v_operator_id,
    'Vegetative Care', 'First Trellising & Preventive Neem Oil Spray',
    'Installed bamboo stakes and bio-twine trellising to support flowering branches. Applied preventive cold-pressed neem oil for leaf miner protection.',
    CURRENT_DATE - INTERVAL '1 day',
    '{"neem_oil_ml": 250, "water_litres": 20, "stakes_bamboo": 40}',
    'Partly Cloudy, 29°C, Wind 11 km/h',
    'pending_approval'
  ) ON CONFLICT (id) DO NOTHING;

END $$;

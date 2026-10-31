-- ==============================================================================
-- MYFARM PLATFORM - DEVELOPMENT SEED DATA
-- Focus Region: Ibadan, Oyo State, Nigeria
-- ==============================================================================

-- 1. SEED FARMS (Ibadan, Oyo State)
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

-- 2. SEED CROPS
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
  'High-yielding, firm-skinned determinate tomato variety with exceptional disease resistance (Bacterial Wilt, TYLCV) and strong consumer demand across Ibadan markets.',
  75,
  'All-year (with irrigation), March-October (rainfed)',
  'High (Regular drip moisture)',
  'Well-drained sandy loam rich in organic compost',
  'Regular scouting for Tuta absoluta and early blight. Treated with neem bio-spray.',
  'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
  true
),
(
  'c2222222-2222-2222-2222-222222222222',
  'Habanero Pepper (Atarodo)',
  'Capsicum chinense',
  'Vegetable',
  'Aromatic, intensely pungent Scotch Bonnet/Atarodo pepper with deep red fruit color and extended shelf life, favored by household consumers and commercial caterers.',
  90,
  'All-year (Irrigated)',
  'Moderate',
  'Deep, loamy, fertile soil with good organic matter',
  'Preventive biological fungicides during rainy periods; sticky insect traps for thrips.',
  'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80',
  true
),
(
  'c3333333-3333-3333-3333-333333333333',
  'Sweet Corn (Hybrid Maize)',
  'Zea mays var. saccharata',
  'Grain',
  'Fast-maturing sweet corn with tender golden kernels, delicious natural sweetness, and rapid market turnaround.',
  70,
  'March-June (Early season), August-October (Late season)',
  'Moderate',
  'Medium-textured, aerated loam with balanced nitrogen',
  'Fall armyworm monitoring with pheromone traps and biopesticides.',
  'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
  true
),
(
  'c4444444-4444-4444-4444-444444444444',
  'Improved Cassava (TME 419)',
  'Manihot esculenta',
  'Root/Tuber',
  'Elite high-starch cassava stem variety developed by IITA. Drought hardy, resistant to Cassava Mosaic Disease, producing bulky tubers ideal for garri and fufu.',
  270,
  'April-November',
  'Low to Moderate',
  'Tolerant to varied soils; thrives in light sandy loam',
  'Stem weed management in first 3 months; minimal pest issues once canopy closes.',
  'https://images.unsplash.com/photo-1598512752271-33f913a5af13?auto=format&fit=crop&w=800&q=80',
  true
)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED CROP PACKAGES
INSERT INTO public.crop_packages (
  id, crop_id, name, plot_size_sqm, target_yield_min_kg, target_yield_max_kg,
  base_production_cost, platform_fee, total_price, is_active
) VALUES
-- Tomato Packages
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
-- Pepper Packages
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
-- Sweet Corn Packages
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

-- 4. SEED PACKAGE COST BREAKDOWN (Itemized Budget for 50 sqm Tomato)
INSERT INTO public.package_cost_items (
  id, package_id, category, item_name, estimated_cost, is_mandatory, sort_order
) VALUES
('b1111111-1111-1111-1111-111111111101', 'e1111111-1111-1111-1111-111111111111', 'Land Preparation', 'Tillage, Bed Formation & Ridging (50 sqm)', 9500.00, true, 1),
('b1111111-1111-1111-1111-111111111102', 'e1111111-1111-1111-1111-111111111111', 'Seeds & Nursery', 'Certified F1 Roma Seedlings (160 vigorous plants)', 12500.00, true, 2),
('b1111111-1111-1111-1111-111111111103', 'e1111111-1111-1111-1111-111111111111', 'Soil Nutrition', 'Enriched Poultry Compost & Organic Bio-Stimulant', 11000.00, true, 3),
('b1111111-1111-1111-1111-111111111104', 'e1111111-1111-1111-1111-111111111111', 'Irrigation & Water', 'Solar Drip Irrigation Access (75 days cycle)', 8000.00, true, 4),
('b1111111-1111-1111-1111-111111111105', 'e1111111-1111-1111-1111-111111111111', 'Crop Protection', 'Preventive Botanical Neem Sprays & Monitoring', 7000.00, true, 5),
('b1111111-1111-1111-1111-111111111106', 'e1111111-1111-1111-1111-111111111111', 'Labor & Care', 'Staking, Pruning, Weeding & Harvesting Labor', 10000.00, true, 6),
('b1111111-1111-1111-1111-111111111107', 'e1111111-1111-1111-1111-111111111111', 'Platform Service', 'Digital Tracking, Photo Evidence & Quality Audit', 7000.00, true, 7)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED FARM PLOTS
INSERT INTO public.farm_plots (id, farm_id, plot_code, area_sqm, status) VALUES
('d1111111-1111-1111-1111-111111111101', 'a1111111-1111-1111-1111-111111111111', 'IDO-BLK-A01', 50.00, 'available'),
('d1111111-1111-1111-1111-111111111102', 'a1111111-1111-1111-1111-111111111111', 'IDO-BLK-A02', 50.00, 'available'),
('d1111111-1111-1111-1111-111111111103', 'a1111111-1111-1111-1111-111111111111', 'IDO-BLK-A03', 100.00, 'available'),
('d2222222-2222-2222-2222-222222222201', 'a2222222-2222-2222-2222-222222222222', 'AKN-BLK-B01', 50.00, 'available'),
('d2222222-2222-2222-2222-222222222202', 'a2222222-2222-2222-2222-222222222222', 'AKN-BLK-B02', 100.00, 'available')
ON CONFLICT (id) DO NOTHING;

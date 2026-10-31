-- ==============================================================================
-- MyFarm Migration: 03_storage_buckets.sql
-- Creates Storage Buckets and Security Policies for Media Uploads
-- ==============================================================================

-- 1. Create Storage Buckets in storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'farm-media',
    'farm-media',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'activities',
    'activities',
    true,
    20971520, -- 20MB limit (photos & short video clips)
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'image/heic']
  ),
  (
    'harvests',
    'harvests',
    true,
    15728640, -- 15MB limit (scale proofs & receipts)
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  ),
  (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Object RLS Policies
-- Allow public viewing of files across all 4 buckets
DROP POLICY IF EXISTS "Public can view farm media" ON storage.objects;
CREATE POLICY "Public can view farm media" ON storage.objects
  FOR SELECT USING (bucket_id IN ('farm-media', 'activities', 'harvests', 'avatars'));

-- Allow uploading of field activity updates, harvest proof, and farm media
DROP POLICY IF EXISTS "Anyone can upload activity photos" ON storage.objects;
CREATE POLICY "Anyone can upload activity photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('farm-media', 'activities', 'harvests', 'avatars'));

-- Allow update and delete for maintenance
DROP POLICY IF EXISTS "Anyone can update objects" ON storage.objects;
CREATE POLICY "Anyone can update objects" ON storage.objects
  FOR UPDATE USING (bucket_id IN ('farm-media', 'activities', 'harvests', 'avatars'));

DROP POLICY IF EXISTS "Anyone can delete objects" ON storage.objects;
CREATE POLICY "Anyone can delete objects" ON storage.objects
  FOR DELETE USING (bucket_id IN ('farm-media', 'activities', 'harvests', 'avatars'));

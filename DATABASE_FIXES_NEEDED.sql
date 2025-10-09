-- ============================================
-- DATABASE FIXES FOR PORT LAVACA BUSINESSES
-- Run these in Supabase SQL Editor
-- ============================================

-- FIX 1: Add coordinates to Port Lavaca businesses
-- This allows proper distance calculation
UPDATE businesses 
SET 
  latitude = 28.614889,
  longitude = -96.625778
WHERE zip_code = '77979' AND latitude IS NULL;

-- FIX 2: Activate Port Lavaca businesses
-- Currently they are "inactive" so they won't show in searches
UPDATE businesses 
SET subscription_status = 'active'
WHERE zip_code = '77979' AND subscription_status = 'inactive';

-- FIX 3: Update categories to match new system
-- Run the queries from migration-step-by-step.sql OR:
UPDATE businesses SET category = 'Therapist' WHERE category IN ('Mental Health', 'Therapy', 'Counseling', 'Psychology');
UPDATE businesses SET category = 'Psychiatrist' WHERE category IN ('Psychiatry');
UPDATE businesses SET category = 'Personal Trainer' WHERE category IN ('Fitness', 'Personal Training', 'Fitness & Personal Training', 'Physical Therapy');
UPDATE businesses SET category = 'Registered Dietitian' WHERE category IN ('Nutrition', 'Nutrition & Dietetics');
UPDATE businesses SET category = 'Health Coach' WHERE category IN ('Holistic Health', 'Wellness', 'Health Coaching');

-- Mark non-matching categories as inactive
UPDATE businesses 
SET subscription_status = 'inactive'
WHERE category NOT IN ('Therapist', 'Psychiatrist', 'Health Coach', 'Personal Trainer', 'Registered Dietitian');

-- FIX 4 (OPTIONAL): Set some businesses as featured
-- Featured businesses always appear first in search results
UPDATE businesses 
SET featured = true 
WHERE name IN ('Mindful Therapy Center', 'Dr. Michael Johnson Psychiatry', 'Wellness Life Coaching', 'Elite Personal Training Studio')
  AND featured = false;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check Port Lavaca businesses
SELECT 
  name,
  category,
  zip_code,
  latitude,
  longitude,
  subscription_status,
  featured
FROM businesses
WHERE zip_code = '77979'
ORDER BY name;

-- Check all active businesses by category
SELECT 
  category,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE featured = true) as featured_count,
  COUNT(*) FILTER (WHERE subscription_status = 'active') as active_count,
  COUNT(*) FILTER (WHERE latitude IS NOT NULL) as with_coordinates
FROM businesses
GROUP BY category
ORDER BY category;

-- List all featured businesses
SELECT 
  name,
  category,
  city,
  state,
  zip_code,
  featured,
  subscription_status,
  rating
FROM businesses
WHERE featured = true
ORDER BY rating DESC;


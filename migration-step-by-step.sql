-- Run these queries ONE AT A TIME in Supabase SQL Editor
-- Copy and paste each query separately

-- Query 1: Update Mental Health to Therapist
UPDATE businesses SET category = 'Therapist', subcategory = 'Mental Health Therapist' WHERE category IN ('Mental Health', 'Therapy', 'Counseling', 'Psychology');

-- Query 2: Update Psychiatry to Psychiatrist  
UPDATE businesses SET category = 'Psychiatrist', subcategory = 'Adult Psychiatry' WHERE category IN ('Psychiatry', 'Psychiatric Services');

-- Query 3: Update Fitness to Personal Trainer
UPDATE businesses SET category = 'Personal Trainer', subcategory = 'Strength & Conditioning' WHERE category IN ('Fitness & Personal Training', 'Personal Training', 'Fitness', 'Sports Medicine');

-- Query 4: Update Nutrition to Registered Dietitian
UPDATE businesses SET category = 'Registered Dietitian', subcategory = 'Clinical Nutrition' WHERE category IN ('Nutrition & Dietetics', 'Nutrition', 'Dietitian', 'Nutritionist');

-- Query 5: Update Wellness to Health Coach
UPDATE businesses SET category = 'Health Coach', subcategory = 'Wellness Coach' WHERE category IN ('Holistic Health', 'Wellness', 'Health Coaching', 'Life Coaching');

-- Query 6: Mark other categories as inactive
UPDATE businesses SET subscription_status = 'inactive' WHERE category NOT IN ('Therapist', 'Psychiatrist', 'Health Coach', 'Personal Trainer', 'Registered Dietitian');

-- Query 7: Check results
SELECT category, COUNT(*) as count FROM businesses GROUP BY category ORDER BY count DESC;


-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'business_owner', 'admin')),
    business_ids UUID[] DEFAULT '{}',
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create directories table
CREATE TABLE directories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    domain VARCHAR(255) UNIQUE,
    subdomain VARCHAR(255) UNIQUE,
    theme_config JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create businesses table
CREATE TABLE businesses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    directory_id UUID NOT NULL REFERENCES directories(id) ON DELETE CASCADE,
    slug VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    tags TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    profile_image VARCHAR(500),
    hours JSONB DEFAULT '{}',
    rating DECIMAL(3, 2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    owner_id UUID REFERENCES users(id),
    subscription_status VARCHAR(20) DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'expired', 'cancelled')),
    subscription_plan VARCHAR(50) DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'professional', 'premium')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    custom_domain VARCHAR(255),
    seo_title VARCHAR(255),
    seo_description TEXT,
    services JSONB DEFAULT '[]',
    social_links JSONB DEFAULT '{}',
    business_hours_notes TEXT,
    payment_methods TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    accessibility_features TEXT[] DEFAULT '{}',
    insurance_accepted TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(directory_id, slug)
);

-- Create reviews table
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    helpful INTEGER DEFAULT 0
);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    plan_name VARCHAR(50) NOT NULL CHECK (plan_name IN ('basic', 'professional', 'premium')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    amount INTEGER NOT NULL, -- Amount in cents
    currency VARCHAR(3) DEFAULT 'usd',
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled')),
    payment_method VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_images table for better image management
CREATE TABLE business_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    image_type VARCHAR(20) DEFAULT 'gallery' CHECK (image_type IN ('profile', 'gallery', 'banner')),
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search_history table for analytics
CREATE TABLE search_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    search_query VARCHAR(255),
    filters JSONB DEFAULT '{}',
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_analytics table
CREATE TABLE business_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    page_views INTEGER DEFAULT 0,
    profile_views INTEGER DEFAULT 0,
    contact_clicks INTEGER DEFAULT 0,
    phone_clicks INTEGER DEFAULT 0,
    website_clicks INTEGER DEFAULT 0,
    review_views INTEGER DEFAULT 0,
    search_impressions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, date)
);

-- Create indexes for better performance
CREATE INDEX idx_directories_slug ON directories(slug);
CREATE INDEX idx_directories_domain ON directories(domain);
CREATE INDEX idx_directories_subdomain ON directories(subdomain);
CREATE INDEX idx_directories_is_active ON directories(is_active);

CREATE INDEX idx_businesses_directory_id ON businesses(directory_id);
CREATE INDEX idx_businesses_directory_slug ON businesses(directory_id, slug);
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_businesses_city ON businesses(city);
CREATE INDEX idx_businesses_state ON businesses(state);
CREATE INDEX idx_businesses_zip_code ON businesses(zip_code);
CREATE INDEX idx_businesses_rating ON businesses(rating);
CREATE INDEX idx_businesses_featured ON businesses(featured);
CREATE INDEX idx_businesses_verified ON businesses(verified);
CREATE INDEX idx_businesses_subscription_status ON businesses(subscription_status);
CREATE INDEX idx_businesses_subscription_plan ON businesses(subscription_plan);
CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX idx_businesses_location ON businesses USING GIST (ST_Point(longitude, latitude));
CREATE INDEX idx_businesses_created_at ON businesses(created_at);
CREATE INDEX idx_businesses_tags ON businesses USING GIN(tags);
-- Create immutable function for search indexing
CREATE OR REPLACE FUNCTION business_search_vector(name TEXT, description TEXT, tags TEXT[])
RETURNS tsvector AS $$
BEGIN
    RETURN to_tsvector('english', name || ' ' || description || ' ' || array_to_string(tags, ' '));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create search index using the immutable function
CREATE INDEX idx_businesses_search ON businesses USING GIN(business_search_vector(name, description, tags));
CREATE INDEX idx_businesses_directory_search ON businesses(directory_id, subscription_status) WHERE subscription_status = 'active';

CREATE INDEX idx_reviews_business_id ON reviews(business_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_subscriptions_business_id ON subscriptions(business_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

CREATE INDEX idx_payments_business_id ON payments(business_id);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

CREATE INDEX idx_business_images_business_id ON business_images(business_id);
CREATE INDEX idx_business_images_type ON business_images(image_type);
CREATE INDEX idx_business_images_primary ON business_images(is_primary);

CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_created_at ON search_history(created_at);

CREATE INDEX idx_business_analytics_business_id ON business_analytics(business_id);
CREATE INDEX idx_business_analytics_date ON business_analytics(date);
CREATE INDEX idx_business_analytics_business_date ON business_analytics(business_id, date);

-- Create function to generate slug from business name
CREATE OR REPLACE FUNCTION generate_business_slug(business_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert to lowercase, replace spaces and special chars with hyphens
    base_slug := lower(regexp_replace(business_name, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    final_slug := base_slug;
    
    -- Check if slug exists and add counter if needed
    WHILE EXISTS (SELECT 1 FROM businesses WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to auto-generate slug on insert
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_business_slug(NEW.name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate slug
CREATE TRIGGER auto_generate_business_slug
    BEFORE INSERT ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_slug();

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_businesses_updated_at 
    BEFORE UPDATE ON businesses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL(10, 8),
    lon1 DECIMAL(11, 8),
    lat2 DECIMAL(10, 8),
    lon2 DECIMAL(11, 8)
)
RETURNS DECIMAL AS $$
BEGIN
    RETURN ST_Distance(
        ST_Point(lon1, lat1)::geography,
        ST_Point(lon2, lat2)::geography
    ) / 1609.344; -- Convert meters to miles
END;
$$ LANGUAGE plpgsql;

-- Create function to search businesses with full-text search
CREATE OR REPLACE FUNCTION search_businesses_advanced(
    search_query TEXT DEFAULT NULL,
    search_category VARCHAR(100) DEFAULT NULL,
    search_city VARCHAR(100) DEFAULT NULL,
    search_state VARCHAR(50) DEFAULT NULL,
    search_zip VARCHAR(20) DEFAULT NULL,
    search_radius DECIMAL DEFAULT 25,
    min_rating DECIMAL(3, 2) DEFAULT 0,
    search_tags TEXT[] DEFAULT NULL,
    directory_id UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    tags TEXT[],
    images TEXT[],
    profile_image VARCHAR(500),
    hours JSONB,
    rating DECIMAL(3, 2),
    review_count INTEGER,
    verified BOOLEAN,
    featured BOOLEAN,
    subscription_status VARCHAR(20),
    subscription_plan VARCHAR(50),
    distance DECIMAL,
    search_rank REAL
) AS $$
DECLARE
    search_lat DECIMAL(10, 8) := 0;
    search_lon DECIMAL(11, 8) := 0;
BEGIN
    -- For now, we'll use placeholder coordinates
    -- In production, integrate with a geocoding service
    
    RETURN QUERY
    SELECT 
        b.*,
        CASE 
            WHEN search_zip IS NOT NULL AND b.latitude IS NOT NULL AND b.longitude IS NOT NULL
            THEN calculate_distance(search_lat, search_lon, b.latitude, b.longitude)
            ELSE 0
        END as distance,
        CASE 
            WHEN search_query IS NOT NULL 
            THEN ts_rank(business_search_vector(b.name, b.description, b.tags), 
                        plainto_tsquery('english', search_query))
            ELSE 0
        END as search_rank
    FROM businesses b
    WHERE 
        b.subscription_status = 'active'
        AND (directory_id IS NULL OR b.directory_id = directory_id)
        AND (search_category IS NULL OR b.category ILIKE '%' || search_category || '%')
        AND (search_city IS NULL OR b.city ILIKE '%' || search_city || '%')
        AND (search_state IS NULL OR b.state ILIKE '%' || search_state || '%')
        AND (search_zip IS NULL OR b.zip_code ILIKE '%' || search_zip || '%')
        AND (search_query IS NULL OR 
             business_search_vector(b.name, b.description, b.tags) @@ plainto_tsquery('english', search_query) OR
             b.name ILIKE '%' || search_query || '%' OR 
             b.description ILIKE '%' || search_query || '%')
        AND b.rating >= min_rating
        AND (search_tags IS NULL OR b.tags && search_tags)
        AND (search_zip IS NULL OR search_radius IS NULL OR 
             b.latitude IS NULL OR b.longitude IS NULL OR
             calculate_distance(search_lat, search_lon, b.latitude, b.longitude) <= search_radius)
    ORDER BY 
        CASE WHEN search_query IS NOT NULL THEN search_rank ELSE 0 END DESC,
        b.featured DESC,
        b.rating DESC,
        b.review_count DESC,
        distance ASC
    LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to update business analytics
CREATE OR REPLACE FUNCTION update_business_analytics(
    p_business_id UUID,
    p_metric VARCHAR(50),
    p_increment INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO business_analytics (business_id, date, page_views, profile_views, contact_clicks, phone_clicks, website_clicks, review_views, search_impressions)
    VALUES (
        p_business_id, 
        CURRENT_DATE,
        CASE WHEN p_metric = 'page_views' THEN p_increment ELSE 0 END,
        CASE WHEN p_metric = 'profile_views' THEN p_increment ELSE 0 END,
        CASE WHEN p_metric = 'contact_clicks' THEN p_increment ELSE 0 END,
        CASE WHEN p_metric = 'phone_clicks' THEN p_increment ELSE 0 END,
        CASE WHEN p_metric = 'website_clicks' THEN p_increment ELSE 0 END,
        CASE WHEN p_metric = 'review_views' THEN p_increment ELSE 0 END,
        CASE WHEN p_metric = 'search_impressions' THEN p_increment ELSE 0 END
    )
    ON CONFLICT (business_id, date) DO UPDATE SET
        page_views = business_analytics.page_views + CASE WHEN p_metric = 'page_views' THEN p_increment ELSE 0 END,
        profile_views = business_analytics.profile_views + CASE WHEN p_metric = 'profile_views' THEN p_increment ELSE 0 END,
        contact_clicks = business_analytics.contact_clicks + CASE WHEN p_metric = 'contact_clicks' THEN p_increment ELSE 0 END,
        phone_clicks = business_analytics.phone_clicks + CASE WHEN p_metric = 'phone_clicks' THEN p_increment ELSE 0 END,
        website_clicks = business_analytics.website_clicks + CASE WHEN p_metric = 'website_clicks' THEN p_increment ELSE 0 END,
        review_views = business_analytics.review_views + CASE WHEN p_metric = 'review_views' THEN p_increment ELSE 0 END,
        search_impressions = business_analytics.search_impressions + CASE WHEN p_metric = 'search_impressions' THEN p_increment ELSE 0 END;
END;
$$ LANGUAGE plpgsql;

-- Insert sample directories
INSERT INTO directories (slug, name, description, domain, subdomain, theme_config, settings) VALUES
('wellness-sf', 'San Francisco Wellness Directory', 'Find the best wellness professionals in San Francisco', 'wellness-sf.com', 'sf', '{"primaryColor": "#3B82F6", "secondaryColor": "#1E40AF", "logo": "/logos/sf-wellness.png"}', '{"allowBusinessRegistration": true, "requireVerification": true, "maxBusinessesPerUser": 3}'),
('wellness-nyc', 'New York Wellness Directory', 'Premier wellness directory for New York City', 'wellness-nyc.com', 'nyc', '{"primaryColor": "#EF4444", "secondaryColor": "#DC2626", "logo": "/logos/nyc-wellness.png"}', '{"allowBusinessRegistration": true, "requireVerification": true, "maxBusinessesPerUser": 5}'),
('wellness-la', 'Los Angeles Wellness Directory', 'Discover wellness professionals in Los Angeles', 'wellness-la.com', 'la', '{"primaryColor": "#F59E0B", "secondaryColor": "#D97706", "logo": "/logos/la-wellness.png"}', '{"allowBusinessRegistration": true, "requireVerification": false, "maxBusinessesPerUser": 2}'),
('mental-health-directory', 'Mental Health Directory', 'Specialized directory for mental health professionals', 'mentalhealth-directory.com', 'mental-health', '{"primaryColor": "#8B5CF6", "secondaryColor": "#7C3AED", "logo": "/logos/mental-health.png"}', '{"allowBusinessRegistration": true, "requireVerification": true, "maxBusinessesPerUser": 1}'),
('fitness-directory', 'Fitness Professionals Directory', 'Connect with fitness trainers and coaches', 'fitness-directory.com', 'fitness', '{"primaryColor": "#10B981", "secondaryColor": "#059669", "logo": "/logos/fitness.png"}', '{"allowBusinessRegistration": true, "requireVerification": false, "maxBusinessesPerUser": 3}');

-- Insert sample data with new categories
INSERT INTO businesses (directory_id, name, description, category, subcategory, address, city, state, zip_code, latitude, longitude, phone, email, website, tags, images, profile_image, hours, rating, review_count, verified, featured, subscription_status, subscription_plan, services, social_links, payment_methods, languages, accessibility_features, insurance_accepted) VALUES
((SELECT id FROM directories WHERE slug = 'wellness-sf'), 'Mindful Therapy Center', 'Licensed therapists specializing in anxiety, depression, and trauma recovery. We offer individual, couples, and group therapy sessions with a holistic approach to mental wellness.', 'Therapist', 'Mental Health Therapist', '123 Wellness Way', 'San Francisco', 'CA', '94102', 37.7749, -122.4194, '(415) 555-0123', 'hello@mindfultherapy.com', 'https://mindfultherapy.com', ARRAY['licensed', 'insurance accepted', 'virtual sessions', 'individual therapy', 'anxiety', 'depression', 'trauma', 'LGBTQ+ friendly'], ARRAY['/cozy-coffee-shop.png'], '/cozy-coffee-shop.png', '{"monday": {"open": "8:00", "close": "20:00"}, "tuesday": {"open": "8:00", "close": "20:00"}, "wednesday": {"open": "8:00", "close": "20:00"}, "thursday": {"open": "8:00", "close": "20:00"}, "friday": {"open": "8:00", "close": "18:00"}, "saturday": {"open": "9:00", "close": "15:00"}, "sunday": {"closed": true}}', 4.8, 127, true, true, 'active', 'professional', '[{"name": "Individual Therapy", "price": "$150/session", "duration": "50 minutes"}, {"name": "Couples Counseling", "price": "$180/session", "duration": "60 minutes"}, {"name": "Group Therapy", "price": "$75/session", "duration": "90 minutes"}]', '{"facebook": "https://facebook.com/mindfultherapy", "instagram": "https://instagram.com/mindfultherapy", "linkedin": "https://linkedin.com/company/mindfultherapy"}', ARRAY['cash', 'credit card', 'insurance', 'hsa'], ARRAY['English', 'Spanish'], ARRAY['wheelchair accessible', 'hearing assistance'], ARRAY['Aetna', 'Blue Cross', 'Cigna', 'Kaiser']),
((SELECT id FROM directories WHERE slug = 'mental-health-directory'), 'Dr. Michael Johnson Psychiatry', 'Board-certified psychiatrist specializing in mood disorders, anxiety, ADHD, and medication management. Comprehensive psychiatric evaluations and ongoing care.', 'Psychiatrist', 'Adult Psychiatry', '456 Medical Plaza', 'San Francisco', 'CA', '94103', 37.7849, -122.4094, '(415) 555-0456', 'contact@drjohnsonpsych.com', 'https://drjohnsonpsych.com', ARRAY['board certified', 'insurance accepted', 'virtual sessions', 'medication management', 'anxiety', 'depression', 'ADHD', 'evidence-based'], ARRAY['/computer-repair-shop.png'], '/computer-repair-shop.png', '{"monday": {"open": "9:00", "close": "18:00"}, "tuesday": {"open": "9:00", "close": "18:00"}, "wednesday": {"open": "9:00", "close": "18:00"}, "thursday": {"open": "9:00", "close": "18:00"}, "friday": {"open": "9:00", "close": "17:00"}, "saturday": {"open": "10:00", "close": "14:00"}, "sunday": {"closed": true}}', 4.9, 89, true, true, 'active', 'premium', '[{"name": "Psychiatric Evaluation", "price": "$300/session", "duration": "90 minutes"}, {"name": "Medication Management", "price": "$150/session", "duration": "30 minutes"}, {"name": "Psychotherapy Session", "price": "$200/session", "duration": "50 minutes"}]', '{"linkedin": "https://linkedin.com/in/drjohnson"}', ARRAY['cash', 'credit card', 'insurance', 'hsa'], ARRAY['English', 'Spanish'], ARRAY['wheelchair accessible'], ARRAY['Aetna', 'Blue Cross', 'Cigna', 'United Healthcare']),
((SELECT id FROM directories WHERE slug = 'wellness-sf'), 'Wellness Life Coaching', 'Certified health coaches helping you achieve your wellness goals through personalized guidance, accountability, and lifestyle optimization strategies.', 'Health Coach', 'Wellness Coach', '789 Wellness Boulevard', 'San Francisco', 'CA', '94104', 37.7649, -122.4294, '(415) 555-0789', 'hello@wellnesslifecoaching.com', 'https://wellnesslifecoaching.com', ARRAY['certified', 'holistic approach', 'virtual sessions', 'stress management', 'lifestyle optimization', 'goal setting', 'accountability', 'work-life balance'], ARRAY['/landscaped-garden.png'], '/landscaped-garden.png', '{"monday": {"open": "7:00", "close": "20:00"}, "tuesday": {"open": "7:00", "close": "20:00"}, "wednesday": {"open": "7:00", "close": "20:00"}, "thursday": {"open": "7:00", "close": "20:00"}, "friday": {"open": "7:00", "close": "19:00"}, "saturday": {"open": "8:00", "close": "15:00"}, "sunday": {"open": "9:00", "close": "14:00"}}', 4.7, 156, true, true, 'active', 'basic', '[{"name": "Initial Consultation", "price": "$120/session", "duration": "60 minutes"}, {"name": "Ongoing Coaching", "price": "$90/session", "duration": "45 minutes"}, {"name": "Group Coaching", "price": "$40/session", "duration": "60 minutes"}]', '{"instagram": "https://instagram.com/wellnesslifecoaching", "facebook": "https://facebook.com/wellnesslifecoaching"}', ARRAY['cash', 'credit card'], ARRAY['English'], ARRAY['wheelchair accessible', 'virtual only'], ARRAY[]::TEXT[]),
((SELECT id FROM directories WHERE slug = 'fitness-directory'), 'Elite Personal Training Studio', 'Certified personal trainers specializing in strength training, weight loss, and athletic performance. One-on-one training and small group sessions available.', 'Personal Trainer', 'Strength & Conditioning', '321 Fitness Way', 'San Francisco', 'CA', '94105', 37.7549, -122.4094, '(415) 555-0321', 'info@eliteptstudio.com', 'https://eliteptstudio.com', ARRAY['certified', 'NASM certified', 'strength training', 'weight loss', 'athletic performance', 'nutrition guidance', 'flexible scheduling'], ARRAY['/placeholder.jpg'], '/placeholder.jpg', '{"monday": {"open": "6:00", "close": "21:00"}, "tuesday": {"open": "6:00", "close": "21:00"}, "wednesday": {"open": "6:00", "close": "21:00"}, "thursday": {"open": "6:00", "close": "21:00"}, "friday": {"open": "6:00", "close": "20:00"}, "saturday": {"open": "7:00", "close": "18:00"}, "sunday": {"open": "8:00", "close": "15:00"}}', 4.9, 203, true, true, 'active', 'professional', '[{"name": "Personal Training Session", "price": "$85/session", "duration": "60 minutes"}, {"name": "Small Group Training", "price": "$35/session", "duration": "60 minutes"}, {"name": "Fitness Assessment", "price": "$50/assessment", "duration": "45 minutes"}]', '{"instagram": "https://instagram.com/eliteptstudio", "facebook": "https://facebook.com/eliteptstudio"}', ARRAY['cash', 'credit card'], ARRAY['English', 'Spanish'], ARRAY['wheelchair accessible'], ARRAY[]::TEXT[]),
((SELECT id FROM directories WHERE slug = 'wellness-sf'), 'Nutrition Solutions by Sarah Chen, RD', 'Registered Dietitian specializing in weight management, sports nutrition, chronic disease prevention, and personalized meal planning.', 'Registered Dietitian', 'Clinical Nutrition', '654 Health Plaza', 'San Francisco', 'CA', '94106', 37.7449, -122.4294, '(415) 555-0654', 'sarah@nutritionsolutions.com', 'https://nutritionsolutions.com', ARRAY['registered dietitian', 'insurance accepted', 'virtual sessions', 'weight management', 'sports nutrition', 'meal planning', 'diabetes management', 'evidence-based'], ARRAY['/placeholder.jpg'], '/placeholder.jpg', '{"monday": {"open": "9:00", "close": "18:00"}, "tuesday": {"open": "9:00", "close": "18:00"}, "wednesday": {"open": "9:00", "close": "18:00"}, "thursday": {"open": "9:00", "close": "18:00"}, "friday": {"open": "9:00", "close": "17:00"}, "saturday": {"open": "10:00", "close": "14:00"}, "sunday": {"closed": true}}', 4.8, 98, true, false, 'active', 'professional', '[{"name": "Nutrition Consultation", "price": "$130/session", "duration": "60 minutes"}, {"name": "Meal Planning Service", "price": "$200/month", "duration": "Ongoing"}, {"name": "Follow-up Session", "price": "$80/session", "duration": "30 minutes"}]', '{"instagram": "https://instagram.com/nutritionsolutions", "linkedin": "https://linkedin.com/in/sarahchen"}', ARRAY['cash', 'credit card', 'insurance', 'hsa'], ARRAY['English', 'Mandarin'], ARRAY['wheelchair accessible', 'hearing assistance'], ARRAY['Aetna', 'Blue Cross', 'Cigna', 'United Healthcare']);

-- Insert sample reviews
INSERT INTO reviews (business_id, user_id, user_name, rating, comment, helpful) VALUES
((SELECT id FROM businesses WHERE name = 'Mindful Therapy Center'), uuid_generate_v4(), 'Sarah Johnson', 5, 'Amazing therapist! Really helped me work through my anxiety. The virtual sessions were just as effective as in-person.', 12),
((SELECT id FROM businesses WHERE name = 'Mindful Therapy Center'), uuid_generate_v4(), 'Mike Chen', 4, 'Great experience overall. The therapist was very professional and understanding.', 8),
((SELECT id FROM businesses WHERE name = 'Dr. Michael Johnson Psychiatry'), uuid_generate_v4(), 'Emily Rodriguez', 5, 'Dr. Johnson is incredibly knowledgeable and caring. His medication management approach has been life-changing for me.', 15),
((SELECT id FROM businesses WHERE name = 'Elite Personal Training Studio'), uuid_generate_v4(), 'David Kim', 5, 'Best personal trainer I''ve ever worked with. The customized workout plan helped me reach my fitness goals.', 20),
((SELECT id FROM businesses WHERE name = 'Nutrition Solutions by Sarah Chen, RD'), uuid_generate_v4(), 'Lisa Thompson', 5, 'Sarah completely transformed my relationship with food. Her evidence-based approach and meal planning are fantastic!', 18);

-- Update review counts
UPDATE businesses SET review_count = (
    SELECT COUNT(*) FROM reviews WHERE business_id = businesses.id
);

-- Update ratings
UPDATE businesses SET rating = (
    SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE business_id = businesses.id
);

# Multi-Tenant Directory Setup Guide

This guide explains how to set up and manage multiple directories using a single database and codebase.

## 🏗️ Architecture Overview

### Single Database, Multiple Directories
- **One Database**: All directories share the same Supabase database
- **Directory Isolation**: Data is filtered by `directory_id` in all queries
- **Shared Resources**: Users, payments, and analytics are shared across directories
- **Custom Branding**: Each directory can have its own theme, domain, and settings

### Benefits
- **Cost Effective**: One database, one deployment, multiple revenue streams
- **Easy Management**: Centralized admin panel for all directories
- **Shared Analytics**: Cross-directory insights and reporting
- **Scalable**: Add new directories without additional infrastructure

## 🚀 Quick Setup

### 1. Database Configuration

Run the updated `supabase-schema.sql` which includes:
- `directories` table for directory management
- Updated `businesses` table with `directory_id` foreign key
- Enhanced search functions with directory filtering
- Sample directories and data

### 2. Environment Variables

No additional environment variables needed! The same Stripe and Supabase configuration works for all directories.

### 3. Directory Detection

The system automatically detects the current directory based on:
1. **Subdomain**: `sf.yourdomain.com` → San Francisco directory
2. **Domain**: `wellness-sf.com` → San Francisco directory  
3. **URL Path**: `/directory/wellness-sf` → San Francisco directory
4. **Default**: First active directory

## 📊 Directory Management

### Creating Directories

#### Via Admin Panel
1. Go to `/admin/directories`
2. Click "Create New Directory"
3. Fill in directory details:
   - **Name**: Display name (e.g., "San Francisco Wellness")
   - **Slug**: URL-friendly identifier (e.g., "wellness-sf")
   - **Domain**: Custom domain (optional)
   - **Subdomain**: Subdomain for multi-tenant setup (optional)
   - **Theme**: Colors and branding
   - **Settings**: Business registration rules

#### Via API
```typescript
const { data, error } = await supabase
  .from('directories')
  .insert({
    name: 'New York Wellness Directory',
    slug: 'wellness-nyc',
    domain: 'wellness-nyc.com',
    subdomain: 'nyc',
    theme_config: {
      primaryColor: '#EF4444',
      secondaryColor: '#DC2626'
    },
    settings: {
      allowBusinessRegistration: true,
      requireVerification: true,
      maxBusinessesPerUser: 5
    }
  })
```

### Directory Settings

Each directory can have unique settings:

```typescript
interface DirectorySettings {
  allowBusinessRegistration: boolean    // Can businesses register?
  requireVerification: boolean         // Must businesses be verified?
  maxBusinessesPerUser: number         // Max businesses per user
  allowedCategories?: string[]         // Restrict to specific categories
  customFields?: Record<string, any>   // Custom form fields
}
```

## 🌐 Domain Configuration

### Option 1: Subdomains
- **Setup**: `sf.yourdomain.com`, `nyc.yourdomain.com`
- **DNS**: Add CNAME records pointing to your main domain
- **Benefits**: Easy setup, shared SSL certificate
- **Example**: 
  - `sf.wellness-directory.com` → San Francisco
  - `nyc.wellness-directory.com` → New York

### Option 2: Custom Domains
- **Setup**: `wellness-sf.com`, `wellness-nyc.com`
- **DNS**: Point domains to your hosting provider
- **Benefits**: Brand independence, better SEO
- **Example**:
  - `wellness-sf.com` → San Francisco
  - `wellness-nyc.com` → New York

### Option 3: URL Paths
- **Setup**: `yourdomain.com/directory/sf`, `yourdomain.com/directory/nyc`
- **Benefits**: No DNS configuration needed
- **Example**:
  - `wellness-directory.com/directory/sf` → San Francisco
  - `wellness-directory.com/directory/nyc` → New York

## 🎨 Customization

### Theme Configuration

Each directory can have unique branding:

```typescript
interface ThemeConfig {
  primaryColor: string      // Main brand color
  secondaryColor: string    // Accent color
  logo?: string            // Custom logo URL
  customCSS?: string       // Additional CSS
}
```

### Custom Fields

Add directory-specific fields to business registration:

```typescript
// Example: Mental Health Directory
const customFields = {
  licenseNumber: { type: 'text', required: true },
  specializations: { type: 'multiselect', options: ['Anxiety', 'Depression'] },
  insuranceAccepted: { type: 'checkbox', options: ['Aetna', 'Blue Cross'] }
}
```

## 🔍 Search and Filtering

### Directory-Aware Search

All search functions automatically filter by current directory:

```typescript
// Search only in current directory
const { data } = await supabase.rpc('search_businesses_advanced', {
  search_query: 'therapy',
  directory_id: currentDirectory.id,  // Automatically filtered
  limit_count: 20
})
```

### Cross-Directory Search (Admin)

Search across all directories for admin purposes:

```typescript
// Search all directories
const { data } = await supabase.rpc('search_businesses_advanced', {
  search_query: 'therapy',
  directory_id: null,  // No directory filter
  limit_count: 50
})
```

## 📈 Analytics and Reporting

### Directory-Specific Analytics

Track performance per directory:

```typescript
// Get analytics for specific directory
const { data } = await supabase
  .from('business_analytics')
  .select('*')
  .eq('business_id', businessId)
  .eq('date', '2024-01-01')
```

### Cross-Directory Insights

Compare performance across directories:

```sql
SELECT 
  d.name as directory_name,
  COUNT(b.id) as total_businesses,
  AVG(b.rating) as avg_rating,
  SUM(ba.page_views) as total_page_views
FROM directories d
LEFT JOIN businesses b ON d.id = b.directory_id
LEFT JOIN business_analytics ba ON b.id = ba.business_id
GROUP BY d.id, d.name
```

## 💰 Revenue Management

### Shared Payment System

All directories use the same Stripe configuration:
- **One Stripe Account**: All payments go to your account
- **Directory Tracking**: Payments are tagged with directory_id
- **Revenue Attribution**: Track which directory generates revenue

### Pricing by Directory

Set different pricing per directory:

```typescript
// Directory-specific pricing
const pricing = {
  'wellness-sf': { basic: 29, professional: 79, premium: 149 },
  'wellness-nyc': { basic: 39, professional: 99, premium: 199 },
  'mental-health': { basic: 49, professional: 129, premium: 249 }
}
```

## 🛠️ Development Workflow

### Adding New Directories

1. **Create Directory**: Use admin panel or API
2. **Configure Domain**: Set up DNS if using custom domains
3. **Customize Theme**: Set colors, logo, and branding
4. **Configure Settings**: Set business registration rules
5. **Test**: Verify directory works correctly

### Directory-Specific Features

Add features that only work in certain directories:

```typescript
// Check if feature is enabled for current directory
const isFeatureEnabled = currentDirectory?.settings?.customFields?.enableBooking

if (isFeatureEnabled) {
  // Show booking feature
}
```

## 🔒 Security and Access Control

### Row Level Security (RLS)

Ensure data isolation between directories:

```sql
-- Only show businesses from current directory
CREATE POLICY "directory_isolation" ON businesses
FOR ALL USING (directory_id = current_setting('app.current_directory_id')::uuid)
```

### User Permissions

Control which users can access which directories:

```typescript
// Check if user can access directory
const canAccess = user.directories.includes(directoryId) || user.role === 'admin'
```

## 📱 Mobile and SEO

### Mobile Optimization

Each directory can have mobile-specific settings:
- Custom mobile themes
- Directory-specific PWA configuration
- Mobile-only features

### SEO Optimization

Directory-specific SEO:
- Custom meta tags per directory
- Directory-specific sitemaps
- Local SEO optimization
- Custom structured data

## 🚀 Deployment

### Single Deployment

Deploy once, serve multiple directories:
- **Vercel**: Automatic deployments from main branch
- **Environment Variables**: Same for all directories
- **Database**: Shared Supabase instance
- **CDN**: Shared Vercel Edge Network

### Scaling Considerations

- **Database**: Monitor query performance with directory filtering
- **Caching**: Cache directory-specific data separately
- **CDN**: Use directory-specific cache keys
- **Monitoring**: Track performance per directory

## 📊 Monitoring and Analytics

### Directory Performance

Track key metrics per directory:
- Business registrations
- Search queries
- Page views
- Revenue
- User engagement

### Cross-Directory Insights

Compare directories:
- Which directories perform best?
- What features drive engagement?
- Where should you focus marketing?

## 🎯 Use Cases

### Geographic Directories
- San Francisco Wellness Directory
- New York Wellness Directory
- Los Angeles Wellness Directory

### Niche Directories
- Mental Health Directory
- Fitness Professionals Directory
- Holistic Health Directory

### Industry-Specific
- Healthcare Providers Directory
- Wellness Coaches Directory
- Alternative Medicine Directory

## 🔧 Troubleshooting

### Common Issues

#### Directory Not Loading
- Check directory is active (`is_active = true`)
- Verify domain/subdomain configuration
- Check DNS settings

#### Search Not Working
- Ensure `directory_id` is being passed to search functions
- Check RLS policies
- Verify directory exists

#### Theme Not Applying
- Check `theme_config` JSON format
- Verify CSS is being applied
- Check for conflicting styles

### Getting Help

- Check the logs for directory-specific errors
- Verify database queries include `directory_id`
- Test with different directories
- Check admin panel for directory status

---

This multi-tenant setup allows you to run multiple directory businesses from a single codebase, maximizing efficiency while providing unique experiences for each directory.

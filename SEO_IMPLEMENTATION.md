# SEO Implementation Guide

## Overview

Comprehensive SEO optimization has been implemented for MinBod (https://minbod.netlify.app), including dynamic sitemaps, structured data, enhanced metadata, and social media optimization.

## What Has Been Implemented

### 1. Dynamic Sitemap (`app/sitemap.ts`)

A dynamic sitemap that automatically includes:
- **Static Pages**: Homepage, search, register, subscribe, onboard, signup, signin
- **Dynamic Business Pages**: All verified businesses from your Supabase database
- **Proper Configuration**:
  - Homepage: Priority 1.0, updated daily
  - Business pages: Priority 0.8, updated weekly
  - Static pages: Priority 0.6, updated monthly

**Access**: `https://minbod.netlify.app/sitemap.xml`

### 2. Robots.txt (`app/robots.ts`)

Configured to:
- Allow all search engines to crawl public pages
- Disallow crawling of: `/api/`, `/admin/`, `/dashboard/`, `/_next/`, `/private/`
- Reference the sitemap location
- Set proper host directive

**Access**: `https://minbod.netlify.app/robots.txt`

### 3. Enhanced Root Metadata (`app/layout.tsx`)

Added comprehensive metadata including:
- **SEO Title**: "MinBod - Find Health & Wellness Professionals Near You"
- **Description**: Optimized for health and wellness searches
- **Keywords**: Therapists, psychiatrists, health coaches, trainers, dietitians
- **Open Graph Tags**: For Facebook, LinkedIn sharing
- **Twitter Cards**: For Twitter sharing
- **Robots Directives**: Proper indexing rules for Google
- **Verification Placeholders**: Google, Bing (update with actual codes)

### 4. Homepage SEO (`app/page.tsx`)

Implemented:
- **Page-specific Metadata**: Title, description, canonical URL
- **JSON-LD Structured Data**:
  - Organization schema with contact point
  - SearchAction schema for site search functionality
  - Logo and description for rich snippets

### 5. Business Page SEO (`app/business/[slug]/page.tsx`)

Added comprehensive structured data:
- **LocalBusiness Schema**: Name, description, contact info, address
- **GeoCoordinates**: Latitude/longitude for map integration
- **AggregateRating**: Star ratings and review counts
- **OpeningHours**: Business hours for each day
- **Breadcrumb Schema**: Navigation hierarchy
- **Enhanced Metadata**: Already had good metadata, now with more details

### 6. Other Pages Metadata

Added SEO metadata to:
- **Register Page** (`/register`): Business registration SEO
- **Subscribe Page** (`/subscribe`): Subscription plans SEO
- **Onboard Page** (`/onboard`): Healthcare practice listing SEO

**Note**: `signup` and `signin` pages are client components and don't require heavy SEO optimization (authentication pages are typically noindex).

### 7. Environment Configuration (`lib/env.ts`)

Updated to use production domain:
- Development: `http://localhost:3000`
- Production: `https://minbod.netlify.app`
- Automatically switches based on `NODE_ENV`

## Verification Steps

### 1. Test Sitemap
Visit: `https://minbod.netlify.app/sitemap.xml`
- Should see all static pages
- Should see all verified businesses
- Verify XML format is correct

### 2. Test Robots.txt
Visit: `https://minbod.netlify.app/robots.txt`
- Should show allowed/disallowed paths
- Should reference sitemap

### 3. Test Structured Data
Use Google's Rich Results Test:
1. Go to: https://search.google.com/test/rich-results
2. Enter your homepage URL: `https://minbod.netlify.app`
3. Verify Organization and SearchAction schemas are detected
4. Test a business page URL to verify LocalBusiness schema

### 4. Test Open Graph Tags
Use Facebook's Sharing Debugger:
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your URLs
3. Verify images, titles, descriptions appear correctly

### 5. Test Twitter Cards
Use Twitter Card Validator:
1. Go to: https://cards-dev.twitter.com/validator
2. Enter your URLs
3. Verify card preview looks good

## Submit to Search Engines

### Google Search Console
1. Go to: https://search.google.com/search-console
2. Add property: `https://minbod.netlify.app`
3. Verify ownership (use HTML tag method)
4. Update verification code in `app/layout.tsx`:
   ```typescript
   verification: {
     google: 'your-actual-verification-code',
   }
   ```
5. Submit sitemap: `https://minbod.netlify.app/sitemap.xml`

### Bing Webmaster Tools
1. Go to: https://www.bing.com/webmasters
2. Add your site
3. Verify ownership
4. Submit sitemap

### Other Search Engines
- **Yandex**: https://webmaster.yandex.com/
- **DuckDuckGo**: Uses Bing index, no separate submission needed

## Monitoring & Optimization

### Google Search Console
Monitor:
- **Coverage**: Which pages are indexed
- **Performance**: Impressions, clicks, CTR, position
- **Enhancements**: Rich results, mobile usability
- **Sitemaps**: Submission status and coverage

### Key Metrics to Track
- **Organic Traffic**: Users from search engines
- **Top Queries**: What people search for
- **Top Pages**: Which pages get the most traffic
- **Click-Through Rate**: How often search listings get clicked
- **Average Position**: Where your pages rank

### Optimization Tips

1. **Title Tags**: Keep under 60 characters
2. **Meta Descriptions**: Keep under 160 characters
3. **Heading Structure**: Use H1, H2, H3 properly
4. **Internal Linking**: Link between related pages
5. **Image Alt Text**: Add descriptive alt text to images
6. **Page Speed**: Optimize images, minimize JS/CSS
7. **Mobile-Friendly**: Already implemented responsive design
8. **Fresh Content**: Update business listings regularly

## Local SEO Features

For each business, the structured data includes:
- **NAP**: Name, Address, Phone
- **GeoCoordinates**: For Google Maps integration
- **Business Hours**: Opening/closing times
- **Reviews & Ratings**: Aggregate rating data
- **Business Category**: Health professional types

This helps businesses appear in:
- Google Maps
- Local pack results
- "Near me" searches
- Voice search results

## Schema.org Structured Data

### Organization Schema (Homepage)
```json
{
  "@type": "Organization",
  "name": "MinBod",
  "url": "https://minbod.netlify.app",
  "logo": "...",
  "contactPoint": {...},
  "potentialAction": {
    "@type": "SearchAction"
  }
}
```

### LocalBusiness Schema (Business Pages)
```json
{
  "@type": "LocalBusiness",
  "name": "...",
  "address": {...},
  "geo": {...},
  "aggregateRating": {...},
  "openingHoursSpecification": [...]
}
```

### BreadcrumbList Schema (Business Pages)
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"position": 1, "name": "Home"},
    {"position": 2, "name": "Category"},
    {"position": 3, "name": "Business"}
  ]
}
```

## Best Practices Implemented

✅ **Mobile-First Indexing**: Responsive design
✅ **HTTPS**: Secure connection (Netlify provides SSL)
✅ **Canonical URLs**: Prevent duplicate content
✅ **Structured Data**: Rich snippets in search results
✅ **Sitemap**: Automated discovery of all pages
✅ **Robots.txt**: Proper crawling directives
✅ **Open Graph**: Social media optimization
✅ **Page Speed**: Optimized with Next.js
✅ **Semantic HTML**: Proper heading hierarchy
✅ **Alt Text**: Image accessibility (verify in components)

## Next Steps

### Immediate Actions
1. ✅ Deploy to Netlify (already at minbod.netlify.app)
2. ⬜ Add actual Google verification code to `app/layout.tsx`
3. ⬜ Submit sitemap to Google Search Console
4. ⬜ Submit sitemap to Bing Webmaster Tools
5. ⬜ Test all pages with Rich Results Test
6. ⬜ Test Open Graph tags with Facebook Debugger

### Ongoing Optimization
1. Monitor search performance weekly
2. Optimize meta descriptions based on CTR data
3. Add more internal links between related pages
4. Create location-specific landing pages for popular cities
5. Encourage businesses to add complete information
6. Build backlinks from healthcare directories
7. Create blog content about health and wellness topics

## Common Issues & Solutions

### Sitemap Not Updating
- The sitemap is generated dynamically on each request
- If businesses aren't appearing, check they're marked as `verified: true` in the database

### Structured Data Errors
- Test with Google's Rich Results Test
- Check that all required fields have data
- Verify JSON-LD syntax is valid

### Pages Not Indexed
- Check robots.txt isn't blocking the page
- Verify page has unique, quality content
- Check Google Search Console for crawl errors
- Ensure page returns 200 status code

### Low Rankings
- SEO takes time (3-6 months to see results)
- Focus on quality content and user experience
- Build authoritative backlinks
- Optimize page speed and mobile experience

## Resources

- **Google Search Console**: https://search.google.com/search-console
- **Bing Webmaster Tools**: https://www.bing.com/webmasters
- **Rich Results Test**: https://search.google.com/test/rich-results
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
- **Schema.org Documentation**: https://schema.org/
- **Next.js SEO Guide**: https://nextjs.org/learn/seo/introduction-to-seo

## Support

If you need help with SEO:
1. Check Google Search Console for specific issues
2. Use the Rich Results Test to validate structured data
3. Review this documentation for best practices
4. Consider hiring an SEO consultant for advanced optimization

---

**Implementation Date**: October 10, 2025
**Domain**: https://minbod.netlify.app
**Status**: ✅ Ready for Production


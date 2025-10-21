import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use direct environment variable access to avoid issues
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://minbod.netlify.app'

  // Static pages with proper ISO date strings
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/subscribe`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/onboard`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  try {
    // Fetch all published businesses from Supabase
    const supabase = await createClient()
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('slug, updated_at')
      .eq('verified', true)
      .order('updated_at', { ascending: false })
      .limit(1000) // Limit to 1000 businesses to avoid sitemap size issues

    if (error) {
      console.error('Error fetching businesses for sitemap:', error)
      return staticPages
    }

    if (!businesses || businesses.length === 0) {
      console.log('No verified businesses found for sitemap')
      return staticPages
    }

    // Dynamic business pages with proper date handling
    const businessPages: MetadataRoute.Sitemap = businesses
      .filter(business => business.slug) // Only include businesses with valid slugs
      .map((business) => ({
        url: `${baseUrl}/business/${business.slug}`,
        lastModified: business.updated_at ? new Date(business.updated_at).toISOString() : new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))

    console.log(`Sitemap generated with ${staticPages.length} static pages and ${businessPages.length} business pages`)
    
    return [...staticPages, ...businessPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return static pages even if dynamic pages fail
    return staticPages
  }
}


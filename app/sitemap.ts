import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

// Helper function to get consistent date format
function getISODate(date?: string | Date): string {
  const d = date ? new Date(date) : new Date()
  return d.toISOString()
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use direct environment variable access to avoid issues
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://minbod.netlify.app'
  
  // Get current date once for consistency
  const currentDate = getISODate()

  // Static pages with consistent ISO date strings
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/subscribe`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/onboard`,
      lastModified: currentDate,
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
      // Return static pages if database fails
      return staticPages
    }

    if (!businesses || businesses.length === 0) {
      console.log('No verified businesses found for sitemap')
      return staticPages
    }

    // Dynamic business pages with consistent date handling
    const businessPages: MetadataRoute.Sitemap = businesses
      .filter(business => business.slug && business.slug.trim() !== '') // Only include businesses with valid, non-empty slugs
      .map((business) => ({
        url: `${baseUrl}/business/${business.slug}`,
        lastModified: getISODate(business.updated_at),
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


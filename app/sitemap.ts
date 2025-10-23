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

  // Static pages with consistent ISO date strings - ALWAYS return these
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

  // Always return static pages first, then try to add business pages
  console.log(`Sitemap: Starting with ${staticPages.length} static pages`)

  try {
    // Check if we have the required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Sitemap: Missing Supabase environment variables, returning static pages only')
      return staticPages
    }

    // Fetch all published businesses from Supabase
    const supabase = await createClient()
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('slug, updated_at')
      .eq('verified', true)
      .order('updated_at', { ascending: false })
      .limit(1000) // Limit to 1000 businesses to avoid sitemap size issues

    if (error) {
      console.error('Sitemap: Error fetching businesses:', error)
      return staticPages
    }

    if (!businesses || businesses.length === 0) {
      console.log('Sitemap: No verified businesses found, returning static pages only')
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

    console.log(`Sitemap: Generated with ${staticPages.length} static pages and ${businessPages.length} business pages`)
    
    return [...staticPages, ...businessPages]
  } catch (error) {
    console.error('Sitemap: Error generating sitemap:', error)
    // Always return static pages even if dynamic pages fail
    return staticPages
  }
}


import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.app.url

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/subscribe`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/onboard`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
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

    if (error) {
      console.error('Error fetching businesses for sitemap:', error)
      return staticPages
    }

    // Dynamic business pages
    const businessPages: MetadataRoute.Sitemap = (businesses || []).map((business) => ({
      url: `${baseUrl}/business/${business.slug}`,
      lastModified: new Date(business.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    return [...staticPages, ...businessPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

// Helper function to get consistent date format
function getISODate(date?: string | Date): string {
  const d = date ? new Date(date) : new Date()
  return d.toISOString()
}

// Generate sitemap XML
function generateSitemapXML(urls: Array<{
  url: string
  lastModified: string
  changeFrequency: string
  priority: number
}>): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://minbod.netlify.app'
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  
  urls.forEach(({ url, lastModified, changeFrequency, priority }) => {
    xml += '  <url>\n'
    xml += `    <loc>${url}</loc>\n`
    xml += `    <lastmod>${lastModified}</lastmod>\n`
    xml += `    <changefreq>${changeFrequency}</changefreq>\n`
    xml += `    <priority>${priority}</priority>\n`
    xml += '  </url>\n'
  })
  
  xml += '</urlset>'
  return xml
}

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://minbod.netlify.app'
    const currentDate = getISODate()

    // Static pages
    const staticPages = [
      {
        url: baseUrl,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/register`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/subscribe`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/onboard`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.6,
      },
    ]

    let businessPages: Array<{
      url: string
      lastModified: string
      changeFrequency: string
      priority: number
    }> = []

    try {
      // Fetch businesses from database
      const supabase = await createClient()
      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('slug, updated_at')
        .eq('verified', true)
        .order('updated_at', { ascending: false })
        .limit(1000)

      if (!error && businesses && businesses.length > 0) {
        businessPages = businesses
          .filter(business => business.slug && business.slug.trim() !== '')
          .map((business) => ({
            url: `${baseUrl}/business/${business.slug}`,
            lastModified: getISODate(business.updated_at),
            changeFrequency: 'weekly',
            priority: 0.8,
          }))
      }
    } catch (dbError) {
      console.error('Database error in sitemap:', dbError)
      // Continue with static pages only
    }

    const allUrls = [...staticPages, ...businessPages]
    const sitemapXML = generateSitemapXML(allUrls)

    return new NextResponse(sitemapXML, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Robots-Tag': 'noindex',
      },
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)
    
    // Return minimal sitemap on error
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://minbod.netlify.app'
    const minimalSitemap = generateSitemapXML([{
      url: baseUrl,
      lastModified: getISODate(),
      changeFrequency: 'daily',
      priority: 1.0,
    }])

    return new NextResponse(minimalSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    })
  }
}

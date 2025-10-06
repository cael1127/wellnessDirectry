import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BusinessProfile } from '@/components/business-profile'
import { BusinessHeader } from '@/components/business-header'
import { BusinessContact } from '@/components/business-contact'
import { BusinessHours } from '@/components/business-hours'
import { BusinessReviews } from '@/components/business-reviews'
import { BusinessGallery } from '@/components/business-gallery'
import { BusinessServices } from '@/components/business-services'
import { Metadata } from 'next'
import { env } from '@/lib/env'

interface BusinessPageProps {
  params: {
    slug: string
  }
}

async function getBusiness(slug: string) {
  const { data: business, error } = await supabase
    .from('businesses')
    .select(`
      *,
      reviews (
        id,
        user_name,
        rating,
        comment,
        created_at,
        helpful
      )
    `)
    .eq('slug', slug)
    .eq('subscription_status', 'active')
    .single()

  if (error || !business) {
    return null
  }

  // Track page view
  try {
    await supabase.rpc('update_business_analytics', {
      p_business_id: business.id,
      p_metric: 'page_views',
      p_increment: 1
    })
  } catch (error) {
    console.error('Error tracking page view:', error)
  }

  return business
}

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const business = await getBusiness(params.slug)
  
  if (!business) {
    return {
      title: 'Business Not Found',
      description: 'The requested business could not be found.'
    }
  }

  const title = business.seo_title || `${business.name} - ${business.category} in ${business.city}, ${business.state}`
  const description = business.seo_description || business.description
  const url = `${env.app.url}/business/${business.slug}`
  const image = business.profile_image || (business.images && business.images.length > 0 ? business.images[0] : '/placeholder.jpg')

  return {
    title,
    description,
    keywords: [
      business.name,
      business.category,
      business.subcategory,
      business.city,
      business.state,
      ...(business.tags || [])
    ].filter(Boolean).join(', '),
    openGraph: {
      title,
      description,
      url,
      siteName: 'Wellness Directory',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: business.name,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const business = await getBusiness(params.slug)

  if (!business) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <BusinessHeader business={business} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <BusinessProfile business={business} />
            <BusinessServices business={business} />
            <BusinessGallery business={business} />
            <BusinessReviews business={business} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <BusinessContact business={business} />
            <BusinessHours business={business} />
          </div>
        </div>
      </main>
    </div>
  )
}

// Generate static params for popular businesses (optional)
export async function generateStaticParams() {
  const { data: businesses } = await supabase
    .from('businesses')
    .select('slug')
    .eq('featured', true)
    .limit(10)

  return businesses?.map((business) => ({
    slug: business.slug,
  })) || []
}



import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BusinessProfile } from '@/components/business-profile'
import { BusinessHeader } from '@/components/business-header'
import { BusinessServices } from '@/components/business-services'
import { ReviewSection } from '@/components/review-section'
import { Header } from '@/components/header'
import { Metadata } from 'next'
import { env } from '@/lib/env'

// Make this page dynamic (don't prerender at build time)
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0 // Don't cache, always fetch fresh data

interface BusinessPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getBusiness(slug: string) {
  const supabase = await createClient()
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
  const { slug } = await params
  const business = await getBusiness(slug)
  
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
  const { slug } = await params
  const business = await getBusiness(slug)

  if (!business) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BusinessHeader business={business} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          <BusinessProfile business={business} />
          <BusinessServices business={business} />
          <ReviewSection 
            businessId={business.id} 
            business={business}
            reviews={business.reviews || []} 
          />
        </div>
      </main>
    </div>
  )
}

// Note: generateStaticParams removed since we're using dynamic rendering
// This ensures pages are built on-demand with fresh data from Supabase



import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BusinessEditForm } from '@/components/business-edit-form'

interface EditBusinessPageProps {
  params: {
    id: string
  }
}

async function getBusiness(id: string) {
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !business) {
    return null
  }

  return business
}

export default async function EditBusinessPage({ params }: EditBusinessPageProps) {
  const business = await getBusiness(params.id)

  if (!business) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Business Profile</h1>
          <p className="text-muted-foreground mt-2">
            Update your business information and services
          </p>
        </div>

        <BusinessEditForm business={business} />
      </div>
    </div>
  )
}




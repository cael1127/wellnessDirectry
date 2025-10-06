import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BusinessDashboard } from '@/components/business-dashboard'
import { BusinessStats } from '@/components/business-stats'
import { BusinessManagementTable } from '@/components/business-management-table'

export default async function DashboardPage() {
  // In a real app, you'd check authentication here
  // For now, we'll show all businesses for demo purposes
  
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select(`
      *,
      reviews (
        id,
        user_name,
        rating,
        comment,
        created_at
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching businesses:', error)
    return <div>Error loading dashboard</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Business Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your wellness business listings and track performance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <BusinessStats businesses={businesses || []} />
        </div>

        <div className="space-y-6">
          <BusinessDashboard businesses={businesses || []} />
          <BusinessManagementTable businesses={businesses || []} />
        </div>
      </div>
    </div>
  )
}





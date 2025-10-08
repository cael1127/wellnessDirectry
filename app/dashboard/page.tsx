import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BusinessManagementTable } from '@/components/business-management-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

  const totalBusinesses = businesses?.length || 0
  const activeBusinesses = businesses?.filter(b => b.subscription_status === 'active').length || 0
  const totalReviews = businesses?.reduce((sum, b) => sum + (b.reviews?.length || 0), 0) || 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Business Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your wellness business listings and track performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Businesses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalBusinesses}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activeBusinesses}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalReviews}</p>
            </CardContent>
          </Card>
        </div>

        <BusinessManagementTable businesses={businesses || []} />
      </div>
    </div>
  )
}





import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin-auth'
import { AdminBusinessTable } from '@/components/admin-business-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/header'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminDashboardPage() {
  // Check admin authentication
  const adminStatus = await isAdmin()
  console.log('Admin auth check:', adminStatus) // Debug log
  
  if (!adminStatus) {
    console.log('Not admin - redirecting to login') // Debug log
    redirect('/admin/login')
  }
  
  console.log('Admin authenticated - showing dashboard') // Debug log
  
  const supabase = await createClient()
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
  const featuredBusinesses = businesses?.filter(b => b.featured).length || 0
  const verifiedBusinesses = businesses?.filter(b => b.verified).length || 0

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage all business listings, verify businesses, and control featured status
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <CardTitle>Active</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{activeBusinesses}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Featured</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{featuredBusinesses}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{verifiedBusinesses}</p>
            </CardContent>
          </Card>
        </div>

        <AdminBusinessTable businesses={businesses || []} />
      </div>
    </div>
  )
}


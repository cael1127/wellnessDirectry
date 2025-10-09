import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, PlusCircle } from 'lucide-react'

export default async function DashboardPage() {
  // Get current user with server-side client that reads cookies
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/signin?redirect=/dashboard')
  }
  
  // Get user's businesses
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching businesses:', error)
  }

  const totalBusinesses = businesses?.length || 0
  const activeBusinesses = businesses?.filter(b => b.subscription_status === 'active').length || 0

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Your Business Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your business listings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Businesses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalBusinesses}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{activeBusinesses}</p>
            </CardContent>
          </Card>
        </div>

        {businesses && businesses.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Your Businesses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {businesses.map(business => (
                  <div key={business.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Building2 className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{business.name}</h3>
                        <p className="text-sm text-muted-foreground">{business.city}, {business.state}</p>
                      </div>
                    </div>
                    <Button asChild>
                      <a href={`/business/${business.slug}`}>View Page</a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No businesses yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first business listing to get started
              </p>
              <Button asChild>
                <a href="/onboard" className="gap-2">
                  <PlusCircle className="w-4 h-4" />
                  List Your Business
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}





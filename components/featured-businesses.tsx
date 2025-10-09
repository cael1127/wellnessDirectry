import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export async function FeaturedBusinesses() {
  // Fetch real businesses from Supabase
  let featuredBusinesses = []
  
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .eq('featured', true)
      // Don't filter by subscription_status - show all featured
      .order('rating', { ascending: false })
      .order('review_count', { ascending: false })
      .limit(6)
    
    featuredBusinesses = data || []
  } catch (error) {
    console.error('Error fetching featured businesses:', error)
    // During build time or if Supabase is unavailable, use empty array
    featuredBusinesses = []
  }
  
  if (!featuredBusinesses || featuredBusinesses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No featured businesses yet. Check back soon!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredBusinesses.map((business) => (
        <Card key={business.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 relative flex items-center justify-center">
            {business.profile_image || (business.images && business.images.length > 0) ? (
              <img
                src={business.profile_image || business.images[0]}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-4xl font-bold text-primary/30">
                {business.name.charAt(0)}
              </div>
            )}
            {business.verified && <Badge className="absolute top-2 right-2 bg-green-500 border-none">Verified</Badge>}
          </div>

          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg line-clamp-1">{business.name}</h3>
              <div className="flex items-center gap-1 text-sm flex-shrink-0">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{business.rating || 5.0}</span>
                <span className="text-muted-foreground">({business.review_count || 0})</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{business.description}</p>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  {business.city}, {business.state}
                </span>
              </div>

              {business.tags && business.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {business.tags.slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button asChild className="w-full">
              <Link href={`/business/${business.slug}`}>View Details</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

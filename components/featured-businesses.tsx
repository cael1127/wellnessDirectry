import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin } from "lucide-react"
import { mockBusinesses } from "@/lib/mock-data"
import Link from "next/link"

export function FeaturedBusinesses() {
  const featuredBusinesses = mockBusinesses.filter((business) => business.featured)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredBusinesses.map((business) => (
        <Card key={business.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-video bg-muted relative">
            <img
              src={business.images[0] || "/placeholder.svg"}
              alt={business.name}
              className="w-full h-full object-cover"
            />
            {business.verified && <Badge className="absolute top-2 right-2 bg-green-500">Verified</Badge>}
          </div>

          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg line-clamp-1">{business.name}</h3>
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{business.rating}</span>
                <span className="text-muted-foreground">({business.reviewCount})</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{business.description}</p>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  {business.location.city}, {business.location.state}
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {business.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Button asChild className="w-full">
              <Link href={`/business/${business.id}`}>View Details</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

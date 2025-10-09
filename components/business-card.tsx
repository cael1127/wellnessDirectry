import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Phone, Globe, Clock, Verified } from "lucide-react"
import Link from "next/link"
import type { Business } from "@/types/business"

interface BusinessCardProps {
  business: Business & { distance?: number }
}

export function BusinessCard({ business }: BusinessCardProps) {
  const isOpen = () => {
    const now = new Date()
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const currentDay = dayNames[now.getDay()]
    const daySchedule = business.hours[currentDay]

    if (!daySchedule || daySchedule.closed) return false

    const currentTime = now.getHours() * 100 + now.getMinutes()
    const openTime = Number.parseInt(daySchedule.open.replace(":", ""))
    const closeTime = Number.parseInt(daySchedule.close.replace(":", ""))

    return currentTime >= openTime && currentTime <= closeTime
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
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
        <div className="absolute top-2 right-2 flex flex-col sm:flex-row gap-1 sm:gap-2">
          {business.verified && (
            <Badge className="bg-green-500 hover:bg-green-600 text-xs border-none">
              <Verified className="w-3 h-3 mr-1" />
              Licensed
            </Badge>
          )}
          {business.featured && <Badge className="bg-health-gradient hover:opacity-90 text-xs border-none">Featured</Badge>}
        </div>
        {business.hours && (
          <div className="absolute bottom-2 left-2">
            <Badge variant={isOpen() ? "default" : "secondary"} className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {isOpen() ? "Open" : "Closed"}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base sm:text-lg line-clamp-1 flex-1">{business.name}</h3>
          <div className="flex items-center gap-1 text-xs sm:text-sm flex-shrink-0">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{business.rating || 5.0}</span>
            <span className="text-muted-foreground hidden sm:inline">({business.review_count || 0})</span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">{business.description}</p>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="space-y-2 sm:space-y-3 mb-4 flex-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="line-clamp-1">
              {business.address}, {business.city}
              {business.distance && business.distance !== Infinity && (
                <span className="ml-2 font-medium text-primary">
                  ({business.distance.toFixed(1)} mi)
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            {business.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{business.phone}</span>
                <span className="sm:hidden">Call</span>
              </div>
            )}
            {business.website && (
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Website</span>
              </div>
            )}
          </div>

          {business.tags && business.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {business.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {business.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{business.tags.length - 2} more
                </Badge>
              )}
            </div>
          )}
        </div>

        <Button asChild className="w-full text-sm">
          <Link href={`/business/${business.slug}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

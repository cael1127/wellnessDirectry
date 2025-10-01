import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Phone, Globe, Clock, Verified } from "lucide-react"
import Link from "next/link"
import type { Business } from "@/types/business"

interface BusinessCardProps {
  business: Business
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-muted relative">
        <img
          src={business.images[0] || "/placeholder.svg"}
          alt={business.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {business.verified && (
            <Badge className="bg-green-500 hover:bg-green-600">
              <Verified className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
          {business.featured && <Badge className="bg-blue-500 hover:bg-blue-600">Featured</Badge>}
        </div>
        <div className="absolute bottom-2 left-2">
          <Badge variant={isOpen() ? "default" : "secondary"} className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {isOpen() ? "Open" : "Closed"}
          </Badge>
        </div>
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
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>
              {business.location.address}, {business.location.city}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {business.contact.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{business.contact.phone}</span>
              </div>
            )}
            {business.contact.website && (
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <span>Website</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {business.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {business.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{business.tags.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <Button asChild className="w-full">
          <Link href={`/business/${business.id}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

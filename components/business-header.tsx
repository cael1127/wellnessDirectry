"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, MapPin, Phone, Mail, Globe, Clock, CheckCircle } from "lucide-react"
import { Business } from "@/types/business"

interface BusinessHeaderProps {
  business: Business & {
    reviews?: Array<{
      id: string
      user_name: string
      rating: number
      comment: string
      created_at: string
      helpful: number
    }>
  }
}

export function BusinessHeader({ business }: BusinessHeaderProps) {
  const formatHours = (hours: Record<string, { open: string; close: string; closed?: boolean }>) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const todayHours = hours[today]
    
    if (!todayHours || todayHours.closed) {
      return "Closed today"
    }
    
    return `Open today ${todayHours.open} - ${todayHours.close}`
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Business Info */}
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{business.name}</h1>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-sm">
                    {business.category}
                  </Badge>
                  {business.subcategory && (
                    <Badge variant="outline" className="text-sm">
                      {business.subcategory}
                    </Badge>
                  )}
                  {business.verified && (
                    <Badge variant="default" className="text-sm">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <p className="text-lg text-muted-foreground mb-6">{business.description}</p>

            {/* Rating and Reviews */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold">{business.rating}</span>
                <span className="text-muted-foreground">({business.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {business.tags.slice(0, 8).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {business.tags.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{business.tags.length - 8} more
                </Badge>
              )}
            </div>
          </div>

          {/* Contact Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Hours */}
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Hours</p>
                      <p className="text-sm text-muted-foreground">
                        {formatHours(business.hours)}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {business.location.address}<br />
                        {business.location.city}, {business.location.state} {business.location.zipCode}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  {business.contact.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <a 
                          href={`tel:${business.contact.phone}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {business.contact.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {business.contact.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email</p>
                        <a 
                          href={`mailto:${business.contact.email}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {business.contact.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {business.contact.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Website</p>
                        <a 
                          href={business.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-4 space-y-2">
                    <Button className="w-full" size="lg">
                      Book Appointment
                    </Button>
                    <Button variant="outline" className="w-full">
                      Get Directions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}





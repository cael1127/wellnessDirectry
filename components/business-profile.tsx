"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Phone, Globe, Mail, Clock, Verified, Share2, Heart, Navigation, Camera, Edit } from "lucide-react"
import type { Business } from "@/types/business"
import { mockReviews } from "@/lib/mock-data"
import { ReviewSection } from "@/components/review-section"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface BusinessProfileProps {
  business: Business & { owner_id?: string }
}

export function BusinessProfile({ business }: BusinessProfileProps) {
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const businessReviews = mockReviews.filter((review) => review.business_id === business.id)

  // Check if current user owns this business
  useEffect(() => {
    async function checkOwnership() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        setIsOwner(business.owner_id === user.id)
      }
    }
    checkOwnership()
  }, [business.owner_id])

  const isOpen = () => {
    try {
      if (!business.hours || typeof business.hours !== 'object') return false
      
      const now = new Date()
      const currentDay = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
      const daySchedule = business.hours[currentDay]

      if (!daySchedule || daySchedule.closed) return false
      if (!daySchedule.open || !daySchedule.close) return false

      const currentTime = now.getHours() * 100 + now.getMinutes()
      const openTime = Number.parseInt(daySchedule.open.replace(":", ""))
      const closeTime = Number.parseInt(daySchedule.close.replace(":", ""))

      return currentTime >= openTime && currentTime <= closeTime
    } catch {
      return false
    }
  }

  const formatTime = (time: string | undefined) => {
    if (!time) return "N/A"
    try {
      const [hours, minutes] = time.split(":")
      const hour = Number.parseInt(hours)
      const ampm = hour >= 12 ? "PM" : "AM"
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    } catch {
      return "N/A"
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business.name,
        text: business.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const handleEdit = () => {
    router.push(`/dashboard/business/${business.id}/edit`)
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
        {/* Image Gallery */}
        <div className="lg:col-span-2">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={business.images[currentImageIndex] || "/placeholder.svg"}
              alt={business.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex flex-col sm:flex-row gap-1 sm:gap-2">
              {business.verified && (
                <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                  <Verified className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden xs:inline">Verified</span>
                </Badge>
              )}
              {business.featured && <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">Featured</Badge>}
            </div>
            {business.images.length > 1 && (
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 flex items-center gap-1 sm:gap-2 bg-black/60 px-2 py-1 rounded">
                <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                <span className="text-white text-xs sm:text-sm">
                  {currentImageIndex + 1} / {business.images.length}
                </span>
              </div>
            )}
          </div>

          {business.images.length > 1 && (
            <div className="flex gap-2 mt-3 sm:mt-4 overflow-x-auto pb-2 scrollbar-hide">
              {business.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex ? "border-primary scale-105" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${business.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Business Info Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{business.name}</CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-lg">{business.rating}</span>
                      <span className="text-muted-foreground">({business.review_count || 0} reviews)</span>
                    </div>
                  </div>
                  <Badge variant={isOpen() ? "default" : "secondary"} className="mb-3">
                    <Clock className="w-4 h-4 mr-1" />
                    {isOpen() ? "Open Now" : "Closed"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {isOwner && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => router.push(`/business/${business.slug}/edit`)}
                      className="gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit Your Business</span>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setIsFavorited(!isFavorited)}>
                    <Heart className={`w-4 h-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{business.description}</p>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{business.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {business.city}, {business.state} {business.zip_code}
                    </p>
                  </div>
                </div>

                {business.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <a href={`tel:${business.phone}`} className="text-primary hover:underline">
                      {business.phone}
                    </a>
                  </div>
                )}

                {business.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                {business.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <a href={`mailto:${business.email}`} className="text-primary hover:underline">
                      {business.email}
                    </a>
                  </div>
                )}
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-2">
                {isOwner && (
                  <Button onClick={handleEdit} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Your Business
                  </Button>
                )}
                <Button className="w-full">
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Details */}
            <Card>
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Category</h4>
                  <Badge variant="secondary">{business.category}</Badge>
                  {business.subcategory && (
                    <Badge variant="outline" className="ml-2">
                      {business.subcategory}
                    </Badge>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Services & Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {business.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{business.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Reviews</span>
                  <span className="font-medium">{business.review_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Verified Business</span>
                  <Badge variant={business.verified ? "default" : "secondary"}>
                    {business.verified ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-medium">
                    {new Date(business.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {business.hours && typeof business.hours === 'object' && (() => {
                  // Display days in correct week order (Sunday - Saturday)
                  const daysOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                  const dayLabels: Record<string, string> = {
                    sunday: 'Sunday',
                    monday: 'Monday',
                    tuesday: 'Tuesday',
                    wednesday: 'Wednesday',
                    thursday: 'Thursday',
                    friday: 'Friday',
                    saturday: 'Saturday',
                  }
                  
                  return daysOrder.map((day) => {
                    const schedule = business.hours[day]
                    if (!schedule) return null
                    
                    return (
                      <div key={day} className="flex justify-between items-center py-2">
                        <span className="font-medium">{dayLabels[day]}</span>
                        <span className="text-muted-foreground">
                          {schedule?.closed ? "Closed" : `${formatTime(schedule?.open)} - ${formatTime(schedule?.close)}`}
                        </span>
                      </div>
                    )
                  })
                })()}
                {(!business.hours || typeof business.hours !== 'object' || Object.keys(business.hours).length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">Hours not set</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewSection businessId={business.id} business={business} reviews={businessReviews} />
        </TabsContent>

        <TabsContent value="photos">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {business.images.map((image, index) => (
              <div
                key={index}
                className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setCurrentImageIndex(index)}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${business.name} photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, TrendingUp, Users } from "lucide-react"
import type { Review } from "@/types/business"

interface ReviewStatsProps {
  reviews: Review[]
}

export function ReviewStats({ reviews }: ReviewStatsProps) {
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  const recentReviews = reviews.filter((review) => {
    const reviewDate = new Date(review.createdAt)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return reviewDate >= thirtyDaysAgo
  })

  const positiveReviews = reviews.filter((review) => review.rating >= 4).length
  const positivePercentage = reviews.length > 0 ? Math.round((positiveReviews / reviews.length) * 100) : 0

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            Average Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
            <div className="flex">{renderStars(Math.round(averageRating))}</div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{reviews.length} total reviews</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{recentReviews.length}</span>
            <Badge variant="secondary" className="text-xs">
              Last 30 days
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">New reviews this month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            Customer Satisfaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{positivePercentage}%</span>
            <Badge variant="default" className="text-xs bg-green-500">
              Positive
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">4+ star reviews</p>
        </CardContent>
      </Card>
    </div>
  )
}

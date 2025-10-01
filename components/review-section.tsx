"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, ThumbsUp, MessageSquare, Filter, Flag } from "lucide-react"
import { WriteReviewModal } from "@/components/write-review-modal"
import type { Review, Business } from "@/types/business"

interface ReviewSectionProps {
  businessId: string
  business: Business
  reviews: Review[]
}

export function ReviewSection({ businessId, business, reviews }: ReviewSectionProps) {
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest")
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set())

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "highest":
        return b.rating - a.rating
      case "lowest":
        return a.rating - b.rating
      default:
        return 0
    }
  })

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
    percentage:
      reviews.length > 0 ? (reviews.filter((review) => review.rating === rating).length / reviews.length) * 100 : 0,
  }))

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const handleHelpfulClick = (reviewId: string) => {
    setHelpfulReviews((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId)
      } else {
        newSet.add(reviewId)
      }
      return newSet
    })
  }

  const handleReportReview = (reviewId: string) => {
    console.log("[v0] Reporting review:", reviewId)
    alert("Review has been reported for moderation.")
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center">{renderStars(Math.round(averageRating))}</div>
              <p className="text-muted-foreground">
                Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rating Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm">{rating}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Write Review Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Share Your Experience</h3>
            <p className="text-muted-foreground">Help others by writing a review about {business.name}</p>
            <WriteReviewModal business={business} />
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customer Reviews</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border rounded px-2 py-1 bg-background"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedReviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to leave a review!</p>
              <WriteReviewModal
                business={business}
                trigger={
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Write First Review
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="space-y-6">
              {sortedReviews.map((review, index) => (
                <div key={review.id}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {review.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{review.userName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">{renderStars(review.rating)}</div>
                              <span className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {review.rating}/5
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReportReview(review.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Flag className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-muted-foreground pl-13">{review.comment}</p>

                    <div className="flex items-center gap-4 text-sm pl-13">
                      <button
                        onClick={() => handleHelpfulClick(review.id)}
                        className={`flex items-center gap-1 transition-colors ${
                          helpfulReviews.has(review.id) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${helpfulReviews.has(review.id) ? "fill-current" : ""}`} />
                        Helpful ({review.helpful + (helpfulReviews.has(review.id) ? 1 : 0)})
                      </button>
                    </div>
                  </div>

                  {index < sortedReviews.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}

              {/* Load More Reviews */}
              {sortedReviews.length >= 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline">Load More Reviews</Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

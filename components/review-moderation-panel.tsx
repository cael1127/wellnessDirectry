"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Star, Search, CheckCircle, XCircle, Flag, MessageSquare } from "lucide-react"
import type { Review } from "@/types/business"
import { mockBusinesses } from "@/lib/mock-data"

interface ReviewModerationPanelProps {
  reviews: Review[]
}

export function ReviewModerationPanel({ reviews }: ReviewModerationPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  const filteredReviews = reviews.filter((review) => {
    const business = mockBusinesses.find((b) => b.id === review.businessId)
    const matchesSearch =
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business?.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && review.helpful < 5) ||
      (statusFilter === "approved" && review.helpful >= 5)

    return matchesSearch && matchesStatus
  })

  const handleApproveReview = (reviewId: string) => {
    console.log("[v0] Approving review:", reviewId)
    alert("Review approved!")
    setSelectedReview(null)
  }

  const handleRejectReview = (reviewId: string) => {
    console.log("[v0] Rejecting review:", reviewId)
    alert("Review rejected!")
    setSelectedReview(null)
  }

  const handleFlagReview = (reviewId: string) => {
    console.log("[v0] Flagging review:", reviewId)
    alert("Review flagged for further review!")
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Reviews List */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Review Moderation</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredReviews.map((review) => {
                const business = mockBusinesses.find((b) => b.id === review.businessId)
                const isPending = review.helpful < 5

                return (
                  <div
                    key={review.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedReview?.id === review.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedReview(review)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{review.userName}</span>
                          <div className="flex">{renderStars(review.rating)}</div>
                          <Badge variant={isPending ? "secondary" : "default"} className="text-xs">
                            {isPending ? "Pending" : "Approved"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {business?.name} • {formatDate(review.createdAt)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFlagReview(review.id)
                          }}
                        >
                          <Flag className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm line-clamp-2">{review.comment}</p>
                  </div>
                )
              })}

              {filteredReviews.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reviews found matching your criteria.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Detail Panel */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Review Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedReview ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Reviewer Information</h4>
                  <div className="text-sm space-y-1">
                    <div>Name: {selectedReview.userName}</div>
                    <div>Rating: {selectedReview.rating}/5</div>
                    <div>Date: {formatDate(selectedReview.createdAt)}</div>
                    <div>Helpful votes: {selectedReview.helpful}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Business</h4>
                  <div className="text-sm">{mockBusinesses.find((b) => b.id === selectedReview.businessId)?.name}</div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Review Content</h4>
                  <div className="text-sm bg-muted p-3 rounded-lg">{selectedReview.comment}</div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Moderation Actions</h4>
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleApproveReview(selectedReview.id)}
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Review
                    </Button>
                    <Button
                      onClick={() => handleRejectReview(selectedReview.id)}
                      variant="destructive"
                      className="w-full"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Review
                    </Button>
                    <Button onClick={() => handleFlagReview(selectedReview.id)} variant="outline" className="w-full">
                      <Flag className="w-4 h-4 mr-2" />
                      Flag for Review
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Admin Notes</h4>
                  <Textarea placeholder="Add internal notes about this review..." rows={3} />
                  <Button size="sm" className="mt-2">
                    Save Notes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a review to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star, MessageSquare } from "lucide-react"
import type { Business } from "@/types/business"

interface WriteReviewModalProps {
  business: Business
  trigger?: React.ReactNode
}

export function WriteReviewModal({ business, trigger }: WriteReviewModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewData, setReviewData] = useState({
    userName: "",
    email: "",
    comment: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      alert("Please select a rating")
      return
    }

    if (!reviewData.comment.trim()) {
      alert("Please write a review")
      return
    }

    console.log("[v0] Review submitted:", {
      businessId: business.id,
      businessName: business.name,
      rating,
      ...reviewData,
    })

    // Here we would submit to the backend
    alert("Thank you for your review! It will be published after moderation.")

    // Reset form
    setRating(0)
    setHoveredRating(0)
    setReviewData({ userName: "", email: "", comment: "" })
    setIsOpen(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setReviewData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="lg">
            <MessageSquare className="w-4 h-4 mr-2" />
            Write a Review
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review for {business.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Selection */}
          <div>
            <Label className="text-base font-medium">Your Rating *</Label>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 hover:scale-110 transition-transform"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} star{rating !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* User Information */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="userName">Your Name *</Label>
              <Input
                id="userName"
                value={reviewData.userName}
                onChange={(e) => handleInputChange("userName", e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={reviewData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Your email will not be published</p>
            </div>
          </div>

          {/* Review Comment */}
          <div>
            <Label htmlFor="comment">Your Review *</Label>
            <Textarea
              id="comment"
              value={reviewData.comment}
              onChange={(e) => handleInputChange("comment", e.target.value)}
              placeholder="Share your experience with this business..."
              rows={4}
              required
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">Minimum 10 characters ({reviewData.comment.length}/10)</p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={rating === 0 || reviewData.comment.length < 10}>
              Submit Review
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

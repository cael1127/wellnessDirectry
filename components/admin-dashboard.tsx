"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star } from "lucide-react"
import { mockBusinesses, mockReviews } from "@/lib/mock-data"
import { BusinessManagementTable } from "@/components/business-management-table"
import { ReviewModerationPanel } from "@/components/review-moderation-panel"
import { AdminStats } from "@/components/admin-stats"

export function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Calculate dashboard stats
  const totalBusinesses = mockBusinesses.length
  const verifiedBusinesses = mockBusinesses.filter((b) => b.verified).length
  const pendingBusinesses = mockBusinesses.filter((b) => !b.verified).length
  const totalReviews = mockReviews.length
  const pendingReviews = mockReviews.filter((r) => r.helpful < 5).length // Mock pending logic
  const averageRating =
    mockReviews.length > 0 ? mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length : 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage businesses, reviews, and platform analytics</p>
      </div>

      {/* Dashboard Stats */}
      <AdminStats
        totalBusinesses={totalBusinesses}
        verifiedBusinesses={verifiedBusinesses}
        pendingBusinesses={pendingBusinesses}
        totalReviews={totalReviews}
        pendingReviews={pendingReviews}
        averageRating={averageRating}
      />

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="businesses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="businesses">
          <BusinessManagementTable businesses={mockBusinesses} />
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewModerationPanel reviews={mockReviews} />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <span className="font-medium">+12 businesses</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Month</span>
                    <span className="font-medium">+8 businesses</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Growth Rate</span>
                    <Badge className="bg-green-500">+50%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Review Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">This Week</span>
                    <span className="font-medium">24 reviews</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Week</span>
                    <span className="font-medium">18 reviews</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    "Food & Beverage",
                    "Technology",
                    "Home & Garden",
                    "Health & Wellness",
                    "Professional Services",
                    "Retail",
                  ].map((category) => {
                    const count = mockBusinesses.filter((b) => b.category === category).length
                    const percentage = Math.round((count / totalBusinesses) * 100)
                    return (
                      <div key={category} className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-sm text-muted-foreground">{category}</div>
                        <Badge variant="outline" className="mt-1">
                          {percentage}%
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Auto-approve businesses</span>
                  <Button variant="outline" size="sm">
                    Disabled
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Review moderation</span>
                  <Button variant="outline" size="sm">
                    Enabled
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Email notifications</span>
                  <Button variant="outline" size="sm">
                    Enabled
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Database</span>
                  <Badge className="bg-green-500">Healthy</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Search Index</span>
                  <Badge className="bg-green-500">Updated</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Backup Status</span>
                  <Badge className="bg-green-500">Current</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Star, TrendingUp, AlertTriangle } from "lucide-react"

interface AdminStatsProps {
  totalBusinesses: number
  verifiedBusinesses: number
  pendingBusinesses: number
  totalReviews: number
  pendingReviews: number
  averageRating: number
}

export function AdminStats({
  totalBusinesses,
  verifiedBusinesses,
  pendingBusinesses,
  totalReviews,
  pendingReviews,
  averageRating,
}: AdminStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBusinesses}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-green-500">{verifiedBusinesses} verified</Badge>
            {pendingBusinesses > 0 && <Badge variant="outline">{pendingBusinesses} pending</Badge>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reviews</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalReviews}</div>
          <div className="flex items-center gap-2 mt-2">
            {pendingReviews > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {pendingReviews} pending
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            {averageRating.toFixed(1)}
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Platform Health
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

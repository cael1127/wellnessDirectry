"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, CheckCircle, XCircle, Eye, Edit, Trash2 } from "lucide-react"
import type { Business } from "@/types/business"

interface BusinessManagementTableProps {
  businesses: Business[]
}

export function BusinessManagementTable({ businesses }: BusinessManagementTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.location.city.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && business.verified) ||
      (statusFilter === "pending" && !business.verified) ||
      (statusFilter === "featured" && business.featured)

    const matchesCategory = categoryFilter === "all" || business.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleApprove = (businessId: string) => {
    console.log("[v0] Approving business:", businessId)
    alert("Business approved successfully!")
  }

  const handleReject = (businessId: string) => {
    console.log("[v0] Rejecting business:", businessId)
    alert("Business rejected!")
  }

  const handleEdit = (businessId: string) => {
    console.log("[v0] Editing business:", businessId)
    alert("Edit functionality would open here")
  }

  const handleDelete = (businessId: string) => {
    console.log("[v0] Deleting business:", businessId)
    if (confirm("Are you sure you want to delete this business?")) {
      alert("Business deleted!")
    }
  }

  const categories = [...new Set(businesses.map((b) => b.category))]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Management</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search businesses..."
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
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBusinesses.map((business) => (
                <TableRow key={business.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{business.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">{business.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{business.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {business.location.city}, {business.location.state}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {business.verified ? (
                        <Badge className="bg-green-500 w-fit">Verified</Badge>
                      ) : (
                        <Badge variant="secondary" className="w-fit">
                          Pending
                        </Badge>
                      )}
                      {business.featured && <Badge className="bg-blue-500 w-fit">Featured</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{business.rating}</span>
                      <span className="text-sm text-muted-foreground">({business.reviewCount})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{new Date(business.createdAt).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(`/business/${business.id}`, "_blank")}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(business.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {!business.verified && (
                          <DropdownMenuItem onClick={() => handleApprove(business.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleReject(business.id)}>
                          <XCircle className="mr-2 h-4 w-4" />
                          {business.verified ? "Suspend" : "Reject"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(business.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredBusinesses.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No businesses found matching your criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

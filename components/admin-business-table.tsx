"use client"

import { useState } from "react"
import { Business } from "@/types/business"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Star, Trash2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface AdminBusinessTableProps {
  businesses: Business[]
}

export function AdminBusinessTable({ businesses }: AdminBusinessTableProps) {
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    setIsLoading(id)
    try {
      const response = await fetch(`/api/admin/businesses/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success("Business deleted successfully")
        router.refresh()
      } else {
        toast.error("Failed to delete business")
      }
    } catch (error) {
      toast.error("Error deleting business")
    } finally {
      setIsLoading(null)
      setDeleteDialog(null)
    }
  }

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    setIsLoading(id)
    try {
      const response = await fetch(`/api/admin/businesses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentStatus }),
      })

      if (response.ok) {
        toast.success(!currentStatus ? "Business featured" : "Removed from featured")
        router.refresh()
      } else {
        toast.error("Failed to update featured status")
      }
    } catch (error) {
      toast.error("Error updating business")
    } finally {
      setIsLoading(null)
    }
  }

  const handleToggleVerified = async (id: string, currentStatus: boolean) => {
    setIsLoading(id)
    try {
      const response = await fetch(`/api/admin/businesses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !currentStatus }),
      })

      if (response.ok) {
        toast.success(!currentStatus ? "Business verified" : "Verification removed")
        router.refresh()
      } else {
        toast.error("Failed to update verification status")
      }
    } catch (error) {
      toast.error("Error updating business")
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Businesses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businesses.map((business) => (
                  <TableRow key={business.id}>
                    <TableCell className="font-medium">
                      <a 
                        href={`/business/${business.slug}`}
                        className="hover:underline text-blue-600"
                        target="_blank"
                      >
                        {business.name}
                      </a>
                    </TableCell>
                    <TableCell>{business.category}</TableCell>
                    <TableCell>{business.city}, {business.state}</TableCell>
                    <TableCell>
                      <Badge variant={business.subscription_status === 'active' ? 'default' : 'secondary'}>
                        {business.subscription_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={business.featured ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleFeatured(business.id, business.featured)}
                        disabled={isLoading === business.id}
                      >
                        <Star className={`w-4 h-4 ${business.featured ? 'fill-white' : ''}`} />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={business.verified ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleVerified(business.id, business.verified)}
                        disabled={isLoading === business.id}
                      >
                        {business.verified ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteDialog(business.id)}
                        disabled={isLoading === business.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the business
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


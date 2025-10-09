"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BusinessHoursEditor } from "@/components/business-hours-editor"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

export default function EditBusinessPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [businessId, setBusinessId] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subcategory: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    phone: "",
    email: "",
    website: "",
    business_hours_notes: "",
  })
  const [hours, setHours] = useState<any>({})

  useEffect(() => {
    async function loadBusiness() {
      try {
        const supabase = createClient()
        
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          toast.error("Please sign in to edit your business")
          router.push('/signin?redirect=/business/' + slug + '/edit')
          return
        }

        // Load business data
        const { data: business, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('slug', slug)
          .single()

        if (error || !business) {
          toast.error("Business not found")
          router.push('/')
          return
        }

        // Check if user owns this business
        if (business.owner_id !== user.id) {
          toast.error("You don't have permission to edit this business")
          router.push('/business/' + slug)
          return
        }

        // Set form data
        setBusinessId(business.id)
        setFormData({
          name: business.name || "",
          description: business.description || "",
          subcategory: business.subcategory || "",
          address: business.address || "",
          city: business.city || "",
          state: business.state || "",
          zip_code: business.zip_code || "",
          phone: business.phone || "",
          email: business.email || "",
          website: business.website || "",
          business_hours_notes: business.business_hours_notes || "",
        })
        
        // Parse hours from JSON string if needed
        let parsedHours = {}
        if (business.hours) {
          try {
            parsedHours = typeof business.hours === 'string' 
              ? JSON.parse(business.hours) 
              : business.hours
          } catch {
            parsedHours = business.hours
          }
        }
        setHours(parsedHours)
      } catch (error) {
        console.error('Error loading business:', error)
        toast.error("Failed to load business")
      } finally {
        setIsLoading(false)
      }
    }

    loadBusiness()
  }, [slug, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      console.log('Submitting update with hours:', hours)
      
      const response = await fetch(`/api/businesses/${businessId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hours: hours,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update business')
      }

      const result = await response.json()
      console.log('Update result:', result)

      toast.success("Business updated successfully!")
      // Use window.location for full refresh to show updated data
      window.location.href = '/business/' + slug
    } catch (error: any) {
      console.error('Error updating business:', error)
      toast.error(error.message || "Failed to update business")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push('/business/' + slug)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Business Page
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Edit Your Business</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Business Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Input
                      id="subcategory"
                      value={formData.subcategory}
                      onChange={(e) => handleChange('subcategory', e.target.value)}
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Location</h3>
                  
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="zip_code">Zip Code</Label>
                    <Input
                      id="zip_code"
                      value={formData.zip_code}
                      onChange={(e) => handleChange('zip_code', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Business Hours */}
                <BusinessHoursEditor
                  hours={hours}
                  onChange={setHours}
                />

                {/* Business Hours Notes */}
                <div>
                  <Label htmlFor="business_hours_notes">Business Hours Notes (Optional)</Label>
                  <Textarea
                    id="business_hours_notes"
                    value={formData.business_hours_notes}
                    onChange={(e) => handleChange('business_hours_notes', e.target.value)}
                    rows={2}
                    placeholder="E.g., Open by appointment only, Closed on holidays"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/business/' + slug)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


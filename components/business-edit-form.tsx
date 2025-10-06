"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, X, Save, Eye } from "lucide-react"
import { categories, popularTags } from "@/lib/mock-data"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface Service {
  name: string
  price: string
  duration: string
}

interface Business {
  id: string
  name: string
  description: string
  category: string
  subcategory?: string
  address: string
  city: string
  state: string
  zip_code: string
  phone?: string
  email?: string
  website?: string
  tags: string[]
  images: string[]
  hours: Record<string, { open: string; close: string; closed?: boolean }>
  services: Service[]
  seo_title?: string
  seo_description?: string
  custom_domain?: string
}

interface BusinessEditFormProps {
  business: Business
}

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

export function BusinessEditForm({ business }: BusinessEditFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<Business>(business)
  const [selectedTags, setSelectedTags] = useState<string[]>(business.tags || [])
  const [customTag, setCustomTag] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags((prev) => [...prev, customTag.trim()])
      setCustomTag("")
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleHoursChange = (day: string, field: "open" | "close" | "closed", value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours?.[day],
          [field]: value,
        },
      },
    }))
  }

  const handleServiceChange = (index: number, field: keyof Service, value: string) => {
    const newServices = [...formData.services]
    newServices[index] = { ...newServices[index], [field]: value }
    setFormData((prev) => ({ ...prev, services: newServices }))
  }

  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, { name: "", price: "", duration: "" }]
    }))
  }

  const removeService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          ...formData,
          tags: selectedTags,
          updated_at: new Date().toISOString()
        })
        .eq('id', business.id)

      if (error) throw error

      toast.success("Business profile updated successfully!")
      router.push(`/dashboard`)
    } catch (error) {
      console.error('Error updating business:', error)
      toast.error("Failed to update business profile")
    } finally {
      setIsLoading(false)
    }
  }

  const viewBusiness = () => {
    router.push(`/business/${business.slug}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Edit Business Profile</h2>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={viewBusiness}>
            <Eye className="w-4 h-4 mr-2" />
            View Business
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="seo">SEO & Settings</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your business name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your wellness services and specialties"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory || ""}
                    onChange={(e) => handleInputChange("subcategory", e.target.value)}
                    placeholder="e.g., Therapy & Counseling, Clinical Nutrition"
                  />
                </div>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {popularTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Add custom tag"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                  />
                  <Button type="button" onClick={addCustomTag} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="default" className="flex items-center gap-1">
                        {tag}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location & Contact */}
        <TabsContent value="location" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Location & Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="San Francisco"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="CA"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zip_code">ZIP Code *</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => handleInputChange("zip_code", e.target.value)}
                    placeholder="94102"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="hello@business.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website || ""}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://www.business.com"
                />
              </div>

              <div>
                <Label>Business Hours</Label>
                <div className="space-y-2 mt-2">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-24 capitalize font-medium">{day}</div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`${day}-closed`}
                          checked={formData.hours?.[day]?.closed || false}
                          onCheckedChange={(checked) => handleHoursChange(day, "closed", checked as boolean)}
                        />
                        <Label htmlFor={`${day}-closed`} className="text-sm">
                          Closed
                        </Label>
                      </div>
                      {!formData.hours?.[day]?.closed && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={formData.hours?.[day]?.open || ""}
                            onChange={(e) => handleHoursChange(day, "open", e.target.value)}
                            className="w-32"
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={formData.hours?.[day]?.close || ""}
                            onChange={(e) => handleHoursChange(day, "close", e.target.value)}
                            className="w-32"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Services & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.services.map((service, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label>Service Name</Label>
                    <Input
                      value={service.name}
                      onChange={(e) => handleServiceChange(index, "name", e.target.value)}
                      placeholder="e.g., Individual Therapy"
                    />
                  </div>
                  <div>
                    <Label>Price</Label>
                    <Input
                      value={service.price}
                      onChange={(e) => handleServiceChange(index, "price", e.target.value)}
                      placeholder="e.g., $150/session"
                    />
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <Input
                      value={service.duration}
                      onChange={(e) => handleServiceChange(index, "duration", e.target.value)}
                      placeholder="e.g., 50 minutes"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeService(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" onClick={addService} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO & Settings */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO & Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seo_title">SEO Title</Label>
                <Input
                  id="seo_title"
                  value={formData.seo_title || ""}
                  onChange={(e) => handleInputChange("seo_title", e.target.value)}
                  placeholder="Custom title for search engines"
                />
              </div>

              <div>
                <Label htmlFor="seo_description">SEO Description</Label>
                <Textarea
                  id="seo_description"
                  value={formData.seo_description || ""}
                  onChange={(e) => handleInputChange("seo_description", e.target.value)}
                  placeholder="Custom description for search engines"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="custom_domain">Custom Domain (Optional)</Label>
                <Input
                  id="custom_domain"
                  value={formData.custom_domain || ""}
                  onChange={(e) => handleInputChange("custom_domain", e.target.value)}
                  placeholder="yourbusiness.com"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Contact support to set up custom domain
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}




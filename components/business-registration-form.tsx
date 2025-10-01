"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X } from "lucide-react"
import { categories, popularTags } from "@/lib/mock-data"
import type { Business } from "@/types/business"

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

export function BusinessRegistrationForm() {
  const [formData, setFormData] = useState<Partial<Business>>({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    location: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
    contact: {
      phone: "",
      email: "",
      website: "",
    },
    tags: [],
    hours: {},
  })

  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState("")
  const [currentStep, setCurrentStep] = useState(1)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Business registration data:", { ...formData, tags: selectedTags })
    // Here we would submit to the backend
    alert("Business registration submitted successfully!")
  }

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {step}
            </div>
            {step < 4 && <div className={`w-12 h-0.5 mx-2 ${step < currentStep ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
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
                placeholder="Describe your wellness services, specialties, and approach to health"
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
                  value={formData.subcategory}
                  onChange={(e) => handleInputChange("subcategory", e.target.value)}
                  placeholder="e.g., Therapy & Counseling, Clinical Nutrition, Personal Training"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Location & Contact */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Location & Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={formData.location?.address}
                onChange={(e) => handleInputChange("location.address", e.target.value)}
                placeholder="123 Main Street"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.location?.city}
                  onChange={(e) => handleInputChange("location.city", e.target.value)}
                  placeholder="San Francisco"
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.location?.state}
                  onChange={(e) => handleInputChange("location.state", e.target.value)}
                  placeholder="CA"
                  required
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.location?.zipCode}
                  onChange={(e) => handleInputChange("location.zipCode", e.target.value)}
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
                  value={formData.contact?.phone}
                  onChange={(e) => handleInputChange("contact.phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contact?.email}
                  onChange={(e) => handleInputChange("contact.email", e.target.value)}
                  placeholder="hello@business.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.contact?.website}
                onChange={(e) => handleInputChange("contact.website", e.target.value)}
                placeholder="https://www.business.com"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Tags & Services */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Tags & Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Popular Tags</Label>
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
            </div>

            <div>
              <Label htmlFor="customTag">Add Custom Tag</Label>
              <div className="flex gap-2">
                <Input
                  id="customTag"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Enter custom tag"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                />
                <Button type="button" onClick={addCustomTag} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {selectedTags.length > 0 && (
              <div>
                <Label>Selected Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="default" className="flex items-center gap-1">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Business Hours */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Business Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
          Previous
        </Button>

        {currentStep < 4 ? (
          <Button type="button" onClick={nextStep}>
            Next
          </Button>
        ) : (
          <Button type="submit">Submit Registration</Button>
        )}
      </div>
    </form>
  )
}

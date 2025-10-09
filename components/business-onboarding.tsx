"use client"

import { useState, useEffect } from "react"
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
import { Plus, X, ArrowRight, ArrowLeft, Check } from "lucide-react"
import { categories, popularTags } from "@/lib/mock-data"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

const steps = [
  { id: 1, title: "Basic Info", description: "Tell us about your business" },
  { id: 2, title: "Location", description: "Where are you located?" },
  { id: 3, title: "Services", description: "What do you offer?" },
  { id: 4, title: "Plan", description: "Choose your subscription" },
  { id: 5, title: "Review", description: "Review and submit" }
]

const subscriptionPlans = [
  {
    name: "Basic",
    price: 5,
    features: [
      "Healthcare provider listing",
      "Contact information display",
      "Business hours",
      "Service listings",
      "Patient reviews",
      "Basic analytics",
      "Email support"
    ],
    recommended: true
  }
]

export function BusinessOnboarding() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    website: "",
    tags: [] as string[],
    services: [] as Array<{ name: string; price: string; duration: string }>,
    selectedPlan: "basic"
  })

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error("Please sign in to list your business")
      router.push('/signin?redirect=/onboard')
      return
    }
    setIsCheckingAuth(false)
  }

  // Don't render form until auth check is complete
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { name: "", price: "", duration: "" }]
    }))
  }

  const updateService = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }))
  }

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please sign in to continue")
        router.push('/signin?redirect=/onboard')
        return
      }

      // Get or create default directory
      let directoryId
      const { data: directories } = await supabase
        .from('directories')
        .select('id')
        .eq('is_active', true)
        .limit(1)

      if (directories && directories.length > 0) {
        directoryId = directories[0].id
      } else {
        // Create a default directory if none exists
        const { data: newDir, error: dirError } = await supabase
          .from('directories')
          .insert({
            slug: 'default-directory',
            name: 'Health Directory',
            is_active: true
          })
          .select()
          .single()

        if (dirError) {
          toast.error("Failed to set up directory")
          return
        }
        directoryId = newDir.id
      }

      // Create business in database
      const { data: business, error } = await supabase
        .from('businesses')
        .insert({
          directory_id: directoryId,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          subcategory: formData.subcategory,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          tags: formData.tags,
          services: formData.services,
          subscription_status: 'active', // Active immediately for $5 plan
          subscription_plan: 'basic',
          owner_id: user.id,
          verified: false
        })
        .select()
        .single()

      if (error) throw error

      toast.success("Business created successfully!")
      router.push(`/business/${business.slug}`)
    } catch (error) {
      console.error('Error creating business:', error)
      toast.error("Failed to create business listing")
    } finally {
      setIsLoading(false)
    }
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.name && formData.description && formData.category
      case 2:
        return formData.address && formData.city && formData.state && formData.zipCode
      case 3:
        return formData.services.length > 0
      case 4:
        return formData.selectedPlan
      default:
        return true
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'border-muted text-muted-foreground'
              }`}>
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <Tabs value={currentStep.toString()} className="w-full">
            {/* Step 1: Basic Info */}
            <TabsContent value="1" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Tell us about your business</h2>
                <p className="text-muted-foreground">This information will help clients find and understand your services.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Business Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Mindful Therapy Center"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your wellness services and specialties..."
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
                      placeholder="e.g., Therapy & Counseling"
                    />
                  </div>
                </div>

                <div>
                  <Label>Tags (Select all that apply)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {popularTags.slice(0, 12).map((tag) => (
                      <Badge
                        key={tag}
                        variant={formData.tags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Step 2: Location */}
            <TabsContent value="2" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Where are you located?</h2>
                <p className="text-muted-foreground">Help clients find you with accurate location information.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="123 Wellness Way"
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
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
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
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="hello@business.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://www.business.com"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Step 3: Services */}
            <TabsContent value="3" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">What services do you offer?</h2>
                <p className="text-muted-foreground">List your main services with pricing to help clients understand what you offer.</p>
              </div>

              <div className="space-y-4">
                {formData.services.map((service, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label>Service Name</Label>
                      <Input
                        value={service.name}
                        onChange={(e) => updateService(index, "name", e.target.value)}
                        placeholder="e.g., Individual Therapy"
                      />
                    </div>
                    <div>
                      <Label>Price</Label>
                      <Input
                        value={service.price}
                        onChange={(e) => updateService(index, "price", e.target.value)}
                        placeholder="e.g., $150/session"
                      />
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Input
                        value={service.duration}
                        onChange={(e) => updateService(index, "duration", e.target.value)}
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
              </div>
            </TabsContent>

            {/* Step 4: Plan Selection */}
            <TabsContent value="4" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Choose your plan</h2>
                <p className="text-muted-foreground">Select the plan that best fits your business needs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subscriptionPlans.map((plan) => (
                  <Card 
                    key={plan.name}
                    className={`cursor-pointer transition-all ${
                      formData.selectedPlan === plan.name.toLowerCase()
                        ? 'ring-2 ring-primary border-primary'
                        : 'hover:shadow-md'
                    } ${plan.recommended ? 'border-primary' : ''}`}
                    onClick={() => handleInputChange("selectedPlan", plan.name.toLowerCase())}
                  >
                    {plan.recommended && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                        Recommended
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="text-3xl font-bold">${plan.price}<span className="text-lg text-muted-foreground">/month</span></div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Step 5: Review */}
            <TabsContent value="5" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Review your listing</h2>
                <p className="text-muted-foreground">Please review your information before submitting.</p>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Name:</strong> {formData.name}</p>
                    <p><strong>Category:</strong> {formData.category}</p>
                    <p><strong>Description:</strong> {formData.description}</p>
                    <p><strong>Location:</strong> {formData.address}, {formData.city}, {formData.state} {formData.zipCode}</p>
                    <p><strong>Contact:</strong> {formData.phone} | {formData.email}</p>
                    <p><strong>Services:</strong> {formData.services.length} service(s) listed</p>
                    <p><strong>Plan:</strong> {formData.selectedPlan.charAt(0).toUpperCase() + formData.selectedPlan.slice(1)}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Listing"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}





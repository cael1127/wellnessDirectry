"use client"

import { useState, useRef, useEffect } from "react"
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
import { Progress } from "@/components/ui/progress"
import { Plus, X, ArrowRight, ArrowLeft, Check, Upload, Image as ImageIcon, CreditCard } from "lucide-react"
import { categories, popularTags } from "@/lib/mock-data"
import { supabase } from "@/lib/supabase"
import { uploadBusinessImages, validateImageFile } from "@/lib/image-upload"
import { SUBSCRIPTION_PLANS } from "@/lib/stripe"
import { toast } from "sonner"
import { loadStripe } from "@stripe/stripe-js"
import { env } from "@/lib/env"

const steps = [
  { id: 1, title: "Basic Info", description: "Tell us about your business" },
  { id: 2, title: "Location", description: "Where are you located?" },
  { id: 3, title: "Services", description: "What do you offer?" },
  { id: 4, title: "Images", description: "Add photos of your business" },
  { id: 5, title: "Plan", description: "Choose your subscription" },
  { id: 6, title: "Review", description: "Review and submit" }
]

const paymentMethods = ['Cash', 'Credit Card', 'Insurance', 'HSA', 'FSA']
const languages = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Korean']
const accessibilityFeatures = ['Wheelchair Accessible', 'Hearing Assistance', 'Visual Assistance', 'Mobility Assistance']
const insuranceProviders = ['Aetna', 'Blue Cross', 'Cigna', 'Kaiser', 'Medicare', 'Medicaid', 'UnitedHealth']

export function EnhancedBusinessOnboarding() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    socialLinks: {
      facebook: "",
      instagram: "",
      linkedin: "",
      twitter: ""
    },
    paymentMethods: [] as string[],
    languages: [] as string[],
    accessibilityFeatures: [] as string[],
    insuranceAccepted: [] as string[],
    businessHoursNotes: "",
    selectedPlan: "professional" as keyof typeof SUBSCRIPTION_PLANS
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
    if (field.includes(".")) {
      const [parent, child] = handleNestedField(field, value)
      setFormData(prev => {
        const parentValue = prev[parent as keyof typeof prev]
        return {
          ...prev,
          [parent]: {
            ...(typeof parentValue === 'object' && parentValue !== null ? parentValue : {}),
            [child]: value
          }
        }
      })
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleNestedField = (field: string, value: any) => {
    const [parent, child] = field.split(".")
    return [parent, child]
  }

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const handleArrayToggle = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter(item => item !== value)
        : [...(prev[field] as string[]), value]
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    files.forEach(file => {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        toast.error(validation.error)
        return
      }

      setUploadedImages(prev => [...prev, file])
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setImagePreviewUrls(prev => [...prev, previewUrl])
    })
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviewUrls(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
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

  const handlePayment = async () => {
    setIsLoading(true)
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please sign in to continue")
        router.push('/signin?redirect=/onboard')
        return
      }

      // Ensure user exists in users table (create or update if exists)
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('id', user.id)
        .maybeSingle()

      if (!existingUser) {
        // Check if a user with this email exists (might have different ID)
        const { data: userByEmail } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email!)
          .maybeSingle()

        if (userByEmail && userByEmail.id !== user.id) {
          // Delete old user record with wrong ID
          await supabase
            .from('users')
            .delete()
            .eq('email', user.email!)
        }

        // Create new user entry with correct auth ID
        const { error: userCreateError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            role: 'business_owner',
          })

        if (userCreateError) {
          console.error('Error creating user:', userCreateError)
          toast.error("Failed to set up user profile. Please try again.")
          return
        }
      }

      // Get or create the default directory
      let directoryId
      
      const { data: existingDirectories } = await supabase
        .from('directories')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle()

      if (existingDirectories) {
        directoryId = existingDirectories.id
      } else {
        // Create a default directory if none exists
        const { data: newDirectory, error: createDirError } = await supabase
          .from('directories')
          .insert({
            slug: 'default',
            name: 'Health Directory',
            description: 'A comprehensive directory for finding mental health specialists, physical therapists, medical professionals, and healthcare providers.',
            is_active: true,
            theme_config: {
              primaryColor: '#8611d0',
              secondaryColor: '#b06cbd',
              accentColor: '#dcedff'
            },
            settings: {
              allowBusinessRegistration: true,
              requireVerification: false,
              maxBusinessesPerUser: 5
            }
          })
          .select('id')
          .maybeSingle()

        if (createDirError || !newDirectory) {
          throw new Error('Failed to create default directory. Please contact support.')
        }
        
        directoryId = newDirectory.id
      }

      // Generate unique slug from business name
      let baseSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100)

      let slug = baseSlug
      let counter = 1
      let slugExists = true

      while (slugExists) {
        const { data: existingBusiness } = await supabase
          .from('businesses')
          .select('id')
          .eq('directory_id', directoryId)
          .eq('slug', slug)
          .maybeSingle()

        if (!existingBusiness) {
          slugExists = false
        } else {
          slug = `${baseSlug}-${counter}`
          counter++
        }
      }

      // Create the business
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          directory_id: directoryId,
          slug: slug,
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
          social_links: formData.socialLinks,
          payment_methods: formData.paymentMethods,
          languages: formData.languages,
          accessibility_features: formData.accessibilityFeatures,
          insurance_accepted: formData.insuranceAccepted,
          business_hours_notes: formData.businessHoursNotes,
          subscription_status: 'inactive',
          subscription_plan: formData.selectedPlan,
          owner_id: user.id,
          verified: false
        })
        .select()
        .single()

      if (businessError) throw businessError

      // Upload images if any
      if (uploadedImages.length > 0) {
        try {
          const imageResult = await uploadBusinessImages(uploadedImages, business.id)
          if (!imageResult.success) {
            console.warn('Image upload failed, but continuing with payment')
          }
        } catch (error) {
          console.warn('Image upload failed, but continuing with payment:', error)
        }
      }

      // Create Stripe checkout session
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          plan: formData.selectedPlan,
          successUrl: `${window.location.origin}/business/${business.slug}?payment=success`,
          cancelUrl: `${window.location.origin}/onboard?payment=cancelled`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()

      // Redirect to Stripe Checkout
      const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      if (!stripePublishableKey) {
        throw new Error('Stripe publishable key is not configured')
      }

      const stripe = await loadStripe(stripePublishableKey)
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId })
      } else {
        throw new Error('Failed to initialize Stripe')
      }

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
        return true // Images are optional
      case 5:
        return formData.selectedPlan
      default:
        return true
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Step {currentStep} of {steps.length}</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

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

            {/* Step 4: Images */}
            <TabsContent value="4" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Add photos of your business</h2>
                <p className="text-muted-foreground">Upload images to showcase your business. You can add up to 20 photos.</p>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Upload Business Photos</p>
                  <p className="text-muted-foreground mb-4">Drag and drop images here, or click to select</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Images
                  </Button>
                </div>

                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Step 5: Plan Selection */}
            <TabsContent value="5" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Choose your plan</h2>
                <p className="text-muted-foreground">Select the plan that best fits your business needs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                  <Card 
                    key={key}
                    className={`cursor-pointer transition-all ${
                      formData.selectedPlan === key
                        ? 'ring-2 ring-primary border-primary'
                        : 'hover:shadow-md'
                    } ${key === 'professional' ? 'border-primary' : ''}`}
                    onClick={() => handleInputChange("selectedPlan", key)}
                  >
                    {key === 'professional' && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                        Recommended
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="text-3xl font-bold">${plan.price / 100}<span className="text-lg text-muted-foreground">/month</span></div>
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

            {/* Step 6: Review */}
            <TabsContent value="6" className="space-y-6">
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
                    <p><strong>Images:</strong> {uploadedImages.length} image(s) uploaded</p>
                    <p><strong>Plan:</strong> {SUBSCRIPTION_PLANS[formData.selectedPlan].name}</p>
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
                onClick={handlePayment}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {isLoading ? "Processing..." : "Subscribe & Create Listing"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

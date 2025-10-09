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
import { createClient } from "@/lib/supabase/client"
import { uploadBusinessImages, validateImageFile } from "@/lib/image-upload"
import { BusinessHoursEditor } from "@/components/business-hours-editor"
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans"
import { toast } from "sonner"
import { loadStripe } from "@stripe/stripe-js"
import { env } from "@/lib/env"

const steps = [
  { id: 1, title: "Basic Info", description: "Tell us about your business" },
  { id: 2, title: "Location", description: "Where are you located?" },
  { id: 3, title: "Services", description: "What do you offer?" },
  { id: 4, title: "Hours", description: "Set your business hours" },
  { id: 5, title: "Images", description: "Add photos of your business" },
  { id: 6, title: "Plan", description: "Choose your subscription" },
  { id: 7, title: "Review", description: "Review and submit" }
]

const paymentMethods = ['Cash', 'Credit Card', 'Insurance', 'HSA', 'FSA']
const languages = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Korean']
const accessibilityFeatures = ['Wheelchair Accessible', 'Hearing Assistance', 'Visual Assistance', 'Mobility Assistance']
const insuranceProviders = ['Aetna', 'Blue Cross', 'Cigna', 'Kaiser', 'Medicare', 'Medicaid', 'UnitedHealth']

export function EnhancedBusinessOnboarding() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string>("")
  const [galleryImages, setGalleryImages] = useState<File[]>([])
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>([])
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const profileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

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
    hours: {
      monday: { open: "09:00", close: "17:00" },
      tuesday: { open: "09:00", close: "17:00" },
      wednesday: { open: "09:00", close: "17:00" },
      thursday: { open: "09:00", close: "17:00" },
      friday: { open: "09:00", close: "17:00" },
      saturday: { closed: true },
      sunday: { closed: true },
    },
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
    selectedPlan: "basic" as keyof typeof SUBSCRIPTION_PLANS
  })

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    const supabase = createClient()
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

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    setProfileImage(file)
    const previewUrl = URL.createObjectURL(file)
    if (profileImagePreview) {
      URL.revokeObjectURL(profileImagePreview)
    }
    setProfileImagePreview(previewUrl)
  }

  const handleGalleryImagesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    // Limit to 3 images total
    const remainingSlots = 3 - galleryImages.length
    if (files.length > remainingSlots) {
      toast.error(`You can only upload ${remainingSlots} more image(s). Maximum 3 gallery photos.`)
      return
    }
    
    const validFiles: File[] = []
    const newPreviews: string[] = []
    
    files.forEach(file => {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        toast.error(validation.error)
        return
      }

      validFiles.push(file)
      newPreviews.push(URL.createObjectURL(file))
    })

    setGalleryImages(prev => [...prev, ...validFiles])
    setGalleryImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removeProfileImage = () => {
    if (profileImagePreview) {
      URL.revokeObjectURL(profileImagePreview)
    }
    setProfileImage(null)
    setProfileImagePreview("")
  }

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
    setGalleryImagePreviews(prev => {
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
      const supabase = createClient()
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
          hours: formData.hours,
          social_links: formData.socialLinks,
          payment_methods: formData.paymentMethods,
          languages: formData.languages,
          accessibility_features: formData.accessibilityFeatures,
          insurance_accepted: formData.insuranceAccepted,
          business_hours_notes: formData.businessHoursNotes,
          subscription_status: 'active', // $5 plan - activate immediately
          subscription_plan: formData.selectedPlan,
          owner_id: user.id,
          verified: true
        })
        .select()
        .single()

      if (businessError) throw businessError

      // Upload images if any
      const allImages: File[] = []
      if (profileImage) allImages.push(profileImage)
      if (galleryImages.length > 0) allImages.push(...galleryImages)
      
      if (allImages.length > 0) {
        try {
          const imageResult = await uploadBusinessImages(allImages, business.id)
          if (!imageResult.success) {
            console.warn('Image upload failed, but continuing with payment')
          } else {
            // Set first image (profile) as profile_image
            if (imageResult.images.length > 0) {
              await supabase
                .from('businesses')
                .update({ 
                  profile_image: imageResult.images[0].url,
                  images: imageResult.images.map(img => img.url)
                })
                .eq('id', business.id)
            }
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
      const stripePublishableKey = env.stripe.publishableKey
      if (!stripePublishableKey) {
        throw new Error('Stripe publishable key is not configured. Please check your environment variables.')
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
        <CardContent className="p-4 sm:p-6 md:p-8">
          <Tabs value={currentStep.toString()} className="w-full">
            {/* Step 1: Basic Info */}
            <TabsContent value="1" className="space-y-4 sm:space-y-6">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Tell us about your business</h2>
                <p className="text-sm sm:text-base text-muted-foreground">This information will help clients find and understand your services.</p>
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
            <TabsContent value="2" className="space-y-4 sm:space-y-6">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Where are you located?</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Help clients find you with accurate location information.</p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="address" className="text-xs sm:text-sm">Street Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="123 Wellness Way"
                    className="h-10 sm:h-11"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <div className="sm:col-span-2 md:col-span-1">
                    <Label htmlFor="city" className="text-xs sm:text-sm">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="San Francisco"
                      className="h-10 sm:h-11"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-xs sm:text-sm">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="TX"
                      className="h-10 sm:h-11"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode" className="text-xs sm:text-sm">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      placeholder="77979"
                      className="h-10 sm:h-11"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-xs sm:text-sm">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="(555) 123-4567"
                      className="h-10 sm:h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs sm:text-sm">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="hello@business.com"
                      className="h-10 sm:h-11"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website" className="text-xs sm:text-sm">Website (Optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://www.business.com"
                    className="h-10 sm:h-11"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Step 3: Services */}
            <TabsContent value="3" className="space-y-4 sm:space-y-6">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">What services do you offer?</h2>
                <p className="text-sm sm:text-base text-muted-foreground">List your main services with pricing to help clients understand what you offer.</p>
              </div>

              <div className="space-y-4">
                {formData.services.map((service, index) => (
                  <div key={index} className="flex flex-col gap-3 p-3 sm:p-4 border rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs sm:text-sm">Service Name</Label>
                        <Input
                          value={service.name}
                          onChange={(e) => updateService(index, "name", e.target.value)}
                          placeholder="e.g., Individual Therapy"
                          className="h-10 sm:h-11"
                        />
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm">Price</Label>
                        <Input
                          value={service.price}
                          onChange={(e) => updateService(index, "price", e.target.value)}
                          placeholder="e.g., $150"
                          className="h-10 sm:h-11"
                        />
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm">Duration</Label>
                        <Input
                          value={service.duration}
                          onChange={(e) => updateService(index, "duration", e.target.value)}
                          placeholder="e.g., 50 min"
                          className="h-10 sm:h-11"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeService(index)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                <Button type="button" onClick={addService} variant="outline" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </TabsContent>

            {/* Step 4: Business Hours */}
            <TabsContent value="4" className="space-y-4 sm:space-y-6">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">When are you open?</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Set your business hours so clients know when to visit or call.</p>
              </div>

              <BusinessHoursEditor
                hours={formData.hours}
                onChange={(hours) => handleInputChange("hours", hours)}
              />
            </TabsContent>

            {/* Step 5: Images */}
            <TabsContent value="5" className="space-y-4 sm:space-y-6">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Add Photos</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Upload 1 profile picture and up to 3 gallery photos</p>
              </div>

              <div className="space-y-6">
                {/* Profile Image */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Profile Picture (Required)</CardTitle>
                    <p className="text-sm text-muted-foreground">This will be the main image for your business listing</p>
                  </CardHeader>
                  <CardContent>
                    {!profileImagePreview ? (
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 sm:p-8 text-center">
                        <input
                          ref={profileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageUpload}
                          className="hidden"
                        />
                        <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                        <p className="text-base sm:text-lg font-medium mb-2">Upload Profile Picture</p>
                        <p className="text-sm text-muted-foreground mb-4">Click to select an image (max 5MB)</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="default"
                          onClick={() => profileInputRef.current?.click()}
                          className="w-full sm:w-auto"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Image
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={profileImagePreview}
                          alt="Profile preview"
                          className="w-full h-48 sm:h-64 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeProfileImage}
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4 mr-0 sm:mr-1" />
                          <span className="hidden sm:inline">Remove</span>
                        </Button>
                        <Badge className="absolute bottom-2 left-2 bg-green-500 text-xs sm:text-sm">
                          Profile Picture
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Gallery Images */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Gallery Photos (Optional - Max 3)</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Add up to 3 photos showcasing your practice ({galleryImages.length}/3)
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {galleryImages.length < 3 && (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <input
                            ref={galleryInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleGalleryImagesUpload}
                            className="hidden"
                          />
                          <ImageIcon className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                          <p className="font-medium mb-2">Add Gallery Photos</p>
                          <p className="text-sm text-muted-foreground mb-3">
                            {3 - galleryImages.length} slot(s) remaining
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => galleryInputRef.current?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Images
                          </Button>
                        </div>
                      )}

                      {galleryImagePreviews.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                          {galleryImagePreviews.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-32 sm:h-40 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                onClick={() => removeGalleryImage(index)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                              <Badge className="absolute bottom-1 left-1 text-xs bg-blue-500">
                                Photo {index + 1}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Step 6: Plan Selection */}
            <TabsContent value="6" className="space-y-4 sm:space-y-6">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Choose your plan</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Simple, affordable pricing for healthcare professionals</p>
              </div>

              <div className="max-w-md mx-auto">
                <Card className="ring-2 ring-primary">
                  <CardHeader className="text-center">
                    <Badge className="mx-auto mb-4 bg-green-500">Only Plan Available</Badge>
                    <CardTitle className="text-3xl">Basic Plan</CardTitle>
                    <div className="mt-4">
                      <span className="text-5xl font-bold">$5</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Everything you need to grow your practice</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {SUBSCRIPTION_PLANS.basic.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <p className="text-sm text-center">
                        <strong>Total:</strong> $5.00/month + applicable taxes
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Step 7: Review */}
            <TabsContent value="7" className="space-y-4 sm:space-y-6">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Review your listing</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Please review your information before submitting.</p>
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
                    <p><strong>Profile Picture:</strong> {profileImage ? '✅ Uploaded' : '❌ Not uploaded'}</p>
                    <p><strong>Gallery Photos:</strong> {galleryImages.length}/3 uploaded</p>
                    <p><strong>Plan:</strong> {SUBSCRIPTION_PLANS[formData.selectedPlan].name} - $5/month</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between mt-6 sm:mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handlePayment}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto order-1 sm:order-2"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{isLoading ? "Processing..." : "Subscribe & Create Listing"}</span>
                <span className="sm:hidden">{isLoading ? "Processing..." : "Submit & Pay"}</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

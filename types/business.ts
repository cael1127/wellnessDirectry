export interface Business {
  id: string
  slug: string
  name: string
  description: string
  category: string
  subcategory?: string
  location: {
    address: string
    city: string
    state: string
    zipCode: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  contact: {
    phone?: string
    email?: string
    website?: string
  }
  tags: string[]
  images: string[]
  profileImage?: string
  hours: {
    [key: string]: {
      open: string
      close: string
      closed?: boolean
    }
  }
  rating: number
  reviewCount: number
  verified: boolean
  featured: boolean
  ownerId?: string
  subscriptionStatus: 'inactive' | 'active' | 'expired' | 'cancelled'
  subscriptionPlan: 'basic' | 'professional' | 'premium'
  subscriptionExpiresAt?: string
  customDomain?: string
  seoTitle?: string
  seoDescription?: string
  services: Array<{
    name: string
    price: string
    duration: string
  }>
  socialLinks?: {
    facebook?: string
    instagram?: string
    linkedin?: string
    twitter?: string
  }
  paymentMethods?: string[]
  languages?: string[]
  accessibilityFeatures?: string[]
  insuranceAccepted?: string[]
  businessHoursNotes?: string
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  businessId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
  helpful: number
}

export interface User {
  id: string
  name: string
  email: string
  role: "user" | "business_owner" | "admin"
  businessIds?: string[]
  createdAt: string
}

export interface SearchFilters {
  query?: string
  category?: string
  location?: string
  rating?: number
  tags?: string[]
  sortBy?: "relevance" | "rating" | "distance" | "newest"
  radius?: number
}

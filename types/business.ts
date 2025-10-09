// Business type that matches Supabase database schema
export interface Business {
  id: string
  directory_id: string
  slug: string
  name: string
  description: string
  category: string
  subcategory?: string
  // Flat address fields
  address: string
  city: string
  state: string
  zip_code: string
  latitude?: number | null
  longitude?: number | null
  // Flat contact fields
  phone?: string
  email?: string
  website?: string
  tags: string[]
  images: string[]
  profile_image?: string
  hours: any // JSON field
  rating: string | number
  review_count: number
  verified: boolean
  featured: boolean
  subscription_status?: string
  subscription_plan?: string
  owner_id?: string
  seo_title?: string
  seo_description?: string
  services: any // JSON field
  social_links?: any // JSON field
  payment_methods?: string[]
  languages?: string[]
  accessibility_features?: string[]
  insurance_accepted?: string[]
  business_hours_notes?: string
  created_at: string
  updated_at: string
  distance?: number // Calculated field for search results
  reviews?: Review[] // Optional reviews array when joined
}

export interface Review {
  id: string
  business_id: string
  user_id: string
  user_name: string
  rating: number
  comment: string
  created_at: string
  helpful: number
}

export interface User {
  id: string
  name: string
  email: string
  role: "user" | "business_owner" | "admin"
  business_ids?: string[]
  created_at: string
}

export interface SearchFilters {
  query?: string
  category?: string
  location?: string
  rating?: number
  tags?: string[]
  sortBy?: "relevance" | "rating" | "distance" | "newest"
  radius?: number // Distance radius in miles
}

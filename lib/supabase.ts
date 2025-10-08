import { createClient } from '@supabase/supabase-js'

// Detect if we're in a build phase
const isBuildTime = typeof window === 'undefined' && (
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.NEXT_PHASE === 'phase-development-build' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL
)

// Lazy initialization to prevent errors during build
let _supabase: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (_supabase) {
    return _supabase
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  // During build time, return a dummy client
  if (isBuildTime) {
    console.warn('Supabase: Using placeholder client during build phase')
    return createClient('https://placeholder.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MTYxNjE2MTYsImV4cCI6MTk2MTc2MTYxNn0.placeholder')
  }
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  
  _supabase = createClient(supabaseUrl, supabaseAnonKey)
  return _supabase
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    return getSupabaseClient()[prop as keyof ReturnType<typeof createClient>]
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          subcategory: string | null
          address: string
          city: string
          state: string
          zip_code: string
          latitude: number | null
          longitude: number | null
          phone: string | null
          email: string | null
          website: string | null
          tags: string[]
          images: string[]
          hours: Record<string, { open: string; close: string; closed?: boolean }>
          rating: number
          review_count: number
          verified: boolean
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          subcategory?: string | null
          address: string
          city: string
          state: string
          zip_code: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          email?: string | null
          website?: string | null
          tags?: string[]
          images?: string[]
          hours?: Record<string, { open: string; close: string; closed?: boolean }>
          rating?: number
          review_count?: number
          verified?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          subcategory?: string | null
          address?: string
          city?: string
          state?: string
          zip_code?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          email?: string | null
          website?: string | null
          tags?: string[]
          images?: string[]
          hours?: Record<string, { open: string; close: string; closed?: boolean }>
          rating?: number
          review_count?: number
          verified?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          business_id: string
          user_id: string
          user_name: string
          rating: number
          comment: string
          created_at: string
          helpful: number
        }
        Insert: {
          id?: string
          business_id: string
          user_id: string
          user_name: string
          rating: number
          comment: string
          created_at?: string
          helpful?: number
        }
        Update: {
          id?: string
          business_id?: string
          user_id?: string
          user_name?: string
          rating?: number
          comment?: string
          created_at?: string
          helpful?: number
        }
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'user' | 'business_owner' | 'admin'
          business_ids: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role?: 'user' | 'business_owner' | 'admin'
          business_ids?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'user' | 'business_owner' | 'admin'
          business_ids?: string[] | null
          created_at?: string
        }
      }
    }
  }
}

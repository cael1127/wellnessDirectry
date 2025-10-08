import { createClient } from '@supabase/supabase-js'

// Lazy initialization to prevent errors during build
let _supabase: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      // During build, return a dummy client to avoid errors
      if (process.env.NEXT_PHASE === 'phase-production-build') {
        console.warn('Supabase client not initialized during build - this is expected')
        return createClient('https://placeholder.supabase.co', 'placeholder-key')
      }
      throw new Error('Missing Supabase environment variables')
    }
    
    _supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
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

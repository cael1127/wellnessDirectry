import { createClient } from '@supabase/supabase-js'
import { env } from './env'

// Validate environment variables
if (!env.supabase.url) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please check your .env.local file.')
}

if (!env.supabase.anonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please check your .env.local file.')
}

export const supabase = createClient(env.supabase.url, env.supabase.anonKey)

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

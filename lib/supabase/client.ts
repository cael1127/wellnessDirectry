import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Access env vars at runtime for proper Netlify builds
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local or Netlify environment variables.')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}


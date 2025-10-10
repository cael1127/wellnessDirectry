/**
 * Environment variable validation and configuration
 * This ensures all required environment variables are present and properly configured
 */

// Detect if we're running on server or client
const isServer = typeof window === 'undefined'

// Required environment variables (client-side, needed at build time)
const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
} as const

// Server-only required variables (only validated at runtime, not build time)
const serverRequiredEnvVars = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_BASIC_PRICE_ID: process.env.STRIPE_BASIC_PRICE_ID,
} as const

// Optional environment variables with defaults
const optionalEnvVars = {
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PROFESSIONAL_PRICE_ID: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
  STRIPE_PREMIUM_PRICE_ID: process.env.STRIPE_PREMIUM_PRICE_ID,
  STRIPE_ENVIRONMENT: process.env.STRIPE_ENVIRONMENT || 'test',
  STRIPE_ACCOUNT_ID: process.env.STRIPE_ACCOUNT_ID,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://minbod.netlify.app' : 'http://localhost:3000'),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123', // Default password (change in production!)
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const

// Validate required environment variables
function validateEnvironment() {
  const missing: string[] = []
  
  // Always validate client-side required vars
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value || value.trim() === '') {
      missing.push(key)
    }
  }
  
  // Only validate server vars if we're on the server (skip during build)
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'
  if (isServer && !isBuildPhase) {
    for (const [key, value] of Object.entries(serverRequiredEnvVars)) {
      if (!value || value.trim() === '') {
        missing.push(key)
      }
    }
  }
  
  if (missing.length > 0) {
    console.warn(
      `Missing environment variables: ${missing.join(', ')}\n` +
      'Some features may not work correctly.\n' +
      'See env.example for a complete list of required variables.'
    )
    // Don't throw during build, just warn
    if (!isBuildPhase && process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }
  }
}

// Validate environment on import
if (process.env.NODE_ENV !== 'test') {
  validateEnvironment()
}

// Export validated environment configuration
export const env = {
  // Supabase
  supabase: {
    url: requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: requiredEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: optionalEnvVars.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  
  // Stripe
  stripe: {
    publishableKey: requiredEnvVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    secretKey: serverRequiredEnvVars.STRIPE_SECRET_KEY || '',
    webhookSecret: optionalEnvVars.STRIPE_WEBHOOK_SECRET || '',
    environment: optionalEnvVars.STRIPE_ENVIRONMENT as 'test' | 'live',
    accountId: optionalEnvVars.STRIPE_ACCOUNT_ID,
    priceIds: {
      basic: serverRequiredEnvVars.STRIPE_BASIC_PRICE_ID || '',
      professional: optionalEnvVars.STRIPE_PROFESSIONAL_PRICE_ID || '',
      premium: optionalEnvVars.STRIPE_PREMIUM_PRICE_ID || '',
    },
  },
  
  // Application
  app: {
    url: optionalEnvVars.NEXT_PUBLIC_APP_URL,
    nodeEnv: optionalEnvVars.NODE_ENV as 'development' | 'production' | 'test',
  },
  
  // Admin
  admin: {
    password: optionalEnvVars.ADMIN_PASSWORD,
  },
  
  // Utility functions
  isDevelopment: optionalEnvVars.NODE_ENV === 'development',
  isProduction: optionalEnvVars.NODE_ENV === 'production',
  isTest: optionalEnvVars.NODE_ENV === 'test',
  isStripeTestMode: optionalEnvVars.STRIPE_ENVIRONMENT === 'test',
  isStripeLiveMode: optionalEnvVars.STRIPE_ENVIRONMENT === 'live',
  isServer,
}

// Export validation function for manual use
export { validateEnvironment }

// Type-safe environment access
export type EnvConfig = typeof env

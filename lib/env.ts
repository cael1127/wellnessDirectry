/**
 * Environment variable validation and configuration
 * This ensures all required environment variables are present and properly configured
 */

// Required environment variables
const requiredEnvVars = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_BASIC_PRICE_ID: process.env.STRIPE_BASIC_PRICE_ID,
  STRIPE_PROFESSIONAL_PRICE_ID: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
  STRIPE_PREMIUM_PRICE_ID: process.env.STRIPE_PREMIUM_PRICE_ID,
} as const

// Optional environment variables with defaults
const optionalEnvVars = {
  STRIPE_ENVIRONMENT: process.env.STRIPE_ENVIRONMENT || 'test',
  STRIPE_ACCOUNT_ID: process.env.STRIPE_ACCOUNT_ID,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const

// Validate required environment variables
function validateEnvironment() {
  const missing: string[] = []
  
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value || value.trim() === '') {
      missing.push(key)
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.\n' +
      'See env.example for a complete list of required variables.'
    )
  }
}

// Validate environment on import (only in production or when explicitly enabled)
if (process.env.NODE_ENV === 'production' || process.env.VALIDATE_ENV === 'true') {
  validateEnvironment()
}

// Export validated environment configuration
export const env = {
  // Supabase
  supabase: {
    url: requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: requiredEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY!,
  },
  
  // Stripe
  stripe: {
    publishableKey: requiredEnvVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    secretKey: requiredEnvVars.STRIPE_SECRET_KEY!,
    webhookSecret: requiredEnvVars.STRIPE_WEBHOOK_SECRET!,
    environment: optionalEnvVars.STRIPE_ENVIRONMENT as 'test' | 'live',
    accountId: optionalEnvVars.STRIPE_ACCOUNT_ID,
    priceIds: {
      basic: requiredEnvVars.STRIPE_BASIC_PRICE_ID!,
      professional: requiredEnvVars.STRIPE_PROFESSIONAL_PRICE_ID!,
      premium: requiredEnvVars.STRIPE_PREMIUM_PRICE_ID!,
    },
  },
  
  // Application
  app: {
    url: optionalEnvVars.NEXT_PUBLIC_APP_URL,
    nodeEnv: optionalEnvVars.NODE_ENV as 'development' | 'production' | 'test',
  },
  
  // Utility functions
  isDevelopment: optionalEnvVars.NODE_ENV === 'development',
  isProduction: optionalEnvVars.NODE_ENV === 'production',
  isTest: optionalEnvVars.NODE_ENV === 'test',
  isStripeTestMode: optionalEnvVars.STRIPE_ENVIRONMENT === 'test',
  isStripeLiveMode: optionalEnvVars.STRIPE_ENVIRONMENT === 'live',
}

// Export validation function for manual use
export { validateEnvironment }

// Type-safe environment access
export type EnvConfig = typeof env

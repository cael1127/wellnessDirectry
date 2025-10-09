import Stripe from 'stripe'
import { env } from './env'
import type { SubscriptionPlan } from './subscription-plans'

// Check if we're on the server
const isServer = typeof window === 'undefined'

// Lazy initialization of Stripe - only on server
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!isServer) {
    throw new Error('Stripe can only be used on the server side')
  }
  
  if (!_stripe) {
    if (!env.stripe.secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set. Please check your .env.local file.')
    }
    
    _stripe = new Stripe(env.stripe.secretKey, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  }
  return _stripe
}

// For backward compatibility - only initialize on server
export const stripe = isServer ? getStripe() : ({} as Stripe)

export const STRIPE_CONFIG = {
  publishableKey: env.stripe.publishableKey,
  secretKey: isServer ? env.stripe.secretKey : '',
  webhookSecret: isServer ? env.stripe.webhookSecret : '',
}

// Import plans from separate file to avoid server-only env access on client
export { SUBSCRIPTION_PLANS } from './subscription-plans'
export type { SubscriptionPlan } from './subscription-plans'

// Server-only: Get Stripe Price IDs
export function getStripePriceId(plan: SubscriptionPlan): string {
  if (!isServer) {
    throw new Error('getStripePriceId can only be called on the server')
  }
  
  const priceIds: Record<SubscriptionPlan, string> = {
    basic: env.stripe.priceIds.basic,
  }
  
  return priceIds[plan] || env.stripe.priceIds.basic
}

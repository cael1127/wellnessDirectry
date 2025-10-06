import Stripe from 'stripe'
import { env } from './env'

// Validate environment variables
if (!env.stripe.secretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set. Please check your .env.local file.')
}

export const stripe = new Stripe(env.stripe.secretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

export const STRIPE_CONFIG = {
  publishableKey: env.stripe.publishableKey,
  secretKey: env.stripe.secretKey,
  webhookSecret: env.stripe.webhookSecret,
}

export const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic',
    price: 2900, // $29.00 in cents
    features: [
      'Business listing with basic info',
      'Contact information display',
      'Business hours',
      'Up to 5 service listings',
      'Basic analytics',
      'Email support'
    ],
    stripePriceId: env.stripe.priceIds.basic,
  },
  professional: {
    name: 'Professional',
    price: 7900, // $79.00 in cents
    features: [
      'Everything in Basic',
      'Custom business page design',
      'Unlimited service listings',
      'Photo gallery (up to 20 images)',
      'Customer reviews management',
      'Advanced analytics',
      'SEO optimization',
      'Priority support',
      'Social media integration'
    ],
    stripePriceId: env.stripe.priceIds.professional,
  },
  premium: {
    name: 'Premium',
    price: 14900, // $149.00 in cents
    features: [
      'Everything in Professional',
      'Custom domain support',
      'Advanced booking system',
      'Staff management',
      'Multi-location support',
      'API access',
      'White-label options',
      'Dedicated account manager',
      'Custom integrations'
    ],
    stripePriceId: env.stripe.priceIds.premium,
  },
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

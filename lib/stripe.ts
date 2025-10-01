import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
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
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID!,
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
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID!,
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
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
  },
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

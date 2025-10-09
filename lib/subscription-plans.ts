// Client-safe subscription plans configuration
// This file can be imported on both client and server

export const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic',
    price: 500, // $5.00 in cents
    priceDisplay: '$5',
    interval: 'month',
    features: [
      'Healthcare provider listing',
      'Contact information display',
      'Business hours',
      'Service listings',
      'Patient reviews',
      'Basic analytics',
      'Email support'
    ],
    recommended: true,
  },
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS


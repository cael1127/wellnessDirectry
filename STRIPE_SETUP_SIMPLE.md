# Simple Stripe Setup - $5/month Plan

## Your Stripe Details

**Product ID:** `
**Price ID:** ` 
**Price:** $5.00 USD per month  
**Active Subscriptions:** 2  

---

## Environment Variables Setup

### In `.env.local` (Local Development):

```env
# Your Stripe Keys (from Stripe Dashboard → Developers → API Keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY

# Your Stripe Webhook Secret (from Stripe Dashboard → Developers → Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Your $5/month Price ID (from your Stripe product)
STRIPE_BASIC_PRICE_ID=
```

### In Netlify Dashboard:

Go to: **Site Settings → Environment Variables**

A

---

## How Payment Works

### Flow:
1. User fills out business form
2. Clicks "Submit" → Goes to plan selection
3. Sees **only one plan**: Basic ($5/month)
4. Clicks "Get Started - $5/month"
5. Redirects to Stripe Checkout
6. User enters payment info
7. Stripe processes payment
8. Webhook updates business status to "active"
9. Business appears in directory

### Files That Handle This:
- `lib/stripe.ts` → Plan configuration ($5/month)
- `app/api/payments/create-checkout-session/route.ts` → Creates Stripe session
- `app/api/payments/webhook/route.ts` → Handles payment success
- `components/subscription-plans.tsx` → Shows the $5 plan card

---

## Test Mode vs Live Mode

### Test Mode (Development):
- Use test keys: `pk_test_...` and `sk_test_...`
- Use test cards: `4242 4242 4242 4242`
- No real money charged

### Live Mode (Production):
- Use live keys: `pk_live_...` and `sk_live_...`
- Real payments processed
- Make sure webhook is set up!

---

## Webhook Setup

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://yourdomain.com/api/payments/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** → Add to `STRIPE_WEBHOOK_SECRET`

---

## ✅ What's Updated

- ✅ Only 1 plan available: **Basic ($5/month)**
- ✅ Professional & Premium plans removed
- ✅ Default selection: "basic"
- ✅ Checkout uses your Price ID: `
- ✅ README updated with $5 pricing
- ✅ All forms default to Basic plan

---

## Quick Checklist

- [ ] Add `STRIPE_BASIC_PRICE_ID= to `.env.local`
- [ ] Add Stripe keys to `.env.local`
- [ ] Test checkout flow locally
- [ ] Add same variables to Netlify
- [ ] Set up webhook endpoint
- [ ] Test in production

**Your $5/month plan is ready!** 💰


# Stripe Setup Guide

This guide will walk you through setting up Stripe for your Wellness Directory application.

## 🚀 Quick Setup

### 1. Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete the account verification process
4. Switch to **Test mode** for development

### 2. Get API Keys

1. Go to [Stripe Dashboard > Developers > API Keys](https://dashboard.stripe.com/apikeys)
2. Copy the following keys to your `.env.local` file:

```env
# Test keys (for development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_SECRET_KEY=your_secret_key

# Live keys (for production - use these when you go live)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_live_publishable_key
STRIPE_SECRET_KEY=your_live_secret_key
```

### 3. Create Subscription Products

You need to create 3 products in Stripe for your subscription plans:

#### Basic Plan ($29/month)
1. Go to [Products](https://dashboard.stripe.com/products)
2. Click "Add product"
3. Fill in:
   - **Name**: Basic Plan
   - **Description**: Basic business listing with essential features
   - **Pricing**: $29.00 USD, Recurring monthly
4. Click "Save product"
5. Copy the **Price ID** (starts with `price_`) to `STRIPE_BASIC_PRICE_ID`

#### Professional Plan ($79/month)
1. Create another product:
   - **Name**: Professional Plan
   - **Description**: Advanced business listing with custom features
   - **Pricing**: $79.00 USD, Recurring monthly
2. Copy the **Price ID** to `STRIPE_PROFESSIONAL_PRICE_ID`

#### Premium Plan ($149/month)
1. Create another product:
   - **Name**: Premium Plan
   - **Description**: Full-featured business listing with all features
   - **Pricing**: $149.00 USD, Recurring monthly
2. Copy the **Price ID** to `STRIPE_PREMIUM_PRICE_ID`

### 4. Set Up Webhooks

Webhooks are essential for handling subscription events (payments, cancellations, etc.).

#### For Development (using Stripe CLI)
1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/payments/webhook`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

#### For Production
1. Go to [Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL: `https://yourdomain.com/api/payments/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** to `STRIPE_WEBHOOK_SECRET`

### 5. Test Your Setup

#### Test Payment Flow
1. Start your development server: `pnpm dev`
2. Go to your business onboarding page
3. Fill out the form and select a plan
4. Use Stripe's test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Requires authentication**: `4000 0025 0000 3155`
5. Use any future expiry date and any 3-digit CVC

#### Test Webhook Events
1. Check your webhook logs in Stripe Dashboard
2. Verify that events are being received
3. Check your database for created subscriptions and payments

## 🔧 Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_SECRET_KEY=your_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Stripe Price IDs
STRIPE_BASIC_PRICE_ID=price_your_basic
STRIPE_PROFESSIONAL_PRICE_ID=price_your_professional
STRIPE_PREMIUM_PRICE_ID=price_your_premium

# Optional
STRIPE_ENVIRONMENT=test
```

## 🚀 Going Live

### 1. Switch to Live Mode
1. In Stripe Dashboard, toggle "Test mode" off
2. Update your environment variables with live keys
3. Update webhook endpoint to production URL
4. Test with real payment methods

### 2. Update Production Environment
1. Add live keys to your production environment (Vercel, etc.)
2. Update webhook endpoint URL
3. Test the complete payment flow

### 3. Monitor and Maintain
1. Set up monitoring for failed payments
2. Monitor webhook delivery
3. Set up alerts for critical events
4. Regularly review subscription metrics

## 🛠 Troubleshooting

### Common Issues

#### Webhook Not Receiving Events
- Check webhook endpoint URL is correct
- Verify webhook secret is correct
- Check server logs for errors
- Test webhook endpoint manually

#### Payment Not Processing
- Verify API keys are correct
- Check if you're using test/live keys consistently
- Verify price IDs exist and are active
- Check browser console for errors

#### Subscription Not Updating
- Check webhook events are being received
- Verify database connection
- Check webhook handler logic
- Review Stripe webhook logs

### Getting Help
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Stripe Discord Community](https://discord.gg/stripe)

## 📊 Monitoring

### Key Metrics to Track
- Payment success rate
- Subscription churn rate
- Webhook delivery success rate
- Average revenue per user (ARPU)
- Monthly recurring revenue (MRR)

### Recommended Tools
- Stripe Dashboard analytics
- Custom analytics in your app
- External monitoring (DataDog, New Relic)
- Error tracking (Sentry)

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Verify webhook signatures** to prevent fraud
4. **Use HTTPS** for all webhook endpoints
5. **Monitor for suspicious activity** regularly
6. **Rotate API keys** periodically
7. **Use least privilege** principle for API access

## 📝 Next Steps

After setting up Stripe:

1. **Test thoroughly** with test cards
2. **Set up monitoring** and alerts
3. **Create customer support** processes
4. **Plan for scaling** as you grow
5. **Consider additional features** like:
   - Proration for plan changes
   - Discount codes and coupons
   - Tax calculation
   - Multi-currency support
   - Invoice customization

---

Need help? Check the [Stripe Documentation](https://stripe.com/docs) or create an issue in this repository.

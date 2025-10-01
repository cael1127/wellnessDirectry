import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_CONFIG.webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const businessId = session.metadata?.businessId
        const plan = session.metadata?.plan

        if (!businessId || !plan) {
          console.error('Missing metadata in checkout session')
          break
        }

        // Update business subscription status
        await supabase
          .from('businesses')
          .update({
            subscription_status: 'active',
            subscription_plan: plan,
            subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          })
          .eq('id', businessId)

        // Create subscription record
        await supabase
          .from('subscriptions')
          .insert({
            business_id: businessId,
            plan_name: plan,
            status: 'active',
            stripe_subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
            current_period_start: new Date(session.subscription_details?.billing_cycle_anchor * 1000).toISOString(),
            current_period_end: new Date((session.subscription_details?.billing_cycle_anchor + 30 * 24 * 60 * 60) * 1000).toISOString(),
          })

        // Create payment record
        await supabase
          .from('payments')
          .insert({
            business_id: businessId,
            stripe_payment_intent_id: session.payment_intent as string,
            amount: session.amount_total || 0,
            currency: session.currency || 'usd',
            status: 'succeeded',
            payment_method: 'card',
            description: `${plan} subscription`,
          })

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const businessId = subscription.metadata?.businessId

        if (!businessId) break

        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('stripe_subscription_id', subscription.id)

        // Update business subscription status
        const subscriptionStatus = subscription.status === 'active' ? 'active' : 'cancelled'
        await supabase
          .from('businesses')
          .update({ subscription_status: subscriptionStatus })
          .eq('id', businessId)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const businessId = subscription.metadata?.businessId

        if (!businessId) break

        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', subscription.id)

        await supabase
          .from('businesses')
          .update({ subscription_status: 'cancelled' })
          .eq('id', businessId)

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (!subscriptionId) break

        // Get subscription to find business
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('business_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single()

        if (!subscription) break

        // Create payment record
        await supabase
          .from('payments')
          .insert({
            business_id: subscription.business_id,
            stripe_payment_intent_id: invoice.payment_intent as string,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: 'succeeded',
            payment_method: 'card',
            description: 'Subscription renewal',
          })

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (!subscriptionId) break

        // Get subscription to find business
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('business_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single()

        if (!subscription) break

        // Update business subscription status
        await supabase
          .from('businesses')
          .update({ subscription_status: 'expired' })
          .eq('id', subscription.business_id)

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

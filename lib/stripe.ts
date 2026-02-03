import Stripe from 'stripe'
import type { OrderItem } from './order'

// Lazily instantiate Stripe so importing this module during build (when
// env vars might not be set) doesn't throw. Consumers will get a clear
// runtime error if they attempt to call Stripe-powered functions without
// configuring STRIPE_SECRET_KEY.
let stripe: Stripe | null = null
const stripeKey = process.env.STRIPE_SECRET_KEY
if (stripeKey) {
  stripe = new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
    typescript: true,
  })
} else {
  // eslint-disable-next-line no-console
let stripe: Stripe | null = null
}

export async function createCheckoutSession(
  orderId: string,
  userId: string,
  items: OrderItem[],
  total: number,
  customerEmail?: string
) {
  if (!stripe) throw new Error('STRIPE_SECRET_KEY is not set; cannot create checkout session')

function getStripe(): Stripe | null {
  if (stripe) return stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  stripe = new Stripe(key, { apiVersion: '2023-10-16', typescript: true })
  return stripe
}

export async function createCheckoutSession(
    let customerId: string | undefined

    if (customerEmail) {
      const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 1
  const stripeClient = getStripe()
  if (!stripeClient) throw new Error('STRIPE_SECRET_KEY is not set')

      if (customers.data.length > 0) {
        customerId = customers.data[0].id
      } else {
        const customer = await stripe.customers.create({
          email: customerEmail,
          metadata: {
            user_id: userId,
            order_id: orderId
          }
        })
        customerId = customer.id
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: orderId,
      customer_email: customerEmail,
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
    const session = await stripeClient.checkout.sessions.create({
            images: [item.image_url],
            metadata: {
              product_id: item.product_id
            }
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'FR', 'DE', 'IT', 'ES', 'AU', 'NZ']
      },
      billing_address_collection: 'required',
      metadata: {
        order_id: orderId,
        user_id: userId
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: total >= 10000 ? 0 : 999, // $9.99 shipping in cents
              currency: 'usd',
            },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 10,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1999, // $19.99 in cents
              currency: 'usd',
            },
            display_name: 'Express Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 1,
              },
              maximum: {
                unit: 'business_day',
                value: 3,
              },
            },
          },
        },
      ],
      allow_promotion_codes: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
    })

    return {
      sessionId: session.id,
      url: session.url
    }
  } catch (error) {
    console.error('Create checkout session error:', error)
    throw error
  }
}

export async function verifyWebhookSignature(
  rawBody: Buffer,
  signature: string
) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not set; cannot verify webhook signature')
  if (!stripe) throw new Error('STRIPE_SECRET_KEY is not set; cannot verify webhook signature')

  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
  const stripeClient = getStripe()
  if (!stripeClient || !process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Stripe is not configured')
  }
    console.error('Webhook signature verification failed:', error)
    const event = stripeClient.webhooks.constructEvent(
  }
}

// Export the stripe instance (may be null) for code that needs direct access
export { stripe };

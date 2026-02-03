import { NextRequest, NextResponse } from 'next/server'
import { stripe, verifyWebhookSignature } from '@/lib/stripe'
import { updateOrderStatus, getOrder } from '@/lib/order'
import { updateProductStock } from '../../../../lib/products'
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from '../../../../lib/email'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  try {
    // Verify webhook signature
    const event = await verifyWebhookSignature(
      Buffer.from(body),
      signature
    )

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        
        // Extract metadata
        const orderId = session.metadata?.order_id
        const userId = session.metadata?.user_id
        
        if (!orderId || !userId) {
          console.error('Missing metadata in webhook')
          break
        }

        // Get order details
        const order = await getOrder(orderId, userId)
        if (!order) {
          console.error('Order not found:', orderId)
          break
        }

        // Update order status
        await updateOrderStatus(
          orderId,
          'processing',
          'paid',
          {
            payment_intent_id: session.payment_intent,
            session_id: session.id
          }
        )

        // Send confirmation email
        await sendOrderConfirmationEmail({
          orderId,
          customerEmail: session.customer_email,
          amount: session.amount_total / 100,
          items: order.items
        })

        // Send admin notification
        await sendAdminNotificationEmail({
          orderId,
          customerEmail: session.customer_email,
          amount: session.amount_total / 100
        })

        break
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as any
        const orderId = session.metadata?.order_id
        
        if (orderId) {
          await updateOrderStatus(orderId, 'processing', 'paid')
        }
        break
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as any
        const orderId = session.metadata?.order_id
        
        if (orderId) {
          await updateOrderStatus(orderId, 'pending', 'failed')
          
          // Restore product stock
          const order = await getOrder(orderId, session.metadata?.user_id)
          if (order) {
            for (const item of order.items) {
              await updateProductStock(item.product_id, item.quantity)
            }
          }
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as any
        const orderId = charge.metadata?.order_id
        
        if (orderId) {
          await updateOrderStatus(orderId, 'cancelled', 'refunded')
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any
        console.log('Payment succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any
        console.log('Payment failed:', paymentIntent.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}

export const runtime = 'nodejs';

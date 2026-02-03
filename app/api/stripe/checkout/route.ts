import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { createOrderFromCart, getOrder, updateOrderStatus } from '@/lib/order'
import { getCurrentUser } from '@/lib/auth'
import rateLimiter from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
  const { success } = await rateLimiter.check(ip, 10) // 10 requests per minute
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate request body
    const { orderId, customerEmail } = await request.json()
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get order with security check (user owns the order)
    const order = await getOrder(orderId, user.id)
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Prevent duplicate payment attempts
    if (order.payment_status === 'paid') {
      return NextResponse.json(
        { error: 'Order already paid' },
        { status: 400 }
      )
    }

    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'Order cannot be paid' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession(
      orderId,
      user.id,
      order.items,
      Math.round(order.total * 100), // Convert to cents
      customerEmail || user.email
    )

    // Update order with session ID
    await updateOrderStatus(orderId, 'processing', 'pending', {
      session_id: session.sessionId
    })

    return NextResponse.json({
      sessionId: session.sessionId,
      url: session.url
    })

  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    
    // Handle Stripe-specific errors
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid payment request' },
        { status: 400 }
      )
    }

    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: 'Card error: ' + error.message },
        { status: 402 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
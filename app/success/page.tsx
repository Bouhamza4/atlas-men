'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getOrder } from '@/lib/order'
import { FiCheckCircle, FiPackage, FiTruck, FiHome, FiDownload, FiShare2 } from 'react-icons/fi'
import './success.css'

function SuccessPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [countdown, setCountdown] = useState(10)

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      router.push('/')
      return
    }

    fetchOrder()
    startCountdown()
  }, [sessionId])

  const fetchOrder = async () => {
    try {
      const currentSessionId = sessionId
      if (!currentSessionId) {
        router.push('/')
        return
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Find order by session ID
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('stripe_session_id', currentSessionId)
        .eq('user_id', user.id)
        .limit(1)

      if (!orders || orders.length === 0) {
        throw new Error('Order not found')
      }

      const orderData = await getOrder(orders[0].id, user.id)
      if (orderData) {
        setOrder(orderData)
      }
    } catch (error) {
      console.error('Fetch order error:', error)
    } finally {
      setLoading(false)
    }
  }

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/orders')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }

  const downloadReceipt = () => {
    if (!order) return

    const receipt = `
      Receipt for Order #${order.id.slice(0, 8).toUpperCase()}
      ========================================
      Date: ${new Date(order.created_at).toLocaleDateString()}
      Status: ${order.status}
      Payment: ${order.payment_status}
      
      Items:
      ${order.items.map((item: any) => `
        • ${item.name} x${item.quantity}
          $${item.price.toFixed(2)} each = $${(item.price * item.quantity).toFixed(2)}
      `).join('')}
      
      Summary:
      Subtotal: $${order.subtotal.toFixed(2)}
      Shipping: $${order.shipping_cost.toFixed(2)}
      Tax: $${order.tax_amount.toFixed(2)}
      Total: $${order.total.toFixed(2)}
      
      Shipping Address:
      ${order.shipping_address.full_name}
      ${order.shipping_address.address_line1}
      ${order.shipping_address.address_line2 || ''}
      ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}
      ${order.shipping_address.country}
      Phone: ${order.shipping_address.phone}
      
      Thank you for your purchase!
    `

    const blob = new Blob([receipt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${order.id.slice(0, 8)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareOrder = async () => {
    if (navigator.share && order) {
      try {
        await navigator.share({
          title: 'My Order Confirmation',
          text: `I just placed an order for $${order.total.toFixed(2)} on our store!`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="success-loading">
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="confetti"></div>
          ))}
        </div>
        <div className="loading-content">
          <div className="success-spinner"></div>
          <h2>Processing Your Order</h2>
          <p>Please wait while we confirm your payment...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="success-error">
        <h2>Order Not Found</h2>
        <p>We couldn't find your order details.</p>
        <button onClick={() => router.push('/orders')} className="back-btn">
          View My Orders
        </button>
      </div>
    )
  }

  return (
    <div className="success-page">
      {/* Confetti Background */}
      <div className="confetti-container">
        {[...Array(100)].map((_, i) => (
          <div key={i} className="confetti"></div>
        ))}
      </div>

      {/* Success Card */}
      <div className="success-card">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon-container">
            <FiCheckCircle className="success-icon" />
            <div className="success-ring"></div>
            <div className="success-glow"></div>
          </div>
          
          <h1 className="success-title">Payment Successful!</h1>
          <p className="success-subtitle">
            Thank you for your order. We've sent a confirmation to your email.
          </p>
        </div>

        {/* Order Details */}
        <div className="order-details">
          <div className="order-header">
            <h3>Order Details</h3>
            <div className="order-badge">
              <span className={`status-${order.status}`}>{order.status}</span>
              <span className={`payment-${order.payment_status}`}>
                {order.payment_status}
              </span>
            </div>
          </div>

          <div className="order-info-grid">
            <div className="info-card">
              <div className="info-icon">
                <FiPackage />
              </div>
              <div className="info-content">
                <h4>Order Number</h4>
                <p>{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <FiTruck />
              </div>
              <div className="info-content">
                <h4>Estimated Delivery</h4>
                <p>3-5 Business Days</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <FiHome />
              </div>
              <div className="info-content">
                <h4>Shipping Address</h4>
                <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                💳
              </div>
              <div className="info-content">
                <h4>Total Amount</h4>
                <p className="total-amount">${order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="order-items">
            <h4>Items Ordered</h4>
            <div className="items-list">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="item-row">
                  <div className="item-image">
                    <img src={item.image_url} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <h5>{item.name}</h5>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button onClick={() => router.push('/orders')} className="action-btn primary">
              Track Order
            </button>
            <button onClick={downloadReceipt} className="action-btn secondary">
              <FiDownload />
              Download Receipt
            </button>
            <button onClick={() => router.push('/products')} className="action-btn outline">
              Continue Shopping
            </button>
            {typeof navigator.share === 'function' && (
              <button onClick={shareOrder} className="action-btn share">
                <FiShare2 />
                Share
              </button>
            )}
          </div>

          {/* Countdown */}
          <div className="countdown-section">
            <p>
              Redirecting to orders page in{' '}
              <span className="countdown-number">{countdown}</span> seconds...
            </p>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="next-steps">
        <h3>What's Next?</h3>
        <div className="steps-grid">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Order Processing</h4>
            <p>We'll process your order within 24 hours.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>Shipping</h4>
            <p>You'll receive tracking information via email.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Delivery</h4>
            <p>Your items will arrive within 3-5 business days.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="success-page" />}>
      <SuccessPageClient />
    </Suspense>
  )
}

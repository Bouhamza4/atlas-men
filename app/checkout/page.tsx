'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CheckoutForm from '@/components/CheckoutForm'
import OrderSummary from '@/components/OrderSummary'
import { FiShield, FiTruck, FiRefreshCw, FiArrowLeft } from 'react-icons/fi'
import './checkout.css'

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [discountError, setDiscountError] = useState('')

  useEffect(() => {
    loadCart()
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login?redirect=/checkout')
    }
  }

  const loadCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: cartData } = await supabase
        .from('carts')
        .select(`
          id,
          cart_items (
            id,
            quantity,
            products (
              id,
              name,
              price,
              image_url,
              stock
            )
          )
        `)
        .eq('user_id', user.id)
        .single()

      setCart(cartData)
    } catch (error) {
      console.error('Load cart error:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyDiscount = async () => {
    if (!discountCode.trim()) return

    setDiscountError('')
    try {
      const response = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: discountCode })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid discount code')
      }

      // Apply discount logic here
      console.log('Discount applied:', data.discount)
      
    } catch (error: any) {
      setDiscountError(error.message)
    }
  }

  if (loading) {
    return (
      <div className="checkout-loading">
        <div className="loading-spinner"></div>
        <p>Loading your cart...</p>
      </div>
    )
  }

  if (!cart || cart.cart_items?.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some products before checkout</p>
        <button 
          className="back-to-shop"
          onClick={() => router.push('/shop')}
        >
          <FiArrowLeft />
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="checkout-container">
      {/* Header */}
      <div className="checkout-header">
        <h1>Secure Checkout</h1>
        <div className="security-badges">
          <div className="security-badge">
            <FiShield />
            <span>256-bit SSL Security</span>
          </div>
          <div className="security-badge">
            <FiTruck />
            <span>Free Shipping Over $100</span>
          </div>
          <div className="security-badge">
            <FiRefreshCw />
            <span>30-Day Returns</span>
          </div>
        </div>
      </div>

      <div className="checkout-content">
        {/* Left Column - Form */}
        <div className="checkout-left">
          <CheckoutForm 
            cart={cart} 
            onProcessing={setProcessing}
          />
        </div>

        {/* Right Column - Order Summary */}
        <div className="checkout-right">
          <OrderSummary 
            cart={cart}
            discountCode={discountCode}
            onDiscountChange={setDiscountCode}
            onApplyDiscount={applyDiscount}
            discountError={discountError}
          />
        </div>
      </div>

      {/* Processing Overlay */}
      {processing && (
        <div className="processing-overlay">
          <div className="processing-modal">
            <div className="spinner-container">
              <div className="payment-spinner"></div>
              <div className="spinner-ring"></div>
            </div>
            <h3>Processing Payment</h3>
            <p>Please wait while we securely process your payment...</p>
            <div className="processing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
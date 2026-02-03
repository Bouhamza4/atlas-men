'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiShoppingBag, FiTruck, FiShield, FiCheckCircle, FiArrowRight } from 'react-icons/fi'
import './CartSummary.css'

interface CartSummaryProps {
  subtotal: number
  itemCount: number
  loading?: boolean
  onCheckout?: () => void
}

export default function CartSummary({ subtotal, itemCount, loading, onCheckout }: CartSummaryProps) {
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax

  const handleCheckout = async () => {
    if (onCheckout) {
      onCheckout()
    } else {
      setProcessing(true)
      try {
        // Add slight delay for animation
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push('/checkout')
      } catch (error) {
        console.error('Checkout error:', error)
      } finally {
        setProcessing(false)
      }
    }
  }

  return (
    <div className="cart-summary">
      {/* Summary Header */}
      <div className="summary-header">
        <h2 className="summary-title">
          <FiShoppingBag />
          Order Summary
        </h2>
        <div className="item-count">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </div>
      </div>

      {/* Summary Details */}
      <div className="summary-details">
        <div className="detail-row">
          <span>Subtotal</span>
          <span className="detail-value">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="detail-row shipping">
          <span>
            <FiTruck />
            Shipping
            {subtotal > 100 && (
              <span className="free-badge">FREE</span>
            )}
          </span>
          <span className={`detail-value ${shipping === 0 ? 'free' : ''}`}>
            {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        
        <div className="detail-row tax">
          <span>Tax (8%)</span>
          <span className="detail-value">${tax.toFixed(2)}</span>
        </div>
        
        <div className="detail-row total-row">
          <span>Total</span>
          <span className="total-value">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      {subtotal < 100 && (
        <div className="free-shipping-progress">
          <div className="progress-label">
            <span>Add ${(100 - subtotal).toFixed(2)} more for free shipping!</span>
            <span className="progress-percent">{Math.min((subtotal / 100) * 100, 100).toFixed(0)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Security Badges */}
      <div className="security-badges">
        <div className="security-badge">
          <FiShield />
          <span>Secure Checkout</span>
        </div>
        <div className="security-badge">
          <FiCheckCircle />
          <span>Money Back Guarantee</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button 
        className="checkout-btn"
        onClick={handleCheckout}
        disabled={itemCount === 0 || loading || processing}
      >
        {processing || loading ? (
          <div className="checkout-spinner"></div>
        ) : (
          <>
            <span>Proceed to Checkout</span>
            <FiArrowRight className="arrow-icon" />
          </>
        )}
        <div className="checkout-shine"></div>
      </button>

      {/* Continue Shopping */}
      <button 
        className="continue-btn"
        onClick={() => router.push('/products')}
      >
        Continue Shopping
      </button>

      {/* Payment Methods */}
      <div className="payment-methods">
        <div className="payment-title">We Accept</div>
        <div className="payment-icons">
          <span className="payment-icon visa">VISA</span>
          <span className="payment-icon mastercard">MC</span>
          <span className="payment-icon amex">AMEX</span>
          <span className="payment-icon stripe">Stripe</span>
        </div>
      </div>
    </div>
  )
}
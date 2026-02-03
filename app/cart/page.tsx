'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCart, updateCartItem, removeFromCart, clearCart } from '@/lib/cart'
import CartItem from '@/components/CartItem'
import CartSummary from '@/components/CartSummary'
import { FiShoppingBag, FiRefreshCw, FiArrowLeft, FiAlertCircle } from 'react-icons/fi'
import './cart.css'

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const fetchCart = async () => {
    try {
      setError(null)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser === null) {
       
        return
      }

      setUser(authUser)
      const cartData = await getCart(authUser.id)
      setCart(cartData)
    } catch (err: any) {
      setError(err.message || 'Failed to load cart')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleUpdateItem = async (itemId: string, quantity: number) => {
    try {
      const success = await updateCartItem(itemId, quantity)
      if (success) {
        fetchCart()
      } else {
        throw new Error('Failed to update item')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      const success = await removeFromCart(itemId)
      if (success) {
        fetchCart()
      } else {
        throw new Error('Failed to remove item')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return
    
    try {
      if (user) {
        const success = await clearCart(user.id)
        if (success) {
          fetchCart()
        }
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchCart()
  }

  useEffect(() => {
    fetchCart()
  }, [])

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading Your Cart</h2>
          <p>Preparing your shopping experience...</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-content">
          <FiShoppingBag className="empty-icon" />
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven't added any items to your cart yet</p>
          <div className="empty-actions">
            <button onClick={() => router.push('/products')} className="browse-btn">
              <FiArrowLeft />
              <span>Browse Products</span>
            </button>
            <button onClick={handleRefresh} className="refresh-btn">
              <FiRefreshCw />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      {/* Cart Header */}
      <div className="cart-header">
        <div className="header-content">
          <h1 className="cart-title">
            <FiShoppingBag />
            Shopping Cart
            <span className="cart-count">({cart.item_count} items)</span>
          </h1>
          
          <div className="header-actions">
            <button onClick={handleRefresh} className="refresh-cart-btn" disabled={refreshing}>
              <FiRefreshCw className={refreshing ? 'spinning' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh Cart'}
            </button>
            
            <button onClick={handleClearCart} className="clear-cart-btn">
              Clear All
            </button>
          </div>
        </div>

        {error && (
          <div className="cart-error">
            <FiAlertCircle />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="dismiss-error">
              ×
            </button>
          </div>
        )}
      </div>

      {/* Cart Content */}
      <div className="cart-content">
        {/* Cart Items */}
        <div className="cart-items-container">
          <div className="items-header">
            <h3>Items in Cart</h3>
            <div className="items-subtotal">
              Subtotal: <span>${cart.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="cart-items-list">
            {cart.items.map((item: any, index: number) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdate={handleUpdateItem}
                onRemove={handleRemoveItem}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="cart-summary-container">
          <CartSummary
            subtotal={cart.total}
            itemCount={cart.item_count}
            loading={refreshing}
            onCheckout={() => router.push('/checkout')}
          />
        </div>
      </div>

      {/* Recommendations */}
      <div className="cart-recommendations">
        <h3>You Might Also Like</h3>
        <div className="recommendations-grid">
          {/* Add recommendation products here */}
          <div className="recommendation-placeholder">
            <div className="placeholder-image"></div>
            <div className="placeholder-info">
              <div className="placeholder-title"></div>
              <div className="placeholder-price"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
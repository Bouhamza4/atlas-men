'use client'
import { useState } from 'react'
import { FiTrash2, FiMinus, FiPlus, FiPackage, FiAlertCircle } from 'react-icons/fi'
import './CartItem.css'

interface CartItemProps {
  item: {
    id: string
    quantity: number
    product: {
      id: string
      name: string
      price: number
      image_url: string
      stock: number
      category?: string
    }
  }
  onUpdate: (itemId: string, quantity: number) => Promise<void>
  onRemove: (itemId: string) => Promise<void>
  index: number
}

export default function CartItem({ item, onUpdate, onRemove, index }: CartItemProps) {
  const [loading, setLoading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity === item.quantity) return
    
    setLoading(true)
    setError(null)
    
    try {
      if (newQuantity < 1) {
        await handleRemove()
        return
      }
      
      if (newQuantity > item.product.stock) {
        throw new Error(`Only ${item.product.stock} items available`)
      }
      
      await onUpdate(item.id, newQuantity)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    setRemoving(true)
    setError(null)
    
    try {
      await onRemove(item.id)
    } catch (err: any) {
      setError(err.message)
      setRemoving(false)
    }
  }

  const totalPrice = (item.product.price * item.quantity).toFixed(2)

  return (
    <div 
      className={`cart-item ${removing ? 'removing' : ''} ${loading ? 'loading' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Item Image */}
      <div className="item-image-container">
        <img 
          src={item.product.image_url} 
          alt={item.product.name}
          className="item-image"
          loading="lazy"
        />
        <div className="image-overlay"></div>
        
        {item.product.stock < 10 && item.product.stock > 0 && (
          <div className="stock-badge">
            <FiAlertCircle />
            <span>Only {item.product.stock} left</span>
          </div>
        )}
        
        {item.product.stock === 0 && (
          <div className="out-of-stock-badge">
            <span>Out of Stock</span>
          </div>
        )}
      </div>

      {/* Item Info */}
      <div className="item-info">
        <div className="item-header">
          <h3 className="item-name">{item.product.name}</h3>
          {item.product.category && (
            <span className="item-category">{item.product.category}</span>
          )}
        </div>
        
        <div className="item-price-info">
          <span className="unit-price">${item.product.price.toFixed(2)} each</span>
          <span className="total-price">${totalPrice}</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="item-error">
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}

        {/* Quantity Controls */}
        <div className="quantity-controls">
          <div className="quantity-selector">
            <button
              className="quantity-btn minus"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1 || loading || removing}
              aria-label="Decrease quantity"
            >
              <FiMinus />
            </button>
            
            <div className="quantity-display">
              <span className="quantity-number">{item.quantity}</span>
              {loading && <div className="quantity-spinner"></div>}
            </div>
            
            <button
              className="quantity-btn plus"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= item.product.stock || loading || removing}
              aria-label="Increase quantity"
            >
              <FiPlus />
            </button>
          </div>

          {/* Remove Button */}
          <button
            className="remove-btn"
            onClick={handleRemove}
            disabled={removing}
            aria-label="Remove item"
          >
            {removing ? (
              <div className="remove-spinner"></div>
            ) : (
              <>
                <FiTrash2 />
                <span>Remove</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="item-decoration">
        <div className="decoration-line"></div>
        <div className="decoration-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  )
}
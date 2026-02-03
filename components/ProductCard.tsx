'use client'
import Link from 'next/link'
import { useState } from 'react'
import { FiEye, FiHeart, FiShoppingCart } from 'react-icons/fi'
import './ProductCard.css'

interface Product {
  id: number
  name: string
  price: number
  image_url: string
  category?: string
  is_new?: boolean
  discount?: number
}

export default function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Implement quick view modal
    console.log('Quick view:', product.id)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Implement add to cart
    console.log('Add to cart:', product.id)
  }

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  return (
    <Link 
      href={`/products/${product.id}`}
      className={`product-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Badges */}
      {product.is_new && (
        <div className="badge new-badge">NEW</div>
      )}
      {product.discount && (
        <div className="badge discount-badge">-{product.discount}%</div>
      )}

      {/* Product Image Container */}
      <div className="product-image-container">
        <img 
          src={product.image_url} 
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        
        {/* Image Overlay */}
        <div className="image-overlay"></div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button 
            className="action-btn view-btn"
            onClick={handleQuickView}
            aria-label="Quick view"
          >
            <FiEye />
            <span className="action-tooltip">Quick View</span>
          </button>
          
          <button 
            className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleToggleLike}
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <FiHeart />
            <span className="action-tooltip">Wishlist</span>
          </button>
          
          <button 
            className="action-btn cart-btn"
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <FiShoppingCart />
            <span className="action-tooltip">Add to Cart</span>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="product-info">
        {product.category && (
          <div className="product-category">{product.category}</div>
        )}
        
        <h3 className="product-name">{product.name}</h3>
        
        <div className="product-price">
          {product.discount ? (
            <>
              <span className="current-price">
                ${(product.price * (1 - product.discount / 100)).toFixed(2)}
              </span>
              <span className="original-price">${product.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="current-price">${product.price.toFixed(2)}</span>
          )}
        </div>

        {/* Rating Stars */}
        <div className="product-rating">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`star ${i < 4 ? 'filled' : ''}`}>★</span>
          ))}
          <span className="rating-count">(24)</span>
        </div>

        {/* Hover Add to Cart */}
        <button 
          className="add-to-cart-btn"
          onClick={handleAddToCart}
        >
          <FiShoppingCart />
          <span>Add to Cart</span>
        </button>
      </div>
    </Link>
  )
}
'use client'
import { useState } from 'react'
import { FiShoppingCart, FiHeart, FiShare2, FiPackage, FiTruck, FiShield, FiStar, FiChevronRight } from 'react-icons/fi'
import './ProductInfo.css'

interface ProductInfoProps {
  name: string
  price: number
  originalPrice?: number
  description: string
  category: string
  sku: string
  brand: string
  rating: number
  reviewCount: number
  sizes?: string[]
  colors?: string[]
  stock: number
}

export default function ProductInfo({ 
  name, 
  price, 
  originalPrice,
  description, 
  category,
  sku,
  brand,
  rating,
  reviewCount,
  sizes = ['S', 'M', 'L', 'XL', 'XXL'],
  colors = ['#0f172a', '#c9a24d', '#64748b', '#ef4444'],
  stock 
}: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState<string>('M')
  const [selectedColor, setSelectedColor] = useState<string>('#0f172a')
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews'>('description')

  const handleAddToCart = () => {
    const cartItem = {
      name,
      price,
      size: selectedSize,
      color: selectedColor,
      quantity,
      image: 'product-image-url'
    }
    console.log('Added to cart:', cartItem)
    // Implement your cart logic here
  }

  const handleBuyNow = () => {
    handleAddToCart()
    // Redirect to checkout
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: name,
        text: description,
        url: window.location.href,
      })
    }
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`star ${i < Math.floor(rating) ? 'filled' : ''} ${i < rating && i >= Math.floor(rating) ? 'half' : ''}`}>
        ★
      </span>
    ))
  }

  return (
    <div className="product-info-container">
      {/* Product Header */}
      <div className="product-header">
        <div className="category-badge">{category}</div>
        <h1 className="product-title">{name}</h1>
        
        <div className="product-meta">
          <span className="sku">SKU: {sku}</span>
          <span className="brand">Brand: {brand}</span>
        </div>

        {/* Rating */}
        <div className="product-rating">
          <div className="stars">
            {renderStars(rating)}
            <span className="rating-value">{rating.toFixed(1)}</span>
          </div>
          <span className="review-count">({reviewCount} reviews)</span>
          <button className="write-review-btn">Write a Review</button>
        </div>
      </div>

      {/* Price Section */}
      <div className="price-section">
        <div className="price-display">
          <span className="current-price">${price.toFixed(2)}</span>
          {originalPrice && (
            <span className="original-price">${originalPrice.toFixed(2)}</span>
          )}
          {originalPrice && (
            <span className="discount-badge">
              Save ${(originalPrice - price).toFixed(2)}!
            </span>
          )}
        </div>
        
        {/* Stock Status */}
        <div className="stock-status">
          <div className={`stock-indicator ${stock > 10 ? 'in-stock' : stock > 0 ? 'low-stock' : 'out-of-stock'}`}>
            <div className="indicator-dot"></div>
            {stock > 10 ? 'In Stock' : stock > 0 ? `Only ${stock} left` : 'Out of Stock'}
          </div>
        </div>
      </div>

      {/* Color Selection */}
      <div className="selection-section color-selection">
        <h3>Color: <span className="selected-option">{selectedColor}</span></h3>
        <div className="color-options">
          {colors.map((color) => (
            <button
              key={color}
              className={`color-option ${selectedColor === color ? 'selected' : ''}`}
              onClick={() => setSelectedColor(color)}
              aria-label={`Select color ${color}`}
              style={{ backgroundColor: color }}
            >
              {selectedColor === color && <span className="check-mark">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div className="selection-section size-selection">
        <h3>Size: <span className="selected-option">{selectedSize}</span></h3>
        <div className="size-options">
          {sizes.map((size) => (
            <button
              key={size}
              className={`size-option ${selectedSize === size ? 'selected' : ''} ${size === 'XXL' ? 'size-xxl' : ''}`}
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
        <a href="#" className="size-guide">
          <FiChevronRight />
          Size Guide
        </a>
      </div>

      {/* Quantity Selector */}
      <div className="quantity-section">
        <h3>Quantity</h3>
        <div className="quantity-selector">
          <button 
            className="quantity-btn minus"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            −
          </button>
          <input
            type="number"
            min="1"
            max={stock}
            value={quantity}
            onChange={(e) => {
              const value = parseInt(e.target.value)
              if (!isNaN(value) && value >= 1 && value <= stock) {
                setQuantity(value)
              }
            }}
            className="quantity-input"
          />
          <button 
            className="quantity-btn plus"
            onClick={() => setQuantity(Math.min(stock, quantity + 1))}
            disabled={quantity >= stock}
          >
            +
          </button>
          <span className="max-quantity">Max: {stock}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={stock === 0}
        >
          <FiShoppingCart />
          <span>Add to Cart</span>
        </button>
        
        <button 
          className="buy-now-btn"
          onClick={handleBuyNow}
          disabled={stock === 0}
        >
          <span>Buy Now</span>
        </button>
        
        <div className="secondary-actions">
          <button 
            className={`action-icon like-btn ${isLiked ? 'liked' : ''}`}
            onClick={() => setIsLiked(!isLiked)}
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <FiHeart />
          </button>
          
          <button 
            className="action-icon share-btn"
            onClick={handleShare}
            aria-label="Share product"
          >
            <FiShare2 />
          </button>
        </div>
      </div>

      {/* Product Features */}
      <div className="product-features">
        <div className="feature">
          <FiPackage className="feature-icon" />
          <div>
            <strong>Free Shipping</strong>
            <p>On orders over $100</p>
          </div>
        </div>
        
        <div className="feature">
          <FiTruck className="feature-icon" />
          <div>
            <strong>Fast Delivery</strong>
            <p>2-3 business days</p>
          </div>
        </div>
        
        <div className="feature">
          <FiShield className="feature-icon" />
          <div>
            <strong>2-Year Warranty</strong>
            <p>Quality guaranteed</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="product-tabs">
        <div className="tab-headers">
          <button 
            className={`tab-header ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button 
            className={`tab-header ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button 
            className={`tab-header ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({reviewCount})
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="description-content">
              <p>{description}</p>
              <ul className="description-features">
                <li>Premium quality materials</li>
                <li>Handcrafted with attention to detail</li>
                <li>Designed for comfort and style</li>
                <li>Perfect for formal and casual occasions</li>
              </ul>
            </div>
          )}
          
          {activeTab === 'details' && (
            <div className="details-content">
              <table className="details-table">
                <tbody>
                  <tr>
                    <td>Material</td>
                    <td>Premium Cotton Blend</td>
                  </tr>
                  <tr>
                    <td>Care Instructions</td>
                    <td>Machine wash cold, gentle cycle</td>
                  </tr>
                  <tr>
                    <td>Origin</td>
                    <td>Made in Italy</td>
                  </tr>
                  <tr>
                    <td>Fit</td>
                    <td>Slim Fit</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="reviews-content">
              <div className="average-rating">
                <strong>{rating.toFixed(1)}</strong>
                <div className="review-stars">{renderStars(rating)}</div>
                <p>Based on {reviewCount} reviews</p>
              </div>
              <button className="write-review-btn">Write a Review</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
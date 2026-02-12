// app/wishlist/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiHeart, 
  FiShoppingCart, 
  FiTrash2, 
  FiX, 
  FiAlertCircle,
  FiArrowRight,
  FiShare2,
  FiTag,
  FiClock,
  FiEye,
  FiCheck
} from 'react-icons/fi';
import { RiTShirtLine, RiCouponLine } from 'react-icons/ri';
import './Wishlist.css';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('date');
  const [filter, setFilter] = useState('all');

  // Mock data - Replace with actual API call
  const mockWishlist = [
    {
      id: 1,
      name: 'Premium Cotton T-Shirt',
      description: 'Soft, breathable cotton with modern fit',
      price: 29.99,
      originalPrice: 39.99,
      discount: 25,
      image: '/api/placeholder/400/500',
      inStock: true,
      stock: 15,
      category: 'T-Shirts',
      brand: 'Atlas',
      dateAdded: '2024-01-15',
      rating: 4.5,
      reviewCount: 128,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White', 'Navy']
    },
    {
      id: 2,
      name: 'Designer Slim Fit Jeans',
      description: 'Premium denim with stretch comfort',
      price: 89.99,
      originalPrice: 119.99,
      discount: 25,
      image: '/api/placeholder/400/500',
      inStock: false,
      stock: 0,
      category: 'Jeans',
      brand: 'DenimCo',
      dateAdded: '2024-01-12',
      rating: 4.8,
      reviewCount: 256,
      sizes: ['30', '32', '34', '36'],
      colors: ['Blue', 'Black', 'Grey']
    },
    {
      id: 3,
      name: 'Leather Biker Jacket',
      description: 'Genuine leather with premium finish',
      price: 199.99,
      originalPrice: 299.99,
      discount: 33,
      image: '/api/placeholder/400/500',
      inStock: true,
      stock: 3,
      category: 'Jackets',
      brand: 'Rider',
      dateAdded: '2024-01-10',
      rating: 4.9,
      reviewCount: 89,
      sizes: ['S', 'M', 'L'],
      colors: ['Black', 'Brown']
    },
    {
      id: 4,
      name: 'Classic Oxford Shirt',
      description: 'Formal cotton shirt for all occasions',
      price: 49.99,
      originalPrice: 59.99,
      discount: 17,
      image: '/api/placeholder/400/500',
      inStock: true,
      stock: 25,
      category: 'Shirts',
      brand: 'FormalWear',
      dateAdded: '2024-01-08',
      rating: 4.3,
      reviewCount: 312,
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['White', 'Blue', 'Pink']
    },
    {
      id: 5,
      name: 'Sports Performance Shorts',
      description: 'Lightweight and quick-dry material',
      price: 34.99,
      originalPrice: 44.99,
      discount: 22,
      image: '/api/placeholder/400/500',
      inStock: true,
      stock: 42,
      category: 'Shorts',
      brand: 'ActiveGear',
      dateAdded: '2024-01-05',
      rating: 4.6,
      reviewCount: 156,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Navy', 'Grey', 'Red']
    },
    {
      id: 6,
      name: 'Wool Blend Sweater',
      description: 'Winter comfort with stylish design',
      price: 79.99,
      originalPrice: 99.99,
      discount: 20,
      image: '/api/placeholder/400/500',
      inStock: false,
      stock: 0,
      category: 'Sweaters',
      brand: 'WoolCo',
      dateAdded: '2024-01-03',
      rating: 4.4,
      reviewCount: 98,
      sizes: ['S', 'M', 'L'],
      colors: ['Grey', 'Navy', 'Cream']
    }
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      // Simulate API call delay
      setTimeout(() => {
        setWishlist(mockWishlist);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setLoading(false);
    }
  };

  const toggleSelectItem = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === wishlist.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlist.map(item => item.id));
    }
  };

  const removeFromWishlist = (id: number) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
  };

  const removeSelectedItems = () => {
    setWishlist(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };

  const addToCart = (item: any) => {
    // Add to cart logic here
    alert(`Added ${item.name} to cart!`);
  };

  const addSelectedToCart = () => {
    const selectedItemsData = wishlist.filter(item => selectedItems.includes(item.id) && item.inStock);
    if (selectedItemsData.length > 0) {
      alert(`Added ${selectedItemsData.length} items to cart!`);
    } else {
      alert('No in-stock items selected');
    }
  };

  const shareWishlist = () => {
    const shareText = `Check out my wishlist from Atlas Store!\n\n${wishlist.map(item => `• ${item.name} - $${item.price}`).join('\n')}`;
    navigator.clipboard.writeText(shareText);
    alert('Wishlist copied to clipboard!');
  };

  const filteredWishlist = wishlist.filter(item => {
    if (filter === 'in-stock') return item.inStock;
    if (filter === 'out-of-stock') return !item.inStock;
    if (filter === 'on-sale') return item.discount > 0;
    return true;
  });

  const sortedWishlist = [...filteredWishlist].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'date') return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  const totalValue = wishlist.reduce((sum, item) => sum + item.price, 0);
  const totalDiscount = wishlist.reduce((sum, item) => 
    sum + (item.originalPrice - item.price), 0
  );

  if (loading) {
    return (
      <div className="wishlist-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading Your Wishlist</h2>
          <p>Fetching your saved items...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="wishlist-auth-required">
        <div className="auth-container">
          <FiHeart className="auth-icon" />
          <h2>Sign In to View Wishlist</h2>
          <p>Save items you love and access them anytime</p>
          <div className="auth-actions">
            <Link href="/auth/login" className="auth-btn primary">
              Sign In
            </Link>
            <Link href="/auth/register" className="auth-btn secondary">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-empty">
        <div className="empty-container">
          <div className="empty-icon">
            <FiHeart />
          </div>
          <h2>Your Wishlist is Empty</h2>
          <p>Save items you love for later by clicking the heart icon</p>
          <div className="empty-actions">
            <Link href="/products" className="empty-btn primary">
              <RiTShirtLine />
              <span>Browse Products</span>
            </Link>
            <Link href="/collections" className="empty-btn secondary">
              <RiCouponLine />
              <span>View Collections</span>
            </Link>
          </div>
          <div className="empty-features">
            <div className="feature">
              <FiCheck />
              <span>Save items for later</span>
            </div>
            <div className="feature">
              <FiCheck />
              <span>Get price drop alerts</span>
            </div>
            <div className="feature">
              <FiCheck />
              <span>Quick add to cart</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      {/* Hero Section */}
      <div className="wishlist-hero">
        <div className="hero-content">
          <div className="hero-icon">
            <FiHeart />
          </div>
          <h1 className="hero-title">My Wishlist</h1>
          <p className="hero-subtitle">
            {wishlist.length} items • Total value: ${totalValue.toFixed(2)}
            {totalDiscount > 0 && (
              <span className="discount-badge">
                Save ${totalDiscount.toFixed(2)}!
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="wishlist-container">
        {/* Sidebar */}
        <div className="wishlist-sidebar">
          <div className="sidebar-stats">
            <div className="stat-item">
              <div className="stat-label">Total Items</div>
              <div className="stat-value">{wishlist.length}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">In Stock</div>
              <div className="stat-value">
                {wishlist.filter(item => item.inStock).length}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">On Sale</div>
              <div className="stat-value">
                {wishlist.filter(item => item.discount > 0).length}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Total Value</div>
              <div className="stat-value">${totalValue.toFixed(2)}</div>
            </div>
          </div>

          <div className="sidebar-actions">
            <button 
              className="sidebar-action-btn primary"
              onClick={addSelectedToCart}
              disabled={selectedItems.length === 0}
            >
              <FiShoppingCart />
              <span>Add Selected to Cart</span>
            </button>
            <button 
              className="sidebar-action-btn secondary"
              onClick={shareWishlist}
            >
              <FiShare2 />
              <span>Share Wishlist</span>
            </button>
            <button 
              className="sidebar-action-btn danger"
              onClick={removeSelectedItems}
              disabled={selectedItems.length === 0}
            >
              <FiTrash2 />
              <span>Remove Selected</span>
            </button>
          </div>

          <div className="sidebar-filters">
            <h3 className="filter-title">Filter By</h3>
            <div className="filter-group">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Items
              </button>
              <button 
                className={`filter-btn ${filter === 'in-stock' ? 'active' : ''}`}
                onClick={() => setFilter('in-stock')}
              >
                In Stock
              </button>
              <button 
                className={`filter-btn ${filter === 'out-of-stock' ? 'active' : ''}`}
                onClick={() => setFilter('out-of-stock')}
              >
                Out of Stock
              </button>
              <button 
                className={`filter-btn ${filter === 'on-sale' ? 'active' : ''}`}
                onClick={() => setFilter('on-sale')}
              >
                On Sale
              </button>
            </div>
          </div>

          <div className="sidebar-categories">
            <h3 className="categories-title">Categories</h3>
            <div className="categories-list">
              {[...new Set(wishlist.map(item => item.category))].map(category => (
                <button key={category} className="category-btn">
                  <span>{category}</span>
                  <span className="category-count">
                    ({wishlist.filter(item => item.category === category).length})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="wishlist-main">
          {/* Toolbar */}
          <div className="wishlist-toolbar">
            <div className="toolbar-left">
              <div className="selection-info">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.length === wishlist.length && wishlist.length > 0}
                    onChange={selectAllItems}
                  />
                  <span className="checkmark"></span>
                </label>
                <span className="selection-text">
                  {selectedItems.length} of {wishlist.length} selected
                </span>
              </div>
            </div>

            <div className="toolbar-right">
              <div className="sort-container">
                <label htmlFor="sort" className="sort-label">Sort by:</label>
                <select 
                  id="sort" 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="date">Date Added</option>
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Wishlist Grid */}
          <div className="wishlist-grid">
            {sortedWishlist.map((item) => (
              <div 
                key={item.id} 
                className={`wishlist-card ${!item.inStock ? 'out-of-stock' : ''}`}
              >
                {/* Selection Checkbox */}
                <div className="card-selection">
                  <label className="checkbox-container">
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelectItem(item.id)}
                    />
                    <span className="checkmark"></span>
                  </label>
                </div>

                {/* Product Image */}
                <div className="card-image">
                  <div className="image-container">
                    {/* Replace with actual Image component */}
                    <div className="image-placeholder">
                      <RiTShirtLine />
                    </div>
                    {item.discount > 0 && (
                      <div className="discount-badge">
                        -{item.discount}%
                      </div>
                    )}
                    {!item.inStock && (
                      <div className="stock-badge">
                        Out of Stock
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="card-info">
                  <div className="card-header">
                    <div className="brand-category">
                      <span className="brand">{item.brand}</span>
                      <span className="category">{item.category}</span>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      <FiX />
                    </button>
                  </div>

                  <h3 className="product-name">{item.name}</h3>
                  <p className="product-description">{item.description}</p>

                  {/* Rating */}
                  <div className="product-rating">
                    <div className="stars">
                      {'★'.repeat(Math.floor(item.rating))}
                      {'☆'.repeat(5 - Math.floor(item.rating))}
                    </div>
                    <span className="rating-text">
                      {item.rating} ({item.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="product-price">
                    <span className="current-price">${item.price.toFixed(2)}</span>
                    {item.originalPrice > item.price && (
                      <span className="original-price">
                        ${item.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Stock Info */}
                  <div className="product-stock">
                    <FiClock />
                    {item.inStock ? (
                      <span className="in-stock">
                        {item.stock > 10 ? 'In Stock' : `Only ${item.stock} left!`}
                      </span>
                    ) : (
                      <span className="out-of-stock-text">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Options */}
                  <div className="product-options">
                    <div className="size-options">
                      <span className="option-label">Size:</span>
                      <div className="size-buttons">
                        {item.sizes.map((size: string) => (
                          <button key={size} className="size-btn">
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="color-options">
                      <span className="option-label">Color:</span>
                      <div className="color-buttons">
                        {item.colors.map((color: string) => (
                          <button 
                            key={color} 
                            className="color-btn"
                            style={{ backgroundColor: color.toLowerCase() }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="card-actions">
                    <button 
                      className={`action-btn cart-btn ${!item.inStock ? 'disabled' : ''}`}
                      onClick={() => addToCart(item)}
                      disabled={!item.inStock}
                    >
                      <FiShoppingCart />
                      {item.inStock ? 'Add to Cart' : 'Notify When Available'}
                    </button>
                    <Link href={`/products/${item.id}`} className="action-btn view-btn">
                      <FiEye />
                      <span>View Details</span>
                    </Link>
                  </div>

                  {/* Added Date */}
                  <div className="added-date">
                    <FiClock />
                    <span>Added {new Date(item.dateAdded).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          {wishlist.length > 0 && (
            <div className="recommendations-section">
              <div className="section-header">
                <h2>You Might Also Like</h2>
                <Link href="/products" className="view-all">
                  View All <FiArrowRight />
                </Link>
              </div>
              <div className="recommendations-grid">
                {/* Add recommendation items here */}
                <div className="recommendation-item">
                  <div className="rec-image">
                    <RiTShirtLine />
                  </div>
                  <h3>Casual Polo Shirt</h3>
                  <div className="rec-price">$34.99</div>
                </div>
                <div className="recommendation-item">
                  <div className="rec-image">
                    <RiTShirtLine />
                  </div>
                  <h3>Chino Pants</h3>
                  <div className="rec-price">$59.99</div>
                </div>
                <div className="recommendation-item">
                  <div className="rec-image">
                    <RiTShirtLine />
                  </div>
                  <h3>Sports Hoodie</h3>
                  <div className="rec-price">$44.99</div>
                </div>
              </div>
            </div>
          )}

          {/* Empty Filter State */}
          {sortedWishlist.length === 0 && (
            <div className="empty-filter">
              <FiAlertCircle />
              <h3>No items match your filters</h3>
              <p>Try changing your filter settings</p>
              <button 
                className="reset-filters"
                onClick={() => setFilter('all')}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
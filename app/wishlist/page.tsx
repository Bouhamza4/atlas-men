'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { addToCart } from '@/lib/cart';
import { getWishlist, removeFromWishlist, WishlistItem } from '@/lib/wishlist';
import { FiHeart, FiShoppingCart, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import './Wishlist.css';

export default function WishlistPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const fetchWishlist = async (uid: string) => {
    setLoading(true);
    setError(null);
    try {
      const items = await getWishlist(uid);
      setWishlist(items);
    } catch (err: any) {
      setError(err?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);
      await fetchWishlist(user.id);
    };

    void bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const totalValue = useMemo(
    () => wishlist.reduce((sum, item) => sum + Number(item.product.price || 0), 0),
    [wishlist]
  );

  const handleRemove = async (productId: string) => {
    if (!userId) return;
    setBusy(productId);
    const ok = await removeFromWishlist(userId, productId);
    if (!ok) {
      setError('Failed to remove item from wishlist');
      setBusy(null);
      return;
    }
    setWishlist((prev) => prev.filter((item) => item.product_id !== productId));
    setBusy(null);
  };

  const handleAddToCart = async (productId: string) => {
    if (!userId) return;
    setBusy(productId);
    const ok = await addToCart(userId, productId, 1);
    if (!ok) {
      setError('Failed to add item to cart');
      setBusy(null);
      return;
    }
    setBusy(null);
    alert('Added to cart');
  };

  if (loading) {
    return (
      <div className="wishlist-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading Your Wishlist</h2>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="wishlist-auth-required">
        <div className="auth-container">
          <FiHeart className="auth-icon" />
          <h2>Sign In to View Wishlist</h2>
          <p>Save items and access them anytime.</p>
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
          <p>Go to products and add items with the heart button.</p>
          <div className="empty-actions">
            <Link href="/products" className="empty-btn primary">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-hero">
        <div className="hero-content">
          <div className="hero-icon">
            <FiHeart />
          </div>
          <h1 className="hero-title">My Wishlist</h1>
          <p className="hero-subtitle">
            {wishlist.length} items | Total value: ${totalValue.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="wishlist-container">
        <div className="wishlist-main" style={{ width: '100%' }}>
          {error && (
            <div className="empty-filter" style={{ marginBottom: 16 }}>
              <FiAlertCircle />
              <p>{error}</p>
            </div>
          )}

          <div className="wishlist-grid">
            {wishlist.map((item) => (
              <div key={item.id} className="wishlist-card">
                <div className="card-image">
                  <div className="image-container">
                    <img src={item.product.image_url || ''} alt={item.product.name} />
                  </div>
                </div>

                <div className="card-info">
                  <h3 className="product-name">{item.product.name}</h3>
                  <p className="product-description">{item.product.description || 'No description'}</p>

                  <div className="product-price">
                    <span className="current-price">${Number(item.product.price).toFixed(2)}</span>
                  </div>

                  <div className="product-stock">
                    {item.product.stock > 0 ? (
                      <span className="in-stock">In Stock ({item.product.stock})</span>
                    ) : (
                      <span className="out-of-stock-text">Out of Stock</span>
                    )}
                  </div>

                  <div className="card-actions">
                    <button
                      className={`action-btn cart-btn ${item.product.stock <= 0 ? 'disabled' : ''}`}
                      onClick={() => handleAddToCart(item.product_id)}
                      disabled={item.product.stock <= 0 || busy === item.product_id}
                    >
                      <FiShoppingCart />
                      {busy === item.product_id ? 'Please wait...' : 'Add to Cart'}
                    </button>

                    <button
                      className="action-btn view-btn"
                      onClick={() => router.push(`/products/${item.product_id}`)}
                    >
                      View Details
                    </button>

                    <button
                      className="remove-btn"
                      onClick={() => handleRemove(item.product_id)}
                      disabled={busy === item.product_id}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

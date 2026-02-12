// app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiEdit2, 
  FiSave, 
  FiX, 
  FiPackage, 
  FiHeart, 
  FiSettings,
  FiShield,
  FiCreditCard,
  FiLogOut,
  FiCalendar,
  FiStar,
  FiCheck
} from 'react-icons/fi';
import { RiTShirtLine } from 'react-icons/ri';
import './Profile.css';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);

  // User form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Morocco',
    postalCode: ''
  });

  // Fetch user data
  useEffect(() => {
    fetchUserData();
    fetchOrders();
    fetchWishlist();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch additional profile data from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFormData({
            fullName: profile.full_name || '',
            email: user.email || '',
            phone: profile.phone || '',
            address: profile.address || '',
            city: profile.city || '',
            country: profile.country || 'Morocco',
            postalCode: profile.postal_code || ''
          });
        } else {
          // If no profile exists, create one
          setFormData({
            fullName: user.user_metadata?.full_name || '',
            email: user.email || '',
            phone: '',
            address: '',
            city: '',
            country: 'Morocco',
            postalCode: ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      // Mock data - Replace with actual API call
      const mockOrders = [
        {
          id: 'ORD-001',
          date: '2024-01-15',
          status: 'delivered',
          total: 129.99,
          items: 3,
          trackingNumber: 'TRK789456123'
        },
        {
          id: 'ORD-002',
          date: '2024-01-10',
          status: 'shipped',
          total: 89.99,
          items: 2,
          trackingNumber: 'TRK123456789'
        },
        {
          id: 'ORD-003',
          date: '2024-01-05',
          status: 'processing',
          total: 199.99,
          items: 1,
          trackingNumber: null
        }
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      // Mock data - Replace with actual API call
      const mockWishlist = [
        {
          id: 1,
          name: 'Premium Cotton T-Shirt',
          price: 29.99,
          image: '/api/placeholder/400/400',
          inStock: true
        },
        {
          id: 2,
          name: 'Designer Jeans',
          price: 89.99,
          image: '/api/placeholder/400/400',
          inStock: false
        },
        {
          id: 3,
          name: 'Leather Jacket',
          price: 199.99,
          image: '/api/placeholder/400/400',
          inStock: true
        }
      ];
      setWishlist(mockWishlist);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      // Update profile in supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          postal_code: formData.postalCode,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: formData.fullName }
      });

      if (updateError) throw updateError;

      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'status-delivered';
      case 'shipped': return 'status-shipped';
      case 'processing': return 'status-processing';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-required">
        <div className="auth-message">
          <RiTShirtLine className="auth-icon" />
          <h2>Authentication Required</h2>
          <p>Please sign in to view your profile</p>
          <div className="auth-actions">
            <a href="/auth/login" className="btn-primary">Sign In</a>
            <a href="/auth/register" className="btn-secondary">Create Account</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-hero">
          <div className="profile-avatar">
            <div className="avatar-initials">
              {formData.fullName 
                ? formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
                : user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="online-status"></div>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">
              {formData.fullName || user.email?.split('@')[0]}
            </h1>
            <p className="profile-email">{user.email}</p>
            <div className="profile-stats">
              <div className="stat-item">
                <FiPackage />
                <span>{orders.length} Orders</span>
              </div>
              <div className="stat-item">
                <FiHeart />
                <span>{wishlist.length} Wishlist</span>
              </div>
              <div className="stat-item">
                <FiCalendar />
                <span>Member since {new Date(user.created_at).getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-container">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <nav className="sidebar-nav">
            <button 
              className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FiUser />
              <span>Profile Information</span>
            </button>

            <button 
              className={`sidebar-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <FiPackage />
              <span>My Orders</span>
              {orders.length > 0 && (
                <span className="sidebar-badge">{orders.length}</span>
              )}
            </button>

            <button 
              className={`sidebar-item ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              <FiHeart />
              <span>Wishlist</span>
              {wishlist.length > 0 && (
                <span className="sidebar-badge">{wishlist.length}</span>
              )}
            </button>

            <button 
              className={`sidebar-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <FiShield />
              <span>Security</span>
            </button>

            <button 
              className={`sidebar-item ${activeTab === 'payment' ? 'active' : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              <FiCreditCard />
              <span>Payment Methods</span>
            </button>

            <button 
              className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <FiSettings />
              <span>Settings</span>
            </button>

            <div className="sidebar-divider"></div>

            <button 
              className="sidebar-item logout"
              onClick={handleLogout}
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Personal Information</h2>
                <button 
                  className={`edit-btn ${isEditing ? 'editing' : ''}`}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <FiX />
                      <span>Cancel</span>
                    </>
                  ) : (
                    <>
                      <FiEdit2 />
                      <span>Edit Profile</span>
                    </>
                  )}
                </button>
              </div>

              <div className="profile-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="fullName">
                      <FiUser />
                      <span>Full Name</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      <FiMail />
                      <span>Email Address</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="disabled"
                    />
                    <span className="email-note">Email cannot be changed</span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      <FiPhone />
                      <span>Phone Number</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={!isEditing}
                      placeholder="+212 6 XX XX XX XX"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="address">
                      <FiMapPin />
                      <span>Address</span>
                    </label>
                    <input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Street address"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      disabled={!isEditing}
                      placeholder="City"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      disabled={!isEditing}
                    >
                      <option value="Morocco">Morocco</option>
                      <option value="Algeria">Algeria</option>
                      <option value="Tunisia">Tunisia</option>
                      <option value="Egypt">Egypt</option>
                      <option value="France">France</option>
                      <option value="Spain">Spain</option>
                      <option value="USA">United States</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="postalCode">Postal Code</label>
                    <input
                      id="postalCode"
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                      disabled={!isEditing}
                      placeholder="XXXXX"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="form-actions">
                    <button className="save-btn" onClick={handleSaveProfile}>
                      <FiSave />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="orders-section">
              <div className="section-header">
                <h2>Order History</h2>
                <div className="orders-stats">
                  <span className="stat">{orders.length} total orders</span>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="empty-state">
                  <FiPackage className="empty-icon" />
                  <h3>No Orders Yet</h3>
                  <p>Start shopping to see your orders here</p>
                  <a href="/products" className="btn-primary">Browse Products</a>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div className="order-info">
                          <h3 className="order-id">{order.id}</h3>
                          <span className="order-date">{formatDate(order.date)}</span>
                        </div>
                        <div className={`order-status ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                      </div>

                      <div className="order-details">
                        <div className="detail-item">
                          <span>Items</span>
                          <strong>{order.items} product(s)</strong>
                        </div>
                        <div className="detail-item">
                          <span>Total Amount</span>
                          <strong className="order-total">${order.total.toFixed(2)}</strong>
                        </div>
                        <div className="detail-item">
                          <span>Tracking</span>
                          <span className="tracking-number">
                            {order.trackingNumber || 'Not available'}
                          </span>
                        </div>
                      </div>

                      <div className="order-actions">
                        <button className="action-btn view-btn">View Details</button>
                        <button className="action-btn track-btn">Track Order</button>
                        {order.status === 'delivered' && (
                          <button className="action-btn review-btn">
                            <FiStar />
                            <span>Leave Review</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="wishlist-section">
              <div className="section-header">
                <h2>My Wishlist</h2>
                <button className="clear-wishlist">
                  Clear All
                </button>
              </div>

              {wishlist.length === 0 ? (
                <div className="empty-state">
                  <FiHeart className="empty-icon" />
                  <h3>Your Wishlist is Empty</h3>
                  <p>Save items you love for later</p>
                  <a href="/products" className="btn-primary">Discover Products</a>
                </div>
              ) : (
                <div className="wishlist-grid">
                  {wishlist.map((item) => (
                    <div key={item.id} className="wishlist-item">
                      <div className="item-image">
                        <div className="image-placeholder"></div>
                        {!item.inStock && (
                          <span className="out-of-stock">Out of Stock</span>
                        )}
                        <button className="remove-btn">
                          <FiX />
                        </button>
                      </div>
                      
                      <div className="item-info">
                        <h3 className="item-name">{item.name}</h3>
                        <div className="item-price">${item.price.toFixed(2)}</div>
                        
                        <div className="item-actions">
                          <button 
                            className={`add-to-cart ${!item.inStock ? 'disabled' : ''}`}
                            disabled={!item.inStock}
                          >
                            {item.inStock ? 'Add to Cart' : 'Notify Me'}
                          </button>
                          <button className="move-to-cart">
                            Move to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="security-section">
              <div className="section-header">
                <h2>Security Settings</h2>
              </div>

              <div className="security-cards">
                <div className="security-card">
                  <div className="security-icon">
                    <FiShield />
                  </div>
                  <div className="security-content">
                    <h3>Password</h3>
                    <p>Last changed 30 days ago</p>
                  </div>
                  <button className="security-action">Change Password</button>
                </div>

                <div className="security-card">
                  <div className="security-icon">
                    <FiCheck />
                  </div>
                  <div className="security-content">
                    <h3>Two-Factor Authentication</h3>
                    <p>Add an extra layer of security</p>
                  </div>
                  <button className="security-action enable">Enable 2FA</button>
                </div>

                <div className="security-card">
                  <div className="security-icon">
                    <FiUser />
                  </div>
                  <div className="security-content">
                    <h3>Active Sessions</h3>
                    <p>2 devices currently active</p>
                  </div>
                  <button className="security-action">Manage Sessions</button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="payment-section">
              <div className="section-header">
                <h2>Payment Methods</h2>
                <button className="add-payment">
                  Add New Card
                </button>
              </div>

              <div className="payment-methods">
                <div className="payment-card">
                  <div className="card-header">
                    <div className="card-type">VISA</div>
                    <div className="card-default">Default</div>
                  </div>
                  <div className="card-number">•••• •••• •••• 4242</div>
                  <div className="card-info">
                    <span>Expires 12/25</span>
                    <button className="card-action">Edit</button>
                  </div>
                </div>

                <div className="payment-card">
                  <div className="card-header">
                    <div className="card-type">MasterCard</div>
                  </div>
                  <div className="card-number">•••• •••• •••• 8888</div>
                  <div className="card-info">
                    <span>Expires 08/24</span>
                    <button className="card-action remove">Remove</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Account Settings</h2>
              </div>

              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Email Notifications</h3>
                    <p>Receive updates about your orders and promotions</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>SMS Notifications</h3>
                    <p>Receive order updates via SMS</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Newsletter</h3>
                    <p>Get fashion tips and exclusive offers</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Language</h3>
                    <p>Choose your preferred language</p>
                  </div>
                  <select className="language-select">
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Currency</h3>
                    <p>Choose your preferred currency</p>
                  </div>
                  <select className="currency-select">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="MAD">MAD (MAD)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { FiUser, FiShoppingCart, FiMenu, FiX, FiChevronDown, FiSearch, FiLogOut, FiHeart, FiPackage } from 'react-icons/fi'
import { RiTShirtLine } from 'react-icons/ri'
import './Header.css'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [allowTransitions, setAllowTransitions] = useState(false)
  const [cartCount, setCartCount] = useState(3)
  const [wishlistCount, setWishlistCount] = useState(2)
  const profileRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  // السماح بالانتقالات بعد التحميل الكامل
  useEffect(() => {
    const timer = setTimeout(() => {
      setAllowTransitions(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // حفظ حالة القائمة في localStorage
  useEffect(() => {
    localStorage.setItem('menuState', JSON.stringify({
      isMenuOpen,
      scrolled
    }))
  }, [isMenuOpen, scrolled])

  // Check session on mount
  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Handle scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    // Handle responsive
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) setIsMenuOpen(false)
    }

    // Handle click outside profile dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    document.addEventListener('mousedown', handleClickOutside)

    handleResize() // Initial check

    return () => {
      listener?.subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsProfileDropdownOpen(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
    }
  }

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'New Arrivals', href: '/products?filter=new' },
    { label: 'Best Sellers', href: '/products?filter=bestsellers' },
    { label: 'Sale', href: '/products?filter=sale', highlight: true },
    { label: 'Collections', href: '/collections' },
  ]
  // components/Header.tsx - أضف هذا الـ useEffect
const [allowAnimations, setAllowAnimations] = useState(false)

// السماح بالـ Animations بعد التحميل الكامل
useEffect(() => {
  const timer = setTimeout(() => {
    setAllowAnimations(true)
  }, 100)
  return () => clearTimeout(timer)
}, [])


  return (
    <div ref={headerRef} className="stable-css">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container">
          <span>✨ Free shipping on orders over $100</span>
          <div className="top-bar-links">
            <Link href="/contact">Contact Us</Link>
            <Link href="/help">Help Center</Link>
            <Link href="/track-order">Track Order</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`main-header ${scrolled ? 'scrolled' : ''} ${isMenuOpen ? 'menu-open' : ''} ${allowTransitions ? 'allow-transitions' : ''}`}>
        <div className="header-container">
          {/* Logo */}
          <div className="logo-container">
            <Link href="/" className="logo">
              <RiTShirtLine className="logo-icon" />
              <div className="logo-text">
                <span className="logo-main">ATLAS</span>
                <span className="logo-sub">GENTLEMAN</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
            <ul className="nav-menu">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <Link 
                    href={item.href} 
                    className={`nav-link ${item.highlight ? 'highlight' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                    {item.highlight && <span className="highlight-badge">SALE</span>}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Search Bar for Mobile */}
            {isMobile && (
              <form onSubmit={handleSearch} className="mobile-search">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-btn">
                  <FiSearch />
                </button>
              </form>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="header-actions">
            {/* Search (Desktop) */}
            {!isMobile && (
              <form onSubmit={handleSearch} className="search-container">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-btn">
                  <FiSearch />
                </button>
              </form>
            )}

            {/* Wishlist */}
            <Link href="/wishlist" className="action-btn" title="Wishlist">
              <FiHeart />
              {wishlistCount > 0 && (
                <span className="action-badge">{wishlistCount}</span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="action-btn cart-btn" title="Cart">
              <FiShoppingCart />
              {cartCount > 0 && (
                <span className="action-badge">{cartCount}</span>
              )}
            </Link>

            {/* Profile/Auth */}
            <div className="profile-container" ref={profileRef}>
              {user ? (
                <>
                  <button
                    className="profile-btn"
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  >
                    <FiUser />
                    <span className="profile-name">
                      {user.email?.split('@')[0]}
                    </span>
                    <FiChevronDown className={`chevron ${isProfileDropdownOpen ? 'open' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileDropdownOpen && (
                    <div className="profile-dropdown">
                      <div className="dropdown-header">
                        <div className="user-avatar">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                          <strong>{user.email}</strong>
                          <span>Welcome back!</span>
                        </div>
                      </div>
                      
                      <div className="dropdown-divider"></div>
                      
                      <Link 
                        href="/profile" 
                        className="dropdown-item"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <FiUser />
                        <span>My Profile</span>
                      </Link>
                      
                      <Link 
                        href="/orders" 
                        className="dropdown-item"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <FiPackage />
                        <span>My Orders</span>
                      </Link>
                      
                      <Link 
                        href="/wishlist" 
                        className="dropdown-item"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <FiHeart />
                        <span>Wishlist</span>
                      </Link>
                      
                      <div className="dropdown-divider"></div>
                      
                      <button 
                        onClick={handleLogout}
                        className="dropdown-item logout"
                      >
                        <FiLogOut />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="auth-buttons">
                  <Link href="/auth/login" className="auth-btn login-btn">
                    <FiUser />
                    <span>Login</span>
                  </Link>
                  <Link href="/auth/register" className="auth-btn register-btn">
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="menu-toggle" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </header>
    </div>
  )
}
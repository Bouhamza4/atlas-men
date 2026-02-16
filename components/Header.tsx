'use client';

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getCartCount } from '@/lib/cart'
import { getWishlist } from '@/lib/wishlist'
import {
  FiUser,
  FiShoppingCart,
  FiMenu,
  FiX,
  FiChevronDown,
  FiSearch,
  FiLogOut,
  FiHeart,
  FiPackage,
} from 'react-icons/fi'
import './Header.css'
import logo from '@/public/lo.png'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [allowTransitions, setAllowTransitions] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const profileRef = useRef<HTMLDivElement>(null)

  // Enable transitions after initial paint to avoid flicker.
  useEffect(() => {
    const timer = setTimeout(() => setAllowTransitions(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    localStorage.setItem(
      'menuState',
      JSON.stringify({
        isMenuOpen,
        scrolled,
      })
    )
  }, [isMenuOpen, scrolled])

  useEffect(() => {
    let isMounted = true

    const refreshCounts = async (userId?: string) => {
      if (!userId) {
        if (!isMounted) return
        setCartCount(0)
        setWishlistCount(0)
        return
      }
      const [cartResult, wishlistResult] = await Promise.allSettled([
        getCartCount(userId),
        getWishlist(userId),
      ])

      if (!isMounted) return
      setCartCount(cartResult.status === 'fulfilled' ? cartResult.value : 0)
      setWishlistCount(
        wishlistResult.status === 'fulfilled' ? wishlistResult.value.length : 0
      )
    }

    supabase.auth.getSession().then(async ({ data }) => {
      const authUser = data.session?.user ?? null
      setUser(authUser)
      await refreshCounts(authUser?.id)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user ?? null
      setUser(authUser)
      await refreshCounts(authUser?.id)
    })

    const handleScroll = () => setScrolled(window.scrollY > 50)

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) setIsMenuOpen(false)
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    document.addEventListener('mousedown', handleClickOutside)
    handleResize()

    return () => {
      isMounted = false
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

  return (
    <div className="stable-css">
      <div className="top-bar">
        <div className="container">
          <span>Free shipping on orders over $100</span>
          <div className="top-bar-links">
            <Link href="/contact">Contact Us</Link>
            <Link href="/help">Help Center</Link>
            <Link href="/track-order">Track Order</Link>
          </div>
        </div>
      </div>

      <header
        className={`main-header ${scrolled ? 'scrolled' : ''} ${isMenuOpen ? 'menu-open' : ''} ${allowTransitions ? 'allow-transitions' : ''}`}
      >
        <div className="header-container">
          <div className="logo-container">
            <Link href="/" className="logo">
              <div className="logo-text">
                <img src={logo.src} alt="Atlas Men" />
              </div>
            </Link>
          </div>

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

            {isMobile && (
              <form onSubmit={handleSearch} className="mobile-search">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-btn" aria-label="Search">
                  <FiSearch />
                </button>
              </form>
            )}
          </nav>

          <div className="header-actions">
            {!isMobile && (
              <form onSubmit={handleSearch} className="search-container">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-btn" aria-label="Search">
                  <FiSearch />
                </button>
              </form>
            )}

            <Link href="/wishlist" className="action-btn" title="Wishlist" aria-label="Wishlist">
              <FiHeart />
              {wishlistCount > 0 && <span className="action-badge">{wishlistCount}</span>}
            </Link>

            <Link href="/cart" className="action-btn cart-btn" title="Cart" aria-label="Cart">
              <FiShoppingCart />
              {cartCount > 0 && <span className="action-badge">{cartCount}</span>}
            </Link>

            <div className="profile-container" ref={profileRef}>
              {user ? (
                <>
                  <button
                    className="profile-btn"
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    aria-label="Profile menu"
                  >
                    <FiUser />
                    <span className="profile-name">{user.email?.split('@')[0]}</span>
                    <FiChevronDown className={`chevron ${isProfileDropdownOpen ? 'open' : ''}`} />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="profile-dropdown">
                      <div className="dropdown-header">
                        <div className="user-avatar">{user.email?.charAt(0).toUpperCase()}</div>
                        <div className="user-info">
                          <strong>{user.email}</strong>
                          <span>Welcome back!</span>
                        </div>
                      </div>

                      <div className="dropdown-divider"></div>

                      <Link href="/profile" className="dropdown-item" onClick={() => setIsProfileDropdownOpen(false)}>
                        <FiUser />
                        <span>My Profile</span>
                      </Link>

                      <Link href="/orders" className="dropdown-item" onClick={() => setIsProfileDropdownOpen(false)}>
                        <FiPackage />
                        <span>My Orders</span>
                      </Link>

                      <Link href="/wishlist" className="dropdown-item" onClick={() => setIsProfileDropdownOpen(false)}>
                        <FiHeart />
                        <span>Wishlist</span>
                      </Link>

                      <div className="dropdown-divider"></div>

                      <button onClick={handleLogout} className="dropdown-item logout">
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

            <button
              className="menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </header>
    </div>
  )
}

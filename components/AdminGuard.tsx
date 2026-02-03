'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { FiShield, FiLoader, FiAlertCircle, FiLogOut } from 'react-icons/fi'
import './AdminGuard.css'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        setLoading(true)
        
        // Check authentication
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

        if (authError) {
          throw new Error('Authentication error')
        }

        if (!authUser) {
          router.push('/login?redirect=/admin')
          return
        }

        setUser(authUser)

        // Check admin role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, email, full_name')
          .eq('id', authUser.id)
          .single()

        if (profileError) {
          throw new Error('Profile not found')
        }

        if (profile?.role !== 'admin') {
          setError('Access denied. Admin privileges required.')
          return
        }

        setLoading(false)
      } catch (err: any) {
        setError(err.message || 'An error occurred')
        setLoading(false)
      }
    }

    checkAdmin()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="loading-content">
          <FiLoader className="spinner" />
          <h2>Verifying Admin Access</h2>
          <p>Please wait while we check your permissions...</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-error-screen">
        <div className="error-content">
          <FiAlertCircle className="error-icon" />
          <h2>Access Restricted</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button onClick={() => router.push('/')} className="home-btn">
              Go to Home
            </button>
            <button onClick={handleLogout} className="logout-btn">
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <div className="admin-user-info">
          <div className="user-avatar">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.email}</span>
            <span className="user-role">
              <FiShield />
              Administrator
            </span>
          </div>
        </div>
        <button onClick={handleLogout} className="admin-logout-btn">
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
      
      <div className="admin-content">
        {children}
      </div>
      
      <div className="admin-footer">
        <span>Admin Dashboard v1.0</span>
        <span>•</span>
        <span>Secure Area</span>
        <span>•</span>
        <span>{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  )
}
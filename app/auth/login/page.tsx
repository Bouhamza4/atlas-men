'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiAlertCircle, FiCheckCircle, FiUserPlus } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import Link from 'next/link';
import './LoginForm.css';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      // Update last_login in profiles
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);

      setSuccess('Login successful! Redirecting...');
      
      // Store remember me preference
    


useEffect(() => {
  if (typeof window !== 'undefined') {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
    }
  }
}, []);


      // Redirect after 1.5 seconds
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `Failed to login with ${provider}`);
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email) {
      setError('Please enter your email to reset password');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;
      
      setSuccess('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    }
  };

  // Load remembered email on component mount
  useState(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
    }
  });

  return (
    <div className="auth-container">
      {/* Left Panel - Branding & Info */}
      <div className="auth-left-panel">
        <div className="brand-logo">
          <span className="logo-primary">ATLAS</span>
          <span className="logo-secondary">GENTLEMAN</span>
        </div>
        
        <div className="welcome-message">
          <h1>Welcome Back</h1>
          <p>Sign in to access your personalized dashboard and continue your journey with us.</p>
        </div>

        <div className="features-list">
          <div className="feature-item">
            <div className="feature-icon">✓</div>
            <span>Secure & Encrypted</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">✓</div>
            <span>24/7 Support</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">✓</div>
            <span>Multi-Device Sync</span>
          </div>
        </div>

        <div className="testimonial">
          <p className="testimonial-text">
            "The best authentication experience I've had. Simple, secure, and elegant."
          </p>
          <p className="testimonial-author">- Alex Johnson, Power User</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="auth-right-panel">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Sign In to Your Account</h2>
            <p className="auth-subtitle">Enter your credentials to continue</p>
          </div>

          {/* Social Login Buttons */}
          <div className="social-login-section">
            <button 
              className="social-btn google-btn"
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
            >
              <FcGoogle className="social-icon" />
              <span>Continue with Google</span>
            </button>
            
            <button 
              className="social-btn github-btn"
              onClick={() => handleSocialLogin('github')}
              disabled={loading}
            >
              <FaGithub className="social-icon" />
              <span>Continue with GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="divider">
            <span>or continue with email</span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email Input */}
            <div className="input-group">
              <div className="input-label">
                <FiMail className="label-icon" />
                <label>Email Address</label>
              </div>
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                disabled={loading}
                className="auth-input"
              />
            </div>

            {/* Password Input */}
            <div className="input-group">
              <div className="input-label">
                <FiLock className="label-icon" />
                <label>Password</label>
              </div>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  disabled={loading}
                  className="auth-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                />
                <span className="checkmark"></span>
                <span className="checkbox-label">Remember me</span>
              </label>
              
              <button
                type="button"
                className="forgot-password-btn"
                onClick={handlePasswordReset}
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="alert-message error">
                <FiAlertCircle />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="alert-message success">
                <FiCheckCircle />
                <span>{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <FiLogIn />
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* Sign Up Link */}
            <div className="auth-footer">
              <p className="footer-text">
                Don't have an account?
                <Link href="/auth/register" className="signup-link">
                  <FiUserPlus />
                  <span>Sign up now</span>
                </Link>
              </p>
            </div>
          </form>

          {/* Security Badges */}
          <div className="security-badges">
            <div className="badge">
              <div className="badge-dot ssl"></div>
              <span>SSL Secured</span>
            </div>
            <div className="badge">
              <div className="badge-dot encrypted"></div>
              <span>End-to-End Encrypted</span>
            </div>
            <div className="badge">
              <div className="badge-dot privacy"></div>
              <span>Privacy First</span>
            </div>
          </div>
        </div>

        <div className="copyright">
          © {new Date().getFullYear()} ATLAS GENTLEMAN. All rights reserved.
        </div>
      </div>
    </div>
  );
}
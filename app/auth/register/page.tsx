'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiCheck, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import Link from 'next/link';
import './RegisterForm.css';

// ✅ FIX: Add export default
export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    acceptTerms: false
  });

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    return {
      valid: Object.values(requirements).every(Boolean),
      requirements
    };
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(null);

  try {
    // 1. Register user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { full_name: formData.fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (authError) throw authError;

    // 2. FIX: Manually ensure profile exists
    if (authData.user) {
      console.log('User created, ID:', authData.user.id);
      
      // Wait a bit for trigger (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single();
      
      // If no profile, create manually
      if (!existingProfile) {
        console.log('Profile missing, creating manually...');
        
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: authData.user.email,
            full_name: formData.fullName,
            role: 'user',
            created_at: new Date().toISOString()
          });
        
        if (profileError) {
          console.warn('Manual profile creation failed:', profileError);
        } else {
          console.log('Manual profile creation successful');
        }
      } else {
        console.log('Profile already exists via trigger');
      }
    }

    setSuccess('✅ Registration successful! You can now login.');
    
    setTimeout(() => {
      router.push('/auth/login');
    }, 2000);

  } catch (err: any) {
    console.error('Registration error:', err);
    setError(err.message || 'Registration failed');
  } finally {
    setLoading(false);
  }
};
  const handleSocialRegister = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `Failed to register with ${provider}`);
    }
  };

  const passwordValidation = validatePassword(formData.password);

  return (
    <div className="auth-container">
      {/* Left Panel - Branding & Info */}
      <div className="auth-left-panel">
        <div className="brand-logo">
          <span className="logo-primary">ATLAS</span>
          <span className="logo-secondary">GENTLEMAN</span>
        </div>
        
        <div className="welcome-message">
          <h1>Join Our Community</h1>
          <p>Create your account and start your journey with us. It's free and only takes a minute.</p>
        </div>

        <div className="benefits-list">
          <div className="benefit-item">
            <div className="benefit-icon">✨</div>
            <div className="benefit-content">
              <h4>Premium Features</h4>
              <p>Access exclusive tools and content</p>
            </div>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">🔒</div>
            <div className="benefit-content">
              <h4>Secure & Private</h4>
              <p>Your data is encrypted and protected</p>
            </div>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">🚀</div>
            <div className="benefit-content">
              <h4>Instant Access</h4>
              <p>Start immediately after registration</p>
            </div>
          </div>
        </div>

        <div className="stats">
          <div className="stat-item">
            <div className="stat-number">10K+</div>
            <div className="stat-label">Happy Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Support</div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="auth-right-panel">
        <div className="auth-card">
          <div className="back-button">
            <Link href="/auth/login" className="back-link">
              <FiArrowLeft />
              <span>Back to Login</span>
            </Link>
          </div>

          <div className="auth-header">
            <h2>Create Your Account</h2>
            <p className="auth-subtitle">Fill in your details to get started</p>
          </div>

          {/* Social Register Buttons */}
          <div className="social-login-section">
            <button 
              className="social-btn google-btn"
              onClick={() => handleSocialRegister('google')}
              disabled={loading}
            >
              <FcGoogle className="social-icon" />
              <span>Sign up with Google</span>
            </button>
            
            <button 
              className="social-btn github-btn"
              onClick={() => handleSocialRegister('github')}
              disabled={loading}
            >
              <FaGithub className="social-icon" />
              <span>Sign up with GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="divider">
            <span>or sign up with email</span>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Full Name Input */}
            <div className="input-group">
              <div className="input-label">
                <FiUser className="label-icon" />
                <label>Full Name</label>
              </div>
              <input
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
                disabled={loading}
                className="auth-input"
              />
            </div>

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
                  placeholder="Create a strong password"
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

              {/* Password Requirements */}
              <div className="password-requirements">
                <div className={`requirement ${passwordValidation.requirements.length ? 'valid' : ''}`}>
                  <FiCheck />
                  <span>At least 8 characters</span>
                </div>
                <div className={`requirement ${passwordValidation.requirements.uppercase ? 'valid' : ''}`}>
                  <FiCheck />
                  <span>One uppercase letter</span>
                </div>
                <div className={`requirement ${passwordValidation.requirements.lowercase ? 'valid' : ''}`}>
                  <FiCheck />
                  <span>One lowercase letter</span>
                </div>
                <div className={`requirement ${passwordValidation.requirements.number ? 'valid' : ''}`}>
                  <FiCheck />
                  <span>One number</span>
                </div>
                <div className={`requirement ${passwordValidation.requirements.special ? 'valid' : ''}`}>
                  <FiCheck />
                  <span>One special character</span>
                </div>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="input-group">
              <div className="input-label">
                <FiLock className="label-icon" />
                <label>Confirm Password</label>
              </div>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                  disabled={loading}
                  className="auth-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="terms-section">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
                />
                <span className="checkmark"></span>
                <span className="checkbox-label">
                  I agree to the <Link href="/terms" className="terms-link">Terms of Service</Link> and <Link href="/privacy" className="terms-link">Privacy Policy</Link>
                </span>
              </label>
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
                <FiCheck />
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <FiCheck />
                  <span>Create Account</span>
                </>
              )}
            </button>

            {/* Login Link */}
            <div className="auth-footer">
              <p className="footer-text">
                Already have an account?
                <Link href="/auth/login" className="login-link">
                  <span>Sign in here</span>
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
// ✅ FIX: No extra closing bracket - Function properly closed
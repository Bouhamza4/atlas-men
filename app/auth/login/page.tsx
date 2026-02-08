'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiLogIn,
  FiAlertCircle,
  FiKey,
  FiShield,
  FiCheck,
  FiStar,
  FiMoon,
  FiSun
} from 'react-icons/fi';
import './LoginForm.css';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
  }>>([]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Create particle effect
  useEffect(() => {
    const particlesArray = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 0.5 + 0.1
    }));
    setParticles(particlesArray);
  }, []);

  // Load remembered email
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
    }

    // Check dark mode preference
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
  }, []);

  // Handle theme toggle
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Update last_login
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);

      // Remember Me functionality
      if (formData.rememberMe) {
        localStorage.setItem('rememberEmail', formData.email);
      } else {
        localStorage.removeItem('rememberEmail');
      }

      setSuccess('✨ Login successful! Redirecting...');

      // Add celebration effect
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 1500);

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email to reset password');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;
      
      setSuccess(`📧 Password reset email sent to ${formData.email}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    }
  };

  const handleSocialLogin = (provider: 'google' | 'github') => {
    setSuccess(`✨ ${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon!`);
    // Implement actual social login here
  };

  return (
    <div className={`login-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="theme-toggle"
        aria-label="Toggle theme"
      >
        {darkMode ? <FiSun /> : <FiMoon />}
      </button>

      {/* Particles Effect */}
      <div className="particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${20 / particle.speed}s`
            }}
          />
        ))}
      </div>

      <div className="login-wrapper">
        {/* Header with decorative elements */}
        <div className="login-header">
          <div className="logo-decorations">
            <div className="decoration-star">
              <FiStar />
            </div>
            <div className="logo-icon">
              <FiShield />
            </div>
            <div className="decoration-star">
              <FiStar />
            </div>
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your fantasy world</p>
        </div>

        {/* Card */}
        <div className="login-card">
          <form onSubmit={handleLogin} className="login-form">
            {/* Email */}
            <div className="form-group">
              <label className="form-label">
                Email Address
                <span className="required-star"> *</span>
              </label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <FiMail />
                </div>
                <input
                  type="email"
                  placeholder="wizard@fantasyrealm.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="form-input"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="password-header">
                <label className="form-label">
                  Password
                  <span className="required-star"> *</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="forgot-password"
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-wrapper">
                <div className="input-icon">
                  <FiLock />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="• • • • • • • •"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  className="form-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Remember Me & Quick Actions */}
            <div className="form-footer">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setFormData({
                  email: 'demo@fantasy.com',
                  password: 'demopass123',
                  rememberMe: false
                })}
                className="demo-button"
              >
                Try Demo Account
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <FiAlertCircle className="error-icon" />
                <div>
                  <p className="error-text">{error}</p>
                  <small>Please check your credentials and try again</small>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="success-message">
                <FiCheck className="success-icon" />
                <div>
                  <p className="success-text">{success}</p>
                  <small>You're being redirected...</small>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Unlocking Portal...</span>
                </>
              ) : (
                <>
                  <FiLogIn className="button-icon" />
                  <span>Enter Fantasy Realm</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="divider">
              <span className="divider-text">Or enter with magic</span>
            </div>

            {/* Social Login */}
            <div className="social-buttons">
              <button
                type="button"
                className="social-button google-button"
                onClick={() => handleSocialLogin('google')}
              >
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google Magic</span>
              </button>
              <button
                type="button"
                className="social-button github-button"
                onClick={() => handleSocialLogin('github')}
              >
                <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                <span>Github Spell</span>
              </button>
            </div>

            {/* Register Link */}
            <div className="register-link-container">
              <p className="register-link-text">
                New to the realm?{' '}
                <Link href="/auth/register" className="register-link">
                  Create an account
                </Link>
              </p>
              <p className="guest-link-text">
                Just exploring?{' '}
                <Link href="/explore" className="guest-link">
                  Continue as guest
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Security Features */}
        <div className="security-features">
          <div className="feature-card">
            <div className="feature-icon secure-icon">
              <FiShield />
            </div>
            <p>Enchanted Security</p>
            <small>Magical protection</small>
          </div>
          <div className="feature-card">
            <div className="feature-icon encrypted-icon">
              <FiKey />
            </div>
            <p>Arcane Encryption</p>
            <small>Unbreakable spells</small>
          </div>
          <div className="feature-card">
            <div className="feature-icon privacy-icon">
              <FiCheck />
            </div>
            <p>Elven Privacy</p>
            <small>Ancient secrets safe</small>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p className="footer-text">
            ✨ By entering, you agree to our{' '}
            <Link href="/terms" className="footer-link">
              Magical Terms
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="footer-link">
              Wizardry Privacy
            </Link>
          </p>
          <div className="footer-decoration">
            <FiStar />
            <span>Fantasy Portal v1.0</span>
            <FiStar />
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Theme Toggle */
        .theme-toggle {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          cursor: pointer;
          z-index: 100;
          backdrop-filter: blur(10px);
          transition: all 0.3s;
        }
        
        .theme-toggle:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(30deg);
        }

        /* Logo Decorations */
        .logo-decorations {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .decoration-star {
          color: rgba(255, 255, 255, 0.6);
          animation: twinkle 2s infinite alternate;
        }
        
        .decoration-star:nth-child(1) {
          animation-delay: 0s;
        }
        
        .decoration-star:nth-child(3) {
          animation-delay: 1s;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        /* Required Star */
        .required-star {
          color: #ff6b6b;
        }

        /* Form Footer */
        .form-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .demo-button {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          border: 1px solid rgba(102, 126, 234, 0.3);
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .demo-button:hover {
          background: rgba(102, 126, 234, 0.2);
          transform: translateY(-2px);
        }

        /* Guest Link */
        .guest-link-text {
          font-size: 13px;
          color: #888;
          margin-top: 8px;
        }
        
        .guest-link {
          color: #888;
          text-decoration: none;
          font-weight: 600;
          border-bottom: 1px dotted #888;
        }
        
        .guest-link:hover {
          color: #667eea;
        }

        /* Login Footer */
        .login-footer {
          text-align: center;
          margin-top: 40px;
        }
        
        .footer-text {
          color: rgba(255, 255, 255, 0.8);
          font-size: 13px;
          margin-bottom: 10px;
        }
        
        .footer-link {
          color: white;
          text-decoration: none;
          font-weight: 600;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .footer-link:hover {
          border-bottom-color: white;
        }
        
        .footer-decoration {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
        }

        /* Dark Mode */
        .login-container.dark-mode {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        }
        
        .login-container.dark-mode .login-card {
          background: rgba(30, 30, 46, 0.95);
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .login-container.dark-mode .form-input {
          background: rgba(40, 40, 60, 0.8);
          border-color: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .login-container.dark-mode .form-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        
        .login-container.dark-mode .login-title,
        .login-container.dark-mode .login-subtitle,
        .login-container.dark-mode .form-label,
        .login-container.dark-mode .checkbox-text,
        .login-container.dark-mode .register-link-text {
          color: rgba(255, 255, 255, 0.9);
        }
        
        .login-container.dark-mode .divider-text {
          background: rgba(30, 30, 46, 0.95);
          color: rgba(255, 255, 255, 0.6);
        }
        
        .login-container.dark-mode .divider::before {
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
        }
        
        .login-container.dark-mode .social-button {
          background: rgba(40, 40, 60, 0.8);
          border-color: rgba(255, 255, 255, 0.1);
          color: white;
        }
      `}</style>
    </div>
  );
}
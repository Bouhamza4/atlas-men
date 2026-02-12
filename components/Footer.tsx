// components/Footer.tsx
'use client';

import Link from 'next/link';
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert(`Subscribed with: ${email}`);
      setEmail('');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Main Footer Grid */}
        <div className="footer-grid">
          
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-icon">🛍️</span>
              <h3 className="footer-brand-name">Atlas Store</h3>
            </div>
            <p className="footer-description">
              Modern fashion & quality products for the contemporary lifestyle.
            </p>
            <div className="social-links">
              <a href="#" className="social-link facebook">
                <FiFacebook />
              </a>
              <a href="#" className="social-link instagram">
                <FiInstagram />
              </a>
              <a href="#" className="social-link twitter">
                <FiTwitter />
              </a>
              <a href="#" className="social-link youtube">
                <FiYoutube />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <div className="footer-links">
              <Link href="/" className="footer-link">Home</Link>
              <Link href="/collections" className="footer-link">Collections</Link>
              <Link href="/new" className="footer-link">New Arrivals</Link>
              <Link href="/sale" className="footer-link">Sale</Link>
              <Link href="/contact" className="footer-link">Contact Us</Link>
            </div>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h4 className="footer-heading">Support</h4>
            <div className="footer-contact">
              <div className="contact-item">
                <FiMail className="contact-icon" />
                <span>support@atlasstore.com</span>
              </div>
              <div className="contact-item">
                <FiPhone className="contact-icon" />
                <span>+212 6 00 00 00 00</span>
              </div>
              <div className="contact-item">
                <FiMapPin className="contact-icon" />
                <span>123 Fashion Street, Casablanca</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="footer-section">
            <h4 className="footer-heading">Newsletter</h4>
            <p className="newsletter-description">Subscribe for updates and exclusive offers.</p>
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <div className="newsletter-input-group">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input"
                  required
                />
                <button type="submit" className="newsletter-btn">
                  Subscribe
                </button>
              </div>
              <p className="newsletter-note">We respect your privacy. Unsubscribe at any time.</p>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} Atlas Store. All rights reserved.
            </p>
            <div className="footer-legal">
              <Link href="/privacy" className="legal-link">Privacy Policy</Link>
              <Link href="/terms" className="legal-link">Terms of Service</Link>
              <Link href="/shipping" className="legal-link">Shipping Policy</Link>
              <Link href="/returns" className="legal-link">Returns</Link>
            </div>
          </div>
          
          {/* Payment Methods */}
          <div className="payment-methods">
            <span className="payment-icon">💳</span>
            <span className="payment-icon">💰</span>
            <span className="payment-icon">📱</span>
            <span className="payment-icon">🏦</span>
            <span className="payment-icon">💎</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
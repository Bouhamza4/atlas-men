// app/contact/page.tsx
'use client';

import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle, FiLoader } from 'react-icons/fi';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // إرسال البيانات إلى Supabase
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // عرض رسالة النجاح
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });

      // إخفاء رسالة النجاح بعد 5 ثواني
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error sending contact form:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Success Message */}
      {success && (
        <div className="success-message">
          <FiCheckCircle className="success-icon" />
          <div className="success-content">
            <h4 className="success-title">Message Sent Successfully!</h4>
            <p className="success-text">We'll get back to you within 24 hours. 🚀</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p className="error-text">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="contact-header">
        <h1 className="contact-title">Get in Touch</h1>
        <p className="contact-subtitle">
          Have questions, suggestions, or need assistance? Our team is here to help you 24/7.
        </p>
      </div>

      <div className="contact-container">
        
        {/* Contact Info Cards */}
        <div className="contact-info">
          <div className="contact-card">
            <div className="contact-card-header">
              <div className="contact-card-icon email">
                <FiMail />
              </div>
              <div className="contact-card-title">
                <h3>Email Us</h3>
                <p>We'll respond quickly</p>
              </div>
            </div>
            <div className="contact-card-content">
              <p>support@atlasstore.com</p>
              <p>sales@atlasstore.com</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-card-header">
              <div className="contact-card-icon phone">
                <FiPhone />
              </div>
              <div className="contact-card-title">
                <h3>Call Us</h3>
                <p>Mon-Fri, 9AM-6PM</p>
              </div>
            </div>
            <div className="contact-card-content">
              <p>+212 6 00 00 00 00</p>
              <p>+212 5 20 00 00 00</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-card-header">
              <div className="contact-card-icon location">
                <FiMapPin />
              </div>
              <div className="contact-card-title">
                <h3>Visit Us</h3>
                <p>Our headquarters</p>
              </div>
            </div>
            <div className="contact-card-content">
              <p>123 Fashion Street</p>
              <p>Casablanca, Morocco</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-wrapper">
          <div className="contact-form-container">
            <h2 className="form-title">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Your Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Your Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject" className="form-label">
                  Subject *
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="How can we help you?"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  Message *
                </label>
                <textarea
                  id="message"
                  placeholder="Tell us about your inquiry..."
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="form-textarea"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`submit-btn ${loading ? 'loading' : ''}`}
              >
                {loading ? (
                  <>
                    <FiLoader className="spinner" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend className="send-icon" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
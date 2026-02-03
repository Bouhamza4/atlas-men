'use client'
import { useState } from 'react'
import './NewsletterSection.css'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle subscription
    setSubscribed(true)
    setEmail('')
    setTimeout(() => setSubscribed(false), 3000)
  }

  return (
    <section className="newsletter-section">
      <div className="newsletter-container">
        <h2>Stay Updated</h2>
        <p>Subscribe to our newsletter for exclusive offers and style tips</p>
        <form onSubmit={handleSubmit} className="newsletter-form">
          <div className="input-container">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="input-border"></span>
          </div>
          <button type="submit" className="subscribe-btn">
            {subscribed ? 'Subscribed!' : 'Subscribe'}
          </button>
        </form>
      </div>
    </section>
  )
}
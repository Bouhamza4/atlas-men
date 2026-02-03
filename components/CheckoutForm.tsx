'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FiUser, FiMapPin, FiPhone, FiMail, FiCreditCard, FiPackage, FiLock, FiCheck } from 'react-icons/fi'
import './CheckoutForm.css'

interface CheckoutFormProps {
  cart: any
  onProcessing?: (processing: boolean) => void
}

export default function CheckoutForm({ cart, onProcessing }: CheckoutFormProps) {
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [userProfile, setUserProfile] = useState<any>(null)
  const [sameBillingAddress, setSameBillingAddress] = useState(true)
  
  const [formData, setFormData] = useState({
    // Shipping Address
    shipping_full_name: '',
    shipping_address_line1: '',
    shipping_address_line2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    shipping_country: 'US',
    shipping_phone: '',
    
    // Billing Address
    billing_full_name: '',
    billing_address_line1: '',
    billing_address_line2: '',
    billing_city: '',
    billing_state: '',
    billing_postal_code: '',
    billing_country: 'US',
    
    // Contact
    email: '',
    
    // Payment
    save_shipping_info: true,
    accept_terms: false,
    subscribe_newsletter: true
  })

  // Load user profile
  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      setUserProfile(profile)
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        shipping_full_name: profile.full_name || '',
        shipping_phone: profile.phone || '',
        shipping_city: profile.city || '',
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Shipping validation
    if (!formData.shipping_full_name.trim()) {
      newErrors.shipping_full_name = 'Full name is required'
    }

    if (!formData.shipping_address_line1.trim()) {
      newErrors.shipping_address_line1 = 'Address is required'
    }

    if (!formData.shipping_city.trim()) {
      newErrors.shipping_city = 'City is required'
    }

    if (!formData.shipping_state.trim()) {
      newErrors.shipping_state = 'State is required'
    }

    if (!formData.shipping_postal_code.trim()) {
      newErrors.shipping_postal_code = 'Postal code is required'
    }

    if (!formData.shipping_phone.trim()) {
      newErrors.shipping_phone = 'Phone number is required'
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required'
    }

    // Billing validation if different
    if (!sameBillingAddress) {
      if (!formData.billing_full_name.trim()) {
        newErrors.billing_full_name = 'Billing name is required'
      }

      if (!formData.billing_address_line1.trim()) {
        newErrors.billing_address_line1 = 'Billing address is required'
      }

      if (!formData.billing_city.trim()) {
        newErrors.billing_city = 'Billing city is required'
      }

      if (!formData.billing_state.trim()) {
        newErrors.billing_state = 'Billing state is required'
      }

      if (!formData.billing_postal_code.trim()) {
        newErrors.billing_postal_code = 'Billing postal code is required'
      }
    }

    if (!formData.accept_terms) {
      newErrors.accept_terms = 'You must accept the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setProcessing(true)
    onProcessing?.(true)

    try {
      // Prepare shipping address
      const shippingAddress = {
        full_name: formData.shipping_full_name,
        address_line1: formData.shipping_address_line1,
        address_line2: formData.shipping_address_line2 || undefined,
        city: formData.shipping_city,
        state: formData.shipping_state,
        postal_code: formData.shipping_postal_code,
        country: formData.shipping_country,
        phone: formData.shipping_phone
      }

      // Prepare billing address
      let billingAddress
      if (!sameBillingAddress) {
        billingAddress = {
          same_as_shipping: false,
          full_name: formData.billing_full_name,
          address_line1: formData.billing_address_line1,
          address_line2: formData.billing_address_line2 || undefined,
          city: formData.billing_city,
          state: formData.billing_state,
          postal_code: formData.billing_postal_code,
          country: formData.billing_country
        }
      }

      // Save shipping info to profile if requested
      if (formData.save_shipping_info && userProfile) {
        await supabase
          .from('profiles')
          .update({
            full_name: formData.shipping_full_name,
            phone: formData.shipping_phone,
            city: formData.shipping_city,
            address: formData.shipping_address_line1,
            updated_at: new Date().toISOString()
          })
          .eq('id', userProfile.id)
      }

      // Create order
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress,
          billingAddress,
          saveInfo: formData.save_shipping_info,
          subscribeNewsletter: formData.subscribe_newsletter
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const { orderId } = await response.json()

      // Create Stripe checkout session
      const stripeResponse = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          customerEmail: formData.email
        })
      })

      if (!stripeResponse.ok) {
        throw new Error('Failed to create payment session')
      }

      const { url } = await stripeResponse.json()
      
      // Redirect to Stripe
      window.location.href = url

    } catch (error: any) {
      console.error('Checkout error:', error)
      setErrors({ submit: error.message || 'An error occurred during checkout' })
    } finally {
      setProcessing(false)
      onProcessing?.(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      {/* Progress Steps */}
      <div className="checkout-progress">
        <div className="progress-step active">
          <div className="step-number">1</div>
          <span>Shipping</span>
        </div>
        <div className="progress-line"></div>
        <div className="progress-step">
          <div className="step-number">2</div>
          <span>Payment</span>
        </div>
        <div className="progress-line"></div>
        <div className="progress-step">
          <div className="step-number">3</div>
          <span>Complete</span>
        </div>
      </div>

      {/* Contact Information */}
      <div className="form-section">
        <h3 className="section-title">
          <FiMail />
          Contact Information
        </h3>
        
        <div className="form-group">
          <div className="input-with-icon">
            <FiMail className="input-icon" />
            <input
              type="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'error' : ''}
              disabled={processing}
            />
          </div>
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="form-section">
        <h3 className="section-title">
          <FiMapPin />
          Shipping Address
        </h3>
        
        <div className="form-grid">
          <div className="form-group">
            <div className="input-with-icon">
              <FiUser className="input-icon" />
              <input
                type="text"
                placeholder="Full Name *"
                value={formData.shipping_full_name}
                onChange={(e) => handleInputChange('shipping_full_name', e.target.value)}
                className={errors.shipping_full_name ? 'error' : ''}
                disabled={processing}
              />
            </div>
            {errors.shipping_full_name && <span className="error-message">{errors.shipping_full_name}</span>}
          </div>

          <div className="form-group">
            <div className="input-with-icon">
              <FiPhone className="input-icon" />
              <input
                type="tel"
                placeholder="Phone Number *"
                value={formData.shipping_phone}
                onChange={(e) => handleInputChange('shipping_phone', e.target.value)}
                className={errors.shipping_phone ? 'error' : ''}
                disabled={processing}
              />
            </div>
            {errors.shipping_phone && <span className="error-message">{errors.shipping_phone}</span>}
          </div>

          <div className="form-group full-width">
            <div className="input-with-icon">
              <FiMapPin className="input-icon" />
              <input
                type="text"
                placeholder="Address Line 1 *"
                value={formData.shipping_address_line1}
                onChange={(e) => handleInputChange('shipping_address_line1', e.target.value)}
                className={errors.shipping_address_line1 ? 'error' : ''}
                disabled={processing}
              />
            </div>
            {errors.shipping_address_line1 && <span className="error-message">{errors.shipping_address_line1}</span>}
          </div>

          <div className="form-group full-width">
            <input
              type="text"
              placeholder="Address Line 2 (Optional)"
              value={formData.shipping_address_line2}
              onChange={(e) => handleInputChange('shipping_address_line2', e.target.value)}
              disabled={processing}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="City *"
              value={formData.shipping_city}
              onChange={(e) => handleInputChange('shipping_city', e.target.value)}
              className={errors.shipping_city ? 'error' : ''}
              disabled={processing}
            />
            {errors.shipping_city && <span className="error-message">{errors.shipping_city}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="State *"
              value={formData.shipping_state}
              onChange={(e) => handleInputChange('shipping_state', e.target.value)}
              className={errors.shipping_state ? 'error' : ''}
              disabled={processing}
            />
            {errors.shipping_state && <span className="error-message">{errors.shipping_state}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Postal Code *"
              value={formData.shipping_postal_code}
              onChange={(e) => handleInputChange('shipping_postal_code', e.target.value)}
              className={errors.shipping_postal_code ? 'error' : ''}
              disabled={processing}
            />
            {errors.shipping_postal_code && <span className="error-message">{errors.shipping_postal_code}</span>}
          </div>

          <div className="form-group">
            <select
              value={formData.shipping_country}
              onChange={(e) => handleInputChange('shipping_country', e.target.value)}
              disabled={processing}
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="FR">France</option>
              <option value="DE">Germany</option>
            </select>
          </div>
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.save_shipping_info}
            onChange={(e) => handleInputChange('save_shipping_info', e.target.checked)}
            disabled={processing}
          />
          <span className="checkmark"></span>
          <span>Save shipping information for next time</span>
        </label>
      </div>

      {/* Billing Address */}
      <div className="form-section">
        <h3 className="section-title">
          <FiCreditCard />
          Billing Address
        </h3>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={sameBillingAddress}
            onChange={(e) => setSameBillingAddress(e.target.checked)}
            disabled={processing}
          />
          <span className="checkmark"></span>
          <span>Same as shipping address</span>
        </label>

        {!sameBillingAddress && (
          <div className="form-grid">
            <div className="form-group">
              <input
                type="text"
                placeholder="Full Name *"
                value={formData.billing_full_name}
                onChange={(e) => handleInputChange('billing_full_name', e.target.value)}
                className={errors.billing_full_name ? 'error' : ''}
                disabled={processing}
              />
              {errors.billing_full_name && <span className="error-message">{errors.billing_full_name}</span>}
            </div>

            <div className="form-group full-width">
              <input
                type="text"
                placeholder="Address Line 1 *"
                value={formData.billing_address_line1}
                onChange={(e) => handleInputChange('billing_address_line1', e.target.value)}
                className={errors.billing_address_line1 ? 'error' : ''}
                disabled={processing}
              />
              {errors.billing_address_line1 && <span className="error-message">{errors.billing_address_line1}</span>}
            </div>

            <div className="form-group full-width">
              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                value={formData.billing_address_line2}
                onChange={(e) => handleInputChange('billing_address_line2', e.target.value)}
                disabled={processing}
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                placeholder="City *"
                value={formData.billing_city}
                onChange={(e) => handleInputChange('billing_city', e.target.value)}
                className={errors.billing_city ? 'error' : ''}
                disabled={processing}
              />
              {errors.billing_city && <span className="error-message">{errors.billing_city}</span>}
            </div>

            <div className="form-group">
              <input
                type="text"
                placeholder="State *"
                value={formData.billing_state}
                onChange={(e) => handleInputChange('billing_state', e.target.value)}
                className={errors.billing_state ? 'error' : ''}
                disabled={processing}
              />
              {errors.billing_state && <span className="error-message">{errors.billing_state}</span>}
            </div>

            <div className="form-group">
              <input
                type="text"
                placeholder="Postal Code *"
                value={formData.billing_postal_code}
                onChange={(e) => handleInputChange('billing_postal_code', e.target.value)}
                className={errors.billing_postal_code ? 'error' : ''}
                disabled={processing}
              />
              {errors.billing_postal_code && <span className="error-message">{errors.billing_postal_code}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Terms & Newsletter */}
      <div className="form-section">
        <div className="terms-section">
          <label className="checkbox-label required">
            <input
              type="checkbox"
              checked={formData.accept_terms}
              onChange={(e) => handleInputChange('accept_terms', e.target.checked)}
              disabled={processing}
              className={errors.accept_terms ? 'error' : ''}
            />
            <span className="checkmark"></span>
            <span>
              I agree to the <a href="/terms" target="_blank" className="terms-link">Terms of Service</a> and <a href="/privacy" target="_blank" className="terms-link">Privacy Policy</a> *
            </span>
          </label>
          {errors.accept_terms && <span className="error-message">{errors.accept_terms}</span>}
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.subscribe_newsletter}
              onChange={(e) => handleInputChange('subscribe_newsletter', e.target.checked)}
              disabled={processing}
            />
            <span className="checkmark"></span>
            <span>Subscribe to our newsletter for exclusive offers</span>
          </label>
        </div>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="submit-error">
          <FiPackage />
          <span>{errors.submit}</span>
        </div>
      )}

      {/* Form Actions */}
      <div className="form-actions">
        <button
          type="button"
          className="back-btn"
          onClick={() => router.push('/cart')}
          disabled={processing}
        >
          Back to Cart
        </button>
        
        <button
          type="submit"
          className="submit-btn"
          disabled={processing || cart?.items?.length === 0}
        >
          {processing ? (
            <div className="submit-spinner"></div>
          ) : (
            <>
              <FiLock />
              <span>Proceed to Payment</span>
              <FiCheck className="check-icon" />
            </>
          )}
          <div className="submit-shine"></div>
        </button>
      </div>

      {/* Security Badges */}
      <div className="security-section">
        <div className="security-badge">
          <div className="security-icon">🔒</div>
          <div>
            <strong>Secure Payment</strong>
            <span>256-bit SSL encryption</span>
          </div>
        </div>
        <div className="security-badge">
          <div className="security-icon">🛡️</div>
          <div>
            <strong>Money Back</strong>
            <span>30-day guarantee</span>
          </div>
        </div>
      </div>
    </form>
  )
}
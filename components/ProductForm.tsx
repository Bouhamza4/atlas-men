'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FiSave, FiX, FiPackage, FiDollarSign, FiFileText, FiTag } from 'react-icons/fi'
import ImageUploader from './ImageUploader'
import './ProductForm.css'

interface ProductFormProps {
  product?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || '',
    description: product?.description || '',
    category_id: product?.category_id || '',
    stock: product?.stock || 0,
    image_url: product?.image_url || ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    }

    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = 'Valid price is required'
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required'
    }

    if (!formData.image_url) {
      newErrors.image_url = 'Product image is required'
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const productData = {
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        category_id: Number(formData.category_id),
        stock: Number(formData.stock),
        image_url: formData.image_url
      }

      if (product) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)

        if (error) throw error
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([productData])

        if (error) throw error
      }

      onSuccess?.()
    } catch (error: any) {
      console.error('Error saving product:', error)
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }))
    setErrors(prev => ({ ...prev, image_url: '' }))
  }

  return (
    <div className="product-form-container">
      <div className="form-header">
        <h2>
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
        {onCancel && (
          <button onClick={onCancel} className="cancel-form-btn">
            <FiX />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        {/* Image Upload */}
        <div className="form-section">
          <h3>
            <FiPackage />
            Product Image
          </h3>
          <ImageUploader 
            onUploadComplete={handleImageUpload}
            folder="products"
            maxSize={5}
            aspectRatio={1}
          />
          {errors.image_url && (
            <p className="error-message">{errors.image_url}</p>
          )}
        </div>

        {/* Basic Info */}
        <div className="form-section">
          <h3>
            <FiPackage />
            Basic Information
          </h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <p className="error-message">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="price">Price ($) *</label>
              <div className="price-input">
                <FiDollarSign className="currency-icon" />
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  className={errors.price ? 'error' : ''}
                />
              </div>
              {errors.price && <p className="error-message">{errors.price}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <div className="select-wrapper">
                <FiTag className="select-icon" />
                <select
                  id="category"
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className={errors.category_id ? 'error' : ''}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.category_id && <p className="error-message">{errors.category_id}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock Quantity</label>
              <input
                type="number"
                id="stock"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                className={errors.stock ? 'error' : ''}
              />
              {errors.stock && <p className="error-message">{errors.stock}</p>}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="form-section">
          <h3>
            <FiFileText />
            Description
          </h3>
          <div className="form-group">
            <label htmlFor="description">Product Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your product..."
              rows={4}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} className="cancel-btn" disabled={loading}>
              Cancel
            </button>
          )}
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <FiSave />
                {product ? 'Update Product' : 'Save Product'}
              </>
            )}
          </button>
        </div>

        {errors.submit && (
          <div className="submit-error">
            <p>{errors.submit}</p>
          </div>
        )}
      </form>
    </div>
  )
}
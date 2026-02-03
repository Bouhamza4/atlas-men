'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminGuard from '@/components/AdminGuard'
import ProductForm from '@/components/ProductForm'
import { FiArrowLeft, FiLoader } from 'react-icons/fi'

export default function EditProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    router.push('/admin')
  }

  const handleCancel = () => {
    router.push('/admin')
  }

  if (loading) {
    return (
      <AdminGuard>
        <div className="loading-page">
          <FiLoader className="spinner" />
          <p>Loading product...</p>
        </div>
      </AdminGuard>
    )
  }

  if (!product) {
    return (
      <AdminGuard>
        <div className="error-page">
          <h2>Product not found</h2>
          <button onClick={() => router.push('/admin')} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="edit-product-page">
        <button onClick={handleCancel} className="back-button">
          <FiArrowLeft />
          <span>Back to Dashboard</span>
        </button>
        
        <div className="page-header">
          <h1>Edit Product</h1>
          <p>Make changes to the product details below</p>
        </div>

        <ProductForm 
          product={product}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </AdminGuard>
  )
}
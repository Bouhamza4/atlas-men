'use client'
import AdminGuard from '@/components/AdminGuard'
import ProductForm from '@/components/ProductForm'
import { useRouter } from 'next/navigation'
import { FiArrowLeft } from 'react-icons/fi'

export default function NewProductPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/admin')
  }

  const handleCancel = () => {
    router.push('/admin')
  }

  return (
    <AdminGuard>
      <div className="new-product-page">
        <button onClick={handleCancel} className="back-button">
          <FiArrowLeft />
          <span>Back to Dashboard</span>
        </button>
        
        <div className="page-header">
          <h1>Add New Product</h1>
          <p>Fill in the details below to add a new product to your store</p>
        </div>

        <ProductForm 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </AdminGuard>
  )
}
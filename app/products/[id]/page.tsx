'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FiArrowLeft, FiStar, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi'
import ProductGallery from '@/components/ProductGallery'
import ProductInfo from '@/components/ProductInfo'
import './product-detail.css'

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const productId = typeof id === 'string' ? id : undefined
    if (!productId) return

    const fetchProduct = async () => {
      try {
        setLoading(true)
        
        // Fetch main product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              name,
              slug
            )
          `)
          .eq('id', productId)
          .single()

        if (productError) throw productError

        if (productData) {
          setProduct(productData)
          
          // Fetch related products from same category
          const categoryId = productData.category_id ?? ''
          const { data: relatedData } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', categoryId)
            .neq('id', productId)
            .limit(4)

          setRelatedProducts(relatedData || [])
        }
      } catch (err) {
        setError('Failed to load product')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="error-container">
        <h2>Product not found</h2>
        <p>{error || "The product you're looking for doesn't exist."}</p>
        <button onClick={() => router.push('/products')} className="back-btn">
          Browse Products
        </button>
      </div>
    )
  }

  // Generate additional images for gallery
  const additionalImages = [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80',
  ]

  return (
    <div className="product-detail-page">
      {/* Back Navigation */}
      <div className="page-header">
        <button onClick={() => router.back()} className="back-button">
          <FiArrowLeft />
          <span>Back to Products</span>
        </button>
        <div className="breadcrumbs">
          <span onClick={() => router.push('/')}>Home</span>
          <span>/</span>
          <span onClick={() => router.push('/products')}>Products</span>
          <span>/</span>
          <span className="current">{product.name}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="product-main-section">
        {/* Left Column - Gallery */}
        <div className="gallery-column">
          <ProductGallery 
            mainImage={product.image_url}
            images={additionalImages}
          />
        </div>

        {/* Right Column - Info */}
        <div className="info-column">
          <ProductInfo 
            name={product.name}
            price={product.price}
            originalPrice={product.price * 1.3} // Example discount
            description={product.description || "Premium quality product designed for the modern gentleman."}
            category={product.categories?.name || "Clothing"}
            sku={`ATLAS-${product.id.toString().padStart(4, '0')}`}
            brand="Atlas Gentleman"
            rating={4.5}
            reviewCount={128}
            sizes={['XS', 'S', 'M', 'L', 'XL']}
            colors={['#0f172a', '#c9a24d', '#64748b', '#1e293b']}
            stock={15}
          />
        </div>
      </div>

      {/* Trust Badges */}
      <div className="trust-badges">
        <div className="badge">
          <FiTruck />
          <div>
            <strong>Free Shipping</strong>
            <span>Over $100</span>
          </div>
        </div>
        <div className="badge">
          <FiRefreshCw />
          <div>
            <strong>30-Day Returns</strong>
            <span>Easy returns</span>
          </div>
        </div>
        <div className="badge">
          <FiShield />
          <div>
            <strong>2-Year Warranty</strong>
            <span>Quality guaranteed</span>
          </div>
        </div>
        <div className="badge">
          <FiStar />
          <div>
            <strong>Premium Quality</strong>
            <span>Handcrafted</span>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2>You Might Also Like</h2>
          <div className="related-grid">
            {relatedProducts.map((relatedProduct) => (
              <div 
                key={relatedProduct.id} 
                className="related-card"
                onClick={() => router.push(`/products/${relatedProduct.id}`)}
              >
                <img src={relatedProduct.image_url} alt={relatedProduct.name} />
                <h3>{relatedProduct.name}</h3>
                <p>${relatedProduct.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      <div className="recently-viewed">
        <h2>Recently Viewed</h2>
        <div className="viewed-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="viewed-card">
              <div className="viewed-image"></div>
              <div className="viewed-info">
                <h3>Classic Dress Shirt</h3>
                <p>$89.99</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
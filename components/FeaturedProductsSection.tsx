'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import './FeaturedProductsSection.css'

interface Product {
  id: string
  name: string
  price: number
  image_url: string | null
  description?: string | null
  stock?: number
  category_id?: string | null
}

export default function FeaturedProductsSection() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    supabase.from('products')
      .select('*')
      .order('id', { ascending: false })
      .limit(8)
      .then(({ data, error }) => {
        if (data) setProducts(data)
      })
  }, [])

  const handleQuickView = (productId: string) => {
    // Implement quick view functionality
    console.log('Quick view:', productId)
  }

  return (
    <section className="featured-section">
      <h2>Exclusive Collection</h2>
      <div className="products-grid">
        {products.map((prod, index) => (
          <div 
            key={prod.id} 
            className="product-card"
            style={{ animationDelay: `${index * 0.1 + 0.1}s` }}
          >
            <div className="product-badge">Featured</div>
            <div className="product-image-container">
              <img src={prod.image_url ?? ''} alt={prod.name} />
              <div className="product-overlay">
                <button 
                  className="quick-view-btn"
                  onClick={(e) => {
                    e.preventDefault()
                    handleQuickView(prod.id)
                  }}
                >
                  Quick View
                </button>
              </div>
            </div>
            <div className="product-info">
              <h3>{prod.name}</h3>
              <div className="price">{prod.price.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="view-all-container">
        <button className="view-all-btn" onClick={() => window.location.href = '/products'}>
          View All Products
        </button>
      </div>
    </section>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from '../../collections/collections.module.css'
import { ChevronLeft, Filter, Star, ShoppingBag } from 'lucide-react'

type Product = {
  id: string
  name: string
  price: number
  image_url?: string | null
  category_id?: string | null
  description?: string | null
  rating?: number
  discount?: number
  stock?: number
  created_at?: string | null
}

type Category = {
  id: string
  name: string
  description?: string
}

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest')

  const rawCategoryId = params.categoryId
  const categoryId = Array.isArray(rawCategoryId) ? rawCategoryId[0] : rawCategoryId

  useEffect(() => {
    const fetchData = async (id: string) => {
      setLoading(true)
      
      try {
        // Fetch category details
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single()

        if (!categoryData) {
          router.push('/collections')
          return
        }

        // Fetch products for this category
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', id)
          .order('created_at', { ascending: false })

        setCategory(categoryData)
        setProducts(productsData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        router.push('/collections')
      } finally {
        setLoading(false)
      }
    }

    if (typeof categoryId === 'string' && categoryId.trim().length > 0) {
      fetchData(categoryId)
    } else {
      router.push('/collections')
    }
  }, [categoryId, router])

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'newest':
      default:
        return (
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime()
        )
    }
  })

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}>
            <ShoppingBag className={styles.spinnerIcon} />
          </div>
          <p className={styles.loadingText}>Loading category...</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return null
  }

  return (
    <div className={styles.container}>
      {/* Back Navigation */}
      <div className={styles.breadcrumb}>
        <Link href="/collections" className={styles.backLink}>
          <ChevronLeft size={20} />
          Back to Collections
        </Link>
      </div>

      {/* Category Header */}
      <div className={styles.categoryHeader}>
        <div className={styles.categoryHero}>
          <h1 className={styles.categoryTitle}>{category.name}</h1>
          {category.description && (
            <p className={styles.categoryDescription}>{category.description}</p>
          )}
          <p className={styles.categoryCount}>{products.length} products available</p>
        </div>
      </div>

      {/* Sort Controls */}
      <div className={styles.sortControls}>
        <div className={styles.sortSection}>
          <Filter className={styles.filterIcon} />
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={styles.sortSelect}
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className={styles.productsSection}>
        {sortedProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <ShoppingBag size={48} />
            </div>
            <h3>No products in this category</h3>
            <p>Check back later for new arrivals</p>
            <Link href="/collections" className={styles.emptyStateButton}>
              Browse All Collections
            </Link>
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {sortedProducts.map(product => (
              <div key={product.id} className={styles.productCard}>
                <Link href={`/product/${product.id}`}>
                  {/* Product Image */}
                  <div className={styles.productImage}>
                    <img
                      src={product.image_url || ''}
                      alt={product.name}
                    />
                    
                    {/* Discount Badge */}
                    {product.discount && (
                      <div className={styles.discountBadge}>
                        -{product.discount}%
                      </div>
                    )}
                    
                    {/* Quick View */}
                    <div className={styles.quickView}>
                      <button className={styles.quickViewButton}>
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className={styles.productInfo}>
                    <div className={styles.productHeader}>
                      <div>
                        <h3>{product.name}</h3>
                        <div className={styles.rating}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`${styles.star} ${star <= (product.rating || 4) ? styles.starActive : ''}`}
                            />
                          ))}
                          <span>({product.rating || 4})</span>
                        </div>
                      </div>
                      <div className={styles.priceContainer}>
                        {product.discount ? (
                          <>
                            <span className={styles.discountPrice}>
                              ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                            </span>
                            <span className={styles.originalPrice}>
                              ${product.price}
                            </span>
                          </>
                        ) : (
                          <span className={styles.price}>
                            ${product.price}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description Preview */}
                    {product.description && (
                      <p className={styles.productDescription}>
                        {product.description.slice(0, 80)}...
                      </p>
                    )}

                    {/* Add to Cart Button */}
                    <button 
                      className={styles.addToCartButton}
                      onClick={(e) => {
                        e.preventDefault()
                        // Add to cart logic here
                        console.log('Add to cart:', product.id)
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

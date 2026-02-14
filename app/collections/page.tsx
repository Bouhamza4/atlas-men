'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import styles from './collections.module.css'
import { 
  Search, Filter, ShoppingBag, Star, 
  ChevronRight, Sparkles, Tag, X 
} from 'lucide-react'

type Category = {
  id: string
  name: string
  image_url?: string | null
  product_count?: number
}

type Product = {
  id: string
  name: string
  price: number
  image_url?: string | null
  category_id?: string | null
  rating?: number
  discount?: number
  created_at?: string | null
}

export default function CollectionsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      try {
        // Fetch categories with product count
        const { data: catData } = await supabase
          .from('categories')
          .select(`
            *,
            products:products(count)
          `)
          .order('name')

        // Fetch products
        const { data: prodData } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })

        const categoriesWithCount = (catData || []).map(cat => ({
          ...cat,
          product_count: cat.products?.[0]?.count || 0
        }))

        setCategories(categoriesWithCount)
        setProducts(prodData || [])
        setFilteredProducts(prodData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter and sort products
  useEffect(() => {
    let result = [...products]

    // Filter by search term
    if (searchTerm) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category_id === selectedCategory)
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'newest':
      default:
        result.sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime()
        )
    }

    setFilteredProducts(result)
  }, [searchTerm, selectedCategory, sortBy, products])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSortBy('newest')
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}>
            <ShoppingBag className={styles.spinnerIcon} />
          </div>
          <p className={styles.loadingText}>Loading amazing collections...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Sparkles className={styles.badgeIcon} />
            <span>EXCLUSIVE COLLECTIONS</span>
          </div>
          
          <h1 className={styles.heroTitle}>
            Discover Amazing
            <span className={styles.heroHighlight}>Products</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Browse through our curated collections of premium products
          </p>

          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className={styles.clearSearch}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <button 
        className={styles.mobileFilterButton}
        onClick={() => setSidebarOpen(true)}
      >
        <Filter size={20} />
        Filters
      </button>

      <div className={styles.mainContent}>
        {/* Sidebar Filters */}
        <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <h3>Filters</h3>
            <button 
              className={styles.closeSidebar}
              onClick={() => setSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          {/* Categories Filter */}
          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>
              <Filter className={styles.filterIcon} />
              Categories
            </h4>
            <div className={styles.filterOptions}>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`${styles.filterButton} ${selectedCategory === 'all' ? styles.filterButtonActive : ''}`}
              >
                All Products
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`${styles.filterButton} ${selectedCategory === cat.id ? styles.filterButtonActive : ''}`}
                >
                  {cat.name}
                  <span className={styles.productCount}>{cat.product_count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>Sort by</h4>
            <div className={styles.sortOptions}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="sort"
                  value="newest"
                  checked={sortBy === 'newest'}
                  onChange={(e) => setSortBy(e.target.value as any)}
                />
                <span>Newest First</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="sort"
                  value="price-low"
                  checked={sortBy === 'price-low'}
                  onChange={(e) => setSortBy(e.target.value as any)}
                />
                <span>Price: Low to High</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="sort"
                  value="price-high"
                  checked={sortBy === 'price-high'}
                  onChange={(e) => setSortBy(e.target.value as any)}
                />
                <span>Price: High to Low</span>
              </label>
            </div>
          </div>

          {/* Clear Filters */}
          <button 
            className={styles.clearFiltersButton}
            onClick={clearFilters}
          >
            Clear All Filters
          </button>
        </div>

        {/* Main Content Area */}
        <div className={styles.contentArea}>
          {/* Categories Grid */}
          <section className={styles.categoriesSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Shop by Category</h2>
              <Link
                href="/categories"
                className={styles.viewAllLink}
              >
                View all <ChevronRight className={styles.viewAllIcon} />
              </Link>
            </div>
            
            <div className={styles.categoriesGrid}>
              {categories.map(cat => (
                <div key={cat.id} className={styles.categoryCard}>
                  <Link href={`/collections/${cat.id}`}>
                    <div className={styles.categoryImage}>
                      <img
                        src={cat.image_url || '/placeholder.jpg'}
                        alt={cat.name}
                      />
                      <div className={styles.categoryOverlay} />
                    </div>
                    <div className={styles.categoryInfo}>
                      <h3>{cat.name}</h3>
                      <p>{cat.product_count} products</p>
                    </div>
                    <div className={styles.categoryArrow}>
                      <ChevronRight />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Products Grid */}
          <section className={styles.productsSection}>
            <div className={styles.productsHeader}>
              <div>
                <h2 className={styles.sectionTitle}>
                  {selectedCategory === 'all' ? 'All Products' : 
                    categories.find(c => c.id === selectedCategory)?.name + ' Collection'}
                </h2>
                <p className={styles.productsCount}>
                  Showing {filteredProducts.length} amazing products
                </p>
              </div>
              
              {/* Active Filters */}
              <div className={styles.activeFilters}>
                {selectedCategory !== 'all' && (
                  <span className={styles.activeFilter}>
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <button onClick={() => setSelectedCategory('all')}>×</button>
                  </span>
                )}
                {searchTerm && (
                  <span className={styles.activeFilter}>
                    Search: "{searchTerm}"
                    <button onClick={() => setSearchTerm('')}>×</button>
                  </span>
                )}
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <Search size={48} />
                </div>
                <h3>No products found</h3>
                <p>Try adjusting your search or filter</p>
                <button 
                  className={styles.emptyStateButton}
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={styles.productsGrid}>
                {filteredProducts.map(product => (
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
                            Quick View
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

                        {/* Category Tag */}
                        <div className={styles.categoryTag}>
                          <Tag className={styles.tagIcon} />
                          <span>
                            {categories.find(c => c.id === product.category_id)?.name}
                          </span>
                        </div>

                        {/* Add to Cart Button */}
                        <button className={styles.addToCartButton}>
                          Add to Cart
                        </button>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Stats Banner */}
          <div className={styles.statsBanner}>
            <div className={styles.statsGrid}>
              <div className={styles.stat}>
                <div className={styles.statNumber}>{products.length}+</div>
                <div className={styles.statLabel}>Premium Products</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>{categories.length}+</div>
                <div className={styles.statLabel}>Collections</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>24/7</div>
                <div className={styles.statLabel}>Customer Support</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>100%</div>
                <div className={styles.statLabel}>Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

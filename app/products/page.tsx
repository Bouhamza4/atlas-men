'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import { FiFilter, FiGrid, FiList, FiChevronDown, FiSearch, FiX } from 'react-icons/fi'
import { TbLoader } from 'react-icons/tb'
import './products.css'

interface Product {
  id: string
  name: string
  price: number
  image_url: string | null
  category_id: string | null
  category_name?: string
  is_new?: boolean
  discount?: number
}

interface Category {
  id: string
  name: string
  slug: string
  count?: number
}

function ProductsPageClient() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')

  const searchParams = useSearchParams()
  const categorySlug = searchParams.get('category')

  useEffect(() => {
    let isActive = true

    const isAbortError = (error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return true
      if (error instanceof Error) {
        return error.name === 'AbortError' || error.message.includes('signal is aborted')
      }
      return false
    }

    const fetchData = async () => {
      setLoading(true)

      try {
        // Fetch products with category names
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
          *,
          categories!inner (
            name,
            slug
          )
        `)
          .order('created_at', { ascending: false })

        if (productsError) throw productsError

        // Fetch categories with product counts
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select(`
          *,
          products (id)
        `)

        if (categoriesError) throw categoriesError

        if (!isActive) return

        if (productsData) {
          const formattedProducts = productsData.map(product => ({
            ...product,
            category_name: product.categories?.name,
            is_new: Math.random() > 0.7,
            discount: Math.random() > 0.8 ? Math.floor(Math.random() * 40) + 10 : undefined
          }))
          setProducts(formattedProducts)
          setFilteredProducts(formattedProducts)
        }

        if (categoriesData) {
          const formattedCategories = categoriesData.map(category => ({
            ...category,
            count: category.products?.length || 0
          }))
          setCategories(formattedCategories)
        }
      } catch (error) {
        if (!isAbortError(error)) {
          console.error('Failed to fetch products page data:', error)
        }
      } finally {
        if (isActive) setLoading(false)
      }
    }

    void fetchData()
    return () => {
      isActive = false
    }
  }, [])

  // Filter by URL category param
  useEffect(() => {
    if (categorySlug && categories.length > 0) {
      const category = categories.find(cat => cat.slug === categorySlug)
      if (category) {
        setSelectedCategories([category.name])
      }
    }
  }, [categorySlug, categories])

  // Apply filters
  useEffect(() => {
    let result = [...products]

    // Filter by search
    if (searchQuery) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      result = result.filter(product =>
        selectedCategories.includes(product.category_name || '')
      )
    }

    // Filter by price range
    result = result.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )

    // Sort products
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      default: // newest (stable sort by id)
        result.sort((a, b) => String(b.id).localeCompare(String(a.id)))
    }

    setFilteredProducts(result)
  }, [products, selectedCategories, priceRange, sortBy, searchQuery])

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(cat => cat !== categoryName)
        : [...prev, categoryName]
    )
  }

  const resetFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, 1000])
    setSortBy('newest')
    setSearchQuery('')
  }

  return (
    <div className="products-page">
      {/* Hero Section */}
      <div className="products-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Premium Collection
            <span className="title-accent">for Gentlemen</span>
          </h1>
          <p className="hero-subtitle">
            Discover our curated selection of luxury menswear
          </p>
        </div>
        <div className="hero-background"></div>
      </div>

      <div className="products-container">
        {/* Sidebar Filters */}
        <aside className={`products-sidebar ${isFilterOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>
              <FiFilter />
              Filters
            </h3>
            <button 
              className="close-filters"
              onClick={() => setIsFilterOpen(false)}
            >
              <FiX />
            </button>
          </div>

          {/* Search */}
          <div className="filter-section">
            <h4>Search</h4>
            <div className="search-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="filter-section">
            <h4>Categories</h4>
            <div className="categories-list">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-btn ${selectedCategories.includes(category.name) ? 'selected' : ''}`}
                  onClick={() => toggleCategory(category.name)}
                >
                  <span className="category-name">{category.name}</span>
                  <span className="category-count">{category.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-range">
              <div className="range-values">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="range-slider"
              />
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="range-slider"
              />
              <div className="range-track">
                <div 
                  className="range-selected"
                  style={{
                    left: `${(priceRange[0] / 1000) * 100}%`,
                    right: `${100 - (priceRange[1] / 1000) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Reset Filters */}
          <button className="reset-filters" onClick={resetFilters}>
            Reset All Filters
          </button>
        </aside>

        {/* Main Content */}
        <main className="products-main">
          {/* Header */}
          <div className="products-header">
            <div className="header-left">
              <button 
                className="filter-toggle"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <FiFilter />
                Filters
              </button>
              <span className="products-count">
                {filteredProducts.length} products found
              </span>
            </div>
            
            <div className="header-right">
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <FiGrid />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <FiList />
                </button>
              </div>
              
              <div className="sort-dropdown">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
                <FiChevronDown className="sort-arrow" />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="loading-container">
              <TbLoader className="spinner" />
              <p>Loading products...</p>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className={`products-grid ${viewMode}`}>
                {filteredProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                  />
                ))}
              </div>

              {/* Empty State */}
              {filteredProducts.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or search term</p>
                  <button onClick={resetFilters} className="reset-btn">
                    Reset Filters
                  </button>
                </div>
              )}

              {/* Load More (Pagination) */}
              {filteredProducts.length > 0 && (
                <div className="load-more">
                  <button className="load-more-btn">
                    Load More Products
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="products-page" />}>
      <ProductsPageClient />
    </Suspense>
  )
}

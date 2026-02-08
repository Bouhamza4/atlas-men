'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch, FiFilter, FiDownload, FiRefreshCw, FiPackage } from 'react-icons/fi'
import { TbLoader } from 'react-icons/tb'
import './AdminDashboard.css'

interface Product {
  id: string
  name: string
  price: number
  image_url: string | null
  description: string | null
  category_id: string | null
  category_name?: string
  stock: number
  created_at?: string | null
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categories, setCategories] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    outOfStock: 0,
    categoriesCount: 0
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data: productsData, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedProducts = productsData?.map(product => ({
        ...product,
        category_name: product.categories?.name
      })) || []

      setProducts(formattedProducts)
      
      // Calculate stats
      const totalValue = formattedProducts.reduce((sum, p) => sum + p.price * p.stock, 0)
      const outOfStock = formattedProducts.filter(p => p.stock === 0).length
      
      setStats({
        totalProducts: formattedProducts.length,
        totalValue,
        outOfStock,
        categoriesCount: new Set(formattedProducts.map(p => p.category_id)).size
      })
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    setCategories(data || [])
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const deleteProduct = async (id: string) => {
    try {
      await supabase.from('products').delete().eq('id', id)
      fetchProducts()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesCategory = selectedCategory === 'all' || 
                          product.category_name === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const exportData = () => {
    const csv = [
      ['ID', 'Name', 'Price', 'Stock', 'Category', 'Created At'],
      ...filteredProducts.map(p => [
        p.id,
        `"${p.name}"`,
        p.price,
        p.stock,
        p.category_name,
        p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="admin-dashboard">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FiPackage />
          </div>
          <div className="stat-info">
            <h3>{stats.totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon value">
            <span>$</span>
          </div>
          <div className="stat-info">
            <h3>{formatCurrency(stats.totalValue)}</h3>
            <p>Total Inventory Value</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon warning">
            <span>!</span>
          </div>
          <div className="stat-info">
            <h3>{stats.outOfStock}</h3>
            <p>Out of Stock</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon categories">
            <span>#</span>
          </div>
          <div className="stat-info">
            <h3>{stats.categoriesCount}</h3>
            <p>Categories</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="dashboard-controls">
        <div className="controls-left">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-dropdown">
            <FiFilter />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="controls-right">
          <button className="refresh-btn" onClick={fetchProducts}>
            <FiRefreshCw />
            Refresh
          </button>
          
          <button className="export-btn" onClick={exportData}>
            <FiDownload />
            Export CSV
          </button>
          
          <button className="add-product-btn" onClick={() => window.location.href = '/admin/products/new'}>
            <FiPlus />
            Add Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="products-table-container">
        {loading ? (
          <div className="loading-table">
            <TbLoader className="spinner" />
            <p>Loading products...</p>
          </div>
        ) : (
          <>
            <div className="table-header">
              <h3>Products ({filteredProducts.length})</h3>
            </div>
            
            <div className="table-responsive">
              <table className="products-table">
                <thead>
                  <tr>
                    <th className="image-col">Image</th>
                    <th className="name-col">Product</th>
                    <th className="category-col">Category</th>
                    <th className="price-col">Price</th>
                    <th className="stock-col">Stock</th>
                    <th className="date-col">Created</th>
                    <th className="actions-col">Actions</th>
                  </tr>
                </thead>
                
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className={product.stock === 0 ? 'out-of-stock' : ''}>
                      <td className="image-col">
                        <div className="product-image">
                          <img src={product.image_url ?? ''} alt={product.name} loading="lazy" />
                        </div>
                      </td>
                      
                      <td className="name-col">
                        <div className="product-info">
                          <strong className="product-name">{product.name}</strong>
                          <p className="product-desc">{product.description ? `${product.description.substring(0, 60)}...` : '—'}</p>
                        </div>
                      </td>
                      
                      <td className="category-col">
                        <span className="category-badge">{product.category_name}</span>
                      </td>
                      
                      <td className="price-col">
                        <span className="price">{formatCurrency(product.price)}</span>
                      </td>
                      
                      <td className="stock-col">
                        <div className="stock-indicator">
                          <div 
                            className={`stock-dot ${product.stock > 10 ? 'high' : product.stock > 0 ? 'low' : 'none'}`}
                          ></div>
                          <span>{product.stock} units</span>
                        </div>
                      </td>
                      
                      <td className="date-col">
                        {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      
                      <td className="actions-col">
                        <div className="action-buttons">
                          <button 
                            className="action-btn view-btn"
                            onClick={() => window.open(`/products/${product.id}`, '_blank')}
                            title="View Product"
                          >
                            <FiEye />
                          </button>
                          
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => window.location.href = `/admin/products/edit/${product.id}`}
                            title="Edit Product"
                          >
                            <FiEdit2 />
                          </button>
                          
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => setDeleteConfirm(product.id)}
                            title="Delete Product"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredProducts.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <h3>No products found</h3>
                  <p>Try changing your search or filters</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={() => deleteProduct(deleteConfirm)}
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
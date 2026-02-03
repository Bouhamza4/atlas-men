'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserOrders } from '@/lib/order'
import { FiPackage, FiCheckCircle, FiTruck, FiClock, FiXCircle, FiFilter } from 'react-icons/fi'
import styles from './orders.module.css' // تم التحديث

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b'
      case 'processing': return '#3b82f6'
      case 'shipped': return '#8b5cf6'
      case 'delivered': return '#10b981'
      case 'cancelled': return '#ef4444'
      default: return '#cbd5e1'
    }
  }

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter)

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/orders')
        return
      }

      const userOrders = await getUserOrders(user.id)
      setOrders(userOrders)
    } catch (error) {
      console.error('Fetch orders error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <FiClock className={styles.statusIcon} />
      case 'processing': return <FiPackage className={styles.statusIcon} />
      case 'shipped': return <FiTruck className={styles.statusIcon} />
      case 'delivered': return <FiCheckCircle className={styles.statusIcon} />
      case 'cancelled': return <FiXCircle className={styles.statusIcon} />
      default: return <FiPackage className={styles.statusIcon} />
    }
  }

  if (loading) {
    return (
      <div className={styles.ordersLoading}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading your orders...</p>
      </div>
    )
  }

  return (
    <div className={styles.ordersPage}>
      {/* Orders Header */}
      <div className={styles.ordersHeader}>
        <h1>My Orders</h1>
        <p>Track and manage all your orders in one place</p>
      </div>

      {/* Filters */}
      <div className={styles.ordersFilters}>
        <div className={styles.filterButtons}>
          <button 
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            <FiFilter />
            All Orders ({orders.length})
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'processing' ? styles.active : ''}`}
            onClick={() => setFilter('processing')}
          >
            <FiPackage />
            Processing
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'shipped' ? styles.active : ''}`}
            onClick={() => setFilter('shipped')}
          >
            <FiTruck />
            Shipped
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'delivered' ? styles.active : ''}`}
            onClick={() => setFilter('delivered')}
          >
            <FiCheckCircle />
            Delivered
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className={styles.ordersList}>
        {filteredOrders.length === 0 ? (
          <div className={styles.noOrders}>
            <FiPackage className={styles.noOrdersIcon} />
            <h3>No orders found</h3>
            <p>You haven't placed any orders yet.</p>
            <button 
              onClick={() => router.push('/products')}
              className={styles.shopNowBtn}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div 
              key={order.id} 
              className={styles.orderCard}
              onClick={() => router.push(`/orders/${order.id}`)}
            >
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  <div className={styles.orderId}>Order #{order.id.slice(0, 8).toUpperCase()}</div>
                  <div className={styles.orderDate}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className={styles.orderStatus}>
                  {getStatusIcon(order.status)}
                  <span style={{ color: getStatusColor(order.status) }}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className={styles.orderContent}>
                <div className={styles.orderItemsPreview}>
                  {order.order_items?.slice(0, 3).map((item: any, index: number) => {
                    const prod = Array.isArray(item.products) ? item.products[0] : item.products
                    return (
                      <div key={index} className={styles.previewItem}>
                        <div className={styles.itemName}>{prod?.name ?? 'Product'}</div>
                        <div className={styles.itemQuantity}>x{item.quantity}</div>
                      </div>
                    )
                  })}
                  {order.order_items && order.order_items.length > 3 && (
                    <div className={styles.moreItems}>
                      +{order.order_items.length - 3} more items
                    </div>
                  )}
                </div>

                <div className={styles.orderTotal}>
                  <span>Total:</span>
                  <span className={styles.totalAmount}>${order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className={styles.orderFooter}>
                <button 
                  className={styles.viewDetailsBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/orders/${order.id}`)
                  }}
                >
                  View Details
                </button>
                {order.status === 'shipped' && (
                  <button className={styles.trackBtn}>
                    Track Order
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  // all helpers are defined above
}
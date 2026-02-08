import { supabase } from './supabase'

export interface OrderItem {
  product_id: string
  quantity: number
  price: number
  name: string
  image_url: string
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  subtotal: number
  shipping_cost: number
  tax_amount: number
  shipping_address: Record<string, any>
  billing_address?: Record<string, any> | null
  payment_method: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  stripe_payment_intent_id?: string | null
  stripe_session_id?: string | null
  created_at: string
  updated_at: string
  items: OrderItem[]
}

export async function createOrderFromCart(
  userId: string,
  shippingAddress: any,
  billingAddress?: any
): Promise<Order | null> {
  try {
    // Get user's cart with validation
    const cart: any = await supabase
      .from('carts')
      .select(`
        id,
        cart_items (
          id,
          quantity,
          products (
            id,
            name,
            price,
            image_url,
            stock
          )
        )
      `)
      .eq('user_id', userId)
      .single()

    if (cart.error || !cart.data) {
      throw new Error('Cart not found')
    }

    // Validate stock and calculate totals
    const items: OrderItem[] = []
    let subtotal = 0

    const cartItems: any[] = (cart.data as any).cart_items ?? []
    for (const item of cartItems) {
      // Supabase nested relations are returned as arrays; normalize to single product object
      const prod = Array.isArray((item as any).products) ? (item as any).products[0] : (item as any).products
      const quantity = Number((item as any).quantity ?? 0)

      // Check stock
      if (!prod || prod.stock < quantity) {
        const prodName = prod?.name ?? 'unknown product'
        throw new Error(`Insufficient stock for ${prodName}`)
      }

      const itemTotal = prod.price * quantity
      subtotal += itemTotal

      items.push({
        product_id: prod.id,
        quantity,
        price: prod.price,
        name: prod.name,
        image_url: prod.image_url
      })
    }

    // Calculate shipping and tax
    const shipping_cost = subtotal >= 100 ? 0 : 9.99
    const tax_amount = subtotal * 0.08 // 8% tax
    const total = subtotal + shipping_cost + tax_amount

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: userId,
        status: 'pending',
        subtotal,
        shipping_cost,
        tax_amount,
        total,
        shipping_address: shippingAddress,
        billing_address: billingAddress || { same_as_shipping: true },
        payment_method: 'card',
        payment_status: 'pending'
      }])
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // Update product stock (reserve items)
    for (const item of items) {
      await (supabase as any).rpc('decrement_product_stock', {
        product_id: item.product_id,
        amount: item.quantity
      })
    }

    // Clear cart
    await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.data.id)

    return {
      ...order,
      items
    }
  } catch (error) {
    console.error('Create order error:', error)
    return null
  }
}

export async function getOrder(orderId: string, userId: string): Promise<Order | null> {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          price,
          product_id,
          products (
            name,
            image_url
          )
        )
      `)
      .eq('id', orderId)
      .eq('user_id', userId)
      .single()

    if (error) throw error

    const items: OrderItem[] = order.order_items.map((item: any) => {
      const prod = Array.isArray(item.products) ? item.products[0] : item.products
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        name: prod?.name ?? '',
        image_url: prod?.image_url ?? ''
      }
    })

    return {
      ...order,
      items
    }
  } catch (error) {
    console.error('Get order error:', error)
    return null
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  paymentStatus?: Order['payment_status'],
  stripeData?: { payment_intent_id?: string; session_id?: string }
): Promise<boolean> {
  try {
    const updates: any = { status }
    
    if (paymentStatus) updates.payment_status = paymentStatus
    if (stripeData?.payment_intent_id) updates.stripe_payment_intent_id = stripeData.payment_intent_id
    if (stripeData?.session_id) updates.stripe_session_id = stripeData.session_id

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Update order status error:', error)
    return false
  }
}

export async function getUserOrders(userId: string): Promise<any[]> {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total,
        created_at,
        order_items (
          quantity,
          products (name)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return orders || []
  } catch (error) {
    console.error('Get user orders error:', error)
    return []
  }
}

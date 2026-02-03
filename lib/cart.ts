import { supabase } from './supabase'

export interface CartItem {
  id: string
  quantity: number
  product_id: string
  created_at: string
  product: {
    id: string
    name: string
    price: number
    image_url: string
    description?: string
    stock: number
    category?: string
  }
}

export interface Cart {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  items: CartItem[]
  total: number
  item_count: number
}

export async function getCart(userId: string): Promise<Cart | null> {
  try {
    // Get or create cart
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (cartError && cartError.code === 'PGRST116') {
      // Create new cart
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ user_id: userId })
        .select()
        .single()

      if (createError) throw createError
      return {
        ...newCart,
        items: [],
        total: 0,
        item_count: 0
      }
    }

    if (cartError) throw cartError

    // Get cart items with product details
    const { data: items, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_id,
        created_at,
        products (
          id,
          name,
          price,
          image_url,
          description,
          stock,
          categories (name)
        )
      `)
      .eq('cart_id', cart.id)
      .order('created_at', { ascending: false })

    if (itemsError) throw itemsError

    const formattedItems = items.map((item: any) => {
      // products can be returned as an array from Supabase relation selects,
      // so normalize to a single product object and handle categories similarly.
      const prod: any = Array.isArray(item.products) ? item.products[0] : item.products
      const category = prod?.categories
        ? Array.isArray(prod.categories)
          ? prod.categories[0]?.name
          : prod.categories.name
        : undefined

      return {
        id: item.id,
        quantity: item.quantity,
        product_id: item.product_id,
        created_at: item.created_at,
        product: {
          id: prod?.id,
          name: prod?.name,
          price: prod?.price,
          image_url: prod?.image_url,
          description: prod?.description,
          stock: prod?.stock,
          category
        }
      }
    })

    const total = formattedItems.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    )

    return {
      ...cart,
      items: formattedItems,
      total,
      item_count: formattedItems.reduce((sum, item) => sum + item.quantity, 0)
    }
  } catch (error) {
    console.error('Get cart error:', error)
    return null
  }
}

export async function addToCart(
  userId: string, 
  productId: string, 
  quantity: number = 1
): Promise<boolean> {
  try {
    // Get user's cart
    const cart = await getCart(userId)
    if (!cart) return false

    // Check product stock
    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single()

    if (!product || product.stock < quantity) {
      throw new Error('Insufficient stock')
    }

    // Check if item already in cart
    const existingItem = cart.items.find(item => item.product_id === productId)

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity
      if (newQuantity > product.stock) {
        throw new Error('Cannot exceed available stock')
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)

      if (error) throw error
    } else {
      // Add new item
      const { error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          product_id: productId,
          quantity: quantity
        })

      if (error) throw error
    }

    return true
  } catch (error) {
    console.error('Add to cart error:', error)
    return false
  }
}

export async function updateCartItem(
  itemId: string,
  quantity: number
): Promise<boolean> {
  try {
    if (quantity < 1) {
      return await removeFromCart(itemId)
    }

    // Check stock
    const { data: item } = await supabase
      .from('cart_items')
      .select('product_id')
      .eq('id', itemId)
      .single()

    if (!item) return false

    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.product_id)
      .single()

    if (!product || product.stock < quantity) {
      throw new Error('Insufficient stock')
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Update cart item error:', error)
    return false
  }
}

export async function removeFromCart(itemId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Remove from cart error:', error)
    return false
  }
}

export async function clearCart(userId: string): Promise<boolean> {
  try {
    const cart = await getCart(userId)
    if (!cart) return false

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Clear cart error:', error)
    return false
  }
}

export async function getCartCount(userId: string): Promise<number> {
  try {
    const cart = await getCart(userId)
    return cart?.item_count || 0
  } catch (error) {
    console.error('Get cart count error:', error)
    return 0
  }
}
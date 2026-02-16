import { supabase } from './supabase'

export interface WishlistItem {
  id: string
  product_id: string
  created_at?: string | null
  product: {
    id: string
    name: string
    price: number
    image_url: string | null
    description: string | null
    stock: number
  }
}

const isAbortError = (err: unknown) => {
  if (err instanceof DOMException && err.name === 'AbortError') return true
  if (err && typeof err === 'object') {
    const anyErr = err as Record<string, unknown>
    return (
      anyErr.name === 'AbortError' ||
      (typeof anyErr.message === 'string' &&
        anyErr.message.toLowerCase().includes('signal is aborted'))
    )
  }
  return false
}

const normalizeError = (err: unknown) => {
  if (!err || typeof err !== 'object') {
    return { message: '', code: '' }
  }
  const anyErr = err as Record<string, unknown>
  return {
    message: typeof anyErr.message === 'string' ? anyErr.message : '',
    code: typeof anyErr.code === 'string' ? anyErr.code : '',
  }
}

const isExpectedWishlistInfraError = (err: unknown) => {
  const { message, code } = normalizeError(err)
  if (['42P01', 'PGRST205', 'PGRST204', '42501'].includes(code)) return true
  const m = message.toLowerCase()
  return (
    m.includes('wishlist_items') &&
    (m.includes('not found') || m.includes('does not exist') || m.includes('permission denied'))
  )
}

export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  try {
    const { data, error } = await (supabase as any)
      .from('wishlist_items')
      .select(
        `
        id,
        product_id,
        created_at,
        products (
          id,
          name,
          price,
          image_url,
          description,
          stock
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map((item: any) => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products
      return {
        id: item.id,
        product_id: item.product_id,
        created_at: item.created_at,
        product: {
          id: product?.id,
          name: product?.name,
          price: product?.price,
          image_url: product?.image_url ?? null,
          description: product?.description ?? null,
          stock: product?.stock ?? 0,
        },
      }
    })
  } catch (error) {
    if (!isAbortError(error) && !isExpectedWishlistInfraError(error)) {
      const { message, code } = normalizeError(error)
      console.error('Get wishlist error:', message || 'Unknown error', code ? `(code: ${code})` : '')
    }
    return []
  }
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  try {
    const { data, error } = await (supabase as any)
      .from('wishlist_items')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle()

    if (error) throw error
    return Boolean(data)
  } catch (error) {
    if (!isAbortError(error) && !isExpectedWishlistInfraError(error)) {
      const { message, code } = normalizeError(error)
      console.error('Wishlist check error:', message || 'Unknown error', code ? `(code: ${code})` : '')
    }
    return false
  }
}

export async function addToWishlist(userId: string, productId: string): Promise<boolean> {
  try {
    const { error } = await (supabase as any).from('wishlist_items').insert({
      user_id: userId,
      product_id: productId,
    })
    if (error) throw error
    return true
  } catch (error) {
    if (!isAbortError(error) && !isExpectedWishlistInfraError(error)) {
      const { message, code } = normalizeError(error)
      console.error('Add wishlist error:', message || 'Unknown error', code ? `(code: ${code})` : '')
    }
    return false
  }
}

export async function removeFromWishlist(userId: string, productId: string): Promise<boolean> {
  try {
    const { error } = await (supabase as any)
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)
    if (error) throw error
    return true
  } catch (error) {
    if (!isAbortError(error) && !isExpectedWishlistInfraError(error)) {
      const { message, code } = normalizeError(error)
      console.error('Remove wishlist error:', message || 'Unknown error', code ? `(code: ${code})` : '')
    }
    return false
  }
}

export async function toggleWishlist(userId: string, productId: string): Promise<boolean> {
  const exists = await isInWishlist(userId, productId)
  if (exists) {
    return removeFromWishlist(userId, productId)
  }
  return addToWishlist(userId, productId)
}

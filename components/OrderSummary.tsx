import React from 'react'

type Props = {
  cart: any
  discountCode: string
  onDiscountChange: (v: string) => void
  onApplyDiscount: () => Promise<void>
  discountError: string
}

export default function OrderSummary({ cart, discountCode, onDiscountChange, onApplyDiscount, discountError }: Props) {
  if (!cart) return null

  const subtotal = cart.cart_items?.reduce((s: number, it: any) => {
    const prod = Array.isArray(it.products) ? it.products[0] : it.products
    return s + (prod?.price || 0) * it.quantity
  }, 0) || 0

  return (
    <aside>
      <h3>Order Summary</h3>
      <p>Subtotal: ${subtotal.toFixed(2)}</p>
      <div>
        <input value={discountCode} onChange={(e) => onDiscountChange(e.target.value)} placeholder="Discount code" />
        <button onClick={onApplyDiscount}>Apply</button>
        {discountError && <div style={{ color: 'red' }}>{discountError}</div>}
      </div>
    </aside>
  )
}

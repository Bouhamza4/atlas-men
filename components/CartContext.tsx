// components/CartContext.tsx
'use client';

import { createContext, useState, ReactNode, useEffect } from 'react';

interface CartContextType {
  cartCount: number;
  addToCart: () => void;
  removeFromCart: () => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType>({
  cartCount: 3,
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(3);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cartCount');
    if (savedCart) {
      setCartCount(parseInt(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartCount', cartCount.toString());
  }, [cartCount]);

  const addToCart = () => {
    setCartCount(prev => prev + 1);
  };

  const removeFromCart = () => {
    setCartCount(prev => Math.max(0, prev - 1));
  };

  const clearCart = () => {
    setCartCount(0);
  };

  return (
    <CartContext.Provider value={{ cartCount, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}
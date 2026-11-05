'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const FREE_SHIPPING_THRESHOLD = 999;

export function CartProvider({ children }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const activeUserIdRef = useRef(null);

  // Sync cart when user logs in / logs out
  useEffect(() => {
    setIsMounted(true);

    if (authLoading) return;

    if (!user) {
      // User is logged out -> cart displays empty
      setCartItems([]);
      activeUserIdRef.current = null;
      return;
    }

    const currentUserId = user.id;
    activeUserIdRef.current = currentUserId;
    const storageKey = `matchday_cart_${currentUserId}`;

    let initialItems = [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        initialItems = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading user cart from storage:', e);
    }

    // Check if there was a pending item from before login
    try {
      const pendingRaw = sessionStorage.getItem('pending_cart_item');
      if (pendingRaw) {
        const pending = JSON.parse(pendingRaw);
        sessionStorage.removeItem('pending_cart_item');

        if (pending && pending.product) {
          const p = pending.product;
          const s = pending.size || 'M';
          const q = pending.quantity || 1;

          const existingIdx = initialItems.findIndex(
            it => it.product?.id === p.id && it.size === s
          );
          if (existingIdx > -1) {
            initialItems[existingIdx].quantity += q;
          } else {
            initialItems.push({ product: p, size: s, quantity: q });
          }

          // Open cart drawer and notify user
          setTimeout(() => {
            setIsCartOpen(true);
            showToast(`Added ${p.name} (${s}) to your bag`);
          }, 400);
        }
      }
    } catch (e) {
      console.warn('Error applying pending cart item:', e);
    }

    setCartItems(initialItems);
  }, [user, authLoading]);

  // Persist cart to current user's localStorage partition
  useEffect(() => {
    if (!isMounted || !user || activeUserIdRef.current !== user.id) return;
    try {
      const storageKey = `matchday_cart_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save user cart to localStorage', e);
    }
  }, [cartItems, user, isMounted]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  /**
   * Adds an item to the bag.
   * If the visitor is not logged in, redirects to /login to establish individual user cart.
   */
  const addToCart = (product, size = "M", quantity = 1) => {
    if (!user) {
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('pending_cart_item', JSON.stringify({ product, size, quantity }));
        } catch (e) {}
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}&notice=login_required`);
      }
      return false;
    }

    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.product?.id === product.id && item.size === size
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, size, quantity }];
      }
    });

    showToast(`Added ${product.name} (${size}) to your bag`);
    setIsCartOpen(true);
    return true;
  };

  const removeFromCart = (productId, size) => {
    setCartItems(prev => prev.filter(
      item => !(item.product?.id === productId && item.size === size)
    ));
  };

  const updateQuantity = (productId, size, delta) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.product?.id === productId && item.size === size) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    if (user) {
      try {
        localStorage.removeItem(`matchday_cart_${user.id}`);
      } catch (e) {}
    }
  };

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.product?.price * item.quantity), 0);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      setIsCartOpen,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      toggleCart: () => setIsCartOpen(prev => !prev),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalCount,
      subtotal,
      freeShippingProgress,
      amountNeededForFreeShipping,
      toastMessage
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

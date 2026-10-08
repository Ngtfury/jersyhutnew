'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { X, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { decrementProductStock } from '../lib/supabase';

export default function CartDrawer({ onCheckout }) {
  const router = useRouter();
  const {
    cartItems,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    freeShippingProgress,
    amountNeededForFreeShipping
  } = useCart();

  const handleContinueShopping = () => {
    closeCart();
    router.push('/collections/half-sleeves');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${isCartOpen ? 'open' : ''}`}
        onClick={closeCart}
      />

      {/* Slide-out drawer */}
      <aside
        className={`cart-drawer ${isCartOpen ? 'open' : ''}`}
        aria-label="Shopping Bag Drawer"
        role="dialog"
      >
        {/* Drawer Header */}
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={18} />
            <h2 className="cart-header-title">YOUR BAG</h2>
            <span style={{ fontSize: '0.75rem', color: '#666' }}>({cartItems.length})</span>
          </div>
          <button
            onClick={closeCart}
            aria-label="Close bag"
            style={{ padding: '0.3rem', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="free-shipping-bar">
          {amountNeededForFreeShipping === 0 ? (
            <p style={{ fontWeight: 600, color: '#008a00' }}>
              ✓ You have unlocked FREE Express Shipping!
            </p>
          ) : (
            <p>
              Add <strong>₹{amountNeededForFreeShipping}</strong> more to unlock <strong>FREE SHIPPING</strong>
            </p>
          )}
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="cart-items-scroll">
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', padding: '2rem 1rem' }}>
              <ShoppingBag size={48} strokeWidth={1} style={{ margin: '0 auto 1rem', color: '#aaa' }} />
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Your bag is empty
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '1.5rem' }}>
                Discover our newest football kits and limited edition drops.
              </p>
              <button
                onClick={handleContinueShopping}
                className="btn btn-primary"
              >
                START SHOPPING
              </button>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div key={`${item.product.id}-${item.size}-${index}`} className="cart-item">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="cart-item-img"
                />

                <div className="cart-item-info">
                  <h4 className="cart-item-name">{item.product.name}</h4>
                  <span className="cart-item-meta">Size: {item.size}</span>
                  <span className="cart-item-price">₹{item.product.price}</span>

                  <div className="cart-qty-ctrl">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.size, -1)}
                      className="cart-qty-btn"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="cart-qty-val">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.size, 1)}
                      className="cart-qty-btn"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id, item.size)}
                  className="cart-item-remove"
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal-row">
              <span style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>SUBTOTAL</span>
              <span>₹{subtotal}</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#777' }}>
              Taxes included. Shipping calculated at checkout.
            </p>

            <button
              onClick={async () => {
                const itemsToOrder = [...cartItems];
                decrementProductStock(itemsToOrder).catch(console.error);
                closeCart();
                onCheckout ? onCheckout() : alert("Thank you for choosing Jersey Hut! Routing to secure Indian UPI & Card Payment Gateway...");
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', marginTop: '0.4rem' }}
              id="cart-checkout-btn"
            >
              PROCEED TO CHECKOUT
              <ArrowRight size={14} />
            </button>

            <button
              onClick={handleContinueShopping}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              CONTINUE SHOPPING
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

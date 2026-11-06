'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShoppingBag, Mail, ArrowRight, Package, Truck, ShieldCheck } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order_number') || 'MD-CONFIRMED';
  const paymentId = searchParams.get('payment_id') || 'VERIFIED';
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(`order_${orderNumber}`);
        if (saved) {
          setOrderDetails(JSON.parse(saved));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [orderNumber]);

  return (
    <div style={{ minHeight: '85vh', backgroundColor: '#fafafa', padding: '3rem 1rem 6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '640px', width: '100%', backgroundColor: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '16px', padding: '2.5rem 2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        
        {/* Animated Check */}
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#16a34a' }}>
          <CheckCircle2 size={44} />
        </div>

        <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#16a34a', marginBottom: '0.35rem' }}>
          Payment Verified & Confirmed
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: '0 0 0.75rem', color: '#09090b' }}>
          Your Kit Is Being Prepared!
        </h1>

        <p style={{ fontSize: '0.875rem', color: '#666', lineHeight: 1.5, margin: '0 auto 2rem', maxWidth: '460px' }}>
          Thank you for choosing Matchday. Your payment via Razorpay has been processed securely, and your jersey order is queued for fulfillment.
        </p>

        {/* Order Reference Box */}
        <div style={{ backgroundColor: '#f4f4f5', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #e4e4e7', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#71717a', fontWeight: 600 }}>Order Number</span>
            <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#09090b', fontFamily: 'monospace' }}>{orderNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #e4e4e7', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#71717a', fontWeight: 600 }}>Razorpay Transaction</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#18181b', fontFamily: 'monospace' }}>{paymentId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#71717a', fontWeight: 600 }}>Delivery Mode</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Truck size={14} /> {orderDetails?.customer?.shipping_method || orderDetails?.shippingMethod || 'Postal Courier Delivery'}
            </span>
          </div>
        </div>

        {/* Email Tracking Notice Box */}
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '10px',
          padding: '1.15rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.85rem',
          textAlign: 'left'
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#16a34a' }}>
            <Mail size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#14532d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tracking Link Available on Email
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#166534', marginTop: '0.25rem', lineHeight: 1.45 }}>
              Your official tracking ID and tracking link will be available on your registered email shortly once your kit is dispatched.
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <Link
            href="/collections/all"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: '#09090b',
              color: '#ffffff',
              padding: '0.9rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.875rem',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            <ShoppingBag size={18} />
            <span>Continue Shopping Kits</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading confirmation...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}


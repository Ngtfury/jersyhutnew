'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart, FREE_SHIPPING_THRESHOLD } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Truck, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  ShoppingBag,
  AlertCircle,
  Zap,
  Plus
} from 'lucide-react';

const INDIAN_STATES = [
  'Kerala', 'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Delhi', 'Andhra Pradesh', 
  'Telangana', 'Goa', 'Gujarat', 'West Bengal', 'Punjab', 'Rajasthan', 
  'Uttar Pradesh', 'Madhya Pradesh', 'Haryana', 'Bihar', 'Odisha', 'Assam', 
  'Jammu & Kashmir', 'Himachal Pradesh', 'Uttarakhand', 'Other'
];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);

    const existing = document.getElementById('razorpay-script');
    if (existing) {
      if (window.Razorpay) return resolve(true);
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, subtotal, clearCart, addToCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStatus, setSimStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Shipping form state
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: 'Kerala',
    pincode: ''
  });

  // If bag contains the test jersey (price <= 10) or subtotal >= 999, waive shipping fee
  const isTestItemOnly = cartItems.length > 0 && cartItems.every(i => (i.product?.price || 0) <= 10);
  const hasTestItem = cartItems.some(i => (i.product?.price || 0) <= 10);
  const shippingFee = (subtotal >= FREE_SHIPPING_THRESHOLD || isTestItemOnly) ? 0 : 70;
  const totalAmount = subtotal + shippingFee;

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  const isTestMode = keyId.startsWith('rzp_test_');

  useEffect(() => {
    setMounted(true);

    if (!authLoading && !user) {
      router.push('/login?redirect=/checkout&notice=login_required');
      return;
    }

    if (user) {
      setForm(prev => ({
        ...prev,
        email: prev.email || user.email || '',
        name: prev.name || user.user_metadata?.full_name || ''
      }));
    }

    // Dynamically inject Razorpay Checkout script
    loadRazorpayScript();
  }, [user, authLoading, router]);

  const handleAddTestJersey = () => {
    addToCart({
      id: '11111111-1111-1111-1111-111111111111',
      name: '₹1 LIVE TEST JERSEY (Matchday Test Kit)',
      price: 1,
      original_price: 999,
      images: ['https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80'],
      category: 'HALF SLEEVES',
      sizes: ['FREE', 'S', 'M', 'L', 'XL']
    }, 'FREE', 1);
  };

  if (!mounted || authLoading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <ShoppingBag size={56} style={{ color: '#888', marginBottom: '1rem' }} />
        <h2 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Your bag is empty</h2>
        <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: '420px' }}>
          Add official matchday jerseys before proceeding to checkout, or add our ₹1 test kit to test the Razorpay payment gateway immediately.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          <Link href="/collections/all" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            Explore Collections
          </Link>
          <button
            type="button"
            onClick={handleAddTestJersey}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Zap size={16} /> Add ₹1 Test Kit to Bag
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Form validations
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim() || !form.pincode.trim()) {
      setErrorMsg('Please complete all delivery fields before proceeding.');
      return;
    }

    if (form.phone.trim().replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (form.pincode.trim().length !== 6) {
      setErrorMsg('Please enter a valid 6-digit postal PIN code.');
      return;
    }

    setLoading(true);

    if (typeof window.Razorpay === 'undefined') {
      const loaded = await loadRazorpayScript();
      if (!loaded || typeof window.Razorpay === 'undefined') {
        setErrorMsg('Razorpay payment gateway could not be loaded. Please check your internet connection.');
        setLoading(false);
        return;
      }
    }

    try {
      // Step 1: Create Order on backend
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          customer: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim()
          },
          shippingAddress: {
            address: form.address.trim(),
            city: form.city.trim(),
            state: form.state,
            pincode: form.pincode.trim()
          },
          userId: user?.id || null,
          subtotal,
          shippingFee,
          totalAmount
        })
      });

      const orderData = await res.json();

      if (!res.ok || !orderData.orderId) {
        throw new Error(orderData.error || 'Failed to initialize payment gateway');
      }

      // Step 2: Open Razorpay checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'MATCHDAY',
        description: `Order ${orderData.orderNumber} — Official Matchday Kits`,
        order_id: orderData.orderId,
        prefill: {
          name: form.name.trim(),
          contact: form.phone.trim(),
          email: form.email.trim() || ''
        },
        theme: {
          color: '#09090b'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        },
        handler: async (response) => {
          try {
            // Step 3: Verify signature on backend
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderNumber: orderData.orderNumber,
                items: cartItems
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              // Store summary for order success page
              if (typeof window !== 'undefined') {
                sessionStorage.setItem(`order_${orderData.orderNumber}`, JSON.stringify({
                  orderNumber: orderData.orderNumber,
                  paymentId: response.razorpay_payment_id,
                  totalAmount,
                  customer: form,
                  items: cartItems
                }));
              }

              // Clear bag & route to confirmation
              clearCart();
              router.push(`/order-success?order_number=${orderData.orderNumber}&payment_id=${response.razorpay_payment_id}`);
            } else {
              throw new Error(verifyData.error || 'Payment signature could not be verified');
            }
          } catch (verifyErr) {
            console.error('Verification error:', verifyErr);
            setErrorMsg(verifyErr.message || 'Payment verification encountered an issue. Contact support.');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setErrorMsg(`Payment failed: ${resp.error.description || resp.error.reason || 'Transaction declined'}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'Could not launch checkout');
      setLoading(false);
    }
  };

  const handleSimulatedPayment = async () => {
    setErrorMsg('');
    setSimStatus('Preparing simulated order...');
    setIsSimulating(true);

    // Auto-fill sensible test details if fields are currently blank so the test button ALWAYS works
    const customerName = form.name.trim() || user?.user_metadata?.full_name || 'Matchday Test Customer';
    const customerPhone = form.phone.trim().replace(/\D/g, '').length >= 10 ? form.phone.trim() : '9072748730';
    const customerEmail = form.email.trim() || user?.email || 'matchdayjerseysindia@gmail.com';
    const deliveryAddress = form.address.trim() || 'Matchday Test Arena, 42 Heritage Lane';
    const deliveryCity = form.city.trim() || 'Kochi';
    const deliveryState = form.state || 'Kerala';
    const deliveryPincode = form.pincode.trim().length === 6 ? form.pincode.trim() : '682001';

    // Synchronize form state so the user sees the filled details on screen
    const resolvedForm = {
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      address: deliveryAddress,
      city: deliveryCity,
      state: deliveryState,
      pincode: deliveryPincode
    };
    setForm(resolvedForm);

    try {
      setSimStatus('1/3 Creating test order on server...');
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          customer: {
            name: resolvedForm.name,
            phone: resolvedForm.phone,
            email: resolvedForm.email
          },
          shippingAddress: {
            address: resolvedForm.address,
            city: resolvedForm.city,
            state: resolvedForm.state,
            pincode: resolvedForm.pincode
          },
          userId: user?.id || null,
          subtotal,
          shippingFee,
          totalAmount,
          is_simulated: true
        })
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.orderId) {
        throw new Error(orderData.error || 'Failed to initialize test order');
      }

      const simulatedPaymentId = `pay_test_${Date.now().toString(36)}`;

      setSimStatus(`2/3 Verifying payment (${orderData.orderNumber}) & dispatching email...`);

      // Call verify endpoint with is_simulated: true (which skips stock deduction and triggers Resend confirmation email)
      const verifyRes = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: simulatedPaymentId,
          razorpay_signature: 'simulated_test_signature',
          is_simulated: true,
          orderNumber: orderData.orderNumber,
          items: cartItems,
          customer: resolvedForm,
          shippingAddress: {
            address: resolvedForm.address,
            city: resolvedForm.city,
            state: resolvedForm.state,
            pincode: resolvedForm.pincode
          },
          subtotal,
          shippingFee,
          totalAmount
        })
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.success) {
        setSimStatus('3/3 Order confirmed! Redirecting to confirmation page...');
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`order_${orderData.orderNumber}`, JSON.stringify({
            orderNumber: orderData.orderNumber,
            paymentId: simulatedPaymentId,
            totalAmount,
            customer: resolvedForm,
            items: cartItems
          }));
        }

        clearCart();
        setTimeout(() => {
          router.push(`/order-success?order_number=${orderData.orderNumber}&payment_id=${simulatedPaymentId}`);
        }, 500);
      } else {
        throw new Error(verifyData.error || 'Test payment verification encountered an issue');
      }
    } catch (err) {
      console.error('Test simulation error:', err);
      setErrorMsg(err.message || 'Could not complete test simulation');
      setSimStatus('');
      setIsSimulating(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', padding: '2rem 1rem 5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e5e5' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, color: '#666', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Store
          </Link>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: '#16a34a', textTransform: 'uppercase' }}>
            <ShieldCheck size={16} /> 256-Bit Encrypted Checkout
          </div>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.875rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          
          {/* Left Form: Delivery Details */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #eaeaea', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} /> Shipping & Contact Details
            </h2>

            <form onSubmit={handlePayment} id="checkout-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: '0.4rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Hafees Mytheen"
                  required
                  style={{ width: '100%', padding: '0.75rem 0.875rem', border: '1px solid #d4d4d8', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: '0.4rem' }}>
                    Phone (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9072748730"
                    required
                    style={{ width: '100%', padding: '0.75rem 0.875rem', border: '1px solid #d4d4d8', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: '0.4rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@email.com"
                    style={{ width: '100%', padding: '0.75rem 0.875rem', border: '1px solid #d4d4d8', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: '0.4rem' }}>
                  Flat / House / Street Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Building, Street name, Locality"
                  required
                  style={{ width: '100%', padding: '0.75rem 0.875rem', border: '1px solid #d4d4d8', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: '0.4rem' }}>
                    City / District *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Kochi"
                    required
                    style={{ width: '100%', padding: '0.75rem 0.875rem', border: '1px solid #d4d4d8', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: '0.4rem' }}>
                    State *
                  </label>
                  <select
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem 0.875rem', border: '1px solid #d4d4d8', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}
                  >
                    {INDIAN_STATES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: '0.4rem' }}>
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="682001"
                    maxLength={6}
                    required
                    style={{ width: '100%', padding: '0.75rem 0.875rem', border: '1px solid #d4d4d8', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Payment Option Card */}
              <div style={{ marginTop: '0.5rem', padding: '1rem', border: '2px solid #09090b', borderRadius: '8px', backgroundColor: '#fcfcfc' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.875rem', textTransform: 'uppercase' }}>
                      Razorpay Official Gateway
                    </span>
                  </div>
                  <span style={{ fontSize: '0.6875rem', backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    Instant & Zero Extra Fee
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#666', lineHeight: 1.4 }}>
                  Pay smoothly using <strong>Google Pay, PhonePe, Paytm, BHIM UPI, Cards (Visa, Mastercard, RuPay), NetBanking</strong>.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || isSimulating}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: '#09090b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: (loading || isSimulating) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                  opacity: (loading || isSimulating) ? 0.7 : 1
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Connecting to Razorpay...</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Pay ₹{totalAmount} via Razorpay</span>
                  </>
                )}
              </button>

              {/* Test Mode Simulator Box */}
              {isTestMode && (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  border: '1.5px dashed #f59e0b',
                  backgroundColor: '#fffbeb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <Zap size={15} /> Test Mode Sandbox Active
                    </div>
                    <span style={{ fontSize: '0.6875rem', backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, border: '1px solid #fde68a' }}>
                      ₹0 ZERO MONEY
                    </span>
                  </div>
                  <p style={{ margin: '0 0 0.85rem', fontSize: '0.75rem', color: '#78350f', lineHeight: 1.45 }}>
                    Test the complete order process without opening Razorpay or paying money. Click below to simulate instant payment verification, record order in Supabase (inventory stock is preserved), and dispatch confirmation emails to your inbox!
                  </p>
                  <button
                    type="button"
                    onClick={handleSimulatedPayment}
                    disabled={loading || isSimulating}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      backgroundColor: '#f59e0b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      cursor: (loading || isSimulating) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)'
                    }}
                  >
                    {isSimulating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>{simStatus || 'Simulating Test Verification...'}</span>
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        <span>⚡ Pay Test (₹0 / Skip Gateway)</span>
                      </>
                    )}
                  </button>

                  {simStatus && (
                    <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: '#b45309', fontWeight: 600, textAlign: 'center', backgroundColor: '#fef3c7', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                      {simStatus}
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #eaeaea', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} /> Order Summary ({cartItems.length} {cartItems.length === 1 ? 'kit' : 'kits'})
              </h2>
              {!hasTestItem && (
                <button
                  type="button"
                  onClick={handleAddTestJersey}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#d97706',
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                  title="Add ₹1 Live Test Jersey to test payment"
                >
                  <Plus size={12} /> Add ₹1 Test Kit
                </button>
              )}
            </div>

            {hasTestItem && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={13} color="#16a34a" />
                <span>₹1 Test Kit active: Express Courier shipping is 100% free!</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '360px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
              {cartItems.map((item, idx) => (
                <div key={`${item.product.id}-${item.size}-${idx}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>
                  <img
                    src={item.product.images?.[0] || '/images/hero-home.jpg'}
                    alt={item.product.name}
                    style={{ width: '56px', height: '64px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#f4f4f5' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem', color: '#111' }}>
                      {item.product.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666', display: 'flex', gap: '0.75rem' }}>
                      <span>Size: <strong>{item.size}</strong></span>
                      <span>Qty: <strong>{item.quantity}</strong></span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#09090b' }}>
                    ₹{item.product.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', borderTop: '1px solid #e5e5e5', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                <span>Express Courier Shipping</span>
                <span>{shippingFee === 0 ? <strong style={{ color: '#16a34a' }}>FREE</strong> : `₹${shippingFee}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: 800, color: '#09090b', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px dashed #d4d4d8' }}>
                <span>Total Amount</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>

            {/* Trust badge */}
            <div style={{ marginTop: '1.5rem', padding: '0.875rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.4 }}>
                <strong>Official Matchday Authenticity:</strong> Premium player & stadium edition jersey quality with verified payment security.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


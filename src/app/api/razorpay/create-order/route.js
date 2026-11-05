import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabase } from '../../../../lib/supabase';

function getRazorpayInstance() {
  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  return new Razorpay({
    key_id,
    key_secret,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, customer, shippingAddress, totalAmount, subtotal, shippingFee, userId, is_simulated } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (totalAmount === undefined || totalAmount === null || Number(totalAmount) < 0) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    // Razorpay accepts amounts in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(totalAmount) * 100);

    // Generate human-readable Matchday order number: e.g. MD-849201
    const orderNumber = `MD-${Date.now().toString().slice(-5)}-${Math.floor(100 + Math.random() * 900)}`;

    // Mode 1: Simulated Test Order (skips external Razorpay API, generates instant test order)
    if (is_simulated) {
      const simulatedOrderId = `order_sim_${Date.now()}`;

      if (supabase) {
        try {
          const orderPayload = {
            order_number: orderNumber,
            customer_name: customer?.name || 'Matchday Test Customer',
            customer_email: customer?.email || null,
            customer_phone: customer?.phone || '',
            shipping_address: shippingAddress || {},
            items: items || [],
            subtotal: Number(subtotal || totalAmount),
            shipping_fee: Number(shippingFee || 0),
            total_amount: Number(totalAmount),
            payment_method: 'RAZORPAY_TEST_SIMULATED',
            payment_status: 'pending',
            status: 'pending',
            razorpay_order_id: simulatedOrderId,
            created_at: new Date().toISOString()
          };

          if (userId) {
            orderPayload.user_id = userId;
          }

          await supabase.from('orders').insert(orderPayload);
        } catch (dbErr) {
          console.warn('⚠️ Supabase simulated order record insertion notice:', dbErr?.message || dbErr);
        }
      }

      return NextResponse.json({
        success: true,
        orderId: simulatedOrderId,
        amount: amountInPaise,
        currency: 'INR',
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_simulated',
        orderNumber,
        is_simulated: true
      });
    }

    // Mode 2: Live / Official Razorpay Gateway
    const razorpay = getRazorpayInstance();

    const razorpayOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now().toString().slice(-10)}`,
      notes: {
        order_number: orderNumber,
        customer_name: customer?.name || '',
        customer_phone: customer?.phone || '',
        customer_email: customer?.email || '',
        shipping_city: shippingAddress?.city || '',
        items_count: String(items.length)
      }
    };

    const razorpayOrder = await razorpay.orders.create(razorpayOptions);

    // Persist pending order to Supabase orders table
    if (supabase) {
      try {
        const orderPayload = {
          order_number: orderNumber,
          customer_name: customer?.name || 'Customer',
          customer_email: customer?.email || null,
          customer_phone: customer?.phone || '',
          shipping_address: shippingAddress || {},
          items: items || [],
          subtotal: Number(subtotal || totalAmount),
          shipping_fee: Number(shippingFee || 0),
          total_amount: Number(totalAmount),
          payment_method: 'RAZORPAY',
          payment_status: 'pending',
          status: 'pending',
          razorpay_order_id: razorpayOrder.id,
          created_at: new Date().toISOString()
        };

        if (userId) {
          orderPayload.user_id = userId;
        }

        await supabase.from('orders').insert(orderPayload);
      } catch (dbErr) {
        console.warn('⚠️ Supabase order record insertion notice:', dbErr?.message || dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
      orderNumber
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    const rzpDesc = error?.error?.description || error?.description || error?.message;
    const statusCode = error?.statusCode || 500;

    let friendlyMessage = rzpDesc || 'Failed to initialize payment gateway';
    if (statusCode === 401 || (typeof rzpDesc === 'string' && rzpDesc.toLowerCase().includes('auth'))) {
      friendlyMessage = 'Razorpay Authentication Failed (401): Please check your Razorpay Key ID and Secret in .env.local. In the Razorpay Dashboard (Test Mode), generate a new Test Key under Account & Settings > API Keys and update .env.local.';
    }

    return NextResponse.json(
      { error: friendlyMessage, details: error?.error || null },
      { status: statusCode }
    );
  }
}


import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { supabase, decrementProductStock } from '../../../../lib/supabase';
import { sendOrderConfirmationEmail } from '../../../../lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vbahumjewlpodkuktzqb.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getSupabaseClient() {
  if (serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
  return supabase;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderNumber,
      items,
      is_simulated
    } = body;

    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    const isTestMode = key_id.startsWith('rzp_test_');

    // Handle 1-click test simulation in test mode
    if (is_simulated) {
      if (!isTestMode) {
        return NextResponse.json(
          { error: 'Simulated payment is only permitted when Razorpay is in Test Mode.' },
          { status: 403 }
        );
      }
    } else {
      // Normal transaction verification requires all parameters
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json(
          { error: 'Missing required Razorpay transaction parameters' },
          { status: 400 }
        );
      }

      const key_secret = process.env.RAZORPAY_KEY_SECRET;

      // Verify cryptographic signature
      const signaturePayload = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', key_secret)
        .update(signaturePayload)
        .digest('hex');

      const isSignatureValid = expectedSignature === razorpay_signature;

      if (!isSignatureValid) {
        console.error('Razorpay signature mismatch!');
        return NextResponse.json(
          { error: 'Payment signature verification failed. Untrusted transaction.' },
          { status: 400 }
        );
      }
    }

    const actualPaymentId = is_simulated
      ? (razorpay_payment_id || `pay_sim_${Date.now()}`)
      : razorpay_payment_id;

    let confirmedOrder = null;
    const dbClient = getSupabaseClient();

    // Update or Insert Supabase order status (guaranteeing order is stored)
    if (dbClient) {
      try {
        const { data: existingOrder } = await dbClient
          .from('orders')
          .select('*')
          .eq('razorpay_order_id', razorpay_order_id)
          .maybeSingle();

        if (existingOrder) {
          const updatePayload = {
            payment_status: 'paid',
            status: 'confirmed',
            razorpay_payment_id: actualPaymentId,
            razorpay_signature: razorpay_signature || 'captured'
          };

          // Enrich customer details if missing on existing record
          if ((!existingOrder.customer_name || existingOrder.customer_name === 'Customer') && body.customer?.name) {
            updatePayload.customer_name = body.customer.name.trim();
          }
          if (!existingOrder.customer_phone && body.customer?.phone) {
            updatePayload.customer_phone = body.customer.phone.trim();
          }
          if (!existingOrder.customer_email && body.customer?.email) {
            updatePayload.customer_email = body.customer.email.trim();
          }
          if (body.shippingAddress && (!existingOrder.shipping_address || Object.keys(existingOrder.shipping_address).length === 0)) {
            updatePayload.shipping_address = body.shippingAddress;
          }
          if (body.userId && !existingOrder.user_id) {
            updatePayload.user_id = body.userId;
          }

          const { data: updatedOrder, error: updErr } = await dbClient
            .from('orders')
            .update(updatePayload)
            .eq('id', existingOrder.id)
            .select()
            .single();

          if (updErr) {
            console.error('⚠️ Failed to update existing order to paid:', updErr);
            confirmedOrder = { ...existingOrder, ...updatePayload };
          } else {
            confirmedOrder = updatedOrder;
          }
        } else {
          // Fallback: If pending order record was missing, insert confirmed order immediately
          console.log(`ℹ️ Pending order ${razorpay_order_id} not found in DB; creating confirmed record.`);
          const orderPayload = {
            order_number: orderNumber || `MD-${Date.now().toString().slice(-5)}`,
            customer_name: body.customer?.name?.trim() || 'Customer',
            customer_email: body.customer?.email?.trim() || null,
            customer_phone: body.customer?.phone?.trim() || '',
            shipping_address: body.shippingAddress || {},
            user_id: body.userId || null,
            items: items || [],
            subtotal: Number(body.subtotal || body.totalAmount || 0),
            shipping_fee: Number(body.shippingFee || 0),
            total_amount: Number(body.totalAmount || 0),
            payment_method: is_simulated ? 'RAZORPAY_TEST_SIMULATED' : 'RAZORPAY',
            payment_status: 'paid',
            status: 'confirmed',
            razorpay_order_id: razorpay_order_id,
            razorpay_payment_id: actualPaymentId,
            razorpay_signature: razorpay_signature || 'captured',
            created_at: new Date().toISOString()
          };

          const { data: insertedOrder, error: insErr } = await dbClient
            .from('orders')
            .insert(orderPayload)
            .select()
            .single();

          if (insErr) {
            console.error('⚠️ Failed to create fallback confirmed order in DB:', insErr);
            confirmedOrder = orderPayload;
          } else {
            confirmedOrder = insertedOrder;
            console.log('✅ Fallback confirmed order stored successfully:', confirmedOrder?.order_number);
          }
        }
      } catch (dbErr) {
        console.error('⚠️ Supabase order record processing notice:', dbErr?.message || dbErr);
      }

      // Decrement stock for purchased items (SKIPPED for simulated test orders to preserve inventory!)
      if (!is_simulated) {
        try {
          if (items && Array.isArray(items) && items.length > 0) {
            await decrementProductStock(items);
          }
        } catch (stockErr) {
          console.warn('⚠️ Product stock decrement notice:', stockErr?.message || stockErr);
        }
      } else {
        console.log('⚡ Simulated test payment: Stock deduction skipped to preserve inventory.');
      }
    }

    // Trigger order confirmation email via Resend
    try {
      const orderToEmail = confirmedOrder || {
        order_number: orderNumber,
        razorpay_payment_id: actualPaymentId,
        items: items || [],
        customer_name: body.customer?.name?.trim() || 'Customer',
        customer_phone: body.customer?.phone?.trim() || '',
        customer_email: body.customer?.email?.trim() || '',
        shipping_address: body.shippingAddress || {},
        total_amount: body.totalAmount || 0,
        subtotal: body.subtotal || 0,
        shipping_fee: body.shippingFee || 0,
        created_at: new Date().toISOString()
      };

      const emailResult = await sendOrderConfirmationEmail(orderToEmail);
      if (emailResult.success && dbClient && confirmedOrder?.id) {
        try {
          const currentAddr = (confirmedOrder.shipping_address && typeof confirmedOrder.shipping_address === 'object')
            ? confirmedOrder.shipping_address
            : {};
          await dbClient
            .from('orders')
            .update({
              shipping_address: {
                ...currentAddr,
                confirmation_email_sent: true
              }
            })
            .eq('id', confirmedOrder.id);
        } catch (e) {}
      }
    } catch (emailErr) {
      console.warn('⚠️ Order confirmation email dispatch notice:', emailErr?.message || emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and confirmed',
      orderNumber,
      paymentId: actualPaymentId
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error?.message || 'Server error verifying payment' },
      { status: 500 }
    );
  }
}

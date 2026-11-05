import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase, decrementProductStock } from '../../../../lib/supabase';
import { sendOrderConfirmationEmail } from '../../../../lib/email';

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

    // Update Supabase order status
    if (supabase) {
      try {
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            razorpay_payment_id: actualPaymentId,
            razorpay_signature: razorpay_signature || 'simulated_test_signature'
          })
          .eq('razorpay_order_id', razorpay_order_id);

        // Fetch full order record for email dispatch
        const { data: dbOrder } = await supabase
          .from('orders')
          .select('*')
          .eq('razorpay_order_id', razorpay_order_id)
          .single();

        confirmedOrder = dbOrder;
      } catch (dbErr) {
        console.warn('⚠️ Supabase order status update notice:', dbErr?.message || dbErr);
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
        customer_name: body.customer?.name || 'Valued Customer',
        customer_phone: body.customer?.phone || '',
        customer_email: body.customer?.email || '',
        shipping_address: body.shippingAddress || {},
        total_amount: body.totalAmount || 0,
        subtotal: body.subtotal || 0,
        shipping_fee: body.shippingFee || 0,
        created_at: new Date().toISOString()
      };

      const emailResult = await sendOrderConfirmationEmail(orderToEmail);
      if (emailResult.success && supabase && confirmedOrder?.id) {
        try {
          const currentAddr = (confirmedOrder.shipping_address && typeof confirmedOrder.shipping_address === 'object')
            ? confirmedOrder.shipping_address
            : {};
          await supabase
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

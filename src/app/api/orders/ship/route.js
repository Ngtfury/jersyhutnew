import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { sendOrderShippedEmail } from '../../../../lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, orderNumber, courierName, trackingId, trackingUrl } = body;

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { error: 'Order identifier (orderId or orderNumber) is required' },
        { status: 400 }
      );
    }

    if (!trackingId || !trackingId.trim()) {
      return NextResponse.json(
        { error: 'Tracking ID / AWB number is required' },
        { status: 400 }
      );
    }

    const cleanCourier = (courierName || 'Express Courier').trim();
    const cleanTrackingId = trackingId.trim();
    const cleanTrackingUrl = (trackingUrl || '').trim();
    const shippedAt = new Date().toISOString();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection is unavailable' },
        { status: 500 }
      );
    }

    // 1. Fetch current order from Supabase
    let query = supabase.from('orders').select('*');
    if (orderId) {
      query = query.eq('id', orderId);
    } else {
      query = query.eq('order_number', orderNumber);
    }

    const { data: order, error: fetchErr } = await query.single();
    if (fetchErr || !order) {
      return NextResponse.json(
        { error: `Order not found in database: ${fetchErr?.message || 'Invalid ID'}` },
        { status: 404 }
      );
    }

    // 2. Prepare merged shipping_address JSONB
    const currentAddress = (order.shipping_address && typeof order.shipping_address === 'object')
      ? order.shipping_address
      : {};

    const updatedAddress = {
      ...currentAddress,
      courier_name: cleanCourier,
      tracking_id: cleanTrackingId,
      tracking_url: cleanTrackingUrl,
      shipped_at: shippedAt
    };

    // 3. Update Supabase order
    let updatedOrder = null;
    try {
      // First attempt: update status, shipping_address JSONB, and top-level columns if they exist
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'shipped',
          courier_name: cleanCourier,
          tracking_id: cleanTrackingId,
          tracking_url: cleanTrackingUrl,
          shipping_address: updatedAddress
        })
        .eq('id', order.id)
        .select()
        .single();

      if (error) {
        // If top-level columns are not created in PostgreSQL table yet,
        // safely update status and shipping_address JSONB
        console.warn('Notice: Updating status and shipping_address JSONB (top-level columns optional):', error.message);
        const { data: fbData, error: fbErr } = await supabase
          .from('orders')
          .update({
            status: 'shipped',
            shipping_address: updatedAddress
          })
          .eq('id', order.id)
          .select()
          .single();

        if (fbErr) throw fbErr;
        updatedOrder = fbData;
      } else {
        updatedOrder = data;
      }
    } catch (dbErr) {
      console.error('Failed to update order status in Supabase:', dbErr);
      return NextResponse.json(
        { error: `Database update failed: ${dbErr?.message || dbErr}` },
        { status: 500 }
      );
    }

    // 4. Send customer shipped & tracking notification email via Resend
    let emailResult = { success: false };
    try {
      const orderPayloadForEmail = {
        ...order,
        ...(updatedOrder || {}),
        tracking_id: cleanTrackingId,
        tracking_url: cleanTrackingUrl,
        courier_name: cleanCourier,
        shipping_address: updatedAddress
      };

      emailResult = await sendOrderShippedEmail(orderPayloadForEmail, {
        tracking_id: cleanTrackingId,
        tracking_url: cleanTrackingUrl,
        courier_name: cleanCourier
      });

      // Mark shipped_email_sent in shipping_address JSONB if email succeeded
      if (emailResult.success) {
        try {
          await supabase
            .from('orders')
            .update({
              shipping_address: {
                ...updatedAddress,
                shipped_email_sent: true
              }
            })
            .eq('id', order.id);
        } catch (e) {}
      }
    } catch (emailErr) {
      console.error('Failed to dispatch shipping email:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated to SHIPPED and tracking email sent successfully',
      order: updatedOrder || { ...order, status: 'shipped', shipping_address: updatedAddress },
      emailSent: emailResult.success,
      emailResult
    });
  } catch (err) {
    console.error('Ship order API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error while processing order shipment' },
      { status: 500 }
    );
  }
}

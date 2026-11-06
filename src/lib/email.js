import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
export const resend = new Resend(resendApiKey || 're_placeholder_key');

export const DEFAULT_STORE_EMAIL = process.env.STORE_NOTIFICATION_EMAIL || 'matchdayjerseysindia@gmail.com';
export const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Matchday Jerseys <orders@matchdayjerseys.com>';

/**
 * Safely extracts and normalizes customer name, phone, email, and shipping address from an order object.
 */
export function resolveOrderDetails(order = {}) {
  let addressObj = {};
  if (typeof order.shipping_address === 'string') {
    try {
      addressObj = JSON.parse(order.shipping_address);
    } catch (e) {
      addressObj = {};
    }
  } else if (order.shipping_address && typeof order.shipping_address === 'object') {
    addressObj = order.shipping_address;
  }

  // Address fields can be directly on addressObj or under nested shippingAddress
  const nested = (addressObj.shippingAddress && typeof addressObj.shippingAddress === 'object')
    ? addressObj.shippingAddress
    : {};

  const addressLine = (
    addressObj.address ||
    addressObj.address_line ||
    addressObj.street ||
    addressObj.line1 ||
    nested.address ||
    nested.address_line ||
    ''
  ).trim();

  const city = (
    addressObj.city ||
    addressObj.district ||
    nested.city ||
    ''
  ).trim();

  const state = (
    addressObj.state ||
    nested.state ||
    ''
  ).trim();

  const pincode = (
    addressObj.pincode ||
    addressObj.postal_code ||
    addressObj.zip ||
    nested.pincode ||
    ''
  ).trim();

  const shippingMethod = (
    addressObj.shipping_method ||
    addressObj.delivery_method ||
    nested.shipping_method ||
    ''
  ).trim();

  // Resolve Customer Name (never default to 'Valued Customer')
  let customerName = (order.customer_name || '').trim();
  if (!customerName || customerName.toLowerCase() === 'valued customer' || customerName.toLowerCase() === 'customer') {
    customerName = (
      order.customer?.name ||
      addressObj.customer_name ||
      addressObj.name ||
      nested.name ||
      nested.customer_name ||
      ''
    ).trim();
  }
  // If still empty, use email prefix or default
  if (!customerName) {
    const emailToUse = order.customer_email || order.customer?.email || addressObj.email || '';
    if (emailToUse && emailToUse.includes('@')) {
      const prefix = emailToUse.split('@')[0];
      customerName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    } else {
      customerName = 'Customer';
    }
  }

  // Resolve Customer Phone
  const customerPhone = (
    order.customer_phone ||
    order.customer?.phone ||
    addressObj.phone ||
    addressObj.contact ||
    nested.phone ||
    ''
  ).trim();

  // Resolve Customer Email
  const customerEmail = (
    order.customer_email ||
    order.customer?.email ||
    addressObj.email ||
    nested.email ||
    ''
  ).trim();

  return {
    customerName,
    customerPhone,
    customerEmail,
    addressLine,
    city,
    state,
    pincode,
    shippingMethod,
    parsedAddress: addressObj
  };
}

/**
 * Builds a clean, responsive HTML email template for confirmed Matchday orders.
 */
export function buildOrderConfirmationHtml(order) {
  const {
    order_number = 'MD-ORDER',
    items = [],
    subtotal = 0,
    shipping_fee = 0,
    total_amount = 0,
    razorpay_payment_id = '',
    created_at = new Date().toISOString()
  } = order;

  const {
    customerName,
    customerPhone,
    addressLine,
    city,
    state,
    pincode,
    shippingMethod
  } = resolveOrderDetails(order);

  const orderDate = new Date(created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const hasDestination = Boolean(addressLine || city || pincode);

  const itemsHtml = Array.isArray(items)
    ? items.map(item => {
        const prodName = item.product?.name || item.name || 'Official Matchday Jersey';
        const size = item.size || 'M';
        const qty = item.quantity || 1;
        const price = item.product?.price || item.price || 0;
        const lineTotal = price * qty;
        const img = item.product?.images?.[0] || '';

        return `
          <tr>
            <td style="padding: 14px 0; border-bottom: 1px solid #27272a;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  ${img ? `
                    <td width="60" valign="middle" style="padding-right: 14px;">
                      <img src="${img}" alt="${prodName}" width="54" height="60" style="object-fit: cover; border-radius: 6px; display: block; background: #18181b;" />
                    </td>
                  ` : ''}
                  <td valign="middle">
                    <div style="font-weight: 700; font-size: 14px; text-transform: uppercase; color: #ffffff; letter-spacing: 0.04em;">
                      ${prodName}
                    </div>
                    <div style="font-size: 12px; color: #a1a1aa; margin-top: 4px;">
                      Size: <strong style="color: #ffffff;">${size}</strong> &bull; Qty: <strong style="color: #ffffff;">${qty}</strong>
                    </div>
                  </td>
                  <td align="right" valign="middle" style="font-size: 14px; font-weight: 700; color: #ffffff;">
                    &#8377;${lineTotal}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `;
      }).join('')
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation - ${order_number}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #09090b; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #121214; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; text-align: left;">
          
          <!-- Brand Header -->
          <tr>
            <td style="padding: 32px 30px 24px; background: linear-gradient(180deg, #18181b 0%, #121214 100%); border-bottom: 1px solid #27272a; text-align: center;">
              <div style="font-size: 24px; font-weight: 900; letter-spacing: 0.15em; color: #ffffff; text-transform: uppercase;">
                MATCHDAY
              </div>
              <div style="font-size: 11px; letter-spacing: 0.25em; color: #4ade80; text-transform: uppercase; font-weight: 700; margin-top: 6px;">
                &bull; Order Confirmed &bull;
              </div>
            </td>
          </tr>

          <!-- Confirmation Banner -->
          <tr>
            <td style="padding: 24px 30px; border-bottom: 1px solid #27272a;">
              <h1 style="font-size: 18px; font-weight: 800; text-transform: uppercase; margin: 0 0 8px; color: #ffffff; letter-spacing: 0.02em;">
                Thank You For Your Order, ${customerName}!
              </h1>
              <p style="font-size: 13px; color: #a1a1aa; line-height: 1.5; margin: 0;">
                Your payment has been successfully verified via Razorpay. Your official matchday kit is now scheduled for priority quality check and dispatch.
              </p>
            </td>
          </tr>

          <!-- Order Summary Meta Grid -->
          <tr>
            <td style="padding: 20px 30px; background-color: #18181b; border-bottom: 1px solid #27272a;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="50%" valign="top" style="padding-right: 10px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: 700; letter-spacing: 0.08em;">Order Number</div>
                    <div style="font-size: 15px; font-weight: 800; color: #ffffff; font-family: monospace; margin-top: 3px;">${order_number}</div>
                    
                    <div style="font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: 700; letter-spacing: 0.08em; margin-top: 14px;">Order Date</div>
                    <div style="font-size: 13px; color: #e4e4e7; margin-top: 2px;">${orderDate}</div>
                  </td>
                  <td width="50%" valign="top" style="padding-left: 10px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: 700; letter-spacing: 0.08em;">Payment Status</div>
                    <div style="font-size: 13px; font-weight: 700; color: #4ade80; margin-top: 3px;">PAID VIA RAZORPAY</div>
                    
                    ${razorpay_payment_id ? `
                      <div style="font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: 700; letter-spacing: 0.08em; margin-top: 14px;">Transaction ID</div>
                      <div style="font-size: 12px; color: #38bdf8; font-family: monospace; margin-top: 2px;">${razorpay_payment_id}</div>
                    ` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping Destination -->
          <tr>
            <td style="padding: 20px 30px; border-bottom: 1px solid #27272a;">
              <div style="font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: 700; letter-spacing: 0.08em; margin-bottom: 6px;">
                Delivery Destination
              </div>
              <div style="font-size: 14px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">
                ${customerName}${customerPhone ? ` &bull; ${customerPhone}` : ''}
              </div>
              <div style="font-size: 13px; color: #d4d4d8; line-height: 1.6;">
                ${hasDestination ? `
                  ${addressLine ? `<div>${addressLine}</div>` : ''}
                  <div>${[city, state].filter(Boolean).join(', ')}${pincode ? ` - <strong style="color: #ffffff;">${pincode}</strong>` : ''}</div>
                  ${shippingMethod ? `<div style="margin-top: 6px; font-size: 11px; color: #4ade80; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Shipping Method: ${shippingMethod}</div>` : ''}
                ` : `
                  <div style="color: #71717a; font-style: italic;">Address confirmed on order file. Contact support if you need to modify delivery details.</div>
                `}
              </div>
            </td>
          </tr>

          <!-- Items Ordered List -->
          <tr>
            <td style="padding: 24px 30px;">
              <div style="font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: 700; letter-spacing: 0.08em; margin-bottom: 8px;">
                Kits Ordered (${items.length})
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${itemsHtml}
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 18px; padding-top: 14px; border-top: 1px dashed #27272a;">
                <tr>
                  <td style="font-size: 13px; color: #a1a1aa; padding: 4px 0;">Subtotal</td>
                  <td align="right" style="font-size: 13px; color: #e4e4e7; padding: 4px 0;">&#8377;${subtotal}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #a1a1aa; padding: 4px 0;">Shipping Fee ${shippingMethod ? `(${shippingMethod})` : ''}</td>
                  <td align="right" style="font-size: 13px; color: #4ade80; padding: 4px 0; font-weight: 700;">
                    ${Number(shipping_fee) === 0 ? 'FREE' : `&#8377;${shipping_fee}`}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 15px; font-weight: 800; color: #ffffff; padding: 10px 0 0; text-transform: uppercase;">Total Paid</td>
                  <td align="right" style="font-size: 18px; font-weight: 900; color: #ffffff; padding: 10px 0 0;">&#8377;${total_amount}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Support & WhatsApp Link -->
          <tr>
            <td style="padding: 24px 30px; background-color: #18181b; border-top: 1px solid #27272a; text-align: center;">
              <div style="font-size: 13px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
                Customer Support & Customization
              </div>
              <div style="font-size: 12px; color: #a1a1aa; margin-bottom: 14px; line-height: 1.4;">
                Need help or wish to request custom name/number printing? Contact us on WhatsApp: <strong>+91 9072 748730</strong>
              </div>
              <a href="https://wa.me/919072748730?text=Hi%20Matchday%20Team!%20Inquiry%20regarding%20Order%20${order_number}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 12px 24px; border-radius: 6px; font-weight: 800; font-size: 12px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.05em;">
                Chat on WhatsApp Support (+91 9072 748730) &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #1f1f23;">
              &copy; ${new Date().getFullYear()} Matchday Official Store. All rights reserved.<br />
              Premium football kits & heritage matchday sportswear.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Plain-text fallback for order confirmation to maximize deliverability and avoid spam flags.
 */
export function buildOrderConfirmationText(order) {
  const {
    order_number = 'MD-ORDER',
    items = [],
    subtotal = 0,
    shipping_fee = 0,
    total_amount = 0,
    razorpay_payment_id = '',
  } = order;

  const {
    customerName,
    customerPhone,
    addressLine,
    city,
    state,
    pincode,
    shippingMethod
  } = resolveOrderDetails(order);

  const itemsList = Array.isArray(items)
    ? items.map(i => {
        const name = i.product?.name || i.name || 'Official Matchday Jersey';
        const size = i.size || 'M';
        const qty = i.quantity || 1;
        const price = i.product?.price || i.price || 0;
        return `- ${name} | Size: ${size} | Qty: ${qty} | ₹${price * qty}`;
      }).join('\n')
    : '';

  const destinationText = [
    addressLine,
    [city, state].filter(Boolean).join(', ') + (pincode ? ` - ${pincode}` : '')
  ].filter(Boolean).join('\n') || 'Address on file';

  return `MATCHDAY - ORDER CONFIRMATION
========================================
Order Number: ${order_number}
Customer: ${customerName}${customerPhone ? ` (${customerPhone})` : ''}
Payment Status: PAID VIA RAZORPAY
Transaction ID: ${razorpay_payment_id || 'N/A'}

ITEMS ORDERED:
${itemsList}

Subtotal: ₹${subtotal}
Shipping Fee: ${Number(shipping_fee) === 0 ? 'FREE' : `₹${shipping_fee}`} ${shippingMethod ? `(${shippingMethod})` : ''}
Total Amount: ₹${total_amount}

DELIVERY DESTINATION:
${destinationText}

WhatsApp Support: +91 90727 48730
Matchday Official Store
`;
}

/**
 * Sends order confirmation email strictly to the customer.
 * NO copy or duplicate notification is sent to store owner email.
 */
export async function sendOrderConfirmationEmail(order) {
  if (!order || !order.order_number) {
    console.warn('sendOrderConfirmationEmail: Missing order payload');
    return { success: false, error: 'Missing order' };
  }

  const { customerEmail, customerName } = resolveOrderDetails(order);

  if (!customerEmail) {
    console.warn(`sendOrderConfirmationEmail: No customer email found for order ${order.order_number}. Email skipped.`);
    return { success: false, error: 'No customer email provided' };
  }

  const html = buildOrderConfirmationHtml(order);
  const text = buildOrderConfirmationText(order);
  const subject = `Your Matchday Order ${order.order_number} is Confirmed!`;

  try {
    const customerEmailRes = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: customerEmail,
      subject,
      html,
      text
    });

    if (customerEmailRes.error) {
      console.error(`⚠️ Customer email delivery error to ${customerEmail}:`, customerEmailRes.error);
      return { success: false, recipient: customerEmail, error: customerEmailRes.error };
    }

    console.log(`✅ Order confirmation email successfully sent to customer: ${customerEmail} (${order.order_number})`);
    return { success: true, recipient: customerEmail, data: customerEmailRes.data };
  } catch (custErr) {
    console.error(`⚠️ Customer email dispatch exception to ${customerEmail}:`, custErr?.message || custErr);
    return { success: false, recipient: customerEmail, error: custErr?.message || custErr };
  }
}

/**
 * Builds HTML template for dispatched / shipped order with tracking links.
 */
export function buildOrderShippedHtml(order, trackingInfo = {}) {
  const {
    order_number = 'MD-ORDER',
    items = []
  } = order;

  const {
    customerName,
    customerPhone,
    addressLine,
    city,
    state,
    pincode,
    shippingMethod,
    parsedAddress
  } = resolveOrderDetails(order);

  const tracking_id = trackingInfo.tracking_id || order.tracking_id || parsedAddress.tracking_id || '';
  const tracking_url = trackingInfo.tracking_url || order.tracking_url || parsedAddress.tracking_url || '';
  const courier_name = trackingInfo.courier_name || order.courier_name || parsedAddress.courier_name || 'Express Courier';

  const hasDestination = Boolean(addressLine || city || pincode);

  const itemsHtml = Array.isArray(items)
    ? items.map(item => {
        const prodName = item.product?.name || item.name || 'Official Matchday Jersey';
        const size = item.size || 'M';
        const qty = item.quantity || 1;
        const img = item.product?.images?.[0] || '';

        return `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #27272a;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  ${img ? `
                    <td width="50" valign="middle" style="padding-right: 12px;">
                      <img src="${img}" alt="${prodName}" width="46" height="52" style="object-fit: cover; border-radius: 6px; display: block; background: #18181b;" />
                    </td>
                  ` : ''}
                  <td valign="middle">
                    <div style="font-weight: 700; font-size: 13px; text-transform: uppercase; color: #ffffff;">
                      ${prodName}
                    </div>
                    <div style="font-size: 11px; color: #a1a1aa; margin-top: 3px;">
                      Size: <strong style="color: #ffffff;">${size}</strong> &bull; Qty: <strong style="color: #ffffff;">${qty}</strong>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `;
      }).join('')
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Matchday Order Has Shipped - ${order_number}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #09090b; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #121214; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; text-align: left;">
          
          <!-- Brand Header -->
          <tr>
            <td style="padding: 32px 30px 24px; background: linear-gradient(180deg, #18181b 0%, #121214 100%); border-bottom: 1px solid #27272a; text-align: center;">
              <div style="font-size: 24px; font-weight: 900; letter-spacing: 0.15em; color: #ffffff; text-transform: uppercase;">
                MATCHDAY
              </div>
              <div style="font-size: 11px; letter-spacing: 0.25em; color: #38bdf8; text-transform: uppercase; font-weight: 700; margin-top: 6px;">
                &bull; Package Dispatched &bull;
              </div>
            </td>
          </tr>

          <!-- Banner -->
          <tr>
            <td style="padding: 24px 30px; border-bottom: 1px solid #27272a;">
              <h1 style="font-size: 18px; font-weight: 800; text-transform: uppercase; margin: 0 0 8px; color: #ffffff; letter-spacing: 0.02em;">
                Great News, ${customerName}!
              </h1>
              <p style="font-size: 13px; color: #a1a1aa; line-height: 1.5; margin: 0;">
                Your official matchday order <strong>${order_number}</strong> has been handed over to <strong>${courier_name}</strong> and is currently en route to your doorstep.
              </p>
            </td>
          </tr>

          <!-- Tracking Highlights Box -->
          <tr>
            <td style="padding: 24px 30px; background-color: #18181b; border-bottom: 1px solid #27272a;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #09090b; border: 1.5px dashed #38bdf8; border-radius: 8px; padding: 20px;">
                <tr>
                  <td>
                    <div style="font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: 700; letter-spacing: 0.08em;">Courier Partner</div>
                    <div style="font-size: 15px; font-weight: 800; color: #ffffff; margin-top: 3px;">${courier_name}</div>

                    <div style="font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: 700; letter-spacing: 0.08em; margin-top: 14px;">Tracking Number / AWB</div>
                    <div style="font-size: 17px; font-weight: 900; color: #38bdf8; font-family: monospace; letter-spacing: 0.06em; margin-top: 3px;">
                      ${tracking_id || 'Will update shortly'}
                    </div>

                    ${tracking_url ? `
                      <div style="margin-top: 18px;">
                        <a href="${tracking_url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #38bdf8; color: #09090b; padding: 12px 24px; border-radius: 6px; font-weight: 800; font-size: 12px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.06em;">
                          Track Your Consignment Online &rarr;
                        </a>
                      </div>
                    ` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping Destination -->
          <tr>
            <td style="padding: 20px 30px; border-bottom: 1px solid #27272a;">
              <div style="font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: 700; letter-spacing: 0.08em; margin-bottom: 6px;">
                Delivery Destination
              </div>
              <div style="font-size: 14px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">
                ${customerName}${customerPhone ? ` &bull; ${customerPhone}` : ''}
              </div>
              <div style="font-size: 13px; color: #d4d4d8; line-height: 1.6;">
                ${hasDestination ? `
                  ${addressLine ? `<div>${addressLine}</div>` : ''}
                  <div>${[city, state].filter(Boolean).join(', ')}${pincode ? ` - <strong style="color: #ffffff;">${pincode}</strong>` : ''}</div>
                  ${shippingMethod ? `<div style="margin-top: 6px; font-size: 11px; color: #4ade80; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Shipping Method: ${shippingMethod}</div>` : ''}
                ` : `
                  <div style="color: #71717a; font-style: italic;">Address confirmed on order file.</div>
                `}
              </div>
            </td>
          </tr>

          <!-- Items Ordered List -->
          <tr>
            <td style="padding: 24px 30px;">
              <div style="font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: 700; letter-spacing: 0.08em; margin-bottom: 8px;">
                Kits in this Shipment (${items.length})
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Support & WhatsApp Link -->
          <tr>
            <td style="padding: 24px 30px; background-color: #18181b; border-top: 1px solid #27272a; text-align: center;">
              <div style="font-size: 13px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
                Need Delivery Support?
              </div>
              <div style="font-size: 12px; color: #a1a1aa; margin-bottom: 14px; line-height: 1.4;">
                Our matchday team is available on WhatsApp for dispatch and courier inquiries: <strong>+91 9072 748730</strong>
              </div>
              <a href="https://wa.me/919072748730?text=Hi%20Matchday%20Team!%20Tracking%20inquiry%20regarding%20Order%20${order_number}%20(AWB:%20${tracking_id})" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 12px 24px; border-radius: 6px; font-weight: 800; font-size: 12px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.05em;">
                Chat on WhatsApp (+91 9072 748730) &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #1f1f23;">
              &copy; ${new Date().getFullYear()} Matchday Official Store. All rights reserved.<br />
              Premium football kits & heritage matchday sportswear.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Plain-text version for shipped order email.
 */
export function buildOrderShippedText(order, trackingInfo = {}) {
  const {
    order_number = 'MD-ORDER',
    items = []
  } = order;

  const {
    customerName,
    customerPhone,
    addressLine,
    city,
    state,
    pincode,
    shippingMethod,
    parsedAddress
  } = resolveOrderDetails(order);

  const tracking_id = trackingInfo.tracking_id || order.tracking_id || parsedAddress.tracking_id || '';
  const tracking_url = trackingInfo.tracking_url || order.tracking_url || parsedAddress.tracking_url || '';
  const courier_name = trackingInfo.courier_name || order.courier_name || parsedAddress.courier_name || 'Express Courier';

  const itemsList = Array.isArray(items)
    ? items.map(i => {
        const name = i.product?.name || i.name || 'Official Matchday Jersey';
        const size = i.size || 'M';
        const qty = i.quantity || 1;
        return `- ${name} | Size: ${size} | Qty: ${qty}`;
      }).join('\n')
    : '';

  const destinationText = [
    addressLine,
    [city, state].filter(Boolean).join(', ') + (pincode ? ` - ${pincode}` : '')
  ].filter(Boolean).join('\n') || 'Address on file';

  return `MATCHDAY - ORDER SHIPPED
========================================
Order Number: ${order_number}
Customer: ${customerName}${customerPhone ? ` (${customerPhone})` : ''}

CONSIGNMENT TRACKING:
Courier Partner: ${courier_name}
Tracking ID (AWB): ${tracking_id || 'Will update shortly'}
Tracking Link: ${tracking_url || 'N/A'}

ITEMS IN SHIPMENT:
${itemsList}

DELIVERY DESTINATION:
${destinationText}
${shippingMethod ? `Shipping Method: ${shippingMethod}\n` : ''}
WhatsApp Customer Support: +91 90727 48730
Matchday Official Store
`;
}

/**
 * Sends order shipped & tracking email strictly to the customer.
 * NO copy or duplicate notification is sent to store owner email.
 */
export async function sendOrderShippedEmail(order, trackingInfo = {}) {
  if (!order || !order.order_number) {
    return { success: false, error: 'Missing order details' };
  }

  const { customerEmail, customerName } = resolveOrderDetails(order);

  if (!customerEmail) {
    console.warn(`sendOrderShippedEmail: No customer email found for order ${order.order_number}. Shipped email skipped.`);
    return { success: false, error: 'No customer email provided' };
  }

  const html = buildOrderShippedHtml(order, trackingInfo);
  const text = buildOrderShippedText(order, trackingInfo);
  const subject = `🚚 Your Matchday Order ${order.order_number} Has Been Shipped!`;

  try {
    const res = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: customerEmail,
      subject,
      html,
      text
    });

    if (res.error) {
      console.error(`⚠️ Failed to send shipping email to ${customerEmail}:`, res.error);
      return { success: false, recipient: customerEmail, error: res.error };
    }

    console.log(`✅ Shipped tracking email successfully sent to customer: ${customerEmail} (${order.order_number})`);
    return { success: true, recipient: customerEmail, data: res.data };
  } catch (err) {
    console.error(`⚠️ Failed to send shipped tracking email to ${customerEmail}:`, err?.message || err);
    return { success: false, recipient: customerEmail, error: err?.message || err };
  }
}

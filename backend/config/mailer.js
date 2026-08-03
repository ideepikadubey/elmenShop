const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || 'elmenindia@gmail.com',
    pass: process.env.EMAIL_PASS || '',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Send order notification email to admin (elmenindia@gmail.com) and customer
 */
const sendOrderEmail = async (order, user) => {
  const adminEmail = 'elmenindia@gmail.com';
  const customerEmail = order.shippingAddress?.email || user?.email;
  const sa = order.shippingAddress || {};
  const orderId = order._id ? order._id.toString().toUpperCase() : 'NEW_ORDER';
  const shortOrderId = orderId.slice(-8);

  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #333; color: #ffffff;">
        <strong>${item.name}</strong>
        ${item.flavour ? `<br/><span style="font-size:0.75rem; color:#f59e0b;">Flavour: ${item.flavour}</span>` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #333; color: #ffffff; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #333; color: #f59e0b; text-align: right; font-weight: bold;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: #09090b; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #27272a;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #18181b 0%, #09090b 100%); padding: 32px 28px; border-bottom: 2px solid #eab308; text-align: center;">
        <h1 style="margin: 0; font-size: 1.8rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #ffffff;">
          EL <span style="color: #eab308;">MEN</span> NUTRITION
        </h1>
        <div style="margin-top: 8px; display: inline-block; background: rgba(234, 179, 8, 0.15); border: 1px solid rgba(234, 179, 8, 0.4); color: #eab308; padding: 4px 16px; border-radius: 20px; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          🚀 NEW ORDER RECEIVED #${shortOrderId}
        </div>
      </div>

      <!-- Body -->
      <div style="padding: 32px 28px;">
        <h2 style="font-size: 1.1rem; color: #eab308; margin-top: 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #27272a; padding-bottom: 8px;">
          Order Summary & Details
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.88rem;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Full Order ID:</td>
            <td style="padding: 6px 0; color: #ffffff; font-weight: 700; text-align: right;">#${order._id}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Order Date:</td>
            <td style="padding: 6px 0; color: #ffffff; font-weight: 700; text-align: right;">${new Date(order.createdAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Payment Method:</td>
            <td style="padding: 6px 0; color: #38bdf8; font-weight: 700; text-align: right; text-transform: uppercase;">${order.paymentMethod || 'COD'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Payment Status:</td>
            <td style="padding: 6px 0; color: #22c55e; font-weight: 700; text-align: right; text-transform: uppercase;">${order.paymentStatus || 'PENDING'}</td>
          </tr>
        </table>

        <!-- Customer & Shipping Info -->
        <h2 style="font-size: 1.1rem; color: #eab308; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #27272a; padding-bottom: 8px;">
          Customer & Delivery Address
        </h2>
        <div style="background: #18181b; padding: 16px; border-radius: 12px; border: 1px solid #27272a; margin-bottom: 24px; font-size: 0.9rem; line-height: 1.6;">
          <p style="margin: 0; color: #ffffff; font-weight: 800; font-size: 1rem;">${sa.fullName || user?.name || 'Customer'}</p>
          <p style="margin: 4px 0 0; color: #cbd5e1;">📧 Email: <a href="mailto:${sa.email || user?.email}" style="color: #38bdf8; text-decoration: none;">${sa.email || user?.email}</a></p>
          <p style="margin: 4px 0 0; color: #cbd5e1;">📞 Phone: <a href="tel:${sa.phone || user?.phone}" style="color: #38bdf8; text-decoration: none;">${sa.phone || user?.phone}</a></p>
          <p style="margin: 8px 0 0; color: #94a3b8; font-size: 0.85rem;">
            📍 <strong>Address:</strong> ${sa.street || ''}, ${sa.city || ''}, ${sa.state || ''} - <strong>${sa.pincode || ''}</strong> (${sa.country || 'India'})
          </p>
        </div>

        <!-- Ordered Items Table -->
        <h2 style="font-size: 1.1rem; color: #eab308; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #27272a; padding-bottom: 8px;">
          Items Ordered
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 0.88rem;">
          <thead>
            <tr style="background: #18181b; color: #94a3b8; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px;">
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #27272a;">Product</th>
              <th style="padding: 10px; text-align: center; border-bottom: 1px solid #27272a;">Qty</th>
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #27272a;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Total Price Breakdown -->
        <div style="background: #18181b; padding: 18px; border-radius: 12px; border: 1px solid #27272a;">
          <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: #94a3b8; margin-bottom: 6px;">
            <span>Subtotal:</span>
            <span style="color: #ffffff; font-weight: 600;">₹${(order.subtotal || 0).toLocaleString('en-IN')}</span>
          </div>
          ${order.discount > 0 ? `
          <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: #22c55e; margin-bottom: 6px;">
            <span>Discount (${order.couponApplied || 'Promo'}):</span>
            <span style="font-weight: 600;">-₹${(order.discount || 0).toLocaleString('en-IN')}</span>
          </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: #94a3b8; margin-bottom: 10px;">
            <span>Shipping Charges:</span>
            <span style="color: #ffffff; font-weight: 600;">${order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 900; color: #eab308; padding-top: 10px; border-top: 1px dashed #3f3f46;">
            <span>Total Amount Paid / Payable:</span>
            <span>₹${(order.totalAmount || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #18181b; padding: 20px; text-align: center; border-top: 1px solid #27272a; font-size: 0.75rem; color: #71717a;">
        <p style="margin: 0;">This is an automated notification from <strong>EL MEN Nutrition System</strong>.</p>
        <p style="margin: 4px 0 0;">Official Admin Email: <a href="mailto:elmenindia@gmail.com" style="color: #eab308; text-decoration: none;">elmenindia@gmail.com</a></p>
      </div>
    </div>
  `;

  // Send to Admin (elmenindia@gmail.com)
  try {
    await transporter.sendMail({
      from: `"EL MEN Orders" <${process.env.EMAIL_USER || 'elmenindia@gmail.com'}>`,
      to: adminEmail,
      subject: `🚨 New Order #${shortOrderId} - ₹${(order.totalAmount || 0).toLocaleString('en-IN')} from ${sa.fullName || user?.name || 'Customer'}`,
      html: emailHtml
    });
    console.log(`Order notification email successfully sent to admin (${adminEmail}) for Order #${order._id}`);
  } catch (err) {
    console.error(`Failed to send order email to admin (${adminEmail}):`, err?.message || err);
  }

  // Also send order receipt to Customer (if valid email provided and different from admin)
  if (customerEmail && customerEmail.toLowerCase() !== adminEmail.toLowerCase()) {
    try {
      await transporter.sendMail({
        from: `"EL MEN Nutrition" <${process.env.EMAIL_USER || 'elmenindia@gmail.com'}>`,
        to: customerEmail,
        subject: `🎉 Order Confirmation #${shortOrderId} - EL MEN Nutrition`,
        html: emailHtml
      });
      console.log(`Order confirmation email sent to customer (${customerEmail})`);
    } catch (err) {
      console.error(`Failed to send order email to customer (${customerEmail}):`, err?.message || err);
    }
  }
};

module.exports = { transporter, sendOrderEmail };

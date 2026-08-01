const Order  = require('../models/Order');
const Product = require('../models/Product');
const Offer = require('../models/Offer');
const axios = require('axios');
const mongoose = require('mongoose');


// Valid coupon codes
const COUPONS = {
  FIT30:   { discount: 0.30, description: '30% OFF' },
  ELMEN10: { discount: 0.10, description: '10% OFF' }
};

// @route  POST /api/orders
// @access Private (User)
const placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order.' });
    }

    // Validate stock and compute subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name || item.productId}" is no longer available.`
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}`
        });
      }

      const pPrice = Number(product.price || 0);
      const pOrig = Number(product.originalPrice || 0);
      const itemPrice = pPrice > 0 ? pPrice : (pOrig > 0 ? pOrig : 0);

      subtotal += itemPrice * item.quantity;
      orderItems.push({
        product:  product._id,
        name:     product.name,
        price:    itemPrice,
        quantity: item.quantity,
        image:    product.image
      });
    }

    // Apply coupon
    let discount = 0;
    let couponApplied = '';
    if (couponCode) {
      const now = new Date();
      const offer = await Offer.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      });
      
      if (offer) {
        // If the offer is product-specific, check if any of the items match targetProducts
        if (offer.targetProducts && offer.targetProducts.length > 0) {
          const targetStrIds = offer.targetProducts.map(id => id.toString());
          let qualifyingSubtotal = 0;
          for (const item of orderItems) {
            const itemProdId = (item.product || item.productId || '').toString();
            if (targetStrIds.includes(itemProdId)) {
              qualifyingSubtotal += item.price * item.quantity;
            }
          }
          if (qualifyingSubtotal > 0) {
            if (offer.discountType === 'percentage') {
              discount = Math.round(qualifyingSubtotal * (offer.discountValue / 100));
            } else {
              discount = Math.min(offer.discountValue, qualifyingSubtotal);
            }
            couponApplied = offer.code;
          } else {
            return res.status(400).json({ success: false, message: 'This coupon is not valid for the items in your cart.' });
          }
        } else {
          // Applies to all items
          if (offer.discountType === 'percentage') {
            discount = Math.round(subtotal * (offer.discountValue / 100));
          } else {
            discount = Math.min(offer.discountValue, subtotal);
          }
          couponApplied = offer.code;
        }
      } else {
        return res.status(400).json({ success: false, message: 'Invalid or expired coupon code.' });
      }
    }

    // Delivery fee logic: Free delivery on 1st order, ₹49 from 2nd order onwards
    const existingOrdersCount = await Order.countDocuments({
      user: req.user._id,
      orderStatus: { $ne: 'cancelled' }
    });
    const shippingFee = existingOrdersCount === 0 ? 0 : 49;
    const totalAmount = subtotal - discount + shippingFee;

    // Normalize payment method to enum: 'razorpay' | 'cod' | 'upi'
    const validPaymentMethod = paymentMethod === 'cod' ? 'cod' : (paymentMethod === 'upi' ? 'upi' : 'razorpay');

    // Create the order
    const order = await Order.create({
      user:            req.user._id,
      items:           orderItems,
      shippingAddress,
      subtotal,
      discount,
      couponApplied,
      shippingFee,
      totalAmount,
      paymentMethod:   validPaymentMethod,
      paymentStatus:   'pending',
      orderStatus:     'processing',
      notes:           notes || ''
    });

    // Deduct stock
    for (const item of items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    // Direct Automated Order Push to iThink Logistics (Async Non-Blocking)
    setTimeout(() => {
      pushOrderToIThink(order, req.user).catch(err => {
        console.error('Background iThink order push error:', err?.message || err);
      });
    }, 0);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order
    });
  } catch (error) {
    console.error('Place order error details:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error placing order.' });
  }
};

// Helper: Automated Order Push to iThink Logistics API
const pushOrderToIThink = async (order, reqUser) => {
  try {
    const token = process.env.ITHINK_ACCESS_TOKEN;
    const secret = process.env.ITHINK_SECRET_KEY;
    if (!token || !secret) {
      console.warn('iThink credentials missing in environment config, skipping automated order push.');
      return;
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const apiUrl = isProduction
      ? 'https://api.ithinklogistics.com/api_v3/order/add.json'
      : 'https://pre-alpha.ithinklogistics.com/api_v3/order/add.json';

    const orderDate = new Date(order.createdAt || Date.now());
    const day = String(orderDate.getDate()).padStart(2, '0');
    const month = String(orderDate.getMonth() + 1).padStart(2, '0');
    const year = orderDate.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    const sa = order.shippingAddress || {};
    const orderKey = String(order._id);

    const payload = {
      data: {
        shipments: [
          {
            waybill: '',
            order: orderKey,
            sub_order: '',
            order_date: formattedDate,
            total_amount: String(order.totalAmount),
            name: sa.fullName || reqUser?.name || 'Customer',
            company_name: 'EL MEN Shop',
            add: sa.street || '',
            pin: sa.pincode || '',
            city: sa.city || '',
            state: sa.state || '',
            country: sa.country || 'India',
            phone: sa.phone || reqUser?.phone || '',
            email: sa.email || reqUser?.email || '',
            payment_mode: (order.paymentMethod || 'cod').toLowerCase() === 'cod' ? 'COD' : 'Prepaid',
            products: (order.items || []).map(item => ({
              product_name: item.name,
              product_sku: item.name,
              product_quantity: String(item.quantity),
              product_price: String(item.price),
              product_tax_rate: '0',
              product_hsn_code: '',
              product_discount: '0'
            }))
          }
        ],
        access_token: token,
        secret_key: secret
      }
    };

    const response = await axios.post(apiUrl, payload);
    const resData = response.data;
    if (resData && (resData.status_code === 200 || resData.status === 'success' || resData.data)) {
      const shipmentData = resData.data?.[orderKey] || (Array.isArray(resData.data) ? resData.data[0] : resData.data);
      const awbNumber = shipmentData?.waybill || shipmentData?.awb_number || shipmentData?.awb_no;
      if (awbNumber) {
        await Order.findByIdAndUpdate(order._id, {
          trackingNumber: awbNumber,
          orderStatus: 'confirmed'
        });
        console.log(`Order ${order._id} automatically pushed to iThink Logistics! AWB: ${awbNumber}`);
      }
    } else {
      console.warn('iThink order push response:', resData?.message || resData);
    }
  } catch (err) {
    console.error('Automated iThink order push error:', err.response?.data || err.message);
  }
};

// @route  GET /api/orders/my
// @access Private (User)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name image category')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @route  GET /api/orders/:id
// @access Private (User or Admin)
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name image category')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Users can only see their own orders
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @route  GET /api/orders (Admin)
// @access Admin
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { orderStatus: status } : {};

    const total  = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      count:   orders.length,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @route  PUT /api/orders/:id/status
// @access Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, trackingNumber } = req.body;

    const validStatuses = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid order status.' });
    }

    const updateData = { orderStatus };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;

    // If delivered, mark payment as paid (for COD)
    if (orderStatus === 'delivered') updateData.paymentStatus = 'paid';

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, message: 'Order status updated.', order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @route  POST /api/orders/track
// @access Public
const getOrderTracking = async (req, res) => {
  try {
    const { trackingNumber } = req.body;

    if (!trackingNumber) {
      return res.status(400).json({ success: false, message: 'Tracking number is required.' });
    }

    const token = process.env.ITHINK_ACCESS_TOKEN;
    const secret = process.env.ITHINK_SECRET_KEY;

    if (!token || !secret) {
      return res.status(500).json({
        success: false,
        message: 'iThink Logistics API credentials are missing in server environment config.'
      });
    }

    // Call real iThink Logistics API
    try {
      const isProduction = process.env.NODE_ENV === 'production';
      const apiUrl = isProduction
        ? 'https://api.ithinklogistics.com/api_v3/order/track.json'
        : 'https://pre-alpha.ithinklogistics.com/api_v3/order/track.json';

      const response = await axios.post(apiUrl, {
        data: {
          awb_number_list: trackingNumber,
          access_token: token,
          secret_key: secret
        }
      });

      const itlData = response.data;
      if (itlData && (itlData.status_code === 200 || itlData.status === 'success' || itlData.data)) {
        // iThink Logistics returns the data keyed by AWB number
        const trackingInfo = itlData.data?.[trackingNumber] || itlData.data;
        if (trackingInfo && (trackingInfo.awb_no || trackingInfo.current_status || trackingInfo.scan_details)) {
          return res.json({
            success: true,
            source: 'api',
            tracking: trackingInfo
          });
        }
      }
      
      return res.status(400).json({ 
        success: false, 
        message: itlData?.message || 'Could not retrieve tracking details from iThink Logistics provider.' 
      });

    } catch (apiError) {
      console.error('iThink Logistics API Error:', apiError.response?.data || apiError.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Logistics tracking API connection error. Please try again later.' 
      });
    }

  } catch (error) {
    console.error('Tracking endpoint error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Webhook receiver for iThink Logistics real-time status updates
// @route   POST /api/orders/webhook/ithink
// @access  Public
const ithinkWebhook = async (req, res) => {
  try {
    const payload = req.body || {};
    console.log('iThink Webhook Payload received:', JSON.stringify(payload));

    const waybill = payload.waybill || payload.awb || payload.awb_number || payload.awb_no || payload.data?.waybill || payload.data?.awb_no;
    const orderId = payload.order || payload.order_id || payload.data?.order;
    const statusText = (payload.current_status || payload.status || payload.status_name || payload.data?.current_status || '').toLowerCase();
    const statusCode = (payload.current_status_code || payload.status_code || payload.code || '').toUpperCase();

    if (!waybill && !orderId) {
      return res.status(400).json({ success: false, message: 'Missing waybill or order ID in webhook payload.' });
    }

    // Find order by MongoDB ID or trackingNumber
    let order = null;
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId);
    }
    if (!order && waybill) {
      order = await Order.findOne({ trackingNumber: waybill });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found in database.' });
    }

    // Update AWB tracking number if missing
    if (waybill && !order.trackingNumber) {
      order.trackingNumber = waybill;
    }

    // Determine status mapping
    if (statusText.includes('deliver') || statusCode === 'DL' || statusCode === 'DLVD') {
      order.orderStatus = 'delivered';
      order.paymentStatus = 'paid';
    } else if (
      statusText.includes('transit') ||
      statusText.includes('shipped') ||
      statusText.includes('picked') ||
      statusText.includes('out for delivery') ||
      statusCode === 'IT' || statusCode === 'PP' || statusCode === 'OD'
    ) {
      order.orderStatus = 'shipped';
    } else if (statusText.includes('cancel') || statusText.includes('rto') || statusText.includes('return')) {
      order.orderStatus = 'cancelled';
    } else if (order.orderStatus === 'processing') {
      order.orderStatus = 'confirmed';
    }

    await order.save();
    console.log(`Order ${order._id} status updated to ${order.orderStatus} via iThink Webhook.`);

    res.status(200).json({ success: true, message: 'Webhook processed successfully.', orderId: order._id, status: order.orderStatus });
  } catch (error) {
    console.error('iThink Webhook processing error:', error);
    res.status(500).json({ success: false, message: 'Server error processing webhook.' });
  }
};

module.exports = { placeOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, getOrderTracking, pushOrderToIThink, ithinkWebhook };

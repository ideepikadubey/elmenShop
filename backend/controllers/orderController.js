const Order  = require('../models/Order');
const Product = require('../models/Product');
const Offer = require('../models/Offer');
const axios = require('axios');


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

      subtotal += product.price * item.quantity;
      orderItems.push({
        product:  product._id,
        name:     product.name,
        price:    product.price,
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
            if (targetStrIds.includes(item.productId.toString())) {
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
      paymentMethod:   paymentMethod || 'cod',
      paymentStatus:   paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus:     'processing',
      notes:           notes || ''
    });

    // Deduct stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
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

module.exports = { placeOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, getOrderTracking };

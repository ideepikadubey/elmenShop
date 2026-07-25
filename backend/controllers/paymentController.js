const crypto  = require('crypto');
const Razorpay = require('razorpay');
const Payment  = require('../models/Payment');
const Order    = require('../models/Order');

// Initialise Razorpay client (will use real keys when provided)
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'your_razorpay_key_id_here') {
    return null; // mock mode
  }
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

// @route  POST /api/payments/create-order
// @access Private (User)
const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const razorpay = getRazorpay();

    // MOCK MODE — no real Razorpay keys yet
    if (!razorpay) {
      const mockOrderId = `mock_order_${Date.now()}`;

      await Order.findByIdAndUpdate(orderId, { razorpayOrderId: mockOrderId });

      await Payment.create({
        order:          order._id,
        user:           req.user._id,
        razorpayOrderId: mockOrderId,
        amount:         order.totalAmount,
        status:         'created'
      });

      return res.json({
        success: true,
        mock:    true,
        message: 'Mock payment order created. Add Razorpay keys to enable real payments.',
        razorpayOrderId: mockOrderId,
        amount:          order.totalAmount,
        currency:        'INR',
        key:             'mock_key'
      });
    }

    // REAL Razorpay payment order
    const options = {
      amount:   order.totalAmount * 100, // amount in paise
      currency: 'INR',
      receipt:  `order_rcpt_${order._id}`,
      notes: {
        orderId:  order._id.toString(),
        customer: req.user.name
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    await Order.findByIdAndUpdate(orderId, { razorpayOrderId: razorpayOrder.id });

    await Payment.create({
      order:           order._id,
      user:            req.user._id,
      razorpayOrderId: razorpayOrder.id,
      amount:          order.totalAmount,
      status:          'created'
    });

    res.json({
      success:         true,
      razorpayOrderId: razorpayOrder.id,
      amount:          razorpayOrder.amount,
      currency:        razorpayOrder.currency,
      key:             process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @route  POST /api/payments/verify
// @access Private (User)
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    // MOCK VERIFICATION
    if (!process.env.RAZORPAY_KEY_SECRET ||
        process.env.RAZORPAY_KEY_SECRET === 'your_razorpay_key_secret_here') {

      await Order.findByIdAndUpdate(orderId, {
        paymentStatus:     'paid',
        orderStatus:       'confirmed',
        razorpayPaymentId: razorpayPaymentId || 'mock_payment'
      });

      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: 'captured', razorpayPaymentId: razorpayPaymentId || 'mock_payment' }
      );

      return res.json({
        success: true,
        mock:    true,
        message: 'Mock payment verified successfully.'
      });
    }

    // REAL signature verification
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus:     'paid',
      orderStatus:       'confirmed',
      razorpayPaymentId
    });

    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { status: 'captured', razorpayPaymentId, razorpaySignature }
    );

    res.json({ success: true, message: 'Payment verified successfully.' });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createPaymentOrder, verifyPayment };

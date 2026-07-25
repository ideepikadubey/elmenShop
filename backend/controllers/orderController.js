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

    // Free shipping above ₹1000
    const shippingFee = subtotal - discount >= 1000 ? 0 : 99;
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

    const isDemo = trackingNumber.toUpperCase().includes('DEMO') || 
                   trackingNumber === '1369010033902' ||
                   !token || 
                   token === 'your_ithink_access_token_here';

    if (isDemo) {
      // Return high-quality mock data for testing
      const normalizedAwb = trackingNumber.toUpperCase();
      let currentStatus = 'In Transit';
      let currentStatusCode = 'UD';
      let scans = [
        {
          status: "Manifested",
          status_code: "UD",
          scan_location: "HQ (Delhi)",
          remark: "Consignment Manifested",
          scan_date_time: "2026-07-20 11:05:57",
          status_reason: ""
        },
        {
          status: "Picked Up",
          status_code: "UD",
          scan_location: "Okhla Hub (Delhi)",
          remark: "Shipment Picked Up from Client Location",
          scan_date_time: "2026-07-20 18:11:26",
          status_reason: ""
        }
      ];

      if (normalizedAwb.includes('DELIVERED') || normalizedAwb === '1369010033902') {
        currentStatus = 'Delivered';
        currentStatusCode = 'DL';
        scans.push(
          {
            status: "In Transit",
            status_code: "UD",
            scan_location: "Mumbai Gateway (Maharashtra)",
            remark: "Shipment in transit to next hub",
            scan_date_time: "2026-07-21 08:30:00",
            status_reason: ""
          },
          {
            status: "Out For Delivery",
            status_code: "UD",
            scan_location: "Bandra DC (Maharashtra)",
            remark: "Dispatched for delivery to consignee",
            scan_date_time: "2026-07-21 10:15:00",
            status_reason: ""
          },
          {
            status: "Delivered",
            status_code: "DL",
            scan_location: "Bandra DC (Maharashtra)",
            remark: "Shipment Delivered successfully",
            scan_date_time: "2026-07-21 14:45:00",
            status_reason: ""
          }
        );
      } else if (normalizedAwb.includes('CANCELLED')) {
        currentStatus = 'Cancelled';
        currentStatusCode = 'CN';
        scans = [
          {
            status: "Manifested",
            status_code: "UD",
            scan_location: "HQ (Delhi)",
            remark: "Consignment Manifested",
            scan_date_time: "2026-07-20 11:05:57",
            status_reason: ""
          },
          {
            status: "Cancelled",
            status_code: "CN",
            scan_location: "HQ (Delhi)",
            remark: "Cancelled by Shipper",
            scan_date_time: "2026-07-20 14:00:00",
            status_reason: ""
          }
        ];
      } else {
        // Standard "In Transit"
        scans.push({
          status: "In Transit",
          status_code: "UD",
          scan_location: "Jaipur Hub (Rajasthan)",
          remark: "Shipment in transit to next hub",
          scan_date_time: "2026-07-21 12:45:00",
          status_reason: ""
        });
      }

      const mockResponse = {
        success: true,
        source: 'mock',
        tracking: {
          message: "success",
          awb_no: trackingNumber,
          logistic: "Delhivery",
          order_type: "forward",
          cancel_status: currentStatus === 'Cancelled' ? 'Approved' : 'Pending',
          current_status: currentStatus,
          current_status_code: currentStatusCode,
          ofd_count: currentStatus === 'Delivered' ? '1' : '0',
          return_tracking_no: "",
          expected_delivery_date: "2026-07-24",
          promise_delivery_date: "2026-07-24",
          last_scan_details: scans[scans.length - 1],
          order_details: {
            order_type: "Prepaid",
            order_number: "10024",
            sub_order_number: "10024",
            order_sub_order_number: "10024-10024",
            phy_weight: "1500.00",
            net_payment: "1850.00",
            ship_length: "20.00",
            ship_width: "15.00",
            ship_height: "10.00"
          },
          order_date_time: {
            manifest_date_time: "2026-07-20 10:34:36",
            pickup_date: "2026-07-20",
            delivery_date: currentStatus === 'Delivered' ? "2026-07-21 14:45:00" : "",
            rto_delivered_date: ""
          },
          customer_details: {
            customer_name: "Rohan Sharma",
            customer_address1: "Sector 62, Noida",
            customer_address2: "",
            customer_address3: "",
            customer_city: "Noida",
            customer_state: "Uttar Pradesh",
            customer_country: "India",
            customer_pincode: "201301",
            customer_mobile: "9876543210",
            customer_phone: ""
          },
          scan_details: scans
        }
      };
      return res.json(mockResponse);
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
        if (trackingInfo) {
          return res.json({
            success: true,
            source: 'api',
            tracking: trackingInfo
          });
        }
      }
      
      return res.status(400).json({ 
        success: false, 
        message: itlData?.message || 'Could not retrieve tracking details from logistics provider.' 
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

const Review = require('../models/Review');
const Product = require('../models/Product');

// @route  POST /api/reviews
// @access Private (Authenticated User)
const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide product ID, rating and comment' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const review = await Review.create({
      product: productId,
      userName: req.user.name,
      rating: Number(rating),
      comment: comment.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route  GET /api/reviews/product/:productId
// @access Public
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route  GET /api/reviews
// @access Public — returns all reviews (for homepage section)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getAllReviews
};

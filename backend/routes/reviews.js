const express = require('express');
const { createReview, getProductReviews, getAllReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/',                    getAllReviews);        // GET  /api/reviews
router.post('/', protect,          createReview);         // POST /api/reviews (auth)
router.get('/product/:productId',  getProductReviews);    // GET  /api/reviews/product/:id

module.exports = router;

const express = require('express');
const { getInstagramPosts } = require('../controllers/instagramController');

const router = express.Router();

// Public route to fetch latest Instagram posts
router.get('/', getInstagramPosts);

module.exports = router;

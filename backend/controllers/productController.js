const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// @route  GET /api/products
// @access Public
const getProducts = async (req, res) => {
  try {
    const { category, search, sort, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };

    if (category) query.category = category.toLowerCase();

    if (search) {
      query.$or = [
        { name:     { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { details:  { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = {};
    if (sort === 'price_asc')    sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'newest')     sortOption = { createdAt: -1 };
    else sortOption = { createdAt: -1 };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count:   products.length,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @route  GET /api/products/:id
// @access Public
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @route  POST /api/products
// @access Admin
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const productData = { ...req.body };

    // If images uploaded via multer
    if (req.files && req.files.length > 0) {
      const filePaths = req.files.map(file => `/uploads/${file.filename}`);
      productData.image = filePaths[0]; // First one as main thumbnail
      productData.images = filePaths;
    }

    // Parse nutritionFacts if sent as a JSON string
    if (typeof productData.nutritionFacts === 'string') {
      productData.nutritionFacts = JSON.parse(productData.nutritionFacts);
    }

    // Parse features if sent as a JSON string
    if (typeof productData.features === 'string') {
      productData.features = JSON.parse(productData.features);
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @route  PUT /api/products/:id
// @access Admin
const updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // If new images uploaded via multer
    if (req.files && req.files.length > 0) {
      const filePaths = req.files.map(file => `/uploads/${file.filename}`);
      updateData.image = filePaths[0];
      updateData.images = filePaths;
    } else if (typeof updateData.images === 'string') {
      // If we are keeping some or all existing images as JSON string
      updateData.images = JSON.parse(updateData.images);
      if (updateData.images.length > 0) {
        updateData.image = updateData.images[0];
      }
    }

    if (typeof updateData.nutritionFacts === 'string') {
      updateData.nutritionFacts = JSON.parse(updateData.nutritionFacts);
    }

    if (typeof updateData.features === 'string') {
      updateData.features = JSON.parse(updateData.features);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, message: 'Product updated successfully.', product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @route  DELETE /api/products/:id
// @access Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @route  PUT /api/products/:id/stock
// @access Admin
const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid stock quantity (0 or more).'
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: Number(stock) },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({
      success: true,
      message: `Stock updated to ${stock} units.`,
      product: { id: product._id, name: product.name, stock: product.stock }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, updateStock };

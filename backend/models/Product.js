const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  subtitle: { type: String, default: '' },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['proteins', 'gainers', 'preworkouts', 'wellness', 'performance', 'accessories'],
    lowercase: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  weight:        { type: String, default: '' },
  shippingWeight: { type: Number, default: 0.5 },
  lengthCm:       { type: Number, default: 10 },
  widthCm:        { type: Number, default: 10 },
  heightCm:       { type: Number, default: 10 },
  servingSize:   { type: String, default: '' },
  servingsCount: { type: Number, default: 0 },
  protein:       { type: String, default: '0g' },
  features:      [{ type: String }],
  flavours:      [{ type: String }],
  details:       { type: String, default: '' },
  nutritionFacts: {
    type: Map,
    of: String,
    default: {}
  },
  badge:      { type: String, default: '' },
  themeColor: { type: String, default: '' },
  image:      { type: String, default: '' },  // URL / path to uploaded image
  images:     [{ type: String }],             // Array of URLs / paths to uploaded images
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 100
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Virtual for discount percentage
productSchema.virtual('discountPercent').get(function () {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);

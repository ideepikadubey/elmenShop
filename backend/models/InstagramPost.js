const mongoose = require('mongoose');

const instagramPostSchema = new mongoose.Schema({
  src: {
    type: String,
    required: [true, 'Post media source URL or path is required'],
    trim: true
  },
  caption: {
    type: String,
    trim: true,
    default: ''
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  permalink: {
    type: String,
    trim: true,
    default: ''
  },
  handle: {
    type: String,
    trim: true,
    default: '@elmen_india'
  }
}, { timestamps: true });

module.exports = mongoose.model('InstagramPost', instagramPostSchema);

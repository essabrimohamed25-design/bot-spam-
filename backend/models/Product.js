const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  specifications: {
    caseSize: String,
    movement: String,
    crystal: String,
    waterResistance: String,
    strap: String
  },
  inStock: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['dress', 'sports', 'diver', 'pilot', 'chronograph'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);

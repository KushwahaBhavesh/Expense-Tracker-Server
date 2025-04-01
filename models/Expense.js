const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD']
  },
  category: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['expense', 'income']
  }
}, {
  timestamps: true
});

// Index for date-based queries
expenseSchema.index({ date: 1 });

module.exports = mongoose.model('Expense', expenseSchema); 
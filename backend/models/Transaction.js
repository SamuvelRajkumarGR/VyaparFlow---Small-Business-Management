const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must be associated with an authenticated business owner'],
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required (sale or expense)'],
      enum: {
        values: ['sale', 'expense'],
        message: 'Type must be either sale or expense',
      },
      lowercase: true,
      trim: true,
    },
    isCreditGiven: {
      type: Boolean,
      default: false,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cash', 'upi', 'card'],
        message: 'Payment method must be cash, upi, or card',
      },
      default: 'cash',
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: ['stock', 'rent', 'bills', 'salaries', 'other'],
        message: 'Category must be stock, rent, bills, salaries, or other',
      },
      default: 'other',
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    date: {
      type: Date,
      default: Date.now,
      required: [true, 'Date is required'],
    },
  },
  {
    timestamps: true,
  }
);

// High performance compound indexes scoped by owner
transactionSchema.index({ owner: 1, type: 1, date: -1 });
transactionSchema.index({ owner: 1, date: -1 });
transactionSchema.index({ owner: 1, customer: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);

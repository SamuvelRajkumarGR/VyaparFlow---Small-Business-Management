const mongoose = require('mongoose');

const reactivationRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, 'Please provide at least 10 characters'],
      maxlength: [1000, 'Request reason cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied'],
      default: 'pending',
      required: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNote: {
      type: String,
      trim: true,
      maxlength: [1000, 'Review note cannot exceed 1000 characters'],
      default: '',
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

reactivationRequestSchema.index(
  { user: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' },
  }
);
reactivationRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ReactivationRequest', reactivationRequestSchema);

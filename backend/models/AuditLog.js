const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorEmail: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'ADMIN_PROVISIONED',
        'USER_SUSPENDED',
        'USER_REACTIVATED',
        'USER_ROLE_CHANGED',
        'LEGACY_DATA_MIGRATED',
        'PASSWORD_RESET_REQUESTED',
        'PASSWORD_RESET_COMPLETED',
        'USER_PROFILE_UPDATED',
        'REACTIVATION_REQUEST_SUBMITTED',
        'REACTIVATION_REQUEST_APPROVED',
        'REACTIVATION_REQUEST_DENIED',
      ],
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    targetUserEmail: {
      type: String,
      trim: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ targetUser: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

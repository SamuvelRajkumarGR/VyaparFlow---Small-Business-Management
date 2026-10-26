const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const ReactivationRequest = require('../models/ReactivationRequest');

const createRequest = async (req, res, next) => {
  try {
    const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
    if (reason.length < 10 || reason.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason between 10 and 1000 characters.',
      });
    }

    if (req.user.accountStatus !== 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'Only suspended accounts can request reactivation.',
      });
    }

    const existingRequest = await ReactivationRequest.findOne({
      user: req.user._id,
      status: 'pending',
    });
    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending reactivation request.',
        request: existingRequest,
      });
    }

    const request = await ReactivationRequest.create({
      user: req.user._id,
      reason,
    });

    await AuditLog.create({
      actor: req.user._id,
      actorEmail: req.user.email,
      action: 'REACTIVATION_REQUEST_SUBMITTED',
      targetUser: req.user._id,
      targetUserEmail: req.user.email,
      details: { requestId: request._id },
      ipAddress: req.ip || '',
      userAgent: req.get('User-Agent') || '',
    });

    res.status(201).json({
      success: true,
      message: 'Your reactivation request has been sent to the administrator.',
      request,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending reactivation request.',
      });
    }
    next(error);
  }
};

const getMyRequest = async (req, res, next) => {
  try {
    const request = await ReactivationRequest.findOne({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

const getRequests = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;
    const allowedStatuses = ['pending', 'approved', 'denied', 'all'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be pending, approved, denied, or all.',
      });
    }

    const query = status === 'all' ? {} : { status };
    const requests = await ReactivationRequest.find(query)
      .populate('user', 'name businessName email accountStatus')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, requests });
  } catch (error) {
    next(error);
  }
};

const reviewRequest = async (req, res, next) => {
  try {
    const { decision } = req.body;
    const reviewNote = typeof req.body.reviewNote === 'string'
      ? req.body.reviewNote.trim()
      : '';

    if (!['approved', 'denied'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be approved or denied.',
      });
    }
    if (reviewNote.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Review note cannot exceed 1000 characters.',
      });
    }

    const request = await ReactivationRequest.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      {
        $set: {
          status: decision,
          reviewNote,
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Pending reactivation request not found.',
      });
    }

    const targetUser = await User.findById(request.user);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'The account associated with this request no longer exists.',
      });
    }

    if (decision === 'approved') {
      targetUser.accountStatus = 'active';
      await targetUser.save();
    }

    await AuditLog.create({
      actor: req.user._id,
      actorEmail: req.user.email,
      action: decision === 'approved'
        ? 'REACTIVATION_REQUEST_APPROVED'
        : 'REACTIVATION_REQUEST_DENIED',
      targetUser: targetUser._id,
      targetUserEmail: targetUser.email,
      details: { requestId: request._id, reviewNote },
      ipAddress: req.ip || '',
      userAgent: req.get('User-Agent') || '',
    });

    res.status(200).json({
      success: true,
      message: decision === 'approved'
        ? `Reactivation request approved. ${targetUser.name}'s account is active.`
        : `Reactivation request denied. ${targetUser.name}'s account remains suspended.`,
      request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getMyRequest,
  getRequests,
  reviewRequest,
};

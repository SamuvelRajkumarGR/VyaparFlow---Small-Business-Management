const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');

// @desc    Get platform-wide statistics for Super Admin dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ accountStatus: 'active' });
    const suspendedUsers = await User.countDocuments({ accountStatus: 'suspended' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newUsersLast7Days = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const newUsersLast30Days = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Authentication provider counts
    const googleUsers = await User.countDocuments({ authProviders: 'google' });
    const localUsers = await User.countDocuments({ authProviders: 'local' });

    // Platform-wide transaction count (aggregated only - respecting user privacy)
    const totalPlatformTransactions = await Transaction.countDocuments();

    // Registration trend by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const registrationTrend = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendFormatted = registrationTrend.map((item) => ({
      label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      users: item.count,
    }));

    // Recent 5 administrative audit logs
    const recentActivity = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        adminCount,
        regularUsers,
        newUsersLast7Days,
        newUsersLast30Days,
        googleUsers,
        localUsers,
        totalPlatformTransactions,
        registrationTrend: trendFormatted,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get paginated registered users list
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, role, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.accountStatus = status;
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { businessName: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash -resetPasswordToken -resetPasswordExpires')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user metadata & stats
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Platform privacy boundary: provide transaction count without leaking private financial entries
    const transactionCount = await Transaction.countDocuments({ owner: user._id });

    res.status(200).json({
      success: true,
      user,
      transactionCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend or Reactivate user account
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin only)
const updateUserStatus = async (req, res, next) => {
  try {
    const { accountStatus } = req.body;

    if (!['active', 'suspended'].includes(accountStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'active' or 'suspended'",
      });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Safety guard: Admin cannot suspend themselves
    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot suspend your own administrative account',
      });
    }

    const oldStatus = targetUser.accountStatus;
    targetUser.accountStatus = accountStatus;
    await targetUser.save();

    // Log the administrative action in AuditLog
    await AuditLog.create({
      actor: req.user._id,
      actorEmail: req.user.email,
      action: accountStatus === 'suspended' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
      targetUser: targetUser._id,
      targetUserEmail: targetUser.email,
      details: {
        previousStatus: oldStatus,
        newStatus: accountStatus,
        targetBusiness: targetUser.businessName,
      },
      ipAddress: req.ip || '',
      userAgent: req.get('User-Agent') || '',
    });

    res.status(200).json({
      success: true,
      message: `User account for "${targetUser.name}" has been ${accountStatus === 'suspended' ? 'suspended' : 'reactivated'}.`,
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        accountStatus: targetUser.accountStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin only)
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, action } = req.query;

    const query = {};
    if (action && action !== 'all') query.action = action;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getUsers,
  getUserById,
  updateUserStatus,
  getAuditLogs,
};

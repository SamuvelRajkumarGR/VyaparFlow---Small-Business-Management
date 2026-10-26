const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  getUserById,
  updateUserStatus,
  getAuditLogs,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const {
  getRequests,
  reviewRequest,
} = require('../controllers/reactivationRequestController');

// All admin routes strictly require valid authentication + admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/status', updateUserStatus);
router.get('/audit-logs', getAuditLogs);
router.get('/reactivation-requests', getRequests);
router.patch('/reactivation-requests/:id', reviewRequest);

module.exports = router;

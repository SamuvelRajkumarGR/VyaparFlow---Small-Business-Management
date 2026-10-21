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

// All admin routes strictly require valid authentication + admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/status', updateUserStatus);
router.get('/audit-logs', getAuditLogs);

module.exports = router;

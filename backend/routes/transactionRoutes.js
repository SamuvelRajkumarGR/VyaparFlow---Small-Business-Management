const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getDashboardSummary,
} = require('../controllers/transactionController');
const { seedData } = require('../seed/seedData');
const { protect } = require('../middleware/auth');

// All transaction routes are strictly user-protected
router.use(protect);

// Dashboard financial summary endpoint
router.get('/summary', getDashboardSummary);

// Seed sample demo data endpoint for current user
router.post('/seed', seedData);

// Base transaction REST CRUD endpoints
router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.route('/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;

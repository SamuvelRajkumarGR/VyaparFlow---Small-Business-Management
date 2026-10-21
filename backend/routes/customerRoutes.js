const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  recordCustomerBalanceChange,
  deleteCustomer,
} = require('../controllers/customerController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getCustomers)
  .post(createCustomer);

router.route('/:id')
  .get(getCustomerById)
  .put(updateCustomer)
  .delete(deleteCustomer);

router.post('/:id/transaction', recordCustomerBalanceChange);

module.exports = router;

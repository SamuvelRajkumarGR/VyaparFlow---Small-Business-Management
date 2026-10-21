const express = require('express');
const router = express.Router();
const { exportTransactionsCSV, getReportStatement } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/csv', exportTransactionsCSV);
router.get('/statement', getReportStatement);

module.exports = router;

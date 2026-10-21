const Transaction = require('../models/Transaction');
const { isCreditGivenTransaction } = require('../utils/transactionClassification');

// Helper to escape CSV strings
const escapeCSV = (str) => {
  if (str === null || str === undefined) return '""';
  const val = String(str).replace(/"/g, '""');
  return `"${val}"`;
};

const applyDateFilter = (query, period, startDate, endDate) => {
  if (period === 'custom' || startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) {
      const rangeEnd = new Date(endDate);
      rangeEnd.setHours(23, 59, 59, 999);
      query.date.$lte = rangeEnd;
    }
    return;
  }

  const now = new Date();
  switch (period) {
    case 'today':
      query.date = {
        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
      };
      break;
    case 'week': {
      const startOfWeek = new Date(now);
      const dayOfWeek = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() + (dayOfWeek === 0 ? -6 : 1 - dayOfWeek));
      startOfWeek.setHours(0, 0, 0, 0);
      query.date = { $gte: startOfWeek, $lte: now };
      break;
    }
    case 'month':
      query.date = {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
      };
      break;
    case 'lastmonth':
      query.date = {
        $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        $lte: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
      };
      break;
    case 'year':
      query.date = {
        $gte: new Date(now.getFullYear(), 0, 1),
        $lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
      };
      break;
    default:
      break;
  }
};

// @desc    Export transactions to CSV file
// @route   GET /api/reports/csv
// @access  Private (Owner isolated)
const exportTransactionsCSV = async (req, res, next) => {
  try {
    const { period, startDate, endDate, type, excludeCreditGiven } = req.query;

    const query = { owner: req.user._id };

    if (type && type !== 'all') query.type = type.toLowerCase();
    applyDateFilter(query, period, startDate, endDate);

    let transactions = await Transaction.find(query)
      .populate('customer', 'name phone')
      .sort({ date: -1 });
    if (type?.toLowerCase() === 'sale' || excludeCreditGiven === 'true') {
      transactions = transactions.filter((transaction) => !isCreditGivenTransaction(transaction));
    }

    // Build CSV content
    const headers = [
      'Transaction ID',
      'Date',
      'Type',
      'Amount',
      'Payment Method',
      'Category',
      'Description',
      'Customer Name',
      'Customer Phone',
    ];

    const rows = transactions.map((t) => [
      escapeCSV(t._id),
      escapeCSV(new Date(t.date).toISOString().split('T')[0]),
      escapeCSV(t.type.toUpperCase()),
      escapeCSV(t.amount),
      escapeCSV(t.paymentMethod.toUpperCase()),
      escapeCSV(t.category.toUpperCase()),
      escapeCSV(t.description),
      escapeCSV(t.customer?.name || 'Walk-in'),
      escapeCSV(t.customer?.phone || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const filename = `VyaparFlow_${req.user.businessName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// @desc    Get printable report summary
// @route   GET /api/reports/statement
// @access  Private (Owner isolated)
const getReportStatement = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { owner: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        query.date.$lte = eDate;
      }
    }

    const transactions = await Transaction.find(query)
      .populate('customer', 'name phone')
      .sort({ date: -1 });

    let totalSales = 0;
    let totalExpenses = 0;

    transactions.forEach((t) => {
      if (t.type === 'sale' && !isCreditGivenTransaction(t)) totalSales += Number(t.amount) || 0;
      else if (t.type === 'expense') totalExpenses += Number(t.amount) || 0;
    });

    const netProfit = totalSales - totalExpenses;

    res.status(200).json({
      success: true,
      report: {
        businessName: req.user.businessName,
        ownerName: req.user.name,
        currency: req.user.currency || '₹',
        generatedAt: new Date(),
        totalSales,
        totalExpenses,
        netProfit,
        isProfit: netProfit >= 0,
        transactionsCount: transactions.length,
        transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportTransactionsCSV,
  getReportStatement,
};

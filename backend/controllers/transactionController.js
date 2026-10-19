const Transaction = require('../models/Transaction');

// Helper to calculate date range based on period filter
const getDateFilter = (period, customStart, customEnd) => {
  const now = new Date();
  let startDate = null;
  let endDate = new Date(now);

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'week': {
      const d = new Date(now);
      const dayOfWeek = d.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startDate = new Date(d.setDate(d.getDate() + diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      break;
    }
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    case 'lastmonth':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    case 'custom':
      if (customStart) startDate = new Date(customStart);
      if (customEnd) {
        endDate = new Date(customEnd);
        endDate.setHours(23, 59, 59, 999);
      }
      break;
    case 'all':
    default:
      return {};
  }

  const query = {};
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }
  return query;
};

// Helper to compute summary from a set of transactions
const computeSummary = (transactions) => {
  let totalSales = 0;
  let totalExpenses = 0;
  const paymentBreakdown = { cash: 0, upi: 0, card: 0 };
  const expenseBreakdown = { stock: 0, rent: 0, bills: 0, salaries: 0, other: 0 };
  const trendMap = {};

  transactions.forEach((t) => {
    const amt = Number(t.amount) || 0;
    const dateStr = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (!trendMap[dateStr]) {
      trendMap[dateStr] = { date: dateStr, sales: 0, expenses: 0, profit: 0, timestamp: new Date(t.date).getTime() };
    }

    if (t.type === 'sale') {
      totalSales += amt;
      if (paymentBreakdown[t.paymentMethod] !== undefined) {
        paymentBreakdown[t.paymentMethod] += amt;
      } else {
        paymentBreakdown.cash += amt;
      }
      trendMap[dateStr].sales += amt;
    } else if (t.type === 'expense') {
      totalExpenses += amt;
      if (expenseBreakdown[t.category] !== undefined) {
        expenseBreakdown[t.category] += amt;
      } else {
        expenseBreakdown.other += amt;
      }
      trendMap[dateStr].expenses += amt;
    }

    trendMap[dateStr].profit = trendMap[dateStr].sales - trendMap[dateStr].expenses;
  });

  const netProfit = totalSales - totalExpenses;
  const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
  const trendData = Object.values(trendMap).sort((a, b) => a.timestamp - b.timestamp);

  const paymentChartData = [
    { name: 'Cash', value: paymentBreakdown.cash, color: '#10B981' },
    { name: 'UPI', value: paymentBreakdown.upi, color: '#3B82F6' },
    { name: 'Card', value: paymentBreakdown.card, color: '#8B5CF6' },
  ];
  const expenseChartData = [
    { name: 'Stock', value: expenseBreakdown.stock, color: '#F59E0B' },
    { name: 'Shop Rent', value: expenseBreakdown.rent, color: '#EF4444' },
    { name: 'Electricity', value: expenseBreakdown.bills, color: '#06B6D4' },
    { name: 'Salaries', value: expenseBreakdown.salaries, color: '#EC4899' },
    { name: 'Other', value: expenseBreakdown.other, color: '#6B7280' },
  ];

  return {
    totalSales, totalExpenses, netProfit,
    isProfit: netProfit >= 0,
    profitMargin: parseFloat(profitMargin.toFixed(2)),
    paymentBreakdown, expenseBreakdown,
    paymentChartData, expenseChartData, trendData,
    totalTransactionsCount: transactions.length,
  };
};

// @desc    Get all transactions with search, filter, and pagination
// @route   GET /api/transactions
// @access  Public
const getTransactions = async (req, res, next) => {
  try {
    const { type, paymentMethod, category, search, period, startDate, endDate, sortBy = 'date', order = 'desc' } = req.query;
    const query = getDateFilter(period, startDate, endDate);

    if (type && type !== 'all') query.type = type.toLowerCase();
    if (paymentMethod && paymentMethod !== 'all') query.paymentMethod = paymentMethod.toLowerCase();
    if (category && category !== 'all') query.category = category.toLowerCase();
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { paymentMethod: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    const transactions = await Transaction.find(query).sort(sortObj);
    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Public
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new transaction (Sale or Expense)
// @route   POST /api/transactions
// @access  Public
const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, paymentMethod, category, description, date } = req.body;

    if (!type || !['sale', 'expense'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Valid transaction type (sale or expense) is required' });
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number greater than 0' });
    }
    if (!description || description.trim() === '') {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }

    const newTransaction = await Transaction.create({
      type: type.toLowerCase(),
      amount: parsedAmount,
      paymentMethod: paymentMethod ? paymentMethod.toLowerCase() : 'cash',
      category: category ? category.toLowerCase() : (type === 'sale' ? 'other' : 'stock'),
      description: description.trim(),
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({ success: true, message: `${type.toUpperCase()} recorded successfully`, data: newTransaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Public
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });

    const { type, amount, paymentMethod, category, description, date } = req.body;

    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be a positive number greater than 0' });
      }
      transaction.amount = parsedAmount;
    }
    if (type) transaction.type = type.toLowerCase();
    if (paymentMethod) transaction.paymentMethod = paymentMethod.toLowerCase();
    if (category) transaction.category = category.toLowerCase();
    if (description) transaction.description = description.trim();
    if (date) transaction.date = new Date(date);

    const updatedTransaction = await transaction.save();
    res.status(200).json({ success: true, message: 'Transaction updated successfully', data: updatedTransaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Public
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    await transaction.deleteOne();
    res.status(200).json({ success: true, message: 'Transaction deleted successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete financial summary + comparison with last month
// @route   GET /api/transactions/summary
// @access  Public
const getDashboardSummary = async (req, res, next) => {
  try {
    const { period = 'all', startDate, endDate } = req.query;
    const dateQuery = getDateFilter(period, startDate, endDate);

    const transactions = await Transaction.find(dateQuery).sort({ date: -1 });
    const current = computeSummary(transactions);

    // Last month comparison (always fetch for insights)
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const lastMonthTxns = await Transaction.find({ date: { $gte: lastMonthStart, $lte: lastMonthEnd } });
    const lastMonth = computeSummary(lastMonthTxns);

    // Compute month-over-month deltas
    const salesChange = lastMonth.totalSales > 0
      ? parseFloat((((current.totalSales - lastMonth.totalSales) / lastMonth.totalSales) * 100).toFixed(1))
      : null;
    const expenseChange = lastMonth.totalExpenses > 0
      ? parseFloat((((current.totalExpenses - lastMonth.totalExpenses) / lastMonth.totalExpenses) * 100).toFixed(1))
      : null;
    const marginChange = lastMonth.profitMargin !== 0
      ? parseFloat((current.profitMargin - lastMonth.profitMargin).toFixed(1))
      : null;

    // Sales count breakdown
    const salesTransactions = transactions.filter(t => t.type === 'sale');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    // Payment method transaction counts
    const paymentCounts = { cash: 0, upi: 0, card: 0 };
    salesTransactions.forEach(t => {
      if (paymentCounts[t.paymentMethod] !== undefined) paymentCounts[t.paymentMethod]++;
    });

    // Generate insights from real data
    const insights = [];
    if (salesChange !== null && Math.abs(salesChange) >= 1) {
      insights.push({
        type: salesChange >= 0 ? 'positive' : 'negative',
        message: salesChange >= 0
          ? `Sales are up ${salesChange}% compared to last month.`
          : `Sales are down ${Math.abs(salesChange)}% compared to last month.`,
      });
    }
    if (expenseChange !== null && expenseChange > 10) {
      insights.push({ type: 'warning', message: `Expenses increased ${expenseChange}% compared to last month.` });
    }
    if (marginChange !== null && Math.abs(marginChange) >= 1) {
      insights.push({
        type: marginChange >= 0 ? 'positive' : 'negative',
        message: marginChange >= 0
          ? `Your profit margin improved by ${marginChange}% this period.`
          : `Your profit margin decreased by ${Math.abs(marginChange)}% this period.`,
      });
    }

    // Biggest payment method
    const topPayment = Object.entries(current.paymentBreakdown).sort(([, a], [, b]) => b - a)[0];
    if (topPayment && current.totalSales > 0) {
      const pct = Math.round((topPayment[1] / current.totalSales) * 100);
      if (pct > 0) {
        const labels = { cash: 'Cash', upi: 'UPI', card: 'Card' };
        insights.push({ type: 'info', message: `${labels[topPayment[0]] || topPayment[0]} accounts for ${pct}% of your sales.` });
      }
    }

    // Biggest expense category
    const topExpense = Object.entries(current.expenseBreakdown).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a)[0];
    if (topExpense && current.totalExpenses > 0) {
      const labels = { stock: 'Stock purchases', rent: 'Shop rent', bills: 'Electricity bills', salaries: 'Staff salaries', other: 'Other expenses' };
      insights.push({ type: 'info', message: `${labels[topExpense[0]] || topExpense[0]} is your biggest expense this period.` });
    }

    res.status(200).json({
      success: true,
      data: {
        ...current,
        profitStatusText: current.isProfit ? "You're profitable" : "Your business is in a loss",
        recentTransactions: transactions.slice(0, 8),
        comparison: { salesChange, expenseChange, marginChange },
        lastMonth: { totalSales: lastMonth.totalSales, totalExpenses: lastMonth.totalExpenses, profitMargin: lastMonth.profitMargin },
        insights,
        paymentCounts,
        salesCount: salesTransactions.length,
        expenseCount: expenseTransactions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getDashboardSummary,
};

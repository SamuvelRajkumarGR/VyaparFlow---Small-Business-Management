const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');

// @desc    Get all customers for current user
// @route   GET /api/customers
// @access  Private (Owner isolated)
const getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { owner: req.user._id };

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const customers = await Customer.find(query).sort({ updatedAt: -1 });

    // Aggregate overall Udhar metrics
    let totalUdharReceivable = 0; // Money customers owe to business
    let totalAdvancePayable = 0;   // Money business owes customers

    customers.forEach((c) => {
      const bal = Number(c.balance) || 0;
      if (bal > 0) totalUdharReceivable += bal;
      else if (bal < 0) totalAdvancePayable += Math.abs(bal);
    });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
      metrics: {
        totalCustomers: customers.length,
        totalUdharReceivable,
        totalAdvancePayable,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer details + transaction history
// @route   GET /api/customers/:id
// @access  Private (Owner isolated)
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const transactions = await Transaction.find({
      owner: req.user._id,
      customer: customer._id,
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: customer,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private (Owner isolated)
const createCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, address, balance, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Customer name is required' });
    }

    const newCustomer = await Customer.create({
      owner: req.user._id,
      name: name.trim(),
      phone: phone ? phone.trim() : '',
      email: email ? email.trim().toLowerCase() : '',
      address: address ? address.trim() : '',
      balance: balance !== undefined ? Number(balance) : 0,
      notes: notes ? notes.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Customer added successfully',
      data: newCustomer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private (Owner isolated)
const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const { name, phone, email, address, balance, notes } = req.body;

    if (name) customer.name = name.trim();
    if (phone !== undefined) customer.phone = phone.trim();
    if (email !== undefined) customer.email = email.trim().toLowerCase();
    if (address !== undefined) customer.address = address.trim();
    if (balance !== undefined) customer.balance = Number(balance);
    if (notes !== undefined) customer.notes = notes.trim();

    const updated = await customer.save();

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record Udhar credit or payment received
// @route   POST /api/customers/:id/transaction
// @access  Private (Owner isolated)
const recordCustomerBalanceChange = async (req, res, next) => {
  try {
    const { type, amount, paymentMethod, description } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive amount is required' });
    }

    const customer = await Customer.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const parsedAmount = Number(amount);

    // type === 'give_credit' (Udhar given to customer -> customer owes money -> balance increases)
    // type === 'receive_payment' (Customer settled udhar -> money received as sale -> balance decreases)
    if (type === 'give_credit') {
      customer.balance += parsedAmount;
      await customer.save();

      // Record as sale on credit
      const txn = await Transaction.create({
        owner: req.user._id,
        customer: customer._id,
        type: 'sale',
        isCreditGiven: true,
        amount: parsedAmount,
        paymentMethod: paymentMethod || 'cash',
        category: 'other',
        description: description || `Udhar (Credit) given to ${customer.name}`,
        date: new Date(),
      });

      return res.status(200).json({
        success: true,
        message: `Udhar of ₹${parsedAmount} recorded for ${customer.name}`,
        data: customer,
        transaction: txn,
      });
    } else if (type === 'receive_payment') {
      customer.balance -= parsedAmount;
      await customer.save();

      // Record as sale collection
      const txn = await Transaction.create({
        owner: req.user._id,
        customer: customer._id,
        type: 'sale',
        amount: parsedAmount,
        paymentMethod: paymentMethod || 'cash',
        category: 'other',
        description: description || `Udhar payment received from ${customer.name}`,
        date: new Date(),
      });

      return res.status(200).json({
        success: true,
        message: `Payment of ₹${parsedAmount} recorded from ${customer.name}`,
        data: customer,
        transaction: txn,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action type. Expected 'give_credit' or 'receive_payment'",
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Owner isolated)
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await customer.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Customer removed successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  recordCustomerBalanceChange,
  deleteCustomer,
};

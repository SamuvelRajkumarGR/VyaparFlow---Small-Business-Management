const Transaction = require('../models/Transaction');

// Rich 30-day seed dataset demonstrating multiple categories, payment methods, and profit scenario
const mockTransactions = [
  // === SALES (Money In) ===
  { type: 'sale', amount: 4200, paymentMethod: 'upi', category: 'other', description: 'Morning grocery retail - GPay', date: new Date(Date.now() - 29 * 86400000) },
  { type: 'sale', amount: 6800, paymentMethod: 'cash', category: 'other', description: 'Walk-in counter sales', date: new Date(Date.now() - 27 * 86400000) },
  { type: 'sale', amount: 11500, paymentMethod: 'card', category: 'other', description: 'Bulk order - credit card', date: new Date(Date.now() - 25 * 86400000) },
  { type: 'sale', amount: 3900, paymentMethod: 'upi', category: 'other', description: 'PhonePe payment - household items', date: new Date(Date.now() - 23 * 86400000) },
  { type: 'sale', amount: 8700, paymentMethod: 'cash', category: 'other', description: 'Weekend peak sales', date: new Date(Date.now() - 21 * 86400000) },
  { type: 'sale', amount: 5500, paymentMethod: 'upi', category: 'other', description: 'Regular customer - GPay', date: new Date(Date.now() - 19 * 86400000) },
  { type: 'sale', amount: 13200, paymentMethod: 'card', category: 'other', description: 'Corporate bulk purchase', date: new Date(Date.now() - 17 * 86400000) },
  { type: 'sale', amount: 2800, paymentMethod: 'cash', category: 'other', description: 'Evening counter collections', date: new Date(Date.now() - 15 * 86400000) },
  { type: 'sale', amount: 7600, paymentMethod: 'upi', category: 'other', description: 'Wholesale delivery payment', date: new Date(Date.now() - 13 * 86400000) },
  { type: 'sale', amount: 4100, paymentMethod: 'cash', category: 'other', description: 'Festival discount sales', date: new Date(Date.now() - 11 * 86400000) },
  { type: 'sale', amount: 9200, paymentMethod: 'upi', category: 'other', description: 'Online order - Paytm', date: new Date(Date.now() - 9 * 86400000) },
  { type: 'sale', amount: 3300, paymentMethod: 'card', category: 'other', description: 'Debit card retail payment', date: new Date(Date.now() - 7 * 86400000) },
  { type: 'sale', amount: 6400, paymentMethod: 'upi', category: 'other', description: 'Regular weekday sales - GPay', date: new Date(Date.now() - 5 * 86400000) },
  { type: 'sale', amount: 8900, paymentMethod: 'cash', category: 'other', description: 'Large walk-in purchase', date: new Date(Date.now() - 3 * 86400000) },
  { type: 'sale', amount: 5100, paymentMethod: 'upi', category: 'other', description: 'PhonePe - repeat customer', date: new Date(Date.now() - 1 * 86400000) },
  { type: 'sale', amount: 4600, paymentMethod: 'card', category: 'other', description: "Today's card payment", date: new Date() },

  // === EXPENSES (Money Out) ===
  { type: 'expense', amount: 18000, paymentMethod: 'cash', category: 'stock', description: 'Monthly grocery wholesale restock', date: new Date(Date.now() - 28 * 86400000) },
  { type: 'expense', amount: 12000, paymentMethod: 'upi', category: 'rent', description: 'Shop monthly rent - October', date: new Date(Date.now() - 26 * 86400000) },
  { type: 'expense', amount: 6500, paymentMethod: 'cash', category: 'stock', description: 'Beverages and packaged goods restock', date: new Date(Date.now() - 22 * 86400000) },
  { type: 'expense', amount: 3200, paymentMethod: 'card', category: 'bills', description: 'Commercial electricity bill', date: new Date(Date.now() - 18 * 86400000) },
  { type: 'expense', amount: 18000, paymentMethod: 'upi', category: 'salaries', description: 'Staff monthly salaries - October', date: new Date(Date.now() - 14 * 86400000) },
  { type: 'expense', amount: 4800, paymentMethod: 'cash', category: 'stock', description: 'Mid-month inventory top-up', date: new Date(Date.now() - 10 * 86400000) },
  { type: 'expense', amount: 1200, paymentMethod: 'cash', category: 'other', description: 'Cleaning and maintenance supplies', date: new Date(Date.now() - 6 * 86400000) },
  { type: 'expense', amount: 950, paymentMethod: 'upi', category: 'bills', description: 'Internet and phone bill', date: new Date(Date.now() - 4 * 86400000) },
  { type: 'expense', amount: 2400, paymentMethod: 'card', category: 'stock', description: 'Special order - seasonal items', date: new Date(Date.now() - 2 * 86400000) },
];

const seedData = async (req, res) => {
  try {
    await Transaction.deleteMany({});
    const inserted = await Transaction.insertMany(mockTransactions);

    if (res && res.status) {
      return res.status(200).json({
        success: true,
        message: `Demo data loaded! ${inserted.length} sample transactions added.`,
        count: inserted.length,
      });
    } else {
      console.log(`[Seed Success]: Seeded ${inserted.length} sample transactions.`);
    }
  } catch (error) {
    if (res && res.status) {
      return res.status(500).json({ success: false, message: `Seeding error: ${error.message}` });
    } else {
      console.error(`[Seed Error]: ${error.message}`);
    }
  }
};

if (require.main === module) {
  const mongoose = require('mongoose');
  const dotenv = require('dotenv');
  dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

  mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/small_business_db')
    .then(async () => {
      console.log('[Seed Script] Connected to MongoDB...');
      await seedData();
      mongoose.disconnect();
    })
    .catch((err) => console.error('[Seed Script Error]:', err));
}

module.exports = { seedData, mockTransactions };

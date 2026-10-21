const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Rich 30-day seed dataset demonstrating multiple categories, payment methods, and profit scenario
const mockTransactions = [
  // === SALES (Money In) ===
  { type: 'sale', amount: 4200, paymentMethod: 'upi', category: 'other', description: 'Morning grocery retail - GPay', daysAgo: 29 },
  { type: 'sale', amount: 6800, paymentMethod: 'cash', category: 'other', description: 'Walk-in counter sales', daysAgo: 27 },
  { type: 'sale', amount: 11500, paymentMethod: 'card', category: 'other', description: 'Bulk order - credit card', daysAgo: 25 },
  { type: 'sale', amount: 3900, paymentMethod: 'upi', category: 'other', description: 'PhonePe payment - household items', daysAgo: 23 },
  { type: 'sale', amount: 8700, paymentMethod: 'cash', category: 'other', description: 'Weekend peak sales', daysAgo: 21 },
  { type: 'sale', amount: 5500, paymentMethod: 'upi', category: 'other', description: 'Regular customer - GPay', daysAgo: 19 },
  { type: 'sale', amount: 13200, paymentMethod: 'card', category: 'other', description: 'Corporate bulk purchase', daysAgo: 17 },
  { type: 'sale', amount: 2800, paymentMethod: 'cash', category: 'other', description: 'Evening counter collections', daysAgo: 15 },
  { type: 'sale', amount: 7600, paymentMethod: 'upi', category: 'other', description: 'Wholesale delivery payment', daysAgo: 13 },
  { type: 'sale', amount: 4100, paymentMethod: 'cash', category: 'other', description: 'Festival discount sales', daysAgo: 11 },
  { type: 'sale', amount: 9200, paymentMethod: 'upi', category: 'other', description: 'Online order - Paytm', daysAgo: 9 },
  { type: 'sale', amount: 3300, paymentMethod: 'card', category: 'other', description: 'Debit card retail payment', daysAgo: 7 },
  { type: 'sale', amount: 6400, paymentMethod: 'upi', category: 'other', description: 'Regular weekday sales - GPay', daysAgo: 5 },
  { type: 'sale', amount: 8900, paymentMethod: 'cash', category: 'other', description: 'Large walk-in purchase', daysAgo: 3 },
  { type: 'sale', amount: 5100, paymentMethod: 'upi', category: 'other', description: 'PhonePe - repeat customer', daysAgo: 1 },
  { type: 'sale', amount: 4600, paymentMethod: 'card', category: 'other', description: "Today's card payment", daysAgo: 0 },

  // === EXPENSES (Money Out) ===
  { type: 'expense', amount: 18000, paymentMethod: 'cash', category: 'stock', description: 'Monthly grocery wholesale restock', daysAgo: 28 },
  { type: 'expense', amount: 12000, paymentMethod: 'upi', category: 'rent', description: 'Shop monthly rent - October', daysAgo: 26 },
  { type: 'expense', amount: 6500, paymentMethod: 'cash', category: 'stock', description: 'Beverages and packaged goods restock', daysAgo: 22 },
  { type: 'expense', amount: 3200, paymentMethod: 'card', category: 'bills', description: 'Commercial electricity bill', daysAgo: 18 },
  { type: 'expense', amount: 18000, paymentMethod: 'upi', category: 'salaries', description: 'Staff monthly salaries - October', daysAgo: 14 },
  { type: 'expense', amount: 4800, paymentMethod: 'cash', category: 'stock', description: 'Mid-month inventory top-up', daysAgo: 10 },
  { type: 'expense', amount: 1200, paymentMethod: 'cash', category: 'other', description: 'Cleaning and maintenance supplies', daysAgo: 6 },
  { type: 'expense', amount: 950, paymentMethod: 'upi', category: 'bills', description: 'Internet and phone bill', daysAgo: 4 },
  { type: 'expense', amount: 2400, paymentMethod: 'card', category: 'stock', description: 'Special order - seasonal items', daysAgo: 2 },
];

const seedData = async (req, res) => {
  try {
    let ownerId = req?.user?._id;

    // If running from CLI or no owner in request, find or create demo user
    if (!ownerId) {
      let demoUser = await User.findOne({ email: 'demo@vyaparflow.com' });
      if (!demoUser) {
        const passwordHash = await User.hashPassword('DemoPassword123!');
        demoUser = await User.create({
          name: 'Demo Merchant',
          businessName: 'Apex Retail & Traders (Demo)',
          email: 'demo@vyaparflow.com',
          phone: '+91 98765 43210',
          passwordHash,
          role: 'user',
          accountStatus: 'active',
        });
      }
      ownerId = demoUser._id;
    }

    // SAFE ISOLATION: Only delete transactions belonging to THIS specific user
    await Transaction.deleteMany({ owner: ownerId });

    const txnsToInsert = mockTransactions.map((item) => ({
      owner: ownerId,
      type: item.type,
      amount: item.amount,
      paymentMethod: item.paymentMethod,
      category: item.category,
      description: item.description,
      date: new Date(Date.now() - item.daysAgo * 86400000),
    }));

    const inserted = await Transaction.insertMany(txnsToInsert);

    if (res && res.status) {
      return res.status(200).json({
        success: true,
        message: `Demo data loaded successfully! ${inserted.length} sample transactions added to your workspace.`,
        count: inserted.length,
      });
    } else {
      console.log(`[Seed Success]: Seeded ${inserted.length} sample transactions for user ${ownerId}.`);
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
      await mongoose.disconnect();
    })
    .catch((err) => console.error('[Seed Script Error]:', err));
}

module.exports = { seedData, mockTransactions };

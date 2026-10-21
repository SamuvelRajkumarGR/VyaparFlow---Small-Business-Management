const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Transaction = require('../models/Transaction');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const migrateLegacyData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/small_business_db';
    await mongoose.connect(mongoUri);
    console.log('[VyaparFlow Migration] Connected to MongoDB...');

    // Find transactions without owner
    const unownedTxns = await Transaction.find({
      $or: [{ owner: { $exists: false } }, { owner: null }],
    });

    console.log(`[Scan]: Found ${unownedTxns.length} legacy transactions without an owner.`);

    if (unownedTxns.length === 0) {
      console.log('✅ All transactions in the database are properly owned. No migration needed.');
      await mongoose.disconnect();
      process.exit(0);
    }

    const targetEmail = process.argv[2];

    if (!targetEmail) {
      console.log('\n================================================================');
      console.log('⚠️ Migration target email not specified.');
      console.log(`Found ${unownedTxns.length} unowned transactions.`);
      console.log('To assign these legacy transactions to a specific business account, run:');
      console.log('  node scripts/migrateLegacyData.js your_email@example.com');
      console.log('================================================================\n');
      await mongoose.disconnect();
      process.exit(0);
    }

    const targetUser = await User.findOne({ email: targetEmail.toLowerCase().trim() });
    if (!targetUser) {
      console.error(`❌ Error: User with email "${targetEmail}" was not found in the database.`);
      console.error('Please register or provision the user first before migrating records.');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Migrate all unowned records to targetUser._id
    const result = await Transaction.updateMany(
      { $or: [{ owner: { $exists: false } }, { owner: null }] },
      { $set: { owner: targetUser._id } }
    );

    // Record audit log
    await AuditLog.create({
      actor: targetUser._id,
      actorEmail: targetUser.email,
      action: 'LEGACY_DATA_MIGRATED',
      details: {
        recordCount: result.modifiedCount,
        assignedTo: targetUser.email,
        timestamp: new Date(),
      },
    });

    console.log(`✅ Migration Complete: ${result.modifiedCount} legacy transactions successfully assigned to ${targetUser.email} (${targetUser.businessName}).`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Migration Error]:', error.message);
    process.exit(1);
  }
};

migrateLegacyData();

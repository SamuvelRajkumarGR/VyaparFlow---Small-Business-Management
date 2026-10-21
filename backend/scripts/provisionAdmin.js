const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const provisionAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/small_business_db';
    await mongoose.connect(mongoUri);
    console.log('[VyaparFlow Admin Provisioning] Connected to MongoDB...');

    // Read credentials securely from environment variables or command-line arguments
    // Usage: node scripts/provisionAdmin.js [email] [password] [name] [businessName]
    const args = process.argv.slice(2);
    const email = (args[0] || process.env.ADMIN_EMAIL || 'admin@vyaparflow.com').toLowerCase().trim();
    const password = args[1] || process.env.ADMIN_PASSWORD || 'VyaparAdmin#2026!';
    const name = args[2] || process.env.ADMIN_NAME || 'Super Administrator';
    const businessName = args[3] || process.env.ADMIN_BUSINESS || 'VyaparFlow Headquarters';

    if (!email || !password || password.length < 8) {
      console.error('Error: Admin email and a secure password (min 8 chars) are required.');
      process.exit(1);
    }

    // Check if an admin already exists with this email or role
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log(`[Notice]: Admin account with email ${email} already exists. No action taken to avoid accidental overwrite.`);
        await mongoose.disconnect();
        process.exit(0);
      } else {
        // Upgrade existing user to admin with confirmation
        console.log(`[Warning]: User ${email} currently has role '${existingUser.role}'. Upgrading to 'admin'...`);
        existingUser.role = 'admin';
        existingUser.accountStatus = 'active';
        await existingUser.save();

        await AuditLog.create({
          actor: existingUser._id,
          actorEmail: email,
          action: 'ADMIN_PROVISIONED',
          details: { method: 'CLI script upgrade' },
        });

        console.log(`[Success]: User ${email} successfully promoted to Super Admin.`);
        await mongoose.disconnect();
        process.exit(0);
      }
    }

    // Hash password securely
    const passwordHash = await User.hashPassword(password);

    const adminUser = await User.create({
      name,
      businessName,
      email,
      passwordHash,
      role: 'admin',
      accountStatus: 'active',
      authProviders: ['local'],
      lastLoginAt: new Date(),
    });

    // Record in audit log
    await AuditLog.create({
      actor: adminUser._id,
      actorEmail: adminUser.email,
      action: 'ADMIN_PROVISIONED',
      details: {
        method: 'Controlled Server-Side Provisioning Script',
        timestamp: new Date(),
      },
    });

    console.log('====================================================');
    console.log('🎉 Super Admin Provisioned Successfully!');
    console.log(`👤 Name:          ${adminUser.name}`);
    console.log(`📧 Email:         ${adminUser.email}`);
    console.log(`👑 Role:          ${adminUser.role}`);
    console.log(`🏢 Business Name: ${adminUser.businessName}`);
    console.log('====================================================');
    console.log('⚠️ Please store your administrator password securely.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Admin Provisioning Failed]:', error.message);
    process.exit(1);
  }
};

provisionAdmin();

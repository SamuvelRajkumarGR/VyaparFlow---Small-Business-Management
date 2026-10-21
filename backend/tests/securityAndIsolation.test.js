const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

process.env.NODE_ENV = 'test';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
process.env.NODE_ENV = 'test';

const app = require('../server');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const AuditLog = require('../models/AuditLog');

// Test runner helper
let server;
let baseUrl;

const request = async (method, endpoint, body = null, token = null, cookie = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, baseUrl);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (cookie) headers['Cookie'] = cookie;

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = data;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: json,
          });
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runTests = async () => {
  console.log('\n========================================================');
  console.log('🧪 VYAPARFLOW SECURITY & MULTI-USER ISOLATION TEST SUITE');
  console.log('========================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`✅ [PASS] ${description}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${description}`);
      failedCount++;
    }
  };

  try {
    // Start temporary server on dynamic port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`📡 Test server running at ${baseUrl}`);
        resolve();
      });
    });

    // Cleanup previous test users
    await User.deleteMany({ email: { $in: ['test_user_a@test.com', 'test_user_b@test.com', 'admin_test@test.com'] } });
    await Customer.deleteMany({ name: { $regex: /Test Customer/ } });

    // ---------------------------------------------------------
    // TEST 1: Register User A with email and password
    // ---------------------------------------------------------
    const regResA = await request('POST', '/api/auth/register', {
      name: 'Alice Merchant',
      businessName: "Alice's Organics",
      email: 'test_user_a@test.com',
      password: 'AlicePassword123!',
      phone: '+91 9988776655',
    });

    assert(regResA.status === 201 && regResA.body.success, 'User A registered successfully');
    const tokenA = regResA.body.token;
    const userA = regResA.body.user;
    assert(userA.role === 'user', 'User A role is defaulted to "user" (not admin)');

    // ---------------------------------------------------------
    // TEST 2: Password is stored as hash, not plaintext
    // ---------------------------------------------------------
    const dbUserA = await User.findById(userA.id).select('+passwordHash');
    assert(
      dbUserA.passwordHash && !dbUserA.passwordHash.includes('AlicePassword123!'),
      'User password is securely hashed with bcrypt'
    );

    // ---------------------------------------------------------
    // TEST 3: Duplicate email registration is rejected
    // ---------------------------------------------------------
    const dupRes = await request('POST', '/api/auth/register', {
      name: 'Duplicate Alice',
      businessName: 'Fake Duplicate',
      email: 'test_user_a@test.com',
      password: 'AnotherPassword123!',
    });
    assert(dupRes.status === 400 && !dupRes.body.success, 'Duplicate registration with same email is safely rejected');

    // ---------------------------------------------------------
    // TEST 4: Existing user login with correct credentials
    // ---------------------------------------------------------
    const loginResA = await request('POST', '/api/auth/login', {
      email: 'test_user_a@test.com',
      password: 'AlicePassword123!',
    });
    assert(loginResA.status === 200 && loginResA.body.token, 'User A logs in successfully with valid credentials');

    // ---------------------------------------------------------
    // TEST 5: Incorrect password rejection
    // ---------------------------------------------------------
    const badLoginRes = await request('POST', '/api/auth/login', {
      email: 'test_user_a@test.com',
      password: 'WrongPassword!',
    });
    assert(badLoginRes.status === 401 && !badLoginRes.body.success, 'Login with incorrect password is rejected (401)');

    // ---------------------------------------------------------
    // TEST 6: Register User B
    // ---------------------------------------------------------
    const regResB = await request('POST', '/api/auth/register', {
      name: 'Bob Retailer',
      businessName: "Bob's Hardware",
      email: 'test_user_b@test.com',
      password: 'BobPassword123!',
      phone: '+91 9988771122',
    });
    assert(regResB.status === 201 && regResB.body.success, 'User B registered successfully');
    const tokenB = regResB.body.token;
    const userB = regResB.body.user;

    // ---------------------------------------------------------
    // TEST 7: Unauthenticated access is rejected
    // ---------------------------------------------------------
    const unauthTxnRes = await request('GET', '/api/transactions');
    assert(unauthTxnRes.status === 401, 'Unauthenticated access to /api/transactions returns 401');

    // ---------------------------------------------------------
    // TEST 8: Cross-User Transaction Isolation (Create & Read)
    // ---------------------------------------------------------
    // User A creates sale
    const txnResA = await request(
      'POST',
      '/api/transactions',
      {
        type: 'sale',
        amount: 5000,
        paymentMethod: 'upi',
        category: 'other',
        description: 'Alice organic gift box sale',
      },
      tokenA
    );
    assert(txnResA.status === 201, "User A creates sale of ₹5,000");
    const txnAId = txnResA.body.data._id;

    // User B creates sale
    const txnResB = await request(
      'POST',
      '/api/transactions',
      {
        type: 'sale',
        amount: 8000,
        paymentMethod: 'cash',
        category: 'other',
        description: 'Bob power drill set',
      },
      tokenB
    );
    assert(txnResB.status === 201, "User B creates sale of ₹8,000");
    const txnBId = txnResB.body.data._id;

    // User A lists transactions
    const listA = await request('GET', '/api/transactions', null, tokenA);
    const userASeesTxnB = listA.body.data.some((t) => t._id === txnBId);
    assert(!userASeesTxnB, "User A CANNOT see User B's transaction in list");

    // User B lists transactions
    const listB = await request('GET', '/api/transactions', null, tokenB);
    const userBSeesTxnA = listB.body.data.some((t) => t._id === txnAId);
    assert(!userBSeesTxnA, "User B CANNOT see User A's transaction in list");

    // ---------------------------------------------------------
    // TEST 9: Cross-User Direct ID Access & Tampering Prevention
    // ---------------------------------------------------------
    // User A attempts to GET User B's transaction by ID
    const getBByA = await request('GET', `/api/transactions/${txnBId}`, null, tokenA);
    assert(getBByA.status === 404, "User A cannot fetch User B's transaction by ID (404 isolated)");

    // User A attempts to UPDATE User B's transaction
    const updateBByA = await request(
      'PUT',
      `/api/transactions/${txnBId}`,
      { amount: 100, description: 'Tampered by Alice' },
      tokenA
    );
    assert(updateBByA.status === 404, "User A cannot update User B's transaction (404 isolated)");

    // User A attempts to DELETE User B's transaction
    const deleteBByA = await request('DELETE', `/api/transactions/${txnBId}`, null, tokenA);
    assert(deleteBByA.status === 404, "User A cannot delete User B's transaction (404 isolated)");

    // Verify User B's transaction is still intact
    const verifyB = await request('GET', `/api/transactions/${txnBId}`, null, tokenB);
    assert(verifyB.body.data.amount === 8000, "User B's transaction remained untouched and safe");

    // ---------------------------------------------------------
    // TEST 10: Owner Spoofing Protection in Request Body
    // ---------------------------------------------------------
    const spoofRes = await request(
      'POST',
      '/api/transactions',
      {
        type: 'expense',
        amount: 1500,
        paymentMethod: 'card',
        category: 'bills',
        description: 'Alice electricity bill with spoofed owner',
        owner: userB.id, // Malicious attempt to assign to User B
      },
      tokenA
    );
    assert(
      spoofRes.status === 201 && spoofRes.body.data.owner.toString() === userA.id,
      "Server ignores spoofed owner in request body and forces authenticated owner"
    );

    // ---------------------------------------------------------
    // TEST 11: Financial Summary & KPI Isolation
    // ---------------------------------------------------------
    const summaryA = await request('GET', '/api/transactions/summary', null, tokenA);
    const summaryB = await request('GET', '/api/transactions/summary', null, tokenB);

    assert(summaryA.body.data.totalSales === 5000, "User A's total sales strictly equals ₹5,000 (User A only)");
    assert(summaryB.body.data.totalSales === 8000, "User B's total sales strictly equals ₹8,000 (User B only)");
    assert(summaryA.body.data.totalExpenses === 1500, "User A's expenses strictly equals ₹1,500");
    assert(summaryB.body.data.totalExpenses === 0, "User B's expenses strictly equals ₹0");

    // ---------------------------------------------------------
    // TEST 12: Customer & Udhar Ledger Isolation
    // ---------------------------------------------------------
    // User A creates customer
    const custResA = await request(
      'POST',
      '/api/customers',
      {
        name: 'Test Customer Rajesh',
        phone: '+91 9123456789',
        balance: 1200, // Rajesh owes ₹1,200 to Alice
      },
      tokenA
    );
    assert(custResA.status === 201, "User A creates customer with ₹1,200 Udhar");
    const custAId = custResA.body.data._id;

    // User B tries to view User A's customers
    const custsB = await request('GET', '/api/customers', null, tokenB);
    const userBSeesCustA = custsB.body.data.some((c) => c._id === custAId);
    assert(!userBSeesCustA, "User B cannot see User A's customer records");

    // User B tries to fetch User A's customer by ID
    const getCustAByB = await request('GET', `/api/customers/${custAId}`, null, tokenB);
    assert(getCustAByB.status === 404, "User B cannot access User A's customer details by ID (404 isolated)");

    // Paid sales count as revenue, but newly-recorded Udhar credit only changes the ledger balance.
    const salesBeforePaidSale = (await request('GET', '/api/transactions/summary', null, tokenA)).body.data.totalSales;
    const paidSale = await request(
      'POST',
      '/api/transactions',
      {
        type: 'sale',
        amount: 1000,
        paymentMethod: 'cash',
        description: 'Paid sale accounting verification',
      },
      tokenA
    );
    const summaryAfterPaidSale = (await request('GET', '/api/transactions/summary', null, tokenA)).body.data;
    const salesAfterPaidSale = summaryAfterPaidSale.totalSales;
    assert(
      paidSale.status === 201 && salesAfterPaidSale === salesBeforePaidSale + 1000,
      'A normal paid sale of ₹1,000 increases Total Sales by ₹1,000'
    );

    const creditGiven = await request(
      'POST',
      `/api/customers/${custAId}/transaction`,
      { type: 'give_credit', amount: 400 },
      tokenA
    );
    const salesAfterCredit = (await request('GET', '/api/transactions/summary', null, tokenA)).body.data.totalSales;
    const summaryAfterCredit = (await request('GET', '/api/transactions/summary', null, tokenA)).body.data;
    const customerAfterCredit = await request('GET', `/api/customers/${custAId}`, null, tokenA);
    const salesStatement = await request('GET', '/api/reports/statement', null, tokenA);
    assert(
      creditGiven.status === 200 && creditGiven.body.transaction.isCreditGiven === true,
      'Udhar credit is recorded and classified as credit given'
    );
    assert(
      salesAfterCredit === salesAfterPaidSale,
      'Giving ₹400 as Udhar does not increase Total Sales'
    );
    assert(
      summaryAfterCredit.salesCount === summaryAfterPaidSale.salesCount &&
        summaryAfterCredit.paymentBreakdown.cash === summaryAfterPaidSale.paymentBreakdown.cash,
      'Udhar credit is excluded from sales counts and payment analytics'
    );
    assert(
      !summaryAfterCredit.recentTransactions.some(
        transaction => transaction.isCreditGiven ||
          String(transaction.description || '').startsWith('Udhar (Credit) given to ')
      ),
      'Dashboard recent transactions exclude Udhar credit'
    );
    assert(
      customerAfterCredit.status === 200 && customerAfterCredit.body.data.balance === 1600,
      'Giving ₹400 as Udhar still increases the customer balance from ₹1,200 to ₹1,600'
    );
    assert(
      salesStatement.status === 200 && salesStatement.body.report.totalSales === salesAfterPaidSale,
      'Report statement sales summary excludes Udhar credit'
    );
    const salesCSV = await request('GET', '/api/reports/csv?type=sale', null, tokenA);
    assert(
      salesCSV.status === 200 &&
        salesCSV.body.includes('Paid sale accounting verification') &&
        !salesCSV.body.includes('Udhar (Credit) given to'),
      'Sales CSV excludes Udhar credit while keeping paid sales'
    );
    const udharRepayment = await request(
      'POST',
      `/api/customers/${custAId}/transaction`,
      { type: 'receive_payment', amount: 50 },
      tokenA
    );
    const salesAfterRepayment = (
      await request('GET', '/api/transactions/summary', null, tokenA)
    ).body.data.totalSales;
    assert(
      udharRepayment.status === 200 && salesAfterRepayment === salesAfterPaidSale + 50,
      'Udhar repayments continue to count as collected sales'
    );
    const transactionsCSV = await request(
      'GET',
      '/api/reports/csv?excludeCreditGiven=true',
      null,
      tokenA
    );
    assert(
      udharRepayment.status === 200 &&
        transactionsCSV.status === 200 &&
        transactionsCSV.body.includes('Paid sale accounting verification') &&
        transactionsCSV.body.includes('Udhar payment received from Test Customer Rajesh') &&
        !transactionsCSV.body.includes('Udhar (Credit) given to') &&
        !transactionsCSV.body.includes('Legacy Customer'),
      'Transactions CSV excludes Udhar given but keeps paid sales and repayments'
    );

    const legacyCredit = await Transaction.create({
      owner: userA.id,
      customer: custAId,
      type: 'sale',
      amount: 250,
      paymentMethod: 'cash',
      category: 'other',
      description: 'Udhar (Credit) given to Legacy Customer',
      date: new Date(),
    });
    const salesAfterLegacyCredit = (await request('GET', '/api/transactions/summary', null, tokenA)).body.data.totalSales;
    const summaryAfterLegacyCredit = (
      await request('GET', '/api/transactions/summary', null, tokenA)
    ).body.data;
    assert(
      legacyCredit.isCreditGiven === false && salesAfterLegacyCredit === salesAfterRepayment,
      'Legacy default-description Udhar credit is excluded from Total Sales'
    );
    assert(
      !summaryAfterLegacyCredit.recentTransactions.some(
        transaction => transaction.description === 'Udhar (Credit) given to Legacy Customer'
      ),
      'Dashboard recent transactions exclude legacy Udhar credit'
    );

    // ---------------------------------------------------------
    // TEST 13: Normal User Cannot Access Super Admin Routes
    // ---------------------------------------------------------
    const adminStatsByNormalUser = await request('GET', '/api/admin/stats', null, tokenA);
    assert(
      adminStatsByNormalUser.status === 403,
      'Normal user cannot access Super Admin stats endpoint (403 Forbidden)'
    );

    const adminUsersByNormalUser = await request('GET', '/api/admin/users', null, tokenA);
    assert(
      adminUsersByNormalUser.status === 403,
      'Normal user cannot access Super Admin users endpoint (403 Forbidden)'
    );

    // ---------------------------------------------------------
    // TEST 14: Super Admin Provisioning & Operations
    // ---------------------------------------------------------
    // Create an Admin user for testing
    const adminPasswordHash = await User.hashPassword('SuperAdminPass123!');
    const adminUser = await User.create({
      name: 'Test Administrator',
      businessName: 'HQ System',
      email: 'admin_test@test.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      accountStatus: 'active',
    });

    const adminLoginRes = await request('POST', '/api/auth/login', {
      email: 'admin_test@test.com',
      password: 'SuperAdminPass123!',
    });
    const adminToken = adminLoginRes.body.token;

    const adminStats = await request('GET', '/api/admin/stats', null, adminToken);
    assert(
      adminStats.status === 200 && adminStats.body.stats.totalUsers >= 2,
      'Super Admin successfully fetches platform stats'
    );

    const adminUsers = await request('GET', '/api/admin/users', null, adminToken);
    assert(
      adminUsers.status === 200 && adminUsers.body.users.length >= 2,
      'Super Admin successfully views registered user accounts'
    );

    // ---------------------------------------------------------
    // TEST 15: Account Suspension & Enforcement
    // ---------------------------------------------------------
    // Admin suspends User B
    const suspendRes = await request(
      'PATCH',
      `/api/admin/users/${userB.id}/status`,
      { accountStatus: 'suspended' },
      adminToken
    );
    assert(suspendRes.status === 200, 'Admin successfully suspends User B');

    // Suspended User B attempts to record a transaction
    const blockedTxn = await request(
      'POST',
      '/api/transactions',
      {
        type: 'sale',
        amount: 200,
        description: 'Attempt after suspension',
      },
      tokenB
    );
    assert(
      blockedTxn.status === 403 && blockedTxn.body.accountStatus === 'suspended',
      'Suspended user is blocked from business operations (403 Forbidden)'
    );

    // Admin reactivates User B
    const reactivateRes = await request(
      'PATCH',
      `/api/admin/users/${userB.id}/status`,
      { accountStatus: 'active' },
      adminToken
    );
    assert(reactivateRes.status === 200, 'Admin successfully reactivates User B');

    // Reactivated User B can record transactions again
    const allowedTxn = await request(
      'POST',
      '/api/transactions',
      {
        type: 'sale',
        amount: 200,
        description: 'Allowed after reactivation',
      },
      tokenB
    );
    assert(allowedTxn.status === 201, 'Reactivated user can resume normal business operations');

    // ---------------------------------------------------------
    // TEST 16: Audit Logs Recorded
    // ---------------------------------------------------------
    const auditRes = await request('GET', '/api/admin/audit-logs', null, adminToken);
    assert(
      auditRes.status === 200 && auditRes.body.logs.some((l) => l.action === 'USER_SUSPENDED'),
      'Administrative suspension action is recorded in AuditLog'
    );

    // ---------------------------------------------------------
    // TEST 17: CSV Export Isolation
    // ---------------------------------------------------------
    const csvResA = await request('GET', '/api/reports/csv', null, tokenA);
    assert(
      csvResA.status === 200 &&
        csvResA.body.includes('Alice organic gift box sale') &&
        !csvResA.body.includes('Bob power drill set'),
      'CSV export strictly contains only User A transactions and does not leak User B records'
    );

    console.log('\n========================================================');
    console.log(`📊 TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('========================================================\n');

    // Cleanup
    await User.deleteMany({ email: { $in: ['test_user_a@test.com', 'test_user_b@test.com', 'admin_test@test.com'] } });
    await Transaction.deleteMany({ description: { $regex: /Alice|Bob/ } });
    await Customer.deleteMany({ name: { $regex: /Test Customer/ } });

    server.close();
    await mongoose.disconnect();

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('Test execution failed with error:', error);
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
};

runTests();

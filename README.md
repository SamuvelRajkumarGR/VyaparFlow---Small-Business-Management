# VyaparFlow — Secure Multi-User Business Management Platform (MERN Stack)

VyaparFlow is a production-grade, secure, multi-tenant small business management and financial analytics platform. Built with MongoDB, Express.js, React (Vite), and Node.js, VyaparFlow provides strict user-level data isolation, role-based access control, genuine Google OAuth 2.0 authentication, customer and Udhar credit tracking, and Super Admin governance.

---

## 🌟 Key Architecture & Capabilities

### 1. Strict Multi-User Data Isolation
- **Private Workspaces**: Each shopkeeper and merchant owns their private business space.
- **Server-Side Enforcement**: All transaction queries, customer ledgers, summaries, analytics, and exports are strictly scoped to `owner: req.user._id`.
- **Tampering Resistance**: Attempts to access, modify, or delete another user's records via guessed IDs or modified request bodies are safely rejected with `404 Not Found`.

### 2. Multi-Channel Authentication & Sessions
- **Email & Password**: Registration and login with salted `bcryptjs` hashing.
- **Genuine Google OAuth 2.0**: Integrated with `google-auth-library` and OpenID Connect. Token signature, audience, and expiry verified server-side.
- **Safe Account Linking**: Securely associates Google subject IDs to existing accounts without duplicate creation or takeover vulnerabilities.
- **HttpOnly Cookies**: Session tokens stored in secure, HttpOnly, SameSite cookies to protect against XSS and token exfiltration.
- **Rate Limiting**: Brute-force protection on authentication and password-reset endpoints.
- **Password Reset**: Secure, expiring single-use reset tokens with audit logging.

### 3. Business Financial Management
- **Money In & Out**: Real-time sales and expense tracking across Cash, UPI (GPay, PhonePe, Paytm), and Card.
- **Dynamic Profit/Loss Engine**: `Net Profit/Loss = Total Sales - Total Expenses`.
- **Customer & Udhar Ledger**: Track customer credit (Udhar) and advance balances with 1-click credit recording and settlement.
- **Financial Analytics**: Recharts trend lines, payment mode distribution, and spending donuts.
- **CSV Ledger Export**: Generates downloadable spreadsheets containing strictly authorized records.

### 4. Super Admin Provisioning & Governance
- **Zero Public Admin Registration**: Admin role can never be self-assigned during registration or Google sign-in.
- **Controlled CLI Provisioning**: First Super Admin is provisioned securely via `npm run provision-admin`.
- **Platform Analytics**: Real aggregated counts (Total Users, Active vs Suspended, 7d/30d Growth, Platform Transactions).
- **User Account Management**: Search, filter, and instantly suspend or reactivate business accounts with confirmation dialogs.
- **Suspension Enforcement**: Suspended users are immediately blocked from all protected business operations.
- **Privacy Boundary**: Super Admin dashboard does not expose ordinary merchants' private customer transactions.
- **Immutable Audit Trail**: Administrative actions (provisioning, suspension, reactivation, migrations) are recorded in `AuditLog`.

---

## 📁 Repository Structure

```
Small Buisness Management/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js        # Register, Login, Google OAuth, Profile, Password Reset
│   │   ├── transactionController.js # Isolated Transaction CRUD & Financial Aggregates
│   │   ├── customerController.js    # Customer & Udhar (Credit) Ledger
│   │   ├── reportController.js      # Isolated CSV & Statement Exports
│   │   └── adminController.js       # Super Admin stats, user management, audit logs
│   ├── middleware/
│   │   ├── auth.js                  # Protect (JWT cookie/header) & Authorize ('admin')
│   │   └── errorHandler.js          # Centralized error handler
│   ├── models/
│   │   ├── User.js                  # User schema with roles & auth providers
│   │   ├── Transaction.js           # Transaction schema with required owner reference
│   │   ├── Customer.js              # Customer schema with owner & balance tracking
│   │   └── AuditLog.js              # Administrative activity audit log
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── reportRoutes.js
│   │   └── adminRoutes.js
│   ├── scripts/
│   │   ├── provisionAdmin.js        # Super Admin provisioning CLI script
│   │   └── migrateLegacyData.js     # Safe unowned transaction migration utility
│   ├── seed/
│   │   └── seedData.js              # User-isolated demo dataset
│   ├── tests/
│   │   └── securityAndIsolation.test.js # Automated 34-point security test suite
│   ├── server.js                    # Express app with Helmet, CORS, CookieParser
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/              # Sidebar, Navbar, GoogleSignInButton, Modals, Cards
    │   ├── context/
    │   │   ├── AuthContext.jsx      # Session management & user profile state
    │   │   ├── TransactionContext.jsx # Private business ledger state
    │   │   └── ThemeContext.jsx     # Light / Dark theme toggles
    │   ├── pages/
    │   │   ├── Dashboard.jsx        # Business KPI cards & trends
    │   │   ├── SalesPage.jsx        # Sales ledger
    │   │   ├── ExpensesPage.jsx     # Expense ledger
    │   │   ├── TransactionsPage.jsx # Full transaction ledger with CSV export
    │   │   ├── CustomersPage.jsx    # Customer & Udhar ledger
    │   │   ├── AnalyticsPage.jsx    # Financial charts & breakdown
    │   │   ├── SettingsPage.jsx     # Profile, Password Change, Theme, Demo Seed
    │   │   ├── LoginPage.jsx        # Login & Continue with Google
    │   │   ├── RegisterPage.jsx     # Registration & Sign Up with Google
    │   │   ├── ForgotPasswordPage.jsx # Password reset request
    │   │   ├── ResetPasswordPage.jsx  # Password reset confirmation
    │   │   ├── SuspendedAccountPage.jsx # Suspended account lock screen
    │   │   ├── AccessDeniedPage.jsx   # 403 Forbidden screen
    │   │   ├── AdminDashboardPage.jsx # Super Admin metrics & platform growth
    │   │   ├── AdminUsersPage.jsx     # User management & account suspension
    │   │   └── AdminAuditLogsPage.jsx # Administrative audit trail viewer
    │   ├── services/
    │   │   └── api.js               # Axios instance with credentials & endpoints
    │   ├── App.jsx                  # Protected & Admin route guards
    │   └── index.css                # Finova-inspired design system
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start Guide (Windows / PowerShell)

### 1. Prerequisites
- **Node.js**: v18+ (verified on v24)
- **MongoDB**: Running locally at `mongodb://127.0.0.1:27017` or MongoDB Atlas URI string

### 2. Configure Backend Environment
Navigate to `backend` and create `.env` (or copy from `.env.example`):

```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/small_business_db
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Google OAuth Credentials (Optional for local dev)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# Super Admin Provisioning Defaults
ADMIN_EMAIL=admin@vyaparflow.com
ADMIN_PASSWORD=VyaparAdmin#2026!
ADMIN_NAME=Super Administrator
ADMIN_BUSINESS=VyaparFlow Headquarters
```

### 3. Configure Frontend Environment
In `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 4. Install Dependencies
```powershell
# In backend
cd backend
npm install

# In frontend
cd ../frontend
npm install
```

### 5. Provision the Super Admin Account
Run the controlled provisioning script:
```powershell
cd backend
npm run provision-admin
```
*(Default credentials: `admin@vyaparflow.com` / `VyaparAdmin#2026!`)*

### 6. Migrate Historical Legacy Records (If any exist)
To associate unowned historical transactions with a specific account:
```powershell
cd backend
npm run migrate-legacy admin@vyaparflow.com
```

### 7. Run the Automated Security & Isolation Test Suite
Verify that all 34 security, cross-user data isolation, and admin boundaries pass:
```powershell
cd backend
npm test
```

### 8. Start Backend and Frontend
In Terminal 1 (Backend):
```powershell
cd backend
npm run dev
# Running on http://localhost:5001
```

In Terminal 2 (Frontend):
```powershell
cd frontend
npm run dev
# Running on http://localhost:5173
```

---

## 🔐 Google Cloud Console OAuth 2.0 Configuration

To configure genuine Google Sign-In with your own Google Cloud project:

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Under **APIs & Services > Credentials**, click **Create Credentials > OAuth client ID**.
4. Application Type: **Web application**.
5. Set Name: `VyaparFlow Web Client`.
6. Add **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
7. Add **Authorized redirect URIs**:
   - `http://localhost:5001/api/auth/google/callback`
8. Copy the generated **Client ID** and **Client Secret**.
9. Paste into `backend/.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) and `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`).

*(Note: In local development before configuring Google Cloud credentials, the frontend includes a convenient developer simulation modal allowing immediate testing of Google sign-in workflows without blocking).*

---

## 🧪 Automated Security Test Coverage

Run `npm test` inside `backend/` to execute the full suite:

- [x] Multi-user independent registration (User A & User B).
- [x] Server-side password hashing using `bcryptjs` (no plaintext storage).
- [x] Duplicate email registration rejection.
- [x] Existing user authentication and invalid password rejection (401).
- [x] Unauthenticated request rejection on all protected endpoints.
- [x] **Cross-User Transaction Isolation**: User A cannot read, list, update, or delete User B's transactions.
- [x] **Request Body Tampering Protection**: Spoofed `owner` parameters in request bodies are ignored.
- [x] **Financial Metric Isolation**: Summary calculations, KPIs, and charts isolate User A and User B.
- [x] **Customer & Udhar Ledger Isolation**: Customer records and credit balances remain strictly private.
- [x] **Super Admin RBAC**: Normal users receive 403 Forbidden when requesting admin endpoints.
- [x] **Account Suspension Enforcement**: Suspended users are immediately denied access to business endpoints.
- [x] **Account Reactivation**: Restores normal business operations upon reactivation.
- [x] **Audit Trail Verification**: Administrative operations logged in `AuditLog`.
- [x] **Export Isolation**: CSV ledger exports strictly contain only the authenticated user's records.

---

## 📄 License
ISC License. Built for modern small business management.

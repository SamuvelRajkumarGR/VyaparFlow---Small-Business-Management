# Small Business Management System (MERN Stack)

A modern, full-stack financial dashboard designed specifically for small business owners. Tracks **Money In (Sales)**, **Money Out (Expenses)**, and automatically computes **Net Profit / Loss** with dynamic **Green Profit State** and **Red Loss State** visual banners, Recharts financial analytics, full transaction ledger with search & filters, and customizable theme settings.

---

## 🌟 Key Features

1. **Automatic Money In (Total Sales)**:
   - Record sales via **Cash**, **UPI (GPay/PhonePe)**, or **Card**.
   - Automatically updates total revenue and payment method breakdowns.

2. **Automatic Money Out (Total Expenses)**:
   - Record expenditures under **Stock Purchase**, **Shop Rent**, **Electricity Bills**, **Staff Salaries**, or **Other**.
   - Automatically updates total expenditure and category breakdown.

3. **Dynamic Net Profit / Loss Calculation**:
   - `Net Profit/Loss = Total Sales - Total Expenses`
   - **🟢 Green Profit State**: Displayed when Sales ≥ Expenses with *"You're in Profit"* badge, green glowing card theme, and profit margin %.
   - **🔴 Red Loss State**: Displayed when Sales < Expenses with *"You're in Loss"* warning badge, red glowing card theme, and deficit status.

4. **Recharts Visual Analytics**:
   - Financial Trend Line/Area Chart (Sales vs Expenses over time).
   - Payment Method Share (Donut / Pie Chart for Cash, UPI, Card).
   - Expense Category Breakdown (Bar Chart for Stock, Rent, Bills, Salaries).

5. **Full Transaction Ledger**:
   - Search by description, category, or payment method.
   - Filter by type (Sale/Expense), payment method, category, or date range.
   - Sort by Date (newest/oldest) or Amount (high/low).
   - Edit or Delete transactions with instant recalculation of all metrics.
   - Export ledger to CSV format.

6. **Appearance & UI**:
   - Modern Glassmorphism SaaS design.
   - Light Mode & Dark Mode toggle.
   - 1-Click **Seed Sample Demo Data** button to demonstrate both Profit and Loss states instantly.

---

## 🚀 Beginner-Friendly Windows VS Code Setup Guide

Follow these step-by-step instructions in PowerShell / Command Prompt inside VS Code:

### 1. Prerequisites
- **Node.js** (v16 or higher) installed: Verify by running `node -v`
- **MongoDB**: Either local MongoDB Community Server running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI string.

---

### 2. Open Project in VS Code
Open VS Code, press `Ctrl + O` or select **File > Open Folder**, and open `d:\project\Small Buisness Management`.

Open VS Code Terminal by pressing ``Ctrl + ` `` or going to **Terminal > New Terminal**.

---

### 3. Install Backend Dependencies
In the VS Code terminal, run the following commands:

```powershell
cd backend
npm install
```

---

### 4. Configure Backend Environment (`backend/.env`)
Create a file named `.env` inside the `backend` folder (if not already created) with the following content:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/small_business_db
NODE_ENV=development
```

*(If using MongoDB Atlas, replace `MONGODB_URI` with your connection string).*

---

### 5. Install Frontend Dependencies
Open a second terminal tab or navigate to the frontend folder:

```powershell
cd ../frontend
npm install
```

---

### 6. Configure Frontend Environment (`frontend/.env`)
Create a file named `.env` inside the `frontend` folder with:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### 7. Start the Application

#### Terminal 1 (Start Backend API Server):
```powershell
cd d:\project\"Small Buisness Management"\backend
npm start
```
*Expected Output:*
```text
🚀 Small Business Backend Server running on port 5000
📡 Environment: development
🔗 API Endpoint: http://localhost:5000/api/transactions
[MongoDB Connected]: 127.0.0.1 / small_business_db
```

#### Terminal 2 (Start React Frontend Dev Server):
```powershell
cd d:\project\"Small Buisness Management"\frontend
npm run dev
```
*Expected Output:*
```text
  VITE v5.2.11  ready in 350 ms

  ➜  Local:   http://localhost:5173/
```

---

### 8. Access the Application
Open your web browser and navigate to:
👉 **`http://localhost:5173`**

---

### 9. How to Seed Demo Data
To test all features immediately with realistic sample transactions:
1. Open the application at `http://localhost:5173`.
2. Click the **"Seed Data"** button in the top navigation bar or go to **Settings > Seed Sample Transactions Data**.
3. The database will populate with sample Cash, UPI, and Card sales, plus Stock, Rent, Electricity, and Salary expenses.

---

## 📋 Requirement Traceability Matrix

| Requirement | Description | Status |
| :--- | :--- | :---: |
| **Total Sales** | Cash, UPI, Card sales automatically sum up | ✅ YES |
| **Cash Payments** | Record counter cash sales | ✅ YES |
| **UPI Payments** | Record GPay / PhonePe / Paytm payments | ✅ YES |
| **Card Payments** | Record Debit / Credit card sales | ✅ YES |
| **Total Expenses** | Money spent on stock, rent, bills, salaries sums up | ✅ YES |
| **Stock Expenses** | Inventory restock category | ✅ YES |
| **Shop Rent** | Monthly premises lease expenditure | ✅ YES |
| **Electricity Bills** | Utility & power expenses | ✅ YES |
| **Staff Salaries** | Payroll disbursement expenses | ✅ YES |
| **Sales - Expenses** | Dynamic dynamic formula `Sales - Expenses` | ✅ YES |
| **Profit Detection** | Sales ≥ Expenses triggers Profit state | ✅ YES |
| **Loss Detection** | Sales < Expenses triggers Loss state | ✅ YES |
| **Green Profit UI** | Green cards, glowing border, profit badge, margin % | ✅ YES |
| **Red Loss UI** | Red cards, glowing border, loss warning badge | ✅ YES |
| **Payment Chart** | Recharts Donut/Pie visualization for payment methods | ✅ YES |
| **Expense Chart** | Recharts Bar visualization for expense categories | ✅ YES |
| **Trend Chart** | Recharts Area comparison for Sales vs Expenses | ✅ YES |
| **Ledger History** | Table with Date, Type, Amount, Method, Description | ✅ YES |
| **Search & Filters** | Filter by type, payment method, category, date, search | ✅ YES |
| **Edit & Delete** | Inline edit/delete with dynamic metric updates | ✅ YES |
| **Responsive UI** | Mobile, tablet, desktop responsive drawer & cards | ✅ YES |
| **Theme Toggle** | Light Mode and Dark Mode support | ✅ YES |

---

## 🛠️ Tech Stack Used

- **Frontend**: React 18, Vite, CSS3 (Variables & Glassmorphism), Recharts, Lucide React Icons, Axios, React Router v6.
- **Backend**: Node.js, Express.js, REST API.
- **Database**: MongoDB, Mongoose ODM.

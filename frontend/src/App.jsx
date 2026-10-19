import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { TransactionProvider } from './context/TransactionContext';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import TransactionModal from './components/TransactionModal';
import ConfirmModal from './components/ConfirmModal';
import ToastContainer from './components/ToastContainer';

import Dashboard from './pages/Dashboard';
import SalesPage from './pages/SalesPage';
import ExpensesPage from './pages/ExpensesPage';
import TransactionsPage from './pages/TransactionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

const App = () => (
  <ThemeProvider>
    <TransactionProvider>
      <Router>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Navbar />
            <div className="page-body">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </div>
          </main>

          <TransactionModal />
          <ConfirmModal />
          <ToastContainer />
        </div>
      </Router>
    </TransactionProvider>
  </ThemeProvider>
);

export default App;

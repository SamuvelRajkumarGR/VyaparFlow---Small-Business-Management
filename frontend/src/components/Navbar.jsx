import React from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, PlusCircle, MinusCircle } from 'lucide-react';
import { useTransaction } from '../context/TransactionContext';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/sales': 'Sales Management',
  '/expenses': 'Expense Tracking',
  '/transactions': 'Transaction History',
  '/analytics': 'Financial Analytics',
  '/settings': 'System Settings',
};

const Navbar = () => {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Dashboard';
  const { period, setPeriod, openAddSaleModal, openAddExpenseModal } = useTransaction();

  return (
    <header className="finova-navbar">
      <div className="fn-left">
        <h1 className="fn-page-title">{title}</h1>
      </div>

      <div className="fn-right">
        {/* Date Filter Pill */}
        <div className="fn-period-wrapper">
          <Calendar size={15} className="fn-period-icon" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="fn-period-select"
            aria-label="Select date range"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="lastmonth">Last Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="fn-actions">
          <button className="btn btn-sale fn-action-btn" onClick={openAddSaleModal} aria-label="Record Sale">
            <PlusCircle size={15} />
            <span>Record Sale</span>
          </button>
          <button className="btn btn-expense fn-action-btn" onClick={openAddExpenseModal} aria-label="Add Expense">
            <MinusCircle size={15} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      <style>{`
        .finova-navbar {
          height: var(--navbar-h);
          padding: 0 2rem;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 90;
          transition: background-color 0.25s ease, border-color 0.25s ease;
        }

        .fn-page-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.025em;
        }

        .fn-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .fn-period-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 0.85rem;
          background: var(--bg-app);
          border: 1px solid var(--border);
          border-radius: var(--r-full);
          transition: border-color var(--transition);
        }
        .fn-period-wrapper:hover {
          border-color: var(--brand);
        }

        .fn-period-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .fn-period-select {
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.825rem;
          cursor: pointer;
          outline: none;
          font-family: inherit;
        }
        .fn-period-select option {
          background: var(--bg-card);
          color: var(--text-primary);
        }

        .fn-actions {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .fn-action-btn {
          padding: 0.55rem 1.1rem;
          font-size: 0.825rem;
          letter-spacing: -0.01em;
        }

        @media (max-width: 1024px) {
          .finova-navbar {
            padding: 0 1rem 0 3.75rem;
          }
        }

        @media (max-width: 640px) {
          .fn-page-title {
            font-size: 1.05rem;
          }
          .fn-action-btn span {
            display: none;
          }
          .fn-action-btn {
            padding: 0.55rem;
            border-radius: var(--r-full);
          }
          .fn-period-wrapper {
            padding: 0.4rem 0.6rem;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;

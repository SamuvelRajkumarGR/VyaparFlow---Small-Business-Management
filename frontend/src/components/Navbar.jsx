import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Calendar, PlusCircle, MinusCircle, User, Shield } from 'lucide-react';
import { useTransaction } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';

const PAGE_TITLES = {
  '/': 'Business Dashboard',
  '/sales': 'Sales Management',
  '/expenses': 'Expense Tracking',
  '/transactions': 'Transaction History',
  '/customers': 'Customer & Udhar Ledger',
  '/analytics': 'Financial Analytics',
  '/settings': 'System & Profile Settings',
  '/admin': 'Super Admin Dashboard',
  '/admin/users': 'User Account Management',
  '/admin/audit-logs': 'Administrative Audit Trail',
};

const Navbar = () => {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Dashboard';
  const { period, setPeriod, openAddSaleModal, openAddExpenseModal } = useTransaction();
  const { user, isAdmin } = useAuth();

  const isBusinessPage = !location.pathname.startsWith('/admin') && location.pathname !== '/settings';

  return (
    <header className="finova-navbar">
      <div className="fn-left">
        <h1 className="fn-page-title">{title}</h1>
      </div>

      <div className="fn-right">
        {/* Date Filter Pill - shown on business transaction pages */}
        {isBusinessPage && (
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
        )}

        {/* Action Buttons */}
        {isBusinessPage && (
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
        )}

        {/* User Profile Pill */}
        {user && (
          <Link to="/settings" className="fn-user-nav-pill" title="View Profile">
            {user.googleProfilePic ? (
              <img src={user.googleProfilePic} alt={user.name} className="fn-nav-avatar" />
            ) : (
              <div className="fn-nav-avatar fn-nav-avatar-fallback">
                {user.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
              </div>
            )}
            <div className="fn-nav-user-text">
              <span className="fn-nav-user-name">{user.name}</span>
              <span className="fn-nav-user-role">{user.role === 'admin' ? 'Super Admin' : user.businessName}</span>
            </div>
          </Link>
        )}
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
          gap: 0.85rem;
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

        .fn-user-nav-pill {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.35rem 0.75rem 0.35rem 0.4rem;
          background: var(--bg-app);
          border: 1px solid var(--border);
          border-radius: var(--r-full);
          text-decoration: none;
          transition: border-color var(--transition);
        }
        .fn-user-nav-pill:hover {
          border-color: var(--brand);
        }
        .fn-nav-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          object-fit: cover;
        }
        .fn-nav-avatar-fallback {
          background: var(--brand-light);
          color: var(--brand);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
        }
        .fn-nav-user-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }
        .fn-nav-user-name {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-primary);
          max-width: 110px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .fn-nav-user-role {
          font-size: 0.65rem;
          color: var(--text-muted);
          max-width: 110px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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
          .fn-nav-user-text {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;

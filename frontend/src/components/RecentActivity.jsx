import React from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const formatTime = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const methodLabel = { cash: 'Cash', upi: 'UPI', card: 'Card' };
const categoryLabel = { stock: 'Stock', rent: 'Shop Rent', bills: 'Electricity', salaries: 'Salaries', other: 'Other' };

const RecentActivity = ({ transactions = [], currency = '₹' }) => {
  const recent = transactions.slice(0, 6);

  return (
    <div className="card fn-recent-card">
      <div className="fn-card-hdr">
        <div>
          <h3 className="fn-card-title">Recent Transactions</h3>
          <p className="fn-card-subtitle">Latest sales & expenses</p>
        </div>
        <Link to="/transactions" className="fn-link-viewall">
          <span>View All</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="fn-txn-list">
        {recent.length === 0 ? (
          <div className="fn-empty-list">
            <p>No recent activity found.</p>
          </div>
        ) : (
          recent.map((t) => {
            const isSale = t.type === 'sale';
            return (
              <div key={t._id} className="fn-txn-item">
                <div className={`fn-txn-avatar ${isSale ? 'fn-avatar-sale' : 'fn-avatar-expense'}`}>
                  {isSale ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>

                <div className="fn-txn-info">
                  <span className="fn-txn-desc" title={t.description}>
                    {t.description || (isSale ? 'Sale Income' : 'Expense')}
                  </span>
                  <div className="fn-txn-meta">
                    <span className="fn-txn-tag">
                      {isSale ? methodLabel[t.paymentMethod] || 'UPI' : categoryLabel[t.category] || 'General'}
                    </span>
                    <span className="fn-meta-dot">•</span>
                    <span className="fn-txn-time">{formatTime(t.date)}</span>
                  </div>
                </div>

                <div className={`fn-txn-amount ${isSale ? 'text-sale' : 'text-expense'}`}>
                  {isSale ? '+' : '-'}{currency}{Number(t.amount).toLocaleString('en-IN')}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .fn-recent-card {
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .fn-card-hdr {
          padding: 1.25rem 1.4rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .fn-card-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .fn-card-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.15rem;
        }

        .fn-link-viewall {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.775rem;
          font-weight: 600;
          color: var(--brand);
          text-decoration: none;
          padding: 0.35rem 0.65rem;
          background: var(--brand-light);
          border-radius: var(--r-full);
          transition: opacity var(--transition);
        }
        .fn-link-viewall:hover {
          opacity: 0.85;
        }

        .fn-txn-list {
          display: flex;
          flex-direction: column;
        }

        .fn-txn-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1.4rem;
          border-bottom: 1px solid var(--border);
          transition: background var(--transition);
        }
        .fn-txn-item:last-child {
          border-bottom: none;
        }
        .fn-txn-item:hover {
          background: var(--bg-hover);
        }

        .fn-txn-avatar {
          width: 36px;
          height: 36px;
          border-radius: var(--r-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .fn-avatar-sale {
          background: var(--green-light);
          color: var(--green);
        }
        .fn-avatar-expense {
          background: var(--red-light);
          color: var(--red);
        }

        .fn-txn-info {
          flex: 1;
          min-width: 0;
        }

        .fn-txn-desc {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .fn-txn-meta {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.2rem;
        }

        .fn-txn-tag {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-hover);
          padding: 0.1rem 0.45rem;
          border-radius: var(--r-sm);
        }

        .fn-meta-dot {
          color: var(--border);
          font-size: 0.7rem;
        }

        .fn-txn-time {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .fn-txn-amount {
          font-size: 0.925rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          flex-shrink: 0;
        }

        .fn-empty-list {
          padding: 3rem 1.5rem;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};

export default RecentActivity;

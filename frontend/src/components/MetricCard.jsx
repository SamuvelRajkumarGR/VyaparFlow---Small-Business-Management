import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MetricCard = ({
  label,
  value,
  subLabel,
  change,
  icon: Icon,
  iconColor = 'brand',
  variant = 'default',
  isDark = false,
}) => {
  const isPositive = change !== null && change !== undefined && change >= 0;

  return (
    <div className={`fn-kpi-card ${isDark ? 'fn-kpi-dark' : 'card'} ${variant !== 'default' ? `state-${variant}` : ''}`}>
      <div className="fn-kpi-top">
        <span className="fn-kpi-label">{label}</span>
        {Icon && (
          <div className={`fn-kpi-icon-wrap fn-kpi-icon--${iconColor}`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="fn-kpi-middle">
        <div className={`fn-kpi-val ${variant === 'profit' ? 'text-sale' : variant === 'loss' ? 'text-expense' : ''}`}>
          {value}
        </div>
      </div>

      <div className="fn-kpi-bottom">
        {change !== null && change !== undefined ? (
          <div className={`fn-kpi-pill ${isPositive ? 'fn-pill-up' : 'fn-pill-down'}`}>
            {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            <span>{isPositive ? '+' : ''}{change}% from last month</span>
          </div>
        ) : subLabel ? (
          <span className="fn-kpi-subtext">{subLabel}</span>
        ) : (
          <span className="fn-kpi-subtext">Current period</span>
        )}
      </div>

      <style>{`
        .fn-kpi-card {
          padding: 1.35rem 1.4rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 145px;
          border-radius: var(--r-xl);
          transition: transform var(--transition), box-shadow var(--transition);
        }
        .fn-kpi-card:hover {
          transform: translateY(-2px);
        }

        .fn-kpi-dark {
          background: var(--bg-card);
          color: var(--text-primary);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }
        .fn-kpi-dark .fn-kpi-label {
          color: var(--text-secondary);
        }
        .fn-kpi-dark .fn-kpi-val {
          color: var(--text-primary);
        }
        .fn-kpi-dark .fn-kpi-subtext {
          color: var(--text-muted);
        }
        [data-theme='dark'] .fn-kpi-dark {
          background: var(--bg-dark);
          color: #FFFFFF;
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 25px rgba(23, 28, 26, 0.4);
        }
        [data-theme='dark'] .fn-kpi-dark .fn-kpi-label {
          color: rgba(255, 255, 255, 0.65);
        }
        [data-theme='dark'] .fn-kpi-dark .fn-kpi-val {
          color: #FFFFFF;
        }
        [data-theme='dark'] .fn-kpi-dark .fn-kpi-subtext {
          color: rgba(255, 255, 255, 0.5);
        }

        .fn-kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .fn-kpi-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: -0.01em;
        }

        .fn-kpi-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: var(--r-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .fn-kpi-icon--brand {
          background: var(--brand-light);
          color: var(--brand);
        }
        .fn-kpi-icon--green {
          background: var(--green-light);
          color: var(--green);
        }
        .fn-kpi-icon--red {
          background: var(--red-light);
          color: var(--red);
        }
        .fn-kpi-icon--muted {
          background: var(--bg-hover);
          color: var(--text-muted);
        }
        [data-theme='dark'] .fn-kpi-dark .fn-kpi-icon-wrap {
          background: rgba(255, 255, 255, 0.12);
          color: #FFFFFF;
        }

        .fn-kpi-val {
          font-size: 1.85rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          line-height: 1.1;
          margin-bottom: 0.65rem;
        }

        .fn-kpi-bottom {
          display: flex;
          align-items: center;
        }

        .fn-kpi-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.73rem;
          font-weight: 600;
          padding: 0.2rem 0.55rem;
          border-radius: var(--r-full);
        }

        .fn-pill-up {
          background: var(--green-light);
          color: var(--green-text);
        }
        [data-theme='dark'] .fn-kpi-dark .fn-pill-up {
          background: rgba(22, 134, 83, 0.25);
          color: #4ade80;
        }

        .fn-pill-down {
          background: var(--red-light);
          color: var(--red-text);
        }
        [data-theme='dark'] .fn-kpi-dark .fn-pill-down {
          background: rgba(217, 75, 75, 0.25);
          color: #f87171;
        }

        .fn-kpi-subtext {
          font-size: 0.775rem;
          font-weight: 500;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default MetricCard;

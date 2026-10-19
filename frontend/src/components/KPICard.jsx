import React from 'react';

const KPICard = ({
  title,
  amount,
  currency = '₹',
  icon: Icon,
  subtitle,
  badgeText,
  badgeType = 'default', // 'profit' | 'loss' | 'sale' | 'expense' | 'neutral'
  isProfitState = false,
  isLossState = false,
}) => {
  // Determine special dynamic glowing styles for Profit / Loss cards
  let dynamicCardClass = 'glass-card kpi-card';
  if (isProfitState) dynamicCardClass += ' card-profit-active';
  if (isLossState) dynamicCardClass += ' card-loss-active';

  const formattedAmount = typeof amount === 'number'
    ? `${currency}${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : amount;

  return (
    <div className={dynamicCardClass}>
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        {Icon && (
          <div className={`kpi-icon-wrapper icon-${badgeType}`}>
            <Icon size={22} />
          </div>
        )}
      </div>

      <div className="kpi-amount-container">
        <h3 className={`kpi-amount amount-${badgeType}`}>
          {isLossState ? `-${formattedAmount}` : formattedAmount}
        </h3>
      </div>

      <div className="kpi-footer">
        {badgeText && (
          <span className={`badge badge-${badgeType}`}>
            {badgeText}
          </span>
        )}
        {subtitle && <span className="kpi-subtitle">{subtitle}</span>}
      </div>

      <style>{`
        .kpi-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          position: relative;
          overflow: hidden;
        }

        .kpi-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .kpi-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .kpi-icon-wrapper {
          padding: 0.65rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          color: var(--text-secondary);
        }

        .kpi-icon-wrapper.icon-profit,
        .kpi-icon-wrapper.icon-sale {
          background: var(--profit-bg);
          color: var(--profit-color);
        }

        .kpi-icon-wrapper.icon-loss,
        .kpi-icon-wrapper.icon-expense {
          background: var(--loss-bg);
          color: var(--loss-color);
        }

        .kpi-amount {
          font-size: 1.85rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .kpi-amount.amount-profit,
        .kpi-amount.amount-sale {
          color: var(--profit-color);
        }

        .kpi-amount.amount-loss,
        .kpi-amount.amount-expense {
          color: var(--loss-color);
        }

        .kpi-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }

        .kpi-subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default KPICard;

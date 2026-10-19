import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';

const iconMap = {
  positive: TrendingUp,
  negative: TrendingDown,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  positive: { bg: 'var(--green-light)', color: 'var(--green)', border: 'var(--green-border)' },
  negative: { bg: 'var(--red-light)', color: 'var(--red)', border: 'var(--red-border)' },
  warning: { bg: 'var(--amber-light)', color: 'var(--amber)', border: 'var(--amber)' },
  info: { bg: 'var(--blue-light)', color: 'var(--blue)', border: 'var(--blue)' },
};

const InsightCard = ({ type = 'info', message }) => {
  const Icon = iconMap[type] || Info;
  const colors = colorMap[type] || colorMap.info;

  return (
    <div className="insight-item" style={{ '--ic-bg': colors.bg, '--ic-color': colors.color, '--ic-border': colors.border }}>
      <div className="insight-icon">
        <Icon size={14} />
      </div>
      <p className="insight-text">{message}</p>

      <style>{`
        .insight-item {
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          padding: 0.75rem 0.875rem;
          background: var(--ic-bg);
          border: 1px solid var(--ic-border);
          border-radius: var(--r-md);
        }
        .insight-icon {
          color: var(--ic-color);
          margin-top: 1px;
          flex-shrink: 0;
        }
        .insight-text {
          font-size: 0.825rem;
          color: var(--text-primary);
          line-height: 1.5;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

const InsightsPanel = ({ insights = [], loading }) => {
  if (loading) return null;

  if (!insights || insights.length === 0) {
    return (
      <div className="insights-panel card">
        <div className="insights-header">
          <h3 className="section-title">Business Insights</h3>
        </div>
        <div className="insights-body">
          <p className="insights-empty">
            Keep recording transactions to unlock automatic insights about your business performance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="insights-panel card">
      <div className="insights-header">
        <h3 className="section-title">Business Insights</h3>
        <span className="insights-badge">{insights.length} insight{insights.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="insights-body">
        {insights.map((ins, i) => (
          <InsightCard key={i} type={ins.type} message={ins.message} />
        ))}
      </div>

      <style>{`
        .insights-panel { overflow: hidden; }
        .insights-header {
          padding: 1.125rem 1.375rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .section-title { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); }
        .insights-badge {
          font-size: 0.72rem;
          font-weight: 700;
          background: var(--accent-subtle);
          color: var(--accent);
          padding: 0.2rem 0.55rem;
          border-radius: 9999px;
        }
        .insights-body { padding: 1rem 1.375rem; display: flex; flex-direction: column; gap: 0.625rem; }
        .insights-empty { font-size: 0.825rem; color: var(--text-muted); line-height: 1.6; }
      `}</style>
    </div>
  );
};

export default InsightsPanel;

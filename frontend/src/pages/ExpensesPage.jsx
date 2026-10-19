import React from 'react';
import { TrendingDown, Package, Building2, Zap, Users, MoreHorizontal, MinusCircle } from 'lucide-react';
import { useTransaction } from '../context/TransactionContext';
import TransactionTable from '../components/TransactionTable';
import MetricCard from '../components/MetricCard';

const fmt = (n, currency = '₹') => `${currency}${Number(n).toLocaleString('en-IN')}`;

const CATS = [
  { key: 'stock', label: 'Stock & Inventory', icon: Package },
  { key: 'rent', label: 'Shop Rent', icon: Building2 },
  { key: 'bills', label: 'Electricity & Utilities', icon: Zap },
  { key: 'salaries', label: 'Staff Salaries', icon: Users },
  { key: 'other', label: 'Miscellaneous', icon: MoreHorizontal },
];

const ExpensesPage = () => {
  const { summary, transactions, loading, currency = '₹', openAddExpenseModal } = useTransaction();

  const expData = transactions.filter(t => t.type === 'expense');
  const totalExpenses = summary?.totalExpenses || 0;
  const expBreak = summary?.expenseBreakdown || {};
  const expChange = summary?.comparison?.expenseChange ?? null;

  if (loading) {
    return (
      <div className="fn-page-container">
        <div style={{ height: 130, background: 'var(--bg-hover)', borderRadius: 'var(--r-xl)', marginBottom: '1.25rem' }} />
        <div style={{ height: 400, background: 'var(--bg-hover)', borderRadius: 'var(--r-xl)' }} />
      </div>
    );
  }

  return (
    <div className="fn-page-container">
      {/* Header */}
      <div className="fn-page-header">
        <div>
          <h2 className="fn-page-heading">Business Expenses</h2>
          <p className="fn-page-desc">Track overheads, stock purchases, and operational disbursements.</p>
        </div>
        <button className="btn btn-expense" onClick={openAddExpenseModal}>
          <MinusCircle size={15} />
          <span>Record Expense</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="fn-exp-kpis">
        <MetricCard
          label="Total Expenses"
          value={fmt(totalExpenses, currency)}
          change={expChange}
          icon={TrendingDown}
          iconColor="red"
          isDark={true}
        />
        {CATS.map(({ key, label, icon }) => (
          <MetricCard
            key={key}
            label={label}
            value={fmt(expBreak[key] || 0, currency)}
            subLabel={`${totalExpenses > 0 ? Math.round(((expBreak[key] || 0) / totalExpenses) * 100) : 0}% of total`}
            icon={icon}
            iconColor="muted"
          />
        ))}
      </div>

      {/* Expense Records */}
      <TransactionTable
        data={expData}
        title={`Expense Records (${expData.length})`}
        showFilters={true}
        showTypeFilter={false}
      />

      <style>{`
        .fn-page-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .fn-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .fn-page-heading {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.025em;
        }

        .fn-page-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }

        .fn-exp-kpis {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 1100px) {
          .fn-exp-kpis { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .fn-exp-kpis { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default ExpensesPage;

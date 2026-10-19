import React from 'react';
import { TrendingUp, Banknote, Smartphone, CreditCard, PlusCircle, ArrowUpRight } from 'lucide-react';
import { useTransaction } from '../context/TransactionContext';
import TransactionTable from '../components/TransactionTable';
import MetricCard from '../components/MetricCard';

const fmt = (n, currency = '₹') => `${currency}${Number(n).toLocaleString('en-IN')}`;

const SalesPage = () => {
  const { summary, transactions, loading, currency = '₹', openAddSaleModal } = useTransaction();

  const salesData = transactions.filter(t => t.type === 'sale');
  const totalSales = summary?.totalSales || 0;
  const payBreak = summary?.paymentBreakdown || {};
  const salesChange = summary?.comparison?.salesChange ?? null;

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
          <h2 className="fn-page-heading">Sales Revenue</h2>
          <p className="fn-page-desc">Comprehensive record of customer income and settlement channels.</p>
        </div>
        <button className="btn btn-sale" onClick={openAddSaleModal}>
          <PlusCircle size={15} />
          <span>Record New Sale</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="fn-page-kpis">
        <MetricCard
          label="Total Sales"
          value={fmt(totalSales, currency)}
          change={salesChange}
          icon={TrendingUp}
          iconColor="green"
          isDark={true}
        />
        <MetricCard
          label="Cash Collection"
          value={fmt(payBreak.cash || 0, currency)}
          subLabel={`${totalSales > 0 ? Math.round(((payBreak.cash || 0) / totalSales) * 100) : 0}% of sales`}
          icon={Banknote}
          iconColor="green"
        />
        <MetricCard
          label="UPI & QR Payments"
          value={fmt(payBreak.upi || 0, currency)}
          subLabel={`${totalSales > 0 ? Math.round(((payBreak.upi || 0) / totalSales) * 100) : 0}% of sales`}
          icon={Smartphone}
          iconColor="brand"
        />
        <MetricCard
          label="Card Transactions"
          value={fmt(payBreak.card || 0, currency)}
          subLabel={`${totalSales > 0 ? Math.round(((payBreak.card || 0) / totalSales) * 100) : 0}% of sales`}
          icon={CreditCard}
          iconColor="muted"
        />
      </div>

      {/* Sales Transaction Ledger */}
      <TransactionTable
        data={salesData}
        title={`Sales Records (${salesData.length})`}
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

        .fn-page-kpis {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 1100px) {
          .fn-page-kpis { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .fn-page-kpis { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default SalesPage;

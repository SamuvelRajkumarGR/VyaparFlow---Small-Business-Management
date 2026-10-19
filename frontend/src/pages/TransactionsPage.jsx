import React from 'react';
import { useTransaction } from '../context/TransactionContext';
import TransactionTable from '../components/TransactionTable';

const TransactionsPage = () => {
  const { transactions, loading } = useTransaction();

  return (
    <div className="fn-page-container">
      <div className="fn-page-header">
        <div>
          <h2 className="fn-page-heading">Financial Transactions</h2>
          <p className="fn-page-desc">Complete ledger of all inflows, outflows, and settlement channels.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ height: 420, background: 'var(--bg-hover)', borderRadius: 'var(--r-xl)' }} />
      ) : (
        <TransactionTable
          data={transactions}
          title={`All Activity (${transactions.length})`}
          showFilters={true}
        />
      )}

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
      `}</style>
    </div>
  );
};

export default TransactionsPage;

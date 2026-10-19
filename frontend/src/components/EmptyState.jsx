import React from 'react';
import { PlusCircle, MinusCircle, Sparkles } from 'lucide-react';
import { useTransaction } from '../context/TransactionContext';

const EmptyState = () => {
  const { openAddSaleModal, openAddExpenseModal, handleSeedData } = useTransaction();

  return (
    <div className="glass-card empty-state-container">
      <div className="sparkle-circle">
        <Sparkles size={36} className="sparkle-icon" />
      </div>
      <h3 className="empty-heading">No Transactions Yet</h3>
      <p className="empty-subtext">
        Start by recording your first sale (Money In) or expense (Money Out) to calculate Total Sales, Total Expenses, Net Profit/Loss, and generate interactive charts.
      </p>
      <div className="empty-actions">
        <button className="btn btn-sale" onClick={openAddSaleModal}>
          <PlusCircle size={18} /> Record First Sale
        </button>
        <button className="btn btn-expense" onClick={openAddExpenseModal}>
          <MinusCircle size={18} /> Record First Expense
        </button>
        <button className="btn btn-secondary" onClick={handleSeedData}>
          ✨ Load Sample Data
        </button>
      </div>

      <style>{`
        .empty-state-container {
          padding: 4rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          max-width: 600px;
          margin: 2rem auto;
        }

        .sparkle-circle {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: var(--accent-light);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }

        .sparkle-icon {
          color: var(--accent-primary);
        }

        .empty-heading {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .empty-subtext {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-top: 0.5rem;
          line-height: 1.6;
        }

        .empty-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default EmptyState;

import React, { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useTransaction } from '../context/TransactionContext';
import TransactionTable from '../components/TransactionTable';
import { exportCSVAPI } from '../services/api';

const isCreditGiven = (transaction) => (
  transaction.isCreditGiven === true ||
  String(transaction.description || '').startsWith('Udhar (Credit) given to ')
);

const TransactionsPage = () => {
  const { transactions, loading, period, customStart, customEnd } = useTransaction();
  const [exporting, setExporting] = useState(false);
  const visibleTransactions = transactions.filter((transaction) => !isCreditGiven(transaction));

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = { period, excludeCreditGiven: true };
      if (period === 'custom') {
        params.startDate = customStart;
        params.endDate = customEnd;
      }
      const response = await exportCSVAPI(params);

      // Trigger browser download
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `VyaparFlow_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('CSV Export failed:', err);
      alert('Failed to export CSV report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fn-page-container">
      <div className="fn-page-header">
        <div>
          <h2 className="fn-page-heading">Financial Transactions</h2>
          <p className="fn-page-desc">Complete ledger of all inflows, outflows, and settlement channels.</p>
        </div>

        <button
          className="btn btn-secondary fn-export-btn"
          onClick={handleExportCSV}
          disabled={exporting || visibleTransactions.length === 0}
          title="Download transactions as CSV file"
        >
          <FileSpreadsheet size={16} />
          <span>{exporting ? 'Generating CSV...' : 'Export CSV Ledger'}</span>
        </button>
      </div>

      {loading ? (
        <div style={{ height: 420, background: 'var(--bg-hover)', borderRadius: 'var(--r-xl)' }} />
      ) : (
        <TransactionTable
          data={visibleTransactions}
          title={`All Activity (${visibleTransactions.length})`}
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

        .fn-export-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.825rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default TransactionsPage;

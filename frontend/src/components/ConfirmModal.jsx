import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useTransaction } from '../context/TransactionContext';

const ConfirmModal = () => {
  const { isDeleteModalOpen, setIsDeleteModalOpen, handleDeleteTransaction } = useTransaction();

  if (!isDeleteModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
      <div
        className="modal-content confirm-modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
      >
        <div className="confirm-header">
          <button className="btn-icon" onClick={() => setIsDeleteModalOpen(false)} aria-label="Cancel delete">
            <X size={16} />
          </button>
        </div>
        <div className="confirm-body">
          <div className="confirm-icon-wrap">
            <AlertTriangle size={24} />
          </div>
          <h2 className="confirm-title" id="confirm-title">Delete Transaction?</h2>
          <p className="confirm-desc" id="confirm-desc">
            This will permanently remove the transaction and update all financial totals. This action cannot be undone.
          </p>
        </div>
        <div className="confirm-footer">
          <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
            Keep it
          </button>
          <button className="btn btn-danger" onClick={handleDeleteTransaction}>
            Yes, delete
          </button>
        </div>
      </div>

      <style>{`
        .confirm-modal { max-width: 380px; }
        .confirm-header {
          padding: 0.875rem 1rem;
          display: flex;
          justify-content: flex-end;
        }
        .confirm-body {
          padding: 0 1.5rem 1.25rem;
          text-align: center;
        }
        .confirm-icon-wrap {
          width: 52px; height: 52px;
          background: var(--red-light);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: var(--red);
          margin: 0 auto 1rem;
        }
        .confirm-title { font-size: 1.05rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem; }
        .confirm-desc { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; }
        .confirm-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: flex-end;
          gap: 0.625rem;
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;

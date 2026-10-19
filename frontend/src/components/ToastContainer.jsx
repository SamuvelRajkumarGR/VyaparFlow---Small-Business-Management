import React from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useTransaction } from '../context/TransactionContext';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
};

const ToastContainer = () => {
  const { toasts, removeToast } = useTransaction();

  return (
    <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || CheckCircle;
        return (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <Icon size={17} className="toast-icon" />
            <span className="toast-msg">{t.message}</span>
            <button className="toast-close" onClick={() => removeToast(t.id)} aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        );
      })}

      <style>{`
        .toast-container {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          pointer-events: none;
        }
        .toast {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.75rem 1rem;
          border-radius: var(--r-lg);
          background: var(--bg-card);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
          min-width: 260px;
          max-width: 360px;
          pointer-events: all;
          animation: slideUp 0.25s ease;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .toast--success .toast-icon { color: var(--green); }
        .toast--error .toast-icon { color: var(--red); }
        .toast--warning .toast-icon { color: var(--amber); }
        .toast-msg { flex: 1; line-height: 1.4; }
        .toast-close {
          background: none; border: none;
          color: var(--text-muted); cursor: pointer;
          display: flex; align-items: center;
          padding: 0.15rem; border-radius: 4px;
          transition: color var(--transition);
          flex-shrink: 0;
        }
        .toast-close:hover { color: var(--text-primary); }
        @media (max-width: 480px) {
          .toast-container { left: 1rem; right: 1rem; bottom: 1rem; }
          .toast { min-width: 0; max-width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default ToastContainer;

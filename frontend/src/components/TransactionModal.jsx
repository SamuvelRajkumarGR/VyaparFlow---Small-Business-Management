import React, { useState, useEffect } from 'react';
import { X, PlusCircle, MinusCircle, CheckCircle } from 'lucide-react';
import { useTransaction } from '../context/TransactionContext';

const TransactionModal = () => {
  const { isModalOpen, modalMode, editingTransaction, closeModal, handleSaveTransaction, currency = '₹' } = useTransaction();

  const [type, setType] = useState('sale');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [category, setCategory] = useState('stock');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isModalOpen) return;
    if (editingTransaction) {
      setType(editingTransaction.type || 'sale');
      setAmount(editingTransaction.amount?.toString() || '');
      setPaymentMethod(editingTransaction.paymentMethod || 'upi');
      setCategory(editingTransaction.category || 'stock');
      setDescription(editingTransaction.description || '');
      setDate(editingTransaction.date ? new Date(editingTransaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    } else {
      setType(modalMode === 'expense' ? 'expense' : 'sale');
      setAmount('');
      setPaymentMethod('upi');
      setCategory('stock');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
    setErrors({});
  }, [editingTransaction, modalMode, isModalOpen]);

  if (!isModalOpen) return null;

  const validate = () => {
    const errs = {};
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) errs.amount = 'Enter a valid amount greater than 0';
    if (!description.trim()) errs.description = 'Description is required';
    if (!date) errs.date = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    handleSaveTransaction({
      type,
      amount: parseFloat(amount),
      paymentMethod,
      category: type === 'expense' ? category : 'other',
      description: description.trim(),
      date,
    });
  };

  const isEdit = !!editingTransaction;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content fn-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="fn-modal-title">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title" id="fn-modal-title">
              {isEdit ? 'Edit Record' : type === 'sale' ? 'Record Customer Sale' : 'Add Expense Record'}
            </h2>
            <p className="modal-subtitle">
              {isEdit
                ? 'Update transaction amount, channel, and category details.'
                : type === 'sale'
                  ? 'Record new business revenue and update financial balance.'
                  : 'Record business expenditure to track operational deductions.'}
            </p>
          </div>
          <button className="btn-icon" onClick={closeModal} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Type selector */}
            {!isEdit && (
              <div className="form-group">
                <label className="form-label">Transaction Flow</label>
                <div className="fn-type-toggle">
                  <button
                    type="button"
                    className={`fn-type-opt ${type === 'sale' ? 'fn-type-opt-sale' : ''}`}
                    onClick={() => setType('sale')}
                  >
                    <PlusCircle size={15} />
                    <span>Income / Sale</span>
                  </button>
                  <button
                    type="button"
                    className={`fn-type-opt ${type === 'expense' ? 'fn-type-opt-expense' : ''}`}
                    onClick={() => setType('expense')}
                  >
                    <MinusCircle size={15} />
                    <span>Outflow / Expense</span>
                  </button>
                </div>
              </div>
            )}

            {/* Amount */}
            <div className="form-group">
              <label className="form-label" htmlFor="fn-amount">Amount ({currency})</label>
              <div className="fn-amount-input-wrap">
                <span className="fn-currency-prefix">{currency}</span>
                <input
                  id="fn-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={`form-control fn-amount-field ${errors.amount ? 'input-error' : ''}`}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                />
              </div>
              {errors.amount && <span className="error-text">{errors.amount}</span>}
            </div>

            {/* Payment Method */}
            <div className="form-group">
              <label className="form-label">Payment Channel</label>
              <div className="radio-group">
                {[
                  { id: 'upi', label: 'UPI / Online' },
                  { id: 'cash', label: 'Cash' },
                  { id: 'card', label: 'Card' }
                ].map((pm) => (
                  <div
                    key={pm.id}
                    className={`radio-card ${paymentMethod === pm.id ? 'active' : ''}`}
                    onClick={() => setPaymentMethod(pm.id)}
                  >
                    {pm.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Category for expenses */}
            {type === 'expense' && (
              <div className="form-group">
                <label className="form-label" htmlFor="fn-category">Expense Category</label>
                <select id="fn-category" className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="stock">Stock & Inventory</option>
                  <option value="rent">Shop Rent</option>
                  <option value="bills">Electricity & Utilities</option>
                  <option value="salaries">Staff Salaries</option>
                  <option value="other">Miscellaneous / Other</option>
                </select>
              </div>
            )}

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="fn-desc">Description</label>
              <input
                id="fn-desc"
                type="text"
                className={`form-control ${errors.description ? 'input-error' : ''}`}
                placeholder={type === 'sale' ? 'e.g. Retail grocery sale to customer' : 'e.g. Monthly shop power bill'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="fn-date">Transaction Date</label>
              <input
                id="fn-date"
                type="date"
                className={`form-control ${errors.date ? 'input-error' : ''}`}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.date && <span className="error-text">{errors.date}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button type="submit" className={`btn ${type === 'sale' ? 'btn-sale' : 'btn-expense'}`}>
              {isEdit ? 'Save Changes' : type === 'sale' ? 'Record Sale' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .fn-modal {
          max-width: 480px;
        }

        .fn-type-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.65rem;
        }

        .fn-type-opt {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          padding: 0.65rem;
          border-radius: var(--r-lg);
          border: 1.5px solid var(--border);
          background: var(--bg-input);
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.825rem;
          cursor: pointer;
          transition: all var(--transition);
          font-family: inherit;
        }

        .fn-type-opt-sale {
          background: var(--brand-light);
          border-color: var(--brand);
          color: var(--brand);
        }

        .fn-type-opt-expense {
          background: var(--red-light);
          border-color: var(--red);
          color: var(--red);
        }

        .fn-amount-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .fn-currency-prefix {
          position: absolute;
          left: 1rem;
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-muted);
          pointer-events: none;
        }

        .fn-amount-field {
          padding-left: 2.2rem;
          font-size: 1.25rem;
          font-weight: 800;
        }
      `}</style>
    </div>
  );
};

export default TransactionModal;

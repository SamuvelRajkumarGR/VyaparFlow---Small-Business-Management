import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, UserPlus, Phone, Mail, ArrowUpRight, ArrowDownRight,
  Search, Plus, Minus, Trash2, Edit3, AlertCircle, CheckCircle
} from 'lucide-react';
import {
  getCustomersAPI,
  createCustomerAPI,
  updateCustomerAPI,
  recordCustomerTxnAPI,
  deleteCustomerAPI
} from '../services/api';
import { useTransaction } from '../context/TransactionContext';

const CustomersPage = () => {
  const { currency = '₹', refetch: refetchTransactions } = useTransaction();

  const [customers, setCustomers] = useState([]);
  const [metrics, setMetrics] = useState({ totalCustomers: 0, totalUdharReceivable: 0, totalAdvancePayable: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [txnType, setTxnType] = useState('give_credit'); // 'give_credit' | 'receive_payment'
  const [txnAmount, setTxnAmount] = useState('');
  const [txnDesc, setTxnDesc] = useState('');

  // Add/Edit Form
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    balance: 0,
    notes: '',
  });

  const [toast, setToast] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCustomersAPI({ search });
      if (res.success) {
        setCustomers(res.data);
        if (res.metrics) setMetrics(res.metrics);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setCustomerForm({ name: '', phone: '', email: '', address: '', balance: 0, notes: '' });
    setShowAddModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCustomer(c);
    setCustomerForm({
      name: c.name,
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      balance: c.balance || 0,
      notes: c.notes || '',
    });
    setShowAddModal(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!customerForm.name.trim()) return;

    try {
      if (editingCustomer) {
        const res = await updateCustomerAPI(editingCustomer._id, customerForm);
        if (res.success) {
          showNotification('Customer updated successfully');
          setShowAddModal(false);
          fetchCustomers();
        }
      } else {
        const res = await createCustomerAPI(customerForm);
        if (res.success) {
          showNotification('New customer added');
          setShowAddModal(false);
          fetchCustomers();
        }
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Error saving customer', 'error');
    }
  };

  const handleOpenTxn = (c, type) => {
    setSelectedCustomer(c);
    setTxnType(type);
    setTxnAmount('');
    setTxnDesc('');
    setShowTxnModal(true);
  };

  const handleRecordTxn = async (e) => {
    e.preventDefault();
    if (!txnAmount || Number(txnAmount) <= 0) return;

    try {
      const res = await recordCustomerTxnAPI(selectedCustomer._id, {
        type: txnType,
        amount: Number(txnAmount),
        description: txnDesc,
      });

      if (res.success) {
        showNotification(res.message);
        setShowTxnModal(false);
        fetchCustomers();
        refetchTransactions(); // Keep business dashboard in sync
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Transaction failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer record?')) return;
    try {
      const res = await deleteCustomerAPI(id);
      if (res.success) {
        showNotification('Customer removed');
        fetchCustomers();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete customer', 'error');
    }
  };

  return (
    <div className="fn-page-container fn-customer-page">
      {/* Toast */}
      {toast && (
        <div className={`fn-floating-toast ${toast.type === 'error' ? 'toast-err' : 'toast-ok'}`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="fn-page-header">
        <div>
          <h2 className="fn-page-heading">Customer & Udhar Ledger</h2>
          <p className="fn-page-desc">Track customer credit accounts, pending balances, and collections.</p>
        </div>
        <button className="btn btn-sale fn-action-btn" onClick={handleOpenAdd}>
          <UserPlus size={16} />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="fn-cust-kpi-row">
        <div className="card fn-cust-kpi">
          <div className="fn-kpi-icon-wrap" style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
            <Users size={20} />
          </div>
          <div>
            <span className="fn-cust-kpi-val">{metrics.totalCustomers}</span>
            <span className="fn-cust-kpi-lbl">Total Customers</span>
          </div>
        </div>

        <div className="card fn-cust-kpi">
          <div className="fn-kpi-icon-wrap" style={{ background: 'var(--red-light)', color: 'var(--red)' }}>
            <ArrowUpRight size={20} />
          </div>
          <div>
            <span className="fn-cust-kpi-val text-expense">{currency}{metrics.totalUdharReceivable.toLocaleString('en-IN')}</span>
            <span className="fn-cust-kpi-lbl">Total Udhar (Receivable)</span>
          </div>
        </div>

        <div className="card fn-cust-kpi">
          <div className="fn-kpi-icon-wrap" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>
            <ArrowDownRight size={20} />
          </div>
          <div>
            <span className="fn-cust-kpi-val text-sale">{currency}{metrics.totalAdvancePayable.toLocaleString('en-IN')}</span>
            <span className="fn-cust-kpi-lbl">Advance Collections</span>
          </div>
        </div>
      </div>

      {/* Customer List Card */}
      <div className="card fn-table-card">
        <div className="fn-table-header">
          <div className="fn-th-left">
            <h3 className="fn-table-title">Customer Accounts</h3>
            <span className="fn-table-badge">
              {customers.length} {customers.length === 1 ? 'customer' : 'customers'}
            </span>
          </div>

          <label className="fn-search-box">
            <Search size={15} className="fn-search-icon" />
            <input
              type="text"
              placeholder="Search by name, phone or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="fn-search-input"
              aria-label="Search customers by name, phone, or email"
            />
          </label>
        </div>

        <div className="fn-table-scroll">
          {loading ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading customers...</div>
          ) : customers.length === 0 ? (
            <div className="fn-table-empty">
              <div className="fn-cust-empty-icon"><Users size={23} /></div>
              <h4>{search ? 'No matching customers' : 'Your customer ledger is ready'}</h4>
              <p>
                {search
                  ? 'Try another name, phone number, or email.'
                  : 'Add a customer to start tracking Udhar, payments, and balances in one place.'}
              </p>
              {!search && (
                <button className="btn btn-sale fn-empty-add-btn" onClick={handleOpenAdd}>
                  <UserPlus size={15} />
                  Add your first customer
                </button>
              )}
            </div>
          ) : (
            <table className="fn-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th style={{ textAlign: 'right' }}>Balance Status</th>
                  <th style={{ textAlign: 'center', width: 220 }}>Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const bal = Number(c.balance) || 0;
                  const isUdhar = bal > 0;
                  const isAdvance = bal < 0;

                  return (
                    <tr key={c._id} className="fn-tr">
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
                        {c.notes && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.notes}</span>}
                      </td>
                      <td>
                        {c.phone ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                            <Phone size={13} color="var(--text-muted)" />
                            <span>{c.phone}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td>
                        {c.email ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                            <Mail size={13} color="var(--text-muted)" />
                            <span>{c.email}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {c.address || '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isUdhar ? (
                          <span className="fn-badge-expense fn-cust-bal-pill">
                            Owes {currency}{bal.toLocaleString('en-IN')}
                          </span>
                        ) : isAdvance ? (
                          <span className="fn-badge-sale fn-cust-bal-pill">
                            Advance {currency}{Math.abs(bal).toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="fn-pill-zero">Settled (₹0)</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="fn-cust-actions">
                          <button
                            className="btn btn-outline fn-btn-mini"
                            style={{ color: 'var(--red)', borderColor: 'var(--red-border)' }}
                            onClick={() => handleOpenTxn(c, 'give_credit')}
                            title="Give Udhar / Credit"
                          >
                            <Plus size={12} />
                            <span>Give Udhar</span>
                          </button>
                          <button
                            className="btn btn-outline fn-btn-mini"
                            style={{ color: 'var(--brand)', borderColor: 'var(--green-border)' }}
                            onClick={() => handleOpenTxn(c, 'receive_payment')}
                            title="Receive Payment"
                          >
                            <Minus size={12} />
                            <span>Got Payment</span>
                          </button>
                          <button className="btn-icon" onClick={() => handleOpenEdit(c)} title="Edit">
                            <Edit3 size={14} />
                          </button>
                          <button className="btn-icon fn-btn-delete" onClick={() => handleDelete(c._id)} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button className="btn-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveCustomer}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Customer Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Suresh Patel"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="fn-form-row">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+91 98765 43210"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="suresh@gmail.com"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address / Landmark</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Shop No. 4, Main Bazaar"
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Starting Balance ({currency})</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={customerForm.balance}
                    onChange={(e) => setCustomerForm({ ...customerForm, balance: e.target.value })}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    Positive number = Customer owes you money (Udhar). Negative = Customer advance.
                  </small>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="e.g. Regular monthly wholesale buyer"
                    value={customerForm.notes}
                    onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-sale">{editingCustomer ? 'Update Customer' : 'Add Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Udhar / Payment Modal */}
      {showTxnModal && selectedCustomer && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">
                {txnType === 'give_credit' ? `Give Udhar to ${selectedCustomer.name}` : `Receive Payment from ${selectedCustomer.name}`}
              </h3>
              <button className="btn-close" onClick={() => setShowTxnModal(false)}>✕</button>
            </div>
            <form onSubmit={handleRecordTxn}>
              <div className="modal-body">
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Current outstanding balance: <strong>{currency}{Number(selectedCustomer.balance || 0).toLocaleString('en-IN')}</strong>
                </p>

                <div className="form-group">
                  <label className="form-label">Amount ({currency}) *</label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    className="form-control"
                    placeholder="Enter amount"
                    value={txnAmount}
                    onChange={(e) => setTxnAmount(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Note</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={txnType === 'give_credit' ? 'e.g. Grocery items on credit' : 'e.g. Cash settled by Suresh'}
                    value={txnDesc}
                    onChange={(e) => setTxnDesc(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTxnModal(false)}>Cancel</button>
                <button type="submit" className={`btn ${txnType === 'give_credit' ? 'btn-expense' : 'btn-sale'}`}>
                  {txnType === 'give_credit' ? 'Record Udhar Credit' : 'Record Payment Received'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .fn-customer-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .fn-customer-page .fn-page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
        }
        .fn-customer-page .fn-page-heading {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.035em;
          line-height: 1.25;
        }
        .fn-customer-page .fn-page-desc {
          margin-top: 0.35rem;
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .fn-customer-page .fn-page-header .btn {
          flex-shrink: 0;
          min-height: 42px;
          padding: 0.65rem 1rem;
        }
        .fn-cust-kpi-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }
        .fn-cust-kpi {
          min-width: 0;
          padding: 1.2rem 1.35rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform var(--transition), box-shadow var(--transition);
        }
        .fn-cust-kpi:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .fn-kpi-icon-wrap {
          width: 46px;
          height: 46px;
          border-radius: var(--r-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .fn-cust-kpi-val {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
          display: block;
          line-height: 1.2;
          overflow-wrap: anywhere;
        }
        .fn-cust-kpi-lbl {
          display: block;
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
          margin-top: 0.3rem;
        }
        .fn-customer-page .fn-table-card {
          min-width: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .fn-customer-page .fn-table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.15rem 1.4rem;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(90deg, var(--brand-subtle), var(--bg-card) 75%);
        }
        [data-theme='dark'] .fn-customer-page .fn-table-header {
          background: linear-gradient(90deg, rgba(21, 154, 104, 0.1), var(--bg-card) 75%);
        }
        .fn-customer-page .fn-th-left {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.65rem;
          min-width: 0;
        }
        .fn-customer-page .fn-table-title {
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.4;
        }
        .fn-customer-page .fn-table-badge {
          padding: 0.2rem 0.6rem;
          border-radius: var(--r-full);
          background: var(--brand-light);
          color: var(--brand);
          font-size: 0.72rem;
          font-weight: 700;
          white-space: nowrap;
        }
        .fn-customer-page .fn-search-box {
          position: relative;
          display: block;
          width: min(320px, 100%);
          flex-shrink: 0;
        }
        .fn-customer-page .fn-search-icon {
          position: absolute;
          top: 50%;
          left: 0.9rem;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .fn-customer-page .fn-search-input {
          width: 100%;
          min-height: 42px;
          padding: 0.6rem 0.9rem 0.6rem 2.4rem;
          border: 1px solid var(--border);
          border-radius: var(--r-full);
          outline: none;
          background: var(--bg-card);
          color: var(--text-primary);
          font: inherit;
          font-size: 0.8rem;
          transition: border-color var(--transition), box-shadow var(--transition);
        }
        .fn-customer-page .fn-search-input::placeholder {
          color: var(--text-muted);
        }
        .fn-customer-page .fn-search-input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }
        .fn-customer-page .fn-table-scroll {
          width: 100%;
          overflow-x: auto;
        }
        .fn-customer-page .fn-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        .fn-customer-page .fn-table thead {
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
        }
        .fn-customer-page .fn-table th {
          padding: 0.8rem 1rem;
          text-align: left;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.045em;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .fn-customer-page .fn-table td {
          padding: 0.9rem 1rem;
          vertical-align: middle;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border);
        }
        .fn-customer-page .fn-tr:last-child td {
          border-bottom: 0;
        }
        .fn-customer-page .fn-tr:hover {
          background: var(--bg-hover);
        }
        .fn-customer-page .fn-table-empty {
          min-height: 240px;
          padding: 2.5rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          text-align: center;
          color: var(--text-muted);
        }
        .fn-cust-empty-icon {
          width: 52px;
          height: 52px;
          margin-bottom: 0.25rem;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: var(--brand);
          background: var(--brand-light);
        }
        .fn-customer-page .fn-table-empty h4 {
          color: var(--text-primary);
          font-size: 0.98rem;
          font-weight: 750;
        }
        .fn-customer-page .fn-table-empty p {
          max-width: 42ch;
          font-size: 0.82rem;
          line-height: 1.55;
        }
        .fn-cust-bal-pill {
          display: inline-block;
          padding: 0.25rem 0.65rem;
          border-radius: var(--r-full);
          font-size: 0.775rem;
          font-weight: 700;
        }
        .fn-pill-zero {
          display: inline-block;
          padding: 0.25rem 0.65rem;
          border-radius: var(--r-full);
          font-size: 0.75rem;
          font-weight: 600;
          background: var(--bg-hover);
          color: var(--text-muted);
        }
        .fn-cust-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
        }
        .fn-btn-mini {
          padding: 0.38rem 0.6rem;
          font-size: 0.7rem;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          border-radius: var(--r-md);
          border: 1px solid var(--border);
          background: var(--bg-card);
          cursor: pointer;
          white-space: nowrap;
        }
        .fn-btn-mini:hover {
          background: var(--bg-hover);
        }
        .fn-customer-page .fn-btn-icon {
          color: var(--text-muted);
        }
        .fn-empty-add-btn {
          margin-top: 0.5rem;
          padding: 0.6rem 0.9rem;
          font-size: 0.8rem;
        }
        .fn-floating-toast {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          z-index: 9999;
          padding: 0.75rem 1.25rem;
          border-radius: var(--r-lg);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.825rem;
          font-weight: 600;
          box-shadow: var(--shadow-lg);
        }
        .toast-ok { background: #E8F8EF; color: #168653; border: 1px solid #A8DFBF; }
        .toast-err { background: #FEF0F0; color: #C23B3B; border: 1px solid #F5ADAD; }
        @media (max-width: 1100px) {
          .fn-customer-page .fn-table {
            min-width: 980px;
          }
        }
        @media (max-width: 900px) {
          .fn-cust-kpi-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .fn-cust-kpi:last-child {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 640px) {
          .fn-customer-page {
            gap: 1rem;
          }
          .fn-customer-page .fn-page-header {
            align-items: stretch;
            flex-direction: column;
          }
          .fn-customer-page .fn-page-heading {
            font-size: 1.3rem;
          }
          .fn-customer-page .fn-page-header .btn {
            align-self: flex-start;
          }
          .fn-cust-kpi-row {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          .fn-cust-kpi:last-child {
            grid-column: auto;
          }
          .fn-cust-kpi {
            padding: 1rem;
          }
          .fn-customer-page .fn-table-header {
            align-items: stretch;
            flex-direction: column;
            padding: 1rem;
          }
          .fn-customer-page .fn-search-box {
            width: 100%;
          }
          .fn-customer-page .fn-table {
            min-width: 920px;
          }
          .fn-cust-actions {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomersPage;

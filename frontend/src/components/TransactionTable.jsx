import React, { useState, useMemo } from 'react';
import { Search, Filter, Pencil, Trash2, ArrowUpDown, ChevronUp, ChevronDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTransaction } from '../context/TransactionContext';

const METHOD_LABEL = { cash: 'Cash', upi: 'UPI', card: 'Card' };
const CAT_LABEL = { stock: 'Stock', rent: 'Rent', bills: 'Bills', salaries: 'Salaries', other: 'Other' };

const TransactionTable = ({
  data = [],
  title = 'Transactions',
  showFilters = true,
  showTypeFilter = true,
  limit = null,
}) => {
  const { openEditModal, confirmDelete, currency = '₹' } = useTransaction();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const toggleSort = (field) => {
    if (sortField === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('desc'); }
  };

  const filtered = useMemo(() => {
    let rows = [...data];
    if (typeFilter !== 'all') rows = rows.filter(t => t.type === typeFilter);
    if (methodFilter !== 'all') rows = rows.filter(t => t.paymentMethod === methodFilter);
    if (catFilter !== 'all') rows = rows.filter(t => t.category === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(t =>
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.paymentMethod?.toLowerCase().includes(q)
      );
    }
    rows.sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (sortField === 'date') { av = new Date(av); bv = new Date(bv); }
      if (sortField === 'amount') { av = Number(av); bv = Number(bv); }
      return sortOrder === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return limit ? rows.slice(0, limit) : rows;
  }, [data, search, typeFilter, methodFilter, catFilter, sortField, sortOrder, limit]);

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={13} className="fn-sort-icon-neutral" />;
    return sortOrder === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />;
  };

  return (
    <div className="card fn-table-card">
      {/* Table Header */}
      <div className="fn-table-header">
        <div className="fn-th-left">
          <h3 className="fn-table-title">{title}</h3>
          <span className="fn-table-badge">{filtered.length} entries</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      {showFilters && (
        <div className="fn-table-toolbar">
          <div className="fn-search-box">
            <Search size={15} className="fn-search-icon" />
            <input
              type="text"
              placeholder="Search by description or category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="fn-search-input"
              aria-label="Search transactions"
            />
          </div>

          <div className="fn-filters-row">
            {showTypeFilter && (
              <div className="fn-filter-pill">
                <Filter size={13} className="fn-f-icon" />
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="fn-select" aria-label="Type">
                  <option value="all">All Types</option>
                  <option value="sale">Sales Only</option>
                  <option value="expense">Expenses Only</option>
                </select>
              </div>
            )}

            <div className="fn-filter-pill">
              <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="fn-select" aria-label="Payment Method">
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
              </select>
            </div>

            <div className="fn-filter-pill">
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="fn-select" aria-label="Category">
                <option value="all">All Categories</option>
                <option value="stock">Stock</option>
                <option value="rent">Rent</option>
                <option value="bills">Bills</option>
                <option value="salaries">Salaries</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="fn-table-scroll">
        {filtered.length === 0 ? (
          <div className="fn-table-empty">
            <Search size={32} />
            <p>{data.length === 0 ? 'No transactions recorded yet.' : 'No transactions matched your search filters.'}</p>
          </div>
        ) : (
          <table className="fn-table">
            <thead>
              <tr>
                <th style={{ width: 100 }}>Type</th>
                <th>Description</th>
                <th className="fn-th-sort" onClick={() => toggleSort('date')}>
                  <div className="fn-th-flex">Date <SortIcon field="date" /></div>
                </th>
                <th>Method</th>
                <th>Category</th>
                <th className="fn-th-sort fn-th-right" onClick={() => toggleSort('amount')}>
                  <div className="fn-th-flex fn-th-flex-right">Amount <SortIcon field="amount" /></div>
                </th>
                <th style={{ textAlign: 'center', width: 90 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const isSale = t.type === 'sale';
                return (
                  <tr key={t._id} className="fn-tr">
                    <td>
                      <span className={`fn-type-badge ${isSale ? 'fn-badge-sale' : 'fn-badge-expense'}`}>
                        {isSale ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        <span>{isSale ? 'Sale' : 'Expense'}</span>
                      </span>
                    </td>
                    <td className="fn-td-desc">
                      <span className="fn-desc-text" title={t.description}>{t.description}</span>
                    </td>
                    <td className="fn-td-date">
                      {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <span className="fn-method-tag">{METHOD_LABEL[t.paymentMethod] || t.paymentMethod}</span>
                    </td>
                    <td>
                      <span className="fn-cat-text">{isSale ? '—' : (CAT_LABEL[t.category] || t.category)}</span>
                    </td>
                    <td className={`fn-td-amount ${isSale ? 'text-sale' : 'text-expense'}`}>
                      {isSale ? '+' : '-'}{currency}{Number(t.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="fn-td-actions">
                      <button className="btn-icon" onClick={() => openEditModal(t)} aria-label="Edit" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button className="btn-icon fn-btn-delete" onClick={() => confirmDelete(t._id)} aria-label="Delete" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .fn-table-card {
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .fn-table-header {
          padding: 1.25rem 1.4rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .fn-th-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .fn-table-title {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.015em;
        }

        .fn-table-badge {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--brand);
          background: var(--brand-light);
          padding: 0.15rem 0.55rem;
          border-radius: var(--r-full);
        }

        .fn-table-toolbar {
          padding: 0.85rem 1.4rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          background: var(--bg-hover);
        }

        .fn-search-box {
          position: relative;
          flex: 1;
          min-width: 220px;
        }

        .fn-search-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .fn-search-input {
          width: 100%;
          padding: 0.5rem 0.85rem 0.5rem 2.2rem;
          border: 1px solid var(--border);
          border-radius: var(--r-full);
          background: var(--bg-card);
          color: var(--text-primary);
          font-size: 0.825rem;
          font-family: inherit;
          outline: none;
          transition: border-color var(--transition);
        }
        .fn-search-input:focus {
          border-color: var(--brand);
        }

        .fn-filters-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .fn-filter-pill {
          display: flex;
          align-items: center;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--r-full);
          padding: 0.2rem 0.65rem;
        }

        .fn-f-icon {
          color: var(--text-muted);
          margin-right: 0.35rem;
        }

        .fn-select {
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          outline: none;
          font-family: inherit;
        }

        .fn-table-scroll {
          overflow-x: auto;
        }

        .fn-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }

        .fn-table thead {
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
        }

        .fn-table th {
          padding: 0.75rem 1.4rem;
          text-align: left;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .fn-th-sort {
          cursor: pointer;
          user-select: none;
        }
        .fn-th-sort:hover {
          color: var(--text-primary);
        }

        .fn-th-flex {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .fn-th-flex-right {
          justify-content: flex-end;
        }

        .fn-sort-icon-neutral {
          opacity: 0.35;
        }

        .fn-tr {
          border-bottom: 1px solid var(--border);
          transition: background var(--transition);
        }
        .fn-tr:last-child {
          border-bottom: none;
        }
        .fn-tr:hover {
          background: var(--bg-hover);
        }

        .fn-table td {
          padding: 0.85rem 1.4rem;
          vertical-align: middle;
        }

        .fn-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.2rem 0.55rem;
          border-radius: var(--r-full);
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .fn-badge-sale {
          background: var(--green-light);
          color: var(--green-text);
        }
        .fn-badge-expense {
          background: var(--red-light);
          color: var(--red-text);
        }

        .fn-td-desc {
          max-width: 260px;
        }
        .fn-desc-text {
          font-weight: 600;
          color: var(--text-primary);
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .fn-td-date {
          color: var(--text-muted);
          font-size: 0.8rem;
          white-space: nowrap;
        }

        .fn-method-tag {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--bg-hover);
          padding: 0.15rem 0.5rem;
          border-radius: var(--r-sm);
        }

        .fn-cat-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .fn-td-amount {
          font-weight: 800;
          font-size: 0.925rem;
          text-align: right;
          white-space: nowrap;
        }

        .fn-td-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
        }

        .fn-btn-delete:hover {
          background: var(--red-light);
          color: var(--red);
        }

        .fn-table-empty {
          padding: 3.5rem 1.5rem;
          text-align: center;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default TransactionTable;

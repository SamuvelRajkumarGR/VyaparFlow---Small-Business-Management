import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Filter, ShieldCheck, UserCheck, UserX,
  AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Store, Mail
} from 'lucide-react';
import { getAdminUsersAPI, updateAdminUserStatusAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Status Modal
  const [targetUser, setTargetUser] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminUsersAPI({
        page,
        limit: 10,
        search,
        status: statusFilter,
      });
      if (res.success) {
        setUsers(res.users);
        setTotal(res.total);
        setPages(res.pages);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenStatusModal = (user) => {
    setTargetUser(user);
    setShowStatusModal(true);
  };

  const handleToggleStatus = async () => {
    if (!targetUser) return;
    const newStatus = targetUser.accountStatus === 'active' ? 'suspended' : 'active';

    setActionLoading(true);
    try {
      const res = await updateAdminUserStatusAPI(targetUser._id, newStatus);
      if (res.success) {
        showToast(res.message);
        setShowStatusModal(false);
        fetchUsers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update account status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fn-page-container fn-admin-users">
      {/* Toast */}
      {toast && (
        <div className={`fn-floating-toast ${toast.type === 'error' ? 'toast-err' : 'toast-ok'}`}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="fn-page-header">
        <div>
          <h2 className="fn-page-heading">User Account Management</h2>
          <p className="fn-page-desc">Oversee registered business workspaces and regulate access permissions.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card fn-table-card">
        <div className="fn-table-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div className="fn-th-left">
            <h3 className="fn-table-title">Registered Business Users</h3>
            <span className="fn-table-badge">{total} accounts</span>
          </div>

          <div className="fn-filters-row">
            <div className="fn-search-box" style={{ maxWidth: 280 }}>
              <Search size={15} className="fn-search-icon" />
              <input
                type="text"
                placeholder="Search name, email, shop..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="fn-search-input"
              />
            </div>

            <div className="fn-filter-pill">
              <Filter size={13} className="fn-f-icon" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="fn-select"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="fn-table-scroll">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading user accounts...
            </div>
          ) : users.length === 0 ? (
            <div className="fn-table-empty">
              <Users size={36} />
              <p>No user accounts matched your search criteria.</p>
            </div>
          ) : (
            <table className="fn-table">
              <thead>
                <tr>
                  <th>Business / Owner Name</th>
                  <th>Email</th>
                  <th>Auth Method</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th style={{ textAlign: 'center', width: 140 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isActive = u.accountStatus === 'active';
                  const isSelf = currentUser?._id === u._id || currentUser?.id === u._id;

                  return (
                    <tr key={u._id} className="fn-tr">
                      <td className="fn-business-cell">
                        <div className="fn-business-name">{u.businessName}</div>
                        <span className="fn-owner-name">{u.name}</span>
                      </td>
                      <td className="fn-email-cell">
                        <div className="fn-user-email">
                          <Mail size={12} color="var(--text-muted)" />
                          <span>{u.email}</span>
                        </div>
                      </td>
                      <td>
                        <div className="fn-auth-methods">
                          {u.authProviders?.map((p) => (
                            <span
                              key={p}
                              className="fn-chan-badge"
                              data-provider={p}
                            >
                              {p === 'google' ? 'Google' : 'Password'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`fn-admin-role-badge ${u.role === 'admin' ? 'is-admin' : ''}`}
                        >
                          {u.role === 'admin' ? 'Super Admin' : 'Business User'}
                        </span>
                      </td>
                      <td>
                        <span className={`fn-type-badge ${isActive ? 'fn-badge-sale' : 'fn-badge-expense'}`}>
                          {isActive ? <UserCheck size={11} /> : <UserX size={11} />}
                          <span>{isActive ? 'Active' : 'Suspended'}</span>
                        </span>
                      </td>
                      <td className="fn-registered-date">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="fn-user-actions">
                        {isSelf ? (
                          <span className="fn-current-admin">
                            Current Admin
                          </span>
                        ) : (
                          <button
                            className={`btn fn-btn-mini ${isActive ? 'btn-expense' : 'btn-sale'}`}
                            onClick={() => handleOpenStatusModal(u)}
                          >
                            {isActive ? 'Suspend' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {pages > 1 && (
          <div className="fn-pagination-bar">
            <span className="fn-page-info">
              Page {page} of {pages}
            </span>
            <div className="fn-page-btns">
              <button
                className="btn btn-secondary fn-btn-mini"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                className="btn btn-secondary fn-btn-mini"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showStatusModal && targetUser && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {targetUser.accountStatus === 'active' ? 'Suspend User Account' : 'Reactivate User Account'}
              </h3>
              <button className="btn-close" onClick={() => setShowStatusModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--r-lg)',
                    background: targetUser.accountStatus === 'active' ? 'var(--red-light)' : 'var(--green-light)',
                    color: targetUser.accountStatus === 'active' ? 'var(--red)' : 'var(--green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    Are you sure you want to {targetUser.accountStatus === 'active' ? 'suspend' : 'reactivate'} "{targetUser.name}" ({targetUser.businessName})?
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                    {targetUser.accountStatus === 'active'
                      ? 'When suspended, the user will be instantly blocked from recording transactions and running analytics. Their historical business data remains intact.'
                      : 'Reactivating will restore full access to their private workspace.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowStatusModal(false)} disabled={actionLoading}>
                Cancel
              </button>
              <button
                className={`btn ${targetUser.accountStatus === 'active' ? 'btn-expense' : 'btn-sale'}`}
                onClick={handleToggleStatus}
                disabled={actionLoading}
              >
                {actionLoading ? 'Updating...' : targetUser.accountStatus === 'active' ? 'Confirm Suspension' : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .fn-admin-users {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .fn-admin-users .fn-page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
        }
        .fn-admin-users .fn-page-desc {
          margin-top: 0.35rem;
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .fn-admin-users .fn-table-card {
          min-width: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .fn-admin-users .fn-table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.15rem 1.4rem;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(90deg, var(--brand-subtle), var(--bg-card) 75%);
        }
        [data-theme='dark'] .fn-admin-users .fn-table-header {
          background: linear-gradient(90deg, rgba(21, 154, 104, 0.1), var(--bg-card) 75%);
        }
        .fn-admin-users .fn-th-left {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.65rem;
          min-width: 0;
        }
        .fn-admin-users .fn-table-title {
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.4;
        }
        .fn-admin-users .fn-table-badge {
          padding: 0.2rem 0.6rem;
          border-radius: var(--r-full);
          background: var(--brand-light);
          color: var(--brand);
          font-size: 0.72rem;
          font-weight: 700;
          white-space: nowrap;
        }
        .fn-admin-users .fn-filters-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 0.65rem;
          min-width: 0;
        }
        .fn-admin-users .fn-search-box {
          position: relative;
          width: min(280px, 100%);
        }
        .fn-admin-users .fn-search-icon {
          position: absolute;
          top: 50%;
          left: 0.85rem;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .fn-admin-users .fn-search-input {
          width: 100%;
          min-height: 40px;
          padding: 0.55rem 0.85rem 0.55rem 2.25rem;
          border: 1px solid var(--border);
          border-radius: var(--r-full);
          outline: none;
          background: var(--bg-card);
          color: var(--text-primary);
          font: inherit;
          font-size: 0.8rem;
          transition: border-color var(--transition), box-shadow var(--transition);
        }
        .fn-admin-users .fn-search-input::placeholder {
          color: var(--text-muted);
        }
        .fn-admin-users .fn-search-input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }
        .fn-admin-users .fn-filter-pill {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          min-height: 40px;
          padding: 0.2rem 0.7rem;
          border: 1px solid var(--border);
          border-radius: var(--r-full);
          background: var(--bg-card);
        }
        .fn-admin-users .fn-f-icon {
          flex-shrink: 0;
          color: var(--text-muted);
        }
        .fn-admin-users .fn-select {
          max-width: 150px;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--text-primary);
          font: inherit;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
        }
        .fn-admin-users .fn-table-scroll {
          width: 100%;
          overflow-x: auto;
        }
        .fn-admin-users .fn-table {
          width: 100%;
          min-width: 920px;
          border-collapse: collapse;
          font-size: 0.82rem;
        }
        .fn-admin-users .fn-table thead {
          background: var(--bg-hover);
          border-bottom: 1px solid var(--border);
        }
        .fn-admin-users .fn-table th {
          padding: 0.85rem 1rem;
          color: var(--text-muted);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.045em;
          text-align: left;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .fn-admin-users .fn-table th:first-child,
        .fn-admin-users .fn-table td:first-child {
          padding-left: 1.4rem;
        }
        .fn-admin-users .fn-table td {
          padding: 0.9rem 1rem;
          border-bottom: 1px solid var(--border);
          color: var(--text-secondary);
          vertical-align: middle;
        }
        .fn-admin-users .fn-tr:last-child td {
          border-bottom: 0;
        }
        .fn-admin-users .fn-tr:hover {
          background: var(--bg-hover);
        }
        .fn-admin-users .fn-business-name {
          color: var(--text-primary);
          font-size: 0.85rem;
          font-weight: 700;
          line-height: 1.4;
        }
        .fn-admin-users .fn-owner-name {
          display: block;
          margin-top: 0.2rem;
          color: var(--text-muted);
          font-size: 0.75rem;
        }
        .fn-admin-users .fn-user-email {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          min-width: 180px;
          white-space: nowrap;
        }
        .fn-admin-users .fn-user-email svg {
          flex-shrink: 0;
        }
        .fn-admin-users .fn-auth-methods {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }
        .fn-admin-users .fn-chan-badge {
          padding: 0.2rem 0.55rem;
          border-radius: var(--r-full);
          background: var(--bg-hover);
          color: var(--text-primary);
          font-size: 0.68rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .fn-admin-users .fn-chan-badge[data-provider='google'] {
          background: #E8F0FE;
          color: #1A73E8;
        }
        .fn-admin-users .fn-admin-role-badge,
        .fn-admin-users .fn-type-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          padding: 0.25rem 0.6rem;
          border-radius: var(--r-full);
          background: var(--green-light);
          color: var(--green-text);
          font-size: 0.7rem;
          font-weight: 700;
          white-space: nowrap;
        }
        .fn-admin-users .fn-admin-role-badge {
          background: var(--bg-hover);
          color: var(--text-secondary);
        }
        .fn-admin-users .fn-admin-role-badge.is-admin {
          background: var(--amber-light);
          color: var(--amber);
        }
        .fn-admin-users .fn-type-badge.fn-badge-expense {
          background: var(--red-light);
          color: var(--red-text);
        }
        .fn-admin-users .fn-registered-date {
          color: var(--text-muted) !important;
          font-size: 0.78rem;
          white-space: nowrap;
        }
        .fn-admin-users .fn-user-actions {
          text-align: center;
        }
        .fn-admin-users .fn-user-actions .btn {
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
        }
        .fn-admin-users .fn-current-admin {
          color: var(--text-muted);
          font-size: 0.72rem;
          font-style: italic;
          white-space: nowrap;
        }
        .fn-admin-users .fn-table-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          min-height: 220px;
          padding: 2rem;
          color: var(--text-muted);
          text-align: center;
        }
        .fn-admin-users .fn-table-empty svg {
          color: var(--brand);
        }
        .fn-pagination-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.9rem 1.4rem;
          border-top: 1px solid var(--border);
        }
        .fn-page-info {
          font-size: 0.8rem;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .fn-page-btns {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 0.5rem;
        }
        @media (max-width: 760px) {
          .fn-admin-users .fn-table-header {
            align-items: stretch;
            flex-direction: column;
            padding: 1rem;
          }
          .fn-admin-users .fn-filters-row {
            justify-content: stretch;
          }
          .fn-admin-users .fn-search-box {
            flex: 1 1 200px;
            max-width: none !important;
          }
          .fn-admin-users .fn-filter-pill {
            flex: 0 0 auto;
          }
          .fn-admin-users .fn-table {
            min-width: 880px;
          }
          .fn-admin-users .fn-table th:first-child,
          .fn-admin-users .fn-table td:first-child {
            padding-left: 1rem;
          }
        }
        @media (max-width: 480px) {
          .fn-admin-users .fn-filters-row {
            align-items: stretch;
            flex-direction: column;
          }
          .fn-admin-users .fn-search-box {
            flex-basis: auto;
          }
          .fn-admin-users .fn-select {
            max-width: none;
            width: 100%;
          }
          .fn-pagination-bar {
            align-items: flex-start;
            flex-direction: column;
            padding: 0.85rem 1rem;
          }
          .fn-page-btns {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminUsersPage;

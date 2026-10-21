import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Filter, ChevronLeft, ChevronRight, Activity, Calendar } from 'lucide-react';
import { getAdminAuditLogsAPI } from '../services/api';

const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminAuditLogsAPI({
        page,
        limit: 15,
        action: actionFilter,
      });
      if (res.success) {
        setLogs(res.logs);
        setTotal(res.total);
        setPages(res.pages);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="fn-page-container fn-admin-audit">
      <div className="fn-page-header">
        <div>
          <h2 className="fn-page-heading">Administrative Audit Trail</h2>
          <p className="fn-page-desc">Immutable log of security and administrative operations across the platform.</p>
        </div>
      </div>

      <div className="card fn-table-card">
        <div className="fn-table-header">
          <div className="fn-th-left">
            <h3 className="fn-table-title">System Audit Log</h3>
            <span className="fn-table-badge">{total} logged events</span>
          </div>

          <div className="fn-filter-pill fn-audit-filter">
            <Filter size={13} className="fn-f-icon" />
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="fn-select"
            >
              <option value="all">All Actions</option>
              <option value="USER_SUSPENDED">Account Suspended</option>
              <option value="USER_REACTIVATED">Account Reactivated</option>
              <option value="ADMIN_PROVISIONED">Admin Provisioned</option>
              <option value="LEGACY_DATA_MIGRATED">Legacy Migration</option>
            </select>
          </div>
        </div>

        <div className="fn-table-scroll">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading audit logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="fn-table-empty">
              <Activity size={36} />
              <p>No audit events match the filter.</p>
            </div>
          ) : (
            <table className="fn-table fn-audit-table">
              <thead>
                <tr>
                  <th className="fn-audit-date">Date & Time</th>
                  <th>Action</th>
                  <th>Administrator</th>
                  <th>Target Account</th>
                  <th>Operation Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const isSuspension = log.action.includes('SUSPEND');
                  const isReactivation = log.action.includes('REACTIVATE');

                  return (
                    <tr key={log._id} className="fn-tr">
                      <td className="fn-audit-date">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <span
                          className={`fn-type-badge fn-audit-action ${
                            isSuspension ? 'fn-badge-expense' : isReactivation ? 'fn-badge-sale' : 'fn-audit-action-neutral'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="fn-audit-email">{log.actorEmail}</td>
                      <td className="fn-audit-email">{log.targetUserEmail || '—'}</td>
                      <td className="fn-audit-details">
                        {log.details ? (
                          <pre>
                            {JSON.stringify(log.details, null, 1)}
                          </pre>
                        ) : '—'}
                      </td>
                      <td className="fn-audit-ip">
                        {log.ipAddress || 'internal'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

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

      <style>{`
        .fn-admin-audit {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .fn-admin-audit .fn-page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
        }
        .fn-admin-audit .fn-page-desc {
          max-width: 48rem;
          margin-top: 0.35rem;
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .fn-admin-audit .fn-table-card {
          min-width: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .fn-admin-audit .fn-table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.15rem 1.4rem;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(90deg, var(--brand-subtle), var(--bg-card) 75%);
        }
        [data-theme='dark'] .fn-admin-audit .fn-table-header {
          background: linear-gradient(90deg, rgba(21, 154, 104, 0.1), var(--bg-card) 75%);
        }
        .fn-admin-audit .fn-th-left {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.65rem;
          min-width: 0;
        }
        .fn-admin-audit .fn-table-title {
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.4;
        }
        .fn-admin-audit .fn-table-badge {
          padding: 0.2rem 0.6rem;
          border-radius: var(--r-full);
          background: var(--brand-light);
          color: var(--brand);
          font-size: 0.72rem;
          font-weight: 700;
          white-space: nowrap;
        }
        .fn-admin-audit .fn-audit-filter {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          min-height: 40px;
          padding: 0.2rem 0.7rem;
          border: 1px solid var(--border);
          border-radius: var(--r-full);
          background: var(--bg-card);
        }
        .fn-admin-audit .fn-f-icon {
          flex-shrink: 0;
          color: var(--text-muted);
        }
        .fn-admin-audit .fn-select {
          max-width: 190px;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--text-primary);
          font: inherit;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
        }
        .fn-admin-audit .fn-table-scroll {
          width: 100%;
          overflow-x: auto;
        }
        .fn-admin-audit .fn-audit-table {
          width: 100%;
          min-width: 1080px;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 0.82rem;
        }
        .fn-admin-audit .fn-audit-table th {
          padding: 0.85rem 1rem;
          background: var(--bg-hover);
          border-bottom: 1px solid var(--border);
          color: var(--text-muted);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.045em;
          text-align: left;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .fn-admin-audit .fn-audit-table td {
          padding: 0.9rem 1rem;
          border-bottom: 1px solid var(--border);
          color: var(--text-secondary);
          vertical-align: top;
        }
        .fn-admin-audit .fn-audit-table th:nth-child(1),
        .fn-admin-audit .fn-audit-table td:nth-child(1) { width: 170px; }
        .fn-admin-audit .fn-audit-table th:nth-child(2),
        .fn-admin-audit .fn-audit-table td:nth-child(2) { width: 190px; }
        .fn-admin-audit .fn-audit-table th:nth-child(3),
        .fn-admin-audit .fn-audit-table td:nth-child(3) { width: 190px; }
        .fn-admin-audit .fn-audit-table th:nth-child(4),
        .fn-admin-audit .fn-audit-table td:nth-child(4) { width: 190px; }
        .fn-admin-audit .fn-audit-table th:nth-child(6),
        .fn-admin-audit .fn-audit-table td:nth-child(6) { width: 140px; }
        .fn-admin-audit .fn-audit-table tr:last-child td {
          border-bottom: 0;
        }
        .fn-admin-audit .fn-audit-table tr:hover td {
          background: var(--bg-hover);
        }
        .fn-admin-audit .fn-audit-date,
        .fn-admin-audit .fn-audit-ip {
          color: var(--text-muted) !important;
          font-size: 0.76rem;
          line-height: 1.5;
        }
        .fn-admin-audit .fn-audit-date {
          white-space: nowrap;
        }
        .fn-admin-audit .fn-audit-email {
          color: var(--text-primary) !important;
          font-size: 0.79rem;
          overflow-wrap: anywhere;
        }
        .fn-admin-audit .fn-audit-action {
          font-size: 0.68rem;
          white-space: nowrap;
        }
        .fn-admin-audit .fn-audit-action-neutral {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .fn-admin-audit .fn-audit-details {
          color: var(--text-secondary) !important;
          font-size: 0.75rem;
        }
        .fn-admin-audit .fn-audit-details pre {
          max-width: 100%;
          margin: 0;
          font-family: inherit;
          line-height: 1.5;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }
        .fn-admin-audit .fn-table-empty {
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
        .fn-admin-audit .fn-table-empty svg {
          color: var(--brand);
        }
        .fn-admin-audit .fn-pagination-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.9rem 1.4rem;
          border-top: 1px solid var(--border);
        }
        .fn-admin-audit .fn-page-info {
          color: var(--text-muted);
          font-size: 0.8rem;
          white-space: nowrap;
        }
        .fn-admin-audit .fn-page-btns {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 0.5rem;
        }
        @media (max-width: 760px) {
          .fn-admin-audit .fn-table-header {
            align-items: stretch;
            flex-direction: column;
            padding: 1rem;
          }
          .fn-admin-audit .fn-audit-filter {
            align-self: flex-start;
          }
          .fn-admin-audit .fn-audit-table {
            min-width: 1080px;
          }
        }
        @media (max-width: 480px) {
          .fn-admin-audit .fn-pagination-bar {
            align-items: flex-start;
            flex-direction: column;
            padding: 0.85rem 1rem;
          }
          .fn-admin-audit .fn-page-btns {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminAuditLogsPage;

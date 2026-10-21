import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserCheck, UserX, Shield, Activity, TrendingUp,
  ArrowRight, ShieldCheck, CheckCircle, AlertTriangle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getAdminStatsAPI } from '../services/api';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminStatsAPI();
        if (res.success) setStats(res.stats);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="fn-page-container fn-admin-dashboard">
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading administrative metrics...
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="fn-page-container fn-admin-dashboard">
      {/* Header */}
      <div className="fn-page-header">
        <div>
          <div className="fn-admin-tag-row">
            <span className="fn-admin-badge"><Shield size={12} /> Super Admin Control Center</span>
          </div>
          <h2 className="fn-page-heading">Platform Administration</h2>
          <p className="fn-page-desc">System health, registered business workspaces, and security overview.</p>
        </div>

        <Link to="/admin/users" className="btn btn-sale fn-action-btn">
          <Users size={16} />
          <span>Manage Users</span>
        </Link>
      </div>

      {/* KPI Cards Row */}
      <div className="fn-admin-kpis">
        <div className="card fn-admin-kpi-card">
          <div className="fn-kpi-hdr">
            <span className="fn-kpi-label">Total Registered Businesses</span>
            <div className="fn-kpi-icon-pill" style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
              <Users size={18} />
            </div>
          </div>
          <span className="fn-kpi-number">{stats.totalUsers}</span>
          <span className="fn-kpi-subtext">+{stats.newUsersLast30Days} new in past 30 days</span>
        </div>

        <div className="card fn-admin-kpi-card">
          <div className="fn-kpi-hdr">
            <span className="fn-kpi-label">Active Workspaces</span>
            <div className="fn-kpi-icon-pill" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>
              <UserCheck size={18} />
            </div>
          </div>
          <span className="fn-kpi-number text-sale">{stats.activeUsers}</span>
          <span className="fn-kpi-subtext">{Math.round((stats.activeUsers / (stats.totalUsers || 1)) * 100)}% platform health rate</span>
        </div>

        <div className="card fn-admin-kpi-card">
          <div className="fn-kpi-hdr">
            <span className="fn-kpi-label">Suspended Accounts</span>
            <div className="fn-kpi-icon-pill" style={{ background: 'var(--red-light)', color: 'var(--red)' }}>
              <UserX size={18} />
            </div>
          </div>
          <span className="fn-kpi-number text-expense">{stats.suspendedUsers}</span>
          <span className="fn-kpi-subtext">Protected from business actions</span>
        </div>

        <div className="card fn-admin-kpi-card">
          <div className="fn-kpi-hdr">
            <span className="fn-kpi-label">Platform Transactions</span>
            <div className="fn-kpi-icon-pill" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
              <Activity size={18} />
            </div>
          </div>
          <span className="fn-kpi-number">{stats.totalPlatformTransactions}</span>
          <span className="fn-kpi-subtext">Aggregated across all stores</span>
        </div>
      </div>

      {/* Middle Grid: Growth Chart + Auth Distribution */}
      <div className="fn-admin-grid">
        <div className="card fn-chart-card">
          <div className="fn-chart-header">
            <div>
              <h3 className="fn-sec-title">Registration Trends</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>New business signups by month</p>
            </div>
          </div>

          <div className="fn-admin-chart">
            {stats.registrationTrend && stats.registrationTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.registrationTrend}>
                  <defs>
                    <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#159A68" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#159A68" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" name="Registrations" stroke="#159A68" strokeWidth={2.5} fill="url(#adminGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No trend data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Security & Auth Breakdown */}
        <div className="card fn-admin-side-card">
          <div className="fn-card-hdr">
            <h4 className="fn-card-title">Authentication Channels</h4>
          </div>

          <div className="fn-auth-chan-list">
            <div className="fn-chan-row">
              <span className="fn-chan-name">Email & Salted Password</span>
              <span className="fn-chan-badge">{stats.localUsers} users</span>
            </div>
            <div className="fn-chan-row">
              <span className="fn-chan-name">Google OAuth 2.0 / OpenID</span>
              <span className="fn-chan-badge" style={{ background: '#E8F0FE', color: '#1A73E8' }}>{stats.googleUsers} users</span>
            </div>
            <div className="fn-chan-row">
              <span className="fn-chan-name">Super Admin Accounts</span>
              <span className="fn-chan-badge" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>{stats.adminCount}</span>
            </div>
          </div>

          <div className="fn-privacy-notice">
            <ShieldCheck size={16} />
            <p>
              <strong>Data Privacy Boundary:</strong> Super Admin dashboard respects single-tenant boundaries. User financials are isolated; no private customer or cashbook records are surfaced here.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom: Recent Administrative Activity Preview */}
      <div className="card fn-table-card">
        <div className="fn-table-header">
          <div className="fn-th-left">
            <h3 className="fn-table-title">Recent Administrative Activity</h3>
            <span className="fn-table-badge">Latest Audit Entries</span>
          </div>

          <Link to="/admin/audit-logs" className="fn-link-pill">
            <span>View All Logs</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="fn-table-scroll">
          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            <table className="fn-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Administrator</th>
                  <th>Target User</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivity.map((log) => (
                  <tr key={log._id} className="fn-tr">
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <span className={`fn-type-badge ${log.action.includes('SUSPEND') ? 'fn-badge-expense' : 'fn-badge-sale'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.825rem', fontWeight: 600 }}>{log.actorEmail}</td>
                    <td style={{ fontSize: '0.825rem' }}>{log.targetUserEmail || '—'}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No administrative events recorded yet.
            </div>
          )}
        </div>
      </div>

      <style>{`
        .fn-admin-dashboard {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .fn-admin-dashboard .fn-page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .fn-admin-dashboard .fn-page-header > div {
          min-width: min(100%, 24rem);
        }
        .fn-admin-dashboard .fn-page-desc {
          margin-top: 0.35rem;
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .fn-admin-dashboard .fn-page-header .btn {
          flex-shrink: 0;
        }
        .fn-admin-tag-row {
          margin-bottom: 0.35rem;
        }
        .fn-admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0.6rem;
          background: var(--amber-light);
          color: var(--amber);
          border-radius: var(--r-full);
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .fn-admin-kpis {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 1100px) {
          .fn-admin-kpis { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .fn-admin-kpis { grid-template-columns: 1fr; }
        }
        .fn-admin-kpi-card {
          min-width: 0;
          padding: 1.25rem 1.4rem;
          display: flex;
          flex-direction: column;
        }
        .fn-kpi-hdr {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .fn-kpi-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .fn-kpi-icon-pill {
          width: 36px;
          height: 36px;
          border-radius: var(--r-lg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fn-kpi-number {
          font-size: 1.6rem;
          font-weight: 900;
          color: var(--text-primary);
          line-height: 1.1;
        }
        .fn-kpi-subtext {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 0.4rem;
        }
        .fn-admin-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 1.25rem;
        }
        @media (max-width: 950px) {
          .fn-admin-grid { grid-template-columns: 1fr; }
        }
        .fn-admin-dashboard .fn-chart-card {
          min-width: 0;
          padding: 1.4rem;
          display: flex;
          flex-direction: column;
        }
        .fn-admin-dashboard .fn-chart-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        .fn-admin-dashboard .fn-sec-title {
          font-size: 1.05rem;
          line-height: 1.35;
          font-weight: 800;
          color: var(--text-primary);
        }
        .fn-admin-chart {
          height: 260px;
        }
        .fn-admin-side-card {
          min-width: 0;
          padding: 1.25rem 1.4rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .fn-auth-chan-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .fn-chan-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.75rem;
          background: var(--bg-hover);
          border-radius: var(--r-lg);
          font-size: 0.825rem;
        }
        .fn-chan-name {
          font-weight: 600;
          color: var(--text-primary);
        }
        .fn-chan-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: var(--r-full);
          background: var(--brand-light);
          color: var(--brand);
        }
        .fn-privacy-notice {
          margin-top: auto;
          display: flex;
          gap: 0.65rem;
          padding: 0.85rem;
          background: var(--bg-hover);
          border-radius: var(--r-lg);
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .fn-privacy-notice svg {
          color: var(--brand);
          flex-shrink: 0;
          margin-top: 2px;
        }
        .fn-admin-dashboard .fn-table-card {
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .fn-admin-dashboard .fn-table-header {
          padding: 1.1rem 1.4rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .fn-admin-dashboard .fn-th-left {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .fn-admin-dashboard .fn-table-title {
          font-size: 1rem;
          line-height: 1.4;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.015em;
        }
        .fn-admin-dashboard .fn-table-badge {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--brand);
          background: var(--brand-light);
          padding: 0.15rem 0.55rem;
          border-radius: var(--r-full);
        }
        .fn-admin-dashboard .fn-table-scroll {
          overflow-x: auto;
        }
        .fn-admin-dashboard .fn-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        .fn-admin-dashboard .fn-table thead {
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
        }
        .fn-admin-dashboard .fn-table th {
          padding: 0.75rem 1.4rem;
          text-align: left;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .fn-admin-dashboard .fn-table td {
          padding: 0.85rem 1.4rem;
          vertical-align: middle;
        }
        .fn-admin-dashboard .fn-tr {
          border-bottom: 1px solid var(--border);
        }
        .fn-admin-dashboard .fn-tr:last-child {
          border-bottom: none;
        }
        @media (max-width: 600px) {
          .fn-admin-dashboard .fn-page-header {
            align-items: flex-start;
          }
          .fn-admin-dashboard .fn-page-header > div {
            min-width: 0;
          }
          .fn-admin-dashboard .fn-admin-kpi-card {
            padding: 1rem;
          }
          .fn-admin-dashboard .fn-chart-card,
          .fn-admin-dashboard .fn-admin-side-card {
            padding: 1rem;
          }
          .fn-admin-dashboard .fn-table-header {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardPage;

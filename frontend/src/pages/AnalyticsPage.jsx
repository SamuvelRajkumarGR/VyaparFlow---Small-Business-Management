import React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { useTransaction } from '../context/TransactionContext';
import InsightsPanel from '../components/InsightsPanel';

const fmt = (n, currency = '₹') => `${currency}${Number(n).toLocaleString('en-IN')}`;

const COLORS = {
  sales: '#159A68',
  expenses: '#2563EB',
  profit: '#8B5CF6',
  stock: '#159A68',
  rent: '#2563EB',
  bills: '#F59E0B',
  salaries: '#8B5CF6',
  other: '#F28A82',
};

const ChartTooltip = ({ active, payload, label, currency = '₹' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="fn-chart-tooltip">
      <p className="fn-ct-label">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="fn-ct-row" style={{ color: p.color }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: p.color, marginRight: 6 }} />
          <span>{p.name}:</span>
          <strong>{currency ? `${currency}${Number(p.value).toLocaleString('en-IN')}` : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

const AnalyticsPage = () => {
  const { summary, loading, currency = '₹' } = useTransaction();

  if (loading) {
    return (
      <div className="fn-page-container">
        <div style={{ height: 100, background: 'var(--bg-hover)', borderRadius: 'var(--r-xl)', marginBottom: '1.25rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={{ height: 320, background: 'var(--bg-hover)', borderRadius: 'var(--r-xl)' }} />
          <div style={{ height: 320, background: 'var(--bg-hover)', borderRadius: 'var(--r-xl)' }} />
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const {
    totalSales = 0, totalExpenses = 0, netProfit = 0, profitMargin = 0,
    paymentBreakdown = {}, expenseBreakdown = {},
    trendData = [], insights = [],
  } = summary;

  const payChartData = [
    { name: 'UPI', value: paymentBreakdown.upi || 0, color: '#2563EB' },
    { name: 'Cash', value: paymentBreakdown.cash || 0, color: '#159A68' },
    { name: 'Card', value: paymentBreakdown.card || 0, color: '#8B5CF6' },
  ].filter(d => d.value > 0);

  const expChartData = [
    { name: 'Stock', value: expenseBreakdown.stock || 0, color: '#159A68' },
    { name: 'Rent', value: expenseBreakdown.rent || 0, color: '#2563EB' },
    { name: 'Bills', value: expenseBreakdown.bills || 0, color: '#F59E0B' },
    { name: 'Salaries', value: expenseBreakdown.salaries || 0, color: '#8B5CF6' },
    { name: 'Other', value: expenseBreakdown.other || 0, color: '#F28A82' },
  ].filter(d => d.value > 0);

  return (
    <div className="fn-page-container">
      {/* Header */}
      <div className="fn-page-header">
        <div>
          <h2 className="fn-page-heading">Financial Analytics</h2>
          <p className="fn-page-desc">Comprehensive visual insights into your business revenue, expenditure, and margins.</p>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="fn-analytics-banner">
        <div className="fn-stat-item">
          <span className="fn-stat-label">Total Revenue</span>
          <span className="fn-stat-value text-sale">{fmt(totalSales, currency)}</span>
        </div>
        <div className="fn-stat-divider" />
        <div className="fn-stat-item">
          <span className="fn-stat-label">Total Expenses</span>
          <span className="fn-stat-value text-expense">{fmt(totalExpenses, currency)}</span>
        </div>
        <div className="fn-stat-divider" />
        <div className="fn-stat-item">
          <span className="fn-stat-label">Net Profit</span>
          <span className={`fn-stat-value ${netProfit >= 0 ? 'text-sale' : 'text-expense'}`}>
            {netProfit < 0 ? '-' : ''}{fmt(Math.abs(netProfit), currency)}
          </span>
        </div>
        <div className="fn-stat-divider" />
        <div className="fn-stat-item">
          <span className="fn-stat-label">Profit Margin</span>
          <span className={`fn-stat-value ${profitMargin >= 0 ? 'text-sale' : 'text-expense'}`}>
            {profitMargin.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="fn-charts-grid">
        {/* Full-width Revenue vs Expenses */}
        <div className="card fn-chart-box fn-span-2">
          <div className="fn-card-hdr">
            <h3 className="fn-card-title">Income & Expenditure Trajectory</h3>
            <p className="fn-card-subtitle">Daily cash-flow performance</p>
          </div>
          <div className="fn-chart-area">
            {trendData.length === 0 ? (
              <p className="fn-no-chart">No trend data available for this range.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trendData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="anGradSale" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.sales} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={COLORS.sales} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="anGradExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.expenses} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={COLORS.expenses} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} width={50} />
                  <Tooltip content={<ChartTooltip currency={currency} />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '0.78rem', paddingTop: '0.5rem' }} />
                  <Area type="monotone" dataKey="sales" name="Sales (Revenue)" stroke={COLORS.sales} strokeWidth={2.5} fill="url(#anGradSale)" />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke={COLORS.expenses} strokeWidth={2.5} fill="url(#anGradExp)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Daily Profit Bar Chart */}
        <div className="card fn-chart-box fn-span-2">
          <div className="fn-card-hdr">
            <h3 className="fn-card-title">Daily Net Profit Variance</h3>
            <p className="fn-card-subtitle">Distribution of positive vs negative margins</p>
          </div>
          <div className="fn-chart-area">
            {trendData.length === 0 ? (
              <p className="fn-no-chart">No trend data available for this range.</p>
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={trendData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} width={50} />
                  <Tooltip content={<ChartTooltip currency={currency} />} />
                  <Bar dataKey="profit" name="Net Profit" radius={[4, 4, 0, 0]}>
                    {trendData.map((d, i) => (
                      <Cell key={i} fill={d.profit >= 0 ? '#159A68' : '#D94B4B'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Payment Channels Pie */}
        <div className="card fn-chart-box">
          <div className="fn-card-hdr">
            <h3 className="fn-card-title">Payment Settlement Channels</h3>
            <p className="fn-card-subtitle">Customer transaction modes</p>
          </div>
          <div className="fn-chart-area">
            {payChartData.length === 0 ? (
              <p className="fn-no-chart">No sales records to analyze.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={payChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                    {payChartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={v => fmt(v, currency)} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '0.78rem' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Expenses Category Pie */}
        <div className="card fn-chart-box">
          <div className="fn-card-hdr">
            <h3 className="fn-card-title">Expense Allocation by Category</h3>
            <p className="fn-card-subtitle">Where business funds are distributed</p>
          </div>
          <div className="fn-chart-area">
            {expChartData.length === 0 ? (
              <p className="fn-no-chart">No expense records to analyze.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={expChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                    {expChartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={v => fmt(v, currency)} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '0.78rem' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      <InsightsPanel insights={insights} loading={loading} />

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

        /* ── Finova Dark KPI Strip ── */
        .fn-analytics-banner {
          background: var(--bg-card);
          color: var(--text-primary);
          border-radius: var(--r-xl);
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-around;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          flex-wrap: wrap;
          gap: 1.25rem;
        }
        [data-theme='dark'] .fn-analytics-banner {
          background: var(--bg-dark);
          color: #FFFFFF;
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 25px rgba(23, 28, 26, 0.4);
        }

        .fn-stat-item {
          text-align: center;
        }

        .fn-stat-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 0.35rem;
        }
        [data-theme='dark'] .fn-stat-label {
          color: rgba(255, 255, 255, 0.65);
        }

        .fn-stat-value {
          font-size: 1.65rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .fn-stat-divider {
          width: 1px;
          height: 36px;
          background: var(--border);
        }
        [data-theme='dark'] .fn-stat-divider {
          background: rgba(255, 255, 255, 0.12);
        }
        @media (max-width: 768px) {
          .fn-stat-divider { display: none; }
        }

        .fn-charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .fn-span-2 {
          grid-column: span 2;
        }
        @media (max-width: 900px) {
          .fn-charts-grid { grid-template-columns: 1fr; }
          .fn-span-2 { grid-column: span 1; }
        }

        .fn-chart-box {
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .fn-chart-area {
          padding: 1.25rem 1rem 0.75rem;
        }

        .fn-no-chart {
          text-align: center;
          color: var(--text-muted);
          padding: 3rem 0;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};

export default AnalyticsPage;

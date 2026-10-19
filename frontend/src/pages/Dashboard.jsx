import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Wallet, ShoppingBag, ArrowRight,
  CheckCircle, AlertCircle, Banknote, Smartphone, CreditCard,
  PlusCircle, MinusCircle, PieChart as PieIcon, Sparkles, Send, DownloadCloud
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts';
import { useTransaction } from '../context/TransactionContext';
import MetricCard from '../components/MetricCard';
import RecentActivity from '../components/RecentActivity';
import InsightsPanel from '../components/InsightsPanel';

const fmt = (n, currency = '₹') => `${currency}${Number(n).toLocaleString('en-IN')}`;

const CustomTooltip = ({ active, payload, label, currency = '₹' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="fn-chart-tooltip">
      <p className="fn-ct-label">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="fn-ct-row" style={{ color: p.color }}>
          <span className="fn-ct-dot" style={{ background: p.color }} />
          <span>{p.name}:</span>
          <strong>{currency}{Number(p.value).toLocaleString('en-IN')}</strong>
        </div>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const {
    summary, loading, error, currency = '₹', period,
    openAddSaleModal, openAddExpenseModal, refetch,
  } = useTransaction();

  const today = useMemo(() => new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  }), []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="fn-dash-error card">
        <AlertCircle size={40} className="fn-err-icon" />
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={refetch}>Retry Connection</button>
      </div>
    );
  }

  if (!summary) return null;

  const {
    totalSales = 0,
    totalExpenses = 0,
    netProfit = 0,
    profitMargin = 0,
    isProfit = true,
    totalTransactionsCount = 0,
    paymentBreakdown = {},
    expenseBreakdown = {},
    trendData = [],
    recentTransactions = [],
    comparison = {},
    insights = [],
  } = summary;

  // Chart data for spending breakdown donut
  const donutData = [
    { name: 'Stock', value: expenseBreakdown.stock || 0, color: '#159A68' },
    { name: 'Rent', value: expenseBreakdown.rent || 0, color: '#2563EB' },
    { name: 'Bills', value: expenseBreakdown.bills || 0, color: '#F59E0B' },
    { name: 'Salaries', value: expenseBreakdown.salaries || 0, color: '#8B5CF6' },
    { name: 'Other', value: expenseBreakdown.other || 0, color: '#F28A82' },
  ].filter(d => d.value > 0);

  // Fallback for visual balance if no expenses yet
  const hasExpenses = donutData.length > 0;

  return (
    <div className="finova-dashboard">
      
      {/* ── Top Row: Finova KPI Grid ── */}
      <div className="fn-kpi-row">
        {/* Dark Charcoal Card (Finova Feature Card) */}
        <MetricCard
          label="Total Net Profit / Balance"
          value={fmt(netProfit, currency)}
          change={comparison.marginChange}
          icon={Wallet}
          iconColor="brand"
          isDark={true}
        />

        {/* Total Sales Card */}
        <MetricCard
          label="Total Revenue / Sales"
          value={fmt(totalSales, currency)}
          change={comparison.salesChange}
          icon={TrendingUp}
          iconColor="green"
        />

        {/* Total Expenses Card */}
        <MetricCard
          label="Total Expenses"
          value={fmt(totalExpenses, currency)}
          change={comparison.expenseChange}
          icon={TrendingDown}
          iconColor="red"
        />

        {/* Transactions Card */}
        <MetricCard
          label="Total Transactions"
          value={totalTransactionsCount}
          subLabel={`Profit Margin: ${profitMargin.toFixed(1)}%`}
          icon={ShoppingBag}
          iconColor="brand"
        />
      </div>

      {/* ── Middle Row: Main Trend Chart + Quick Actions & Spending Breakdown ── */}
      <div className="fn-main-grid">
        
        {/* Left / Center: Revenue vs Expenses Finova Overview Chart */}
        <div className="card fn-chart-card">
          <div className="fn-chart-header">
            <div className="fn-chart-title-group">
              <h3 className="fn-sec-title">Financial Overview</h3>
              <div className="fn-chart-kpi-pills">
                <div className="fn-overview-pill">
                  <span className="fn-dot fn-dot-green" />
                  <span className="fn-pill-label">Income:</span>
                  <span className="fn-pill-val">{fmt(totalSales, currency)}</span>
                </div>
                <div className="fn-overview-pill">
                  <span className="fn-dot fn-dot-blue" />
                  <span className="fn-pill-label">Expenses:</span>
                  <span className="fn-pill-val">{fmt(totalExpenses, currency)}</span>
                </div>
              </div>
            </div>

            <Link to="/analytics" className="fn-link-pill">
              <span>View Analytics</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="fn-chart-container">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={290}>
                <AreaChart data={trendData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="finovaSaleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#159A68" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#159A68" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="finovaExpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} width={50} />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '0.78rem', paddingTop: '0.75rem' }} />
                  <Area type="monotone" dataKey="sales" name="Sales (Income)" stroke="#159A68" strokeWidth={2.5} fill="url(#finovaSaleGrad)" />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#2563EB" strokeWidth={2.5} fill="url(#finovaExpGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="fn-no-chart-data">
                <p>No activity records for this period.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Finova Quick Actions & Spending Breakdown */}
        <div className="fn-side-column">
          
          {/* Quick Actions Panel (Finova Dark Card) */}
          <div className="fn-quick-panel">
            <div className="fn-quick-hdr">
              <h4 className="fn-quick-title">Quick Actions</h4>
            </div>
            <div className="fn-quick-grid">
              <button className="fn-quick-btn" onClick={openAddSaleModal}>
                <div className="fn-qb-icon fn-qb-green">
                  <PlusCircle size={18} />
                </div>
                <span>New Sale</span>
              </button>

              <button className="fn-quick-btn" onClick={openAddExpenseModal}>
                <div className="fn-qb-icon fn-qb-coral">
                  <MinusCircle size={18} />
                </div>
                <span>Add Expense</span>
              </button>

              <Link to="/transactions" className="fn-quick-btn">
                <div className="fn-qb-icon fn-qb-blue">
                  <ShoppingBag size={18} />
                </div>
                <span>Transactions</span>
              </Link>

              <Link to="/analytics" className="fn-quick-btn">
                <div className="fn-qb-icon fn-qb-purple">
                  <PieIcon size={18} />
                </div>
                <span>Reports</span>
              </Link>
            </div>
          </div>

          {/* Spending Breakdown Donut */}
          <div className="card fn-spending-card">
            <div className="fn-card-hdr">
              <h4 className="fn-card-title">Spending Breakdown</h4>
            </div>

            <div className="fn-donut-body">
              {hasExpenses ? (
                <>
                  <div className="fn-donut-wrapper">
                    <ResponsiveContainer width={120} height={120}>
                      <PieChart>
                        <Pie
                          data={donutData}
                          innerRadius={38}
                          outerRadius={55}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="fn-donut-center">
                      <span className="fn-donut-sum-val">{fmt(totalExpenses, currency)}</span>
                      <span className="fn-donut-sum-lbl">Total</span>
                    </div>
                  </div>

                  <div className="fn-donut-legends">
                    {donutData.map((item) => (
                      <div key={item.name} className="fn-legend-item">
                        <span className="fn-legend-dot" style={{ background: item.color }} />
                        <span className="fn-legend-name">{item.name}</span>
                        <span className="fn-legend-pct">
                          {totalExpenses > 0 ? Math.round((item.value / totalExpenses) * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="fn-empty-spending">
                  <p>No expenses recorded in this period.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ── Bottom Row: Payment Methods + Recent Activity + Insights ── */}
      <div className="fn-bottom-grid">
        
        {/* Payment Methods Card */}
        <div className="card fn-pay-card">
          <div className="fn-card-hdr">
            <h3 className="fn-card-title">Payment Collections</h3>
          </div>
          <div className="fn-pay-list">
            <div className="fn-pay-row">
              <div className="fn-pay-icon fn-icon-upi"><Smartphone size={16} /></div>
              <div className="fn-pay-meta">
                <span className="fn-pay-name">UPI / Online</span>
                <div className="fn-pay-bar-wrap">
                  <div
                    className="fn-pay-fill fn-fill-blue"
                    style={{ width: `${totalSales > 0 ? Math.round(((paymentBreakdown.upi || 0) / totalSales) * 100) : 0}%` }}
                  />
                </div>
              </div>
              <span className="fn-pay-amount">{fmt(paymentBreakdown.upi || 0, currency)}</span>
            </div>

            <div className="fn-pay-row">
              <div className="fn-pay-icon fn-icon-cash"><Banknote size={16} /></div>
              <div className="fn-pay-meta">
                <span className="fn-pay-name">Cash</span>
                <div className="fn-pay-bar-wrap">
                  <div
                    className="fn-pay-fill fn-fill-green"
                    style={{ width: `${totalSales > 0 ? Math.round(((paymentBreakdown.cash || 0) / totalSales) * 100) : 0}%` }}
                  />
                </div>
              </div>
              <span className="fn-pay-amount">{fmt(paymentBreakdown.cash || 0, currency)}</span>
            </div>

            <div className="fn-pay-row">
              <div className="fn-pay-icon fn-icon-card"><CreditCard size={16} /></div>
              <div className="fn-pay-meta">
                <span className="fn-pay-name">Credit / Debit Card</span>
                <div className="fn-pay-bar-wrap">
                  <div
                    className="fn-pay-fill fn-fill-purple"
                    style={{ width: `${totalSales > 0 ? Math.round(((paymentBreakdown.card || 0) / totalSales) * 100) : 0}%` }}
                  />
                </div>
              </div>
              <span className="fn-pay-amount">{fmt(paymentBreakdown.card || 0, currency)}</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions List */}
        <RecentActivity transactions={recentTransactions} currency={currency} />

        {/* Business Insights Panel */}
        <InsightsPanel insights={insights} loading={loading} />

      </div>

      <style>{`
        .finova-dashboard {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* ── Top KPI Row ── */
        .fn-kpi-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 1200px) {
          .fn-kpi-row { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .fn-kpi-row { grid-template-columns: 1fr; }
        }

        /* ── Main Middle Grid ── */
        .fn-main-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 1.25rem;
        }
        @media (max-width: 1024px) {
          .fn-main-grid { grid-template-columns: 1fr; }
        }

        .fn-chart-card {
          padding: 1.4rem;
          display: flex;
          flex-direction: column;
        }

        .fn-chart-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .fn-sec-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .fn-chart-kpi-pills {
          display: flex;
          gap: 1rem;
          margin-top: 0.4rem;
        }

        .fn-overview-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
        }

        .fn-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .fn-dot-green { background: #159A68; }
        .fn-dot-blue { background: #2563EB; }

        .fn-pill-label {
          color: var(--text-muted);
          font-weight: 500;
        }
        .fn-pill-val {
          font-weight: 700;
          color: var(--text-primary);
        }

        .fn-link-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.775rem;
          font-weight: 600;
          color: var(--brand);
          text-decoration: none;
          padding: 0.35rem 0.75rem;
          background: var(--brand-light);
          border-radius: var(--r-full);
          transition: opacity var(--transition);
        }
        .fn-link-pill:hover { opacity: 0.85; }

        .fn-chart-container {
          flex: 1;
          min-height: 290px;
        }

        .fn-no-chart-data {
          height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        /* ── Tooltip ── */
        .fn-chart-tooltip {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          padding: 0.65rem 0.85rem;
          box-shadow: var(--shadow-md);
          font-size: 0.78rem;
        }
        .fn-ct-label {
          font-weight: 700;
          margin-bottom: 0.35rem;
          color: var(--text-primary);
        }
        .fn-ct-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.2rem;
        }
        .fn-ct-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        /* ── Side Column ── */
        .fn-side-column {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* ── Finova Dark Quick Actions Panel ── */
        .fn-quick-panel {
          background: var(--bg-card);
          border-radius: var(--r-xl);
          padding: 1.25rem;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }
        [data-theme='dark'] .fn-quick-panel {
          background: var(--bg-dark);
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 25px rgba(23, 28, 26, 0.4);
        }
        .fn-quick-hdr {
          margin-bottom: 0.9rem;
        }
        .fn-quick-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        [data-theme='dark'] .fn-quick-title {
          color: #FFFFFF;
        }
        .fn-quick-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }
        .fn-quick-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          text-decoration: none;
          font-family: inherit;
          font-size: 0.68rem;
          font-weight: 600;
          transition: transform var(--transition);
        }
        .fn-quick-btn:hover {
          transform: translateY(-2px);
          color: var(--text-primary);
        }
        [data-theme='dark'] .fn-quick-btn {
          color: rgba(255, 255, 255, 0.8);
        }
        [data-theme='dark'] .fn-quick-btn:hover {
          color: #FFFFFF;
        }
        .fn-qb-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--r-lg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fn-qb-green { background: #159A68; color: #FFFFFF; }
        .fn-qb-coral { background: #D94B4B; color: #FFFFFF; }
        .fn-qb-blue { background: #2563EB; color: #FFFFFF; }
        .fn-qb-purple { background: #8B5CF6; color: #FFFFFF; }

        /* ── Spending Breakdown Card ── */
        .fn-spending-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
        }
        .fn-donut-body {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.75rem;
          gap: 1rem;
        }
        .fn-donut-wrapper {
          position: relative;
          width: 120px;
          height: 120px;
          flex-shrink: 0;
        }
        .fn-donut-center {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .fn-donut-sum-val {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .fn-donut-sum-lbl {
          font-size: 0.62rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .fn-donut-legends {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .fn-legend-item {
          display: flex;
          align-items: center;
          font-size: 0.75rem;
          gap: 0.45rem;
        }
        .fn-legend-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .fn-legend-name {
          flex: 1;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .fn-legend-pct {
          font-weight: 700;
          color: var(--text-primary);
        }
        .fn-empty-spending {
          padding: 1.5rem 0;
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-muted);
          width: 100%;
        }

        /* ── Bottom 3-Column Grid ── */
        .fn-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1.25rem;
        }
        @media (max-width: 1100px) {
          .fn-bottom-grid { grid-template-columns: 1fr; }
        }

        /* ── Payment Collections Card ── */
        .fn-pay-card {
          padding: 1.25rem 1.4rem;
          display: flex;
          flex-direction: column;
        }
        .fn-pay-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }
        .fn-pay-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .fn-pay-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--r-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .fn-icon-upi { background: var(--blue-light); color: var(--blue); }
        .fn-icon-cash { background: var(--green-light); color: var(--green); }
        .fn-icon-card { background: #F3E8FF; color: #8B5CF6; }

        .fn-pay-meta {
          flex: 1;
          min-width: 0;
        }
        .fn-pay-name {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--text-primary);
          display: block;
          margin-bottom: 0.35rem;
        }
        .fn-pay-bar-wrap {
          height: 6px;
          background: var(--bg-hover);
          border-radius: var(--r-full);
          overflow: hidden;
        }
        .fn-pay-fill {
          height: 100%;
          border-radius: var(--r-full);
          transition: width 0.5s ease;
        }
        .fn-fill-blue { background: var(--blue); }
        .fn-fill-green { background: var(--brand); }
        .fn-fill-purple { background: #8B5CF6; }

        .fn-pay-amount {
          font-size: 0.875rem;
          font-weight: 800;
          color: var(--text-primary);
          flex-shrink: 0;
        }

        /* ── Error Skeleton ── */
        .fn-dash-error {
          padding: 3rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .fn-err-icon { color: var(--red); }
      `}</style>
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="finova-dashboard">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ height: 140, background: 'var(--bg-hover)', borderRadius: 'var(--r-xl)' }} />
      ))}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>
      <div style={{ height: 350, background: 'var(--bg-hover)', borderRadius: 'var(--r-xl)' }} />
      <div style={{ height: 350, background: 'var(--bg-hover)', borderRadius: 'var(--r-xl)' }} />
    </div>
  </div>
);

export default Dashboard;

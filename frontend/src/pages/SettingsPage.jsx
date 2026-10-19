import React, { useState, useEffect } from 'react';
import { User, DollarSign, Palette, Database, CheckCircle, ShieldCheck } from 'lucide-react';
import { useTransaction } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';

const SettingsPage = () => {
  const { businessName, currency, updateSettings, handleSeedData } = useTransaction();
  const { theme, setTheme } = useTheme();

  const [nameVal, setNameVal] = useState(businessName);
  const [currVal, setCurrVal] = useState(currency);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNameVal(businessName);
    setCurrVal(currency);
  }, [businessName, currency]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!nameVal.trim()) return;
    updateSettings(nameVal.trim(), currVal);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="fn-page-container">
      {/* Header */}
      <div className="fn-page-header">
        <div>
          <h2 className="fn-page-heading">Settings & Preferences</h2>
          <p className="fn-page-desc">Configure business profile, UI theme, and sample database records.</p>
        </div>
      </div>

      <div className="fn-settings-grid">
        {/* Business Profile */}
        <div className="card fn-settings-card">
          <div className="fn-card-hdr">
            <div className="fn-hdr-icon-wrap">
              <User size={18} />
            </div>
            <div>
              <h3 className="fn-card-title">Business Profile</h3>
              <p className="fn-card-subtitle">Brand name and default currency symbol</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="fn-settings-form">
            <div className="form-group">
              <label className="form-label" htmlFor="biz-name">Business / Store Name</label>
              <input
                id="biz-name"
                type="text"
                className="form-control"
                value={nameVal}
                onChange={e => setNameVal(e.target.value)}
                placeholder="e.g. Apex Retailers"
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="currency">Currency Symbol</label>
              <select id="currency" className="form-control" value={currVal} onChange={e => setCurrVal(e.target.value)}>
                <option value="₹">₹ Indian Rupee (INR)</option>
                <option value="$">$ US Dollar (USD)</option>
                <option value="€">€ Euro (EUR)</option>
                <option value="£">£ British Pound (GBP)</option>
                <option value="¥">¥ Japanese Yen (JPY)</option>
              </select>
            </div>

            <button type="submit" className={`btn ${saved ? 'btn-saved' : 'btn-sale'}`}>
              {saved ? <><CheckCircle size={15} /> Saved successfully</> : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* UI Appearance */}
        <div className="card fn-settings-card">
          <div className="fn-card-hdr">
            <div className="fn-hdr-icon-wrap">
              <Palette size={18} />
            </div>
            <div>
              <h3 className="fn-card-title">Theme & Appearance</h3>
              <p className="fn-card-subtitle">Choose interface color scheme</p>
            </div>
          </div>

          <div className="fn-theme-options">
            {['light', 'dark'].map(t => (
              <button
                key={t}
                className={`fn-theme-card ${theme === t ? 'fn-theme-active' : ''}`}
                onClick={() => setTheme(t)}
              >
                <div className={`fn-tp-preview fn-tp-${t}`}>
                  <div className="fn-tp-side" />
                  <div className="fn-tp-main">
                    <div className="fn-tp-line" style={{ width: '80%' }} />
                    <div className="fn-tp-line" style={{ width: '50%' }} />
                  </div>
                </div>
                <div className="fn-theme-name">
                  <span>{t === 'light' ? 'Finova Mint (Light)' : 'Charcoal Dark'}</span>
                  {theme === t && <CheckCircle size={15} className="fn-theme-check" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Demo Data Management */}
        <div className="card fn-settings-card">
          <div className="fn-card-hdr">
            <div className="fn-hdr-icon-wrap fn-icon-amber">
              <Database size={18} />
            </div>
            <div>
              <h3 className="fn-card-title">Demo Data Generator</h3>
              <p className="fn-card-subtitle">Populate application with realistic records</p>
            </div>
          </div>

          <div className="fn-demo-body">
            <p className="fn-demo-text">
              Seed your database with 30 days of realistic small-business sales, stock purchases, rent, salaries, and utility bills.
            </p>
            <div className="fn-demo-notice">
              <span>⚠️ Notice: This replaces your current transactions with fresh demo data.</span>
            </div>
            <button className="btn btn-secondary fn-demo-btn" onClick={handleSeedData}>
              <Database size={15} />
              <span>Load 30-Day Demo Data</span>
            </button>
          </div>
        </div>

        {/* System & Architecture Info */}
        <div className="card fn-settings-card">
          <div className="fn-card-hdr">
            <div className="fn-hdr-icon-wrap">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="fn-card-title">System & Stack Information</h3>
              <p className="fn-card-subtitle">VyaparFlow platform details</p>
            </div>
          </div>

          <div className="fn-info-body">
            <div className="fn-info-row"><span>Design Theme</span><span className="fn-pill-info">Finova UI No. 4</span></div>
            <div className="fn-info-row"><span>Frontend Stack</span><span>React 18, Vite, Recharts, Lucide</span></div>
            <div className="fn-info-row"><span>Backend Stack</span><span>Node.js, Express, MongoDB Atlas</span></div>
            <div className="fn-info-row"><span>Calculations</span><span>Real-time Financial Aggregate Engine</span></div>
          </div>
        </div>
      </div>

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

        .fn-settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        @media (max-width: 900px) {
          .fn-settings-grid { grid-template-columns: 1fr; }
        }

        .fn-settings-card {
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .fn-card-hdr {
          padding: 1.25rem 1.4rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .fn-hdr-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: var(--r-lg);
          background: var(--brand-light);
          color: var(--brand);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .fn-icon-amber {
          background: var(--amber-light);
          color: var(--amber);
        }

        .fn-settings-form {
          padding: 1.4rem;
          display: flex;
          flex-direction: column;
        }

        /* ── Theme Selectors ── */
        .fn-theme-options {
          padding: 1.4rem;
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .fn-theme-card {
          flex: 1;
          min-width: 140px;
          padding: 0.85rem;
          border: 1.5px solid var(--border);
          border-radius: var(--r-xl);
          background: var(--bg-input);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          transition: all var(--transition);
          font-family: inherit;
        }
        .fn-theme-card:hover {
          border-color: var(--brand);
        }
        .fn-theme-active {
          border-color: var(--brand);
          background: var(--brand-light);
        }

        .fn-tp-preview {
          width: 100%;
          height: 60px;
          border-radius: var(--r-md);
          display: flex;
          border: 1px solid var(--border);
          overflow: hidden;
        }
        .fn-tp-light { background: #F5F8F5; }
        .fn-tp-dark { background: #171C1A; }

        .fn-tp-side {
          width: 25%;
          border-right: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.4);
        }
        .fn-tp-dark .fn-tp-side {
          background: #1E2523;
          border-right-color: rgba(255,255,255,0.08);
        }

        .fn-tp-main {
          flex: 1;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .fn-tp-line {
          height: 6px;
          border-radius: 3px;
          background: var(--border);
        }

        .fn-theme-name {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .fn-theme-check {
          color: var(--brand);
        }

        /* ── Demo ── */
        .fn-demo-body {
          padding: 1.4rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .fn-demo-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.55;
        }
        .fn-demo-notice {
          background: var(--amber-light);
          padding: 0.65rem 0.85rem;
          border-radius: var(--r-lg);
          font-size: 0.775rem;
          font-weight: 600;
          color: var(--amber);
        }
        .fn-demo-btn {
          align-self: flex-start;
          margin-top: 0.4rem;
        }

        /* ── Info ── */
        .fn-info-body {
          padding: 1.4rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .fn-info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.65rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.825rem;
        }
        .fn-info-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .fn-info-row span:first-child {
          color: var(--text-muted);
          font-weight: 500;
        }
        .fn-info-row span:last-child {
          color: var(--text-primary);
          font-weight: 600;
        }
        .fn-pill-info {
          background: var(--brand-light);
          color: var(--brand) !important;
          padding: 0.15rem 0.55rem;
          border-radius: var(--r-full);
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;

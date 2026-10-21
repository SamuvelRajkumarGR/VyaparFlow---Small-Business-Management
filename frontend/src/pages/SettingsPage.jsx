import React, { useState, useEffect } from 'react';
import { User, Palette, Database, CheckCircle, Lock } from 'lucide-react';
import { useTransaction } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const { businessName, currency, updateSettings, handleSeedData } = useTransaction();
  const { theme, setTheme } = useTheme();
  const { user, changePassword } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Profile Form
  const [bizVal, setBizVal] = useState(businessName || user?.businessName || '');
  const [currVal, setCurrVal] = useState(currency);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  useEffect(() => {
    if (user) {
      setBizVal(user.businessName || businessName);
      setCurrVal(user.currency || currency);
    }
  }, [user, businessName, currency]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    if (!bizVal.trim()) {
      setProfileError('Business name cannot be empty');
      return;
    }

    try {
      await updateSettings(bizVal.trim(), currVal);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      setProfileError('Failed to update business profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdSuccess('');
    setPwdError('');

    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('Passwords do not match');
      return;
    }

    setPwdLoading(true);
    const res = await changePassword(currentPassword, newPassword);
    setPwdLoading(false);

    if (res.success) {
      setPwdSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdSuccess(''), 3500);
    } else {
      setPwdError(res.message);
    }
  };

  return (
    <div className="fn-page-container fn-settings-page">
      {/* Header */}
      <div className="fn-page-header">
        <div>
          <h2 className="fn-page-heading">Settings & Preferences</h2>
          <p className="fn-page-desc">Configure business profile, security credentials, and interface themes.</p>
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
              <p className="fn-card-subtitle">
                {isAdmin ? 'Platform profile details' : 'Brand name, currency, and merchant contact'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="fn-settings-form">
            {profileError && (
              <div style={{ color: 'var(--red)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{profileError}</div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="biz-name">Business / Store Name</label>
              <input
                id="biz-name"
                type="text"
                className="form-control"
                value={bizVal}
                onChange={(e) => setBizVal(e.target.value)}
                placeholder="e.g. Apex Retailers"
                maxLength={60}
                required
              />
            </div>

            {!isAdmin && (
              <div className="form-group">
                <label className="form-label" htmlFor="currency">Default Currency Symbol</label>
                <select id="currency" className="form-control" value={currVal} onChange={(e) => setCurrVal(e.target.value)}>
                  <option value="₹">₹ Indian Rupee (INR)</option>
                  <option value="$">$ US Dollar (USD)</option>
                  <option value="€">€ Euro (EUR)</option>
                  <option value="£">£ British Pound (GBP)</option>
                  <option value="¥">¥ Japanese Yen (JPY)</option>
                  <option value="AED ">AED UAE Dirham (AED)</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="user-email">Registered Email</label>
              <input
                id="user-email"
                type="email"
                className="form-control"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                Email is unique and verified for secure account ownership.
              </small>
            </div>

            <button type="submit" className={`btn ${profileSaved ? 'btn-saved' : 'btn-sale'}`}>
              {profileSaved ? <><CheckCircle size={15} /> Saved successfully</> : 'Update Business Profile'}
            </button>
          </form>
        </div>

        {/* Change Password / Security */}
        <div className="card fn-settings-card">
          <div className="fn-card-hdr">
            <div className="fn-hdr-icon-wrap" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
              <Lock size={18} />
            </div>
            <div>
              <h3 className="fn-card-title">Security & Password</h3>
              <p className="fn-card-subtitle">Change account login credentials</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="fn-settings-form">
            {pwdSuccess && (
              <div style={{ color: 'var(--brand)', fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: 600 }}>
                ✓ {pwdSuccess}
              </div>
            )}
            {pwdError && (
              <div style={{ color: 'var(--red)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{pwdError}</div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="curr-pwd">Current Password</label>
              <input
                id="curr-pwd"
                type="password"
                className="form-control"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-pwd">New Password</label>
              <input
                id="new-pwd"
                type="password"
                className="form-control"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="conf-pwd">Confirm New Password</label>
              <input
                id="conf-pwd"
                type="password"
                className="form-control"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-secondary" disabled={pwdLoading}>
              {pwdLoading ? 'Updating Password...' : 'Change Password'}
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
            {['light', 'dark'].map((t) => (
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

        {!isAdmin && (
          <>
            {/* Demo Data Management */}
            <div className="card fn-settings-card">
              <div className="fn-card-hdr">
                <div className="fn-hdr-icon-wrap fn-icon-amber">
                  <Database size={18} />
                </div>
                <div>
                  <h3 className="fn-card-title">Personal Demo Data</h3>
                  <p className="fn-card-subtitle">Populate your workspace with sample records</p>
                </div>
              </div>

              <div className="fn-demo-body">
                <p className="fn-demo-text">
                  Seed your private workspace with 30 days of realistic sales, stock purchases, rent, staff salaries, and utility bills.
                </p>
                <div className="fn-demo-notice">
                  <span>⚠️ Notice: This only affects YOUR business data. Other users' workspaces remain isolated and untouched.</span>
                </div>
                <button className="btn btn-secondary fn-demo-btn" onClick={handleSeedData}>
                  <Database size={15} />
                  <span>Load 30-Day Demo Data</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .fn-settings-page .fn-page-header {
          margin-bottom: 1.5rem;
        }
        .fn-settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
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
      `}</style>
    </div>
  );
};

export default SettingsPage;

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both your registered email and password.');
      return;
    }

    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from === '/admin' ? '/' : from);
      }
    } else {
      if (res.accountStatus === 'suspended') {
        navigate('/suspended');
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div className="fn-auth-wrapper">
      <div className="fn-auth-card card">
        {/* Brand Header */}
        <div className="fn-auth-brand">
          <div className="fn-auth-logo">
            <span>₹</span>
          </div>
          <h2 className="fn-auth-title">Welcome Back to VyaparFlow</h2>
          <p className="fn-auth-subtitle">Log in to manage your private business workspace</p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="fn-auth-alert fn-alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Continue with Google */}
        <div className="fn-google-section">
          <GoogleSignInButton text="Continue with Google" />
        </div>

        <div className="fn-auth-separator">
          <span>or sign in with email</span>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="fn-auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Registered Email</label>
            <div className="fn-input-icon-wrap">
              <Mail size={16} className="fn-field-icon" />
              <input
                id="login-email"
                type="email"
                className="form-control fn-has-icon"
                placeholder="name@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="fn-label-split">
              <label className="form-label" htmlFor="login-password">Password</label>
              <Link to="/forgot-password" className="fn-forgot-link">Forgot password?</Link>
            </div>
            <div className="fn-input-icon-wrap">
              <Lock size={16} className="fn-field-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-control fn-has-icon fn-has-toggle"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="fn-pwd-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary fn-auth-submit" disabled={loading}>
            {loading ? (
              <span className="fn-btn-spinner">Logging in...</span>
            ) : (
              <>
                <span>Access Business Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="fn-auth-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="fn-auth-link">Register New Business</Link>
          </p>
        </div>

        <div className="fn-security-badge">
          <ShieldCheck size={14} />
          <span>Strict Single-Tenant Data Isolation & End-to-End Encryption</span>
        </div>
      </div>

      <style>{`
        .fn-auth-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          background: var(--bg-app);
        }
        .fn-auth-card {
          width: 100%;
          max-width: 440px;
          padding: 2.25rem;
          border-radius: var(--r-2xl);
          background: var(--bg-surface);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
        }
        .fn-auth-brand {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .fn-auth-logo {
          width: 48px;
          height: 48px;
          border-radius: var(--r-xl);
          background: var(--brand);
          color: #fff;
          font-size: 1.4rem;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.75rem;
          box-shadow: 0 4px 14px rgba(21, 154, 104, 0.35);
        }
        .fn-auth-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .fn-auth-subtitle {
          font-size: 0.825rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }
        .fn-auth-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: var(--r-lg);
          font-size: 0.825rem;
          font-weight: 500;
          margin-bottom: 1.25rem;
        }
        .fn-alert-error {
          background: var(--red-light);
          color: var(--red-text);
          border: 1px solid var(--red-border);
        }
        .fn-google-section {
          margin-bottom: 1.25rem;
        }
        .fn-auth-separator {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1.25rem 0;
          color: var(--text-muted);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .fn-auth-separator::before,
        .fn-auth-separator::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border);
        }
        .fn-auth-separator span {
          padding: 0 0.75rem;
        }
        .fn-auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .fn-input-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .fn-field-icon {
          position: absolute;
          left: 0.9rem;
          color: var(--text-muted);
          pointer-events: none;
        }
        .fn-has-icon {
          padding-left: 2.5rem !important;
        }
        .fn-has-toggle {
          padding-right: 2.5rem !important;
        }
        .fn-pwd-toggle {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0.25rem;
          transition: color var(--transition);
        }
        .fn-pwd-toggle:hover {
          color: var(--text-primary);
        }
        .fn-label-split {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .fn-forgot-link {
          font-size: 0.775rem;
          color: var(--brand);
          text-decoration: none;
          font-weight: 500;
        }
        .fn-forgot-link:hover {
          text-decoration: underline;
        }
        .fn-auth-submit {
          width: 100%;
          padding: 0.75rem;
          font-size: 0.9rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .fn-auth-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.825rem;
          color: var(--text-secondary);
        }
        .fn-auth-link {
          color: var(--brand);
          font-weight: 700;
          text-decoration: none;
        }
        .fn-auth-link:hover {
          text-decoration: underline;
        }
        .fn-security-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;

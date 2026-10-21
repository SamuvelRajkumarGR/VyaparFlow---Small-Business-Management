import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) setToken(t);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('Password reset token is required');
      return;
    }
    if (password.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const res = await resetPassword(token.trim(), password);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fn-auth-wrapper fn-reset-wrapper">
      <div className="fn-auth-card fn-reset-card card">
        <div className="fn-auth-brand">
          <div className="fn-auth-logo">
            <span>₹</span>
          </div>
          <h2 className="fn-auth-title">Set New Password</h2>
          <p className="fn-auth-subtitle">Create a secure new password for your VyaparFlow account</p>
        </div>

        {error && (
          <div className="fn-auth-alert fn-alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="fn-reset-success-box">
            <CheckCircle size={40} className="fn-success-icon" />
            <h3>Password Reset Complete!</h3>
            <p>Your password has been securely updated. Redirecting to login...</p>
            <Link to="/login" className="btn btn-primary fn-reset-success-button">
              Log In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="fn-auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="reset-tok">Reset Token</label>
              <input
                id="reset-tok"
                type="text"
                className="form-control"
                placeholder="Paste your 64-character reset token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                autoComplete="one-time-code"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reset-pwd">New Password</label>
              <div className="fn-input-icon-wrap">
                <Lock size={16} className="fn-field-icon" />
                <input
                  id="reset-pwd"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control fn-has-icon fn-has-toggle"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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
              <style>{`
                .fn-reset-wrapper {
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding: 2rem 1rem;
                  background:
                    radial-gradient(ellipse at 12% 8%, rgba(21, 154, 104, 0.1), transparent 36%),
                    var(--bg-app);
                }
                .fn-reset-card {
                  width: 100%;
                  max-width: 480px;
                  padding: 2.25rem;
                  border-radius: var(--r-2xl);
                  background: var(--bg-surface);
                  border: 1px solid var(--border);
                  box-shadow: var(--shadow-lg);
                }
                .fn-reset-card .fn-auth-brand {
                  text-align: center;
                  margin-bottom: 1.75rem;
                }
                .fn-reset-card .fn-auth-logo {
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
                .fn-reset-card .fn-auth-title {
                  font-size: 1.35rem;
                  font-weight: 800;
                  color: var(--text-primary);
                  letter-spacing: -0.02em;
                }
                .fn-reset-card .fn-auth-subtitle {
                  font-size: 0.85rem;
                  color: var(--text-muted);
                  margin-top: 0.35rem;
                  line-height: 1.5;
                }
                .fn-reset-card .fn-auth-alert {
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;
                  padding: 0.75rem 1rem;
                  border-radius: var(--r-lg);
                  font-size: 0.825rem;
                  font-weight: 500;
                  margin-bottom: 1rem;
                }
                .fn-reset-card .fn-alert-error {
                  background: var(--red-light);
                  color: var(--red-text);
                  border: 1px solid var(--red-border);
                }
                .fn-reset-card .fn-auth-form {
                  display: flex;
                  flex-direction: column;
                  gap: 0.9rem;
                }
                .fn-reset-card .form-group {
                  min-width: 0;
                  margin-bottom: 0;
                }
                .fn-reset-card .form-label {
                  display: block;
                  margin-bottom: 0.5rem;
                  font-size: 0.8rem;
                  font-weight: 600;
                  color: var(--text-primary);
                }
                .fn-reset-card .fn-input-icon-wrap {
                  position: relative;
                  display: flex;
                  align-items: center;
                }
                .fn-reset-card .fn-input-icon-wrap .form-control {
                  width: 100%;
                  min-width: 0;
                }
                .fn-reset-card .fn-field-icon {
                  position: absolute;
                  left: 0.9rem;
                  color: var(--text-muted);
                  pointer-events: none;
                }
                .fn-reset-card .fn-has-icon {
                  padding-left: 2.5rem !important;
                }
                .fn-reset-card .fn-has-toggle {
                  padding-right: 2.5rem !important;
                }
                .fn-reset-card .fn-pwd-toggle {
                  position: absolute;
                  right: 0.75rem;
                  background: none;
                  border: none;
                  color: var(--text-muted);
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  padding: 0.25rem;
                }
                .fn-reset-card .fn-auth-submit {
                  width: 100%;
                  padding: 0.8rem;
                  font-size: 0.9rem;
                  font-weight: 700;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-top: 0.25rem;
                }
                .fn-reset-card .fn-auth-submit:disabled {
                  cursor: wait;
                  opacity: 0.75;
                }
                .fn-reset-card .fn-auth-footer {
                  margin-top: 0.25rem;
                  text-align: center;
                }
                .fn-reset-card .fn-auth-link {
                  color: var(--brand);
                  font-size: 0.825rem;
                  font-weight: 700;
                  text-decoration: none;
                }
                .fn-reset-card .fn-auth-link:hover {
                  text-decoration: underline;
                }
                .fn-reset-success-box {
                  text-align: center;
                  padding: 0.5rem 0;
                }
                .fn-success-icon {
                  color: var(--brand);
                  margin-bottom: 0.75rem;
                }
                .fn-reset-success-box h3 {
                  font-size: 1.15rem;
                  font-weight: 800;
                  color: var(--text-primary);
                  margin-bottom: 0.5rem;
                }
                .fn-reset-success-box p {
                  font-size: 0.85rem;
                  color: var(--text-secondary);
                  line-height: 1.5;
                }
                .fn-reset-success-button {
                  margin-top: 1.25rem;
                  text-decoration: none;
                }
                @media (max-width: 600px) {
                  .fn-reset-wrapper {
                    align-items: flex-start;
                    padding: 1rem 0.75rem;
                  }
                  .fn-reset-card {
                    padding: 1.75rem 1.25rem;
                  }
                }
              `}</style>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reset-conf">Confirm New Password</label>
              <div className="fn-input-icon-wrap">
                <Lock size={16} className="fn-field-icon" />
                <input
                  id="reset-conf"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control fn-has-icon"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-sale fn-auth-submit" disabled={loading}>
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>

            <div className="fn-auth-footer">
              <Link to="/login" className="fn-auth-link">Back to Login</Link>
            </div>
          </form>
        )}
      </div>
      <style>{`
        .fn-reset-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          background:
            radial-gradient(ellipse at 12% 8%, rgba(21, 154, 104, 0.1), transparent 36%),
            var(--bg-app);
        }
        .fn-reset-card {
          width: 100%;
          max-width: 480px;
          padding: 2.25rem;
          border-radius: var(--r-2xl);
          background: var(--bg-surface);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
        }
        .fn-reset-card .fn-auth-brand {
          text-align: center;
          margin-bottom: 1.75rem;
        }
        .fn-reset-card .fn-auth-logo {
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
        .fn-reset-card .fn-auth-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .fn-reset-card .fn-auth-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 0.35rem;
          line-height: 1.5;
        }
        .fn-reset-success-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0.5rem 0 0.25rem;
        }
        .fn-reset-success-box .fn-success-icon {
          width: 56px;
          height: 56px;
          padding: 10px;
          margin-bottom: 1rem;
          border-radius: 50%;
          color: var(--brand);
          background: var(--brand-light);
        }
        .fn-reset-success-box h3 {
          margin-bottom: 0.5rem;
          color: var(--text-primary);
          font-size: 1.2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .fn-reset-success-box p {
          max-width: 32ch;
          color: var(--text-secondary);
          font-size: 0.875rem;
          line-height: 1.6;
        }
        .fn-reset-success-button {
          margin-top: 1.25rem;
          padding: 0.7rem 1.4rem;
          text-decoration: none;
        }
        @media (max-width: 600px) {
          .fn-reset-wrapper {
            align-items: flex-start;
            padding: 1rem 0.75rem;
          }
          .fn-reset-card {
            padding: 1.75rem 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ResetPasswordPage;

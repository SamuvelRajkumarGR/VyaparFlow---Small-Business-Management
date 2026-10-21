import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '', resetToken: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setStatus({ type: '', message: '', resetToken: '' });

    const res = await forgotPassword(email.trim());
    setLoading(false);

    if (res.success) {
      setStatus({
        type: 'success',
        message: res.message || 'Password reset instructions have been generated.',
        resetToken: res.resetToken || '',
      });
    } else {
      setStatus({
        type: 'error',
        message: res.message || 'Unable to process reset request.',
      });
    }
  };

  return (
    <div className="fn-auth-wrapper fn-forgot-wrapper">
      <div className="fn-auth-card fn-forgot-card card">
        <div className="fn-auth-brand">
          <div className="fn-auth-logo">
            <span>₹</span>
          </div>
          <h2 className="fn-auth-title">Forgot Password</h2>
          <p className="fn-auth-subtitle">Enter your registered email to receive reset instructions</p>
        </div>

        {status.type === 'error' && (
          <div className="fn-auth-alert fn-alert-error">
            <AlertCircle size={16} />
            <span>{status.message}</span>
          </div>
        )}

        {status.type === 'success' ? (
          <div className="fn-reset-success-box">
            <CheckCircle size={36} className="fn-success-icon" />
            <h3>Reset Request Sent</h3>
            <p>{status.message}</p>
            {status.resetToken && (
              <div className="fn-token-display">
                <span className="fn-token-lbl">Your Password Reset Token:</span>
                <code className="fn-token-code">{status.resetToken}</code>
                <Link to={`/reset-password?token=${status.resetToken}`} className="btn btn-sale fn-token-btn">
                  Continue to Set New Password <ArrowRight size={14} />
                </Link>
              </div>
            )}
            <Link to="/login" className="fn-auth-link" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="fn-auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="fp-email">Registered Email Address</label>
              <div className="fn-input-icon-wrap">
                <Mail size={16} className="fn-field-icon" />
                <input
                  id="fp-email"
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

            <button type="submit" className="btn btn-primary fn-auth-submit" disabled={loading}>
              {loading ? 'Sending instructions...' : 'Send Reset Instructions'}
            </button>

            <div className="fn-auth-footer">
              <Link to="/login" className="fn-back-link">
                <ArrowLeft size={14} />
                <span>Return to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .fn-forgot-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          background:
            radial-gradient(ellipse at 12% 8%, rgba(21, 154, 104, 0.1), transparent 36%),
            var(--bg-app);
        }
        .fn-forgot-card {
          width: 100%;
          max-width: 460px;
          padding: 2.25rem;
          border-radius: var(--r-2xl);
          background: var(--bg-surface);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
        }
        .fn-forgot-card .fn-auth-brand {
          text-align: center;
          margin-bottom: 1.75rem;
        }
        .fn-forgot-card .fn-auth-logo {
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
        .fn-forgot-card .fn-auth-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .fn-forgot-card .fn-auth-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 0.35rem;
          line-height: 1.5;
        }
        .fn-forgot-card .fn-auth-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: var(--r-lg);
          font-size: 0.825rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }
        .fn-forgot-card .fn-alert-error {
          background: var(--red-light);
          color: var(--red-text);
          border: 1px solid var(--red-border);
        }
        .fn-forgot-card .fn-auth-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .fn-forgot-card .form-group {
          margin-bottom: 0;
        }
        .fn-forgot-card .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .fn-forgot-card .fn-input-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .fn-forgot-card .fn-field-icon {
          position: absolute;
          left: 0.9rem;
          color: var(--text-muted);
          pointer-events: none;
        }
        .fn-forgot-card .fn-has-icon {
          width: 100%;
          padding-left: 2.5rem !important;
        }
        .fn-forgot-card .fn-auth-submit {
          width: 100%;
          padding: 0.8rem;
          font-size: 0.9rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 0.25rem;
        }
        .fn-forgot-card .fn-auth-submit:disabled {
          cursor: wait;
          opacity: 0.75;
        }
        .fn-forgot-card .fn-auth-footer {
          margin-top: 0.75rem;
          text-align: center;
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
        .fn-token-display {
          margin-top: 1.25rem;
          background: var(--bg-hover);
          padding: 1rem;
          border-radius: var(--r-lg);
          border: 1px dashed var(--border);
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          align-items: center;
        }
        .fn-token-lbl {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }
        .fn-token-code {
          font-size: 0.825rem;
          word-break: break-all;
          max-width: 100%;
          background: var(--bg-card);
          padding: 0.35rem 0.65rem;
          border-radius: var(--r-md);
          color: var(--brand);
          font-weight: 700;
        }
        .fn-token-btn {
          margin-top: 0.5rem;
          font-size: 0.825rem;
          padding: 0.5rem 1rem;
          text-decoration: none;
        }
        .fn-back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.825rem;
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 600;
        }
        .fn-back-link:hover {
          color: var(--text-primary);
        }
        @media (max-width: 600px) {
          .fn-forgot-wrapper {
            align-items: flex-start;
            padding: 1rem 0.75rem;
          }
          .fn-forgot-card {
            padding: 1.75rem 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;

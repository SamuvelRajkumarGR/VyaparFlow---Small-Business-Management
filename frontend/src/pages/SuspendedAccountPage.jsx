import React, { useCallback, useEffect, useState } from 'react';
import { ShieldAlert, LogOut, LockKeyhole, Send, Clock3, RotateCcw, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  createReactivationRequestAPI,
  getMyReactivationRequestAPI,
} from '../services/api';

const SuspendedAccountPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadRequest = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getMyReactivationRequestAPI();
      setRequest(result.request);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your reactivation request.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await createReactivationRequestAPI(reason);
      setRequest(result.request);
      setReason('');
    } catch (err) {
      if (err.response?.data?.request) {
        setRequest(err.response.data.request);
      }
      setError(err.response?.data?.message || 'Could not submit your request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isPending = request?.status === 'pending';

  return (
    <div className="fn-auth-wrapper fn-suspend-wrapper">
      <div className="fn-auth-card card fn-suspend-card">
        <div className="fn-suspend-icon-wrap">
          <ShieldAlert size={48} className="fn-suspend-icon" />
        </div>

        <h2 className="fn-suspend-title">Account Suspended</h2>
        <p className="fn-suspend-desc">
          Your VyaparFlow account for <strong>{user?.businessName || 'your business'}</strong> has
          been temporarily suspended by the Super Administrator.
        </p>

        <div className="fn-suspend-box">
          <div className="fn-suspend-box-icon"><LockKeyhole size={17} /></div>
          <div className="fn-suspend-box-copy">
            <p className="fn-suspend-box-title">Your account access is temporarily paused</p>
            <p>
              Transactions, analytics, and data changes are unavailable while the account is
              suspended. Your existing business records remain preserved.
            </p>
          </div>
        </div>

        {error && <p className="fn-suspend-error" role="alert">{error}</p>}

        {loading ? (
          <p className="fn-suspend-status">Checking your request status...</p>
        ) : request?.status === 'approved' ? (
          <div className="fn-suspend-request-state" role="status">
            <CheckCircle size={19} />
            <div>
              <strong>Your reactivation request was approved</strong>
              <p>Your account is active. Sign in again to return to your business workspace.</p>
              <button
                type="button"
                className="btn btn-primary fn-suspend-submit"
                onClick={handleLogout}
              >
                Return to sign in
              </button>
            </div>
          </div>
        ) : isPending ? (
          <div className="fn-suspend-request-state" role="status">
            <Clock3 size={19} />
            <div>
              <strong>Request sent for review</strong>
              <p>An administrator will review your request. You can sign out and check back later.</p>
              <small>Submitted {new Date(request.createdAt).toLocaleString()}</small>
              <button
                type="button"
                className="fn-suspend-check-status"
                onClick={loadRequest}
                disabled={loading}
              >
                Check request status
              </button>
            </div>
          </div>
        ) : (
          <>
            {request?.status === 'denied' && (
              <div className="fn-suspend-review" role="status">
                <strong>Your previous request was not approved.</strong>
                {request.reviewNote && <p>Administrator note: {request.reviewNote}</p>}
                <small>Reviewed {request.reviewedAt ? new Date(request.reviewedAt).toLocaleString() : ''}</small>
              </div>
            )}
            <form onSubmit={handleSubmit} className="fn-suspend-request-form">
              <label htmlFor="reactivation-reason">Request an account review</label>
              <textarea
                id="reactivation-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Tell the administrator why you are requesting reactivation."
                minLength={10}
                maxLength={1000}
                rows={4}
                required
              />
              <small>{reason.length}/1000 characters (at least 10 required)</small>
              <button
                type="submit"
                className="btn btn-primary fn-suspend-submit"
                disabled={submitting || reason.trim().length < 10}
              >
                {request?.status === 'denied' ? <RotateCcw size={16} /> : <Send size={16} />}
                <span>
                  {submitting ? 'Sending request...' : request?.status === 'denied'
                    ? 'Submit another request'
                    : 'Send reactivation request'}
                </span>
              </button>
            </form>
          </>
        )}

        <div className="fn-suspend-actions">
          <button onClick={handleLogout} className="btn btn-outline fn-suspend-logout">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <style>{`
        .fn-suspend-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          background:
            radial-gradient(ellipse at 90% 8%, rgba(217, 75, 75, 0.08), transparent 34%),
            var(--bg-app);
        }
        .fn-suspend-card {
          width: 100%;
          text-align: center;
          max-width: 520px;
          padding: 2.25rem;
          border-radius: var(--r-2xl);
          background: var(--bg-surface);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
        }
        .fn-suspend-icon-wrap {
          width: 68px;
          height: 68px;
          border-radius: var(--r-full);
          background: var(--red-light);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          color: var(--red);
        }
        .fn-suspend-icon { width: 34px; height: 34px; }
        .fn-suspend-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.035em;
        }
        .fn-suspend-desc {
          max-width: 52ch;
          margin: 0.5rem auto 0;
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .fn-suspend-box {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin: 1.5rem 0;
          padding: 1rem 1.1rem;
          background: var(--amber-light);
          border: 1px solid color-mix(in srgb, var(--amber) 22%, transparent);
          border-radius: var(--r-lg);
          font-size: 0.825rem;
          color: var(--text-secondary);
          line-height: 1.6;
          text-align: left;
        }
        .fn-suspend-box-icon { display: flex; flex-shrink: 0; margin-top: 0.1rem; color: var(--amber); }
        .fn-suspend-box-copy { display: flex; flex-direction: column; gap: 0.45rem; }
        .fn-suspend-box-title { color: var(--text-primary); font-weight: 700; }
        .fn-suspend-request-form {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          text-align: left;
        }
        .fn-suspend-request-form label { color: var(--text-primary); font-size: 0.875rem; font-weight: 700; }
        .fn-suspend-request-form textarea {
          width: 100%;
          resize: vertical;
          padding: 0.75rem;
          color: var(--text-primary);
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          font: inherit;
        }
        .fn-suspend-request-form small, .fn-suspend-review small {
          color: var(--text-muted);
          font-size: 0.75rem;
        }
        .fn-suspend-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 42px;
          margin-top: 0.4rem;
        }
        .fn-suspend-request-state, .fn-suspend-review {
          display: flex;
          align-items: flex-start;
          gap: 0.7rem;
          margin: 1.25rem 0;
          padding: 1rem;
          border: 1px solid var(--green-border);
          border-radius: var(--r-lg);
          background: var(--green-light);
          color: var(--text-primary);
          text-align: left;
          font-size: 0.85rem;
        }
        .fn-suspend-request-state svg { color: var(--green); flex-shrink: 0; }
        .fn-suspend-request-state p, .fn-suspend-review p { margin: 0.35rem 0; color: var(--text-secondary); }
        .fn-suspend-check-status {
          margin-top: 0.5rem;
          padding: 0;
          border: 0;
          background: transparent;
          color: var(--brand);
          cursor: pointer;
          font: inherit;
          font-size: 0.8rem;
          font-weight: 700;
        }
        .fn-suspend-review { display: block; border-color: var(--red-border); background: var(--red-light); }
        .fn-suspend-error { margin: 0.75rem 0; color: var(--red); font-size: 0.85rem; }
        .fn-suspend-status { color: var(--text-muted); font-size: 0.85rem; }
        .fn-suspend-actions { display: flex; gap: 0.65rem; justify-content: center; margin-top: 1.25rem; }
        .fn-suspend-logout {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 42px;
          width: 100%;
          padding: 0.65rem 1rem;
          font-size: 0.825rem;
        }
        @media (max-width: 600px) {
          .fn-suspend-wrapper { align-items: flex-start; padding: 1rem 0.75rem; }
          .fn-suspend-card { padding: 1.75rem 1.25rem; }
          .fn-suspend-title { font-size: 1.3rem; }
        }
      `}</style>
    </div>
  );
};

export default SuspendedAccountPage;

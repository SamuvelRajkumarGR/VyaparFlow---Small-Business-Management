import React from 'react';
import { ShieldAlert, LogOut, Mail, LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SuspendedAccountPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="fn-auth-wrapper fn-suspend-wrapper">
      <div className="fn-auth-card card fn-suspend-card">
        <div className="fn-suspend-icon-wrap">
          <ShieldAlert size={48} className="fn-suspend-icon" />
        </div>

        <h2 className="fn-suspend-title">Account Suspended</h2>
        <p className="fn-suspend-desc">
          Your VyaparFlow account for <strong>{user?.businessName || 'your business'}</strong> has been temporarily suspended by the Super Administrator.
        </p>

        <div className="fn-suspend-box">
          <div className="fn-suspend-box-icon"><LockKeyhole size={17} /></div>
          <div className="fn-suspend-box-copy">
            <p className="fn-suspend-box-title">Your account access is temporarily paused</p>
            <p>
              Transactions, analytics, and data changes are unavailable while the account is suspended.
              Your existing business records remain preserved.
            </p>
            <p>
              Contact the administrator to request a review or account reactivation.
            </p>
          </div>
        </div>

        <div className="fn-suspend-actions">
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=support%40vyaparflow.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary fn-suspend-contact"
          >
            <Mail size={16} />
            <span>Contact Administrator</span>
          </a>
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
        .fn-suspend-icon {
          width: 34px;
          height: 34px;
        }
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
        .fn-suspend-box-icon {
          display: flex;
          flex-shrink: 0;
          margin-top: 0.1rem;
          color: var(--amber);
        }
        .fn-suspend-box-copy {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .fn-suspend-box-title {
          color: var(--text-primary);
          font-weight: 700;
        }
        .fn-suspend-actions .btn {
          min-height: 42px;
          padding: 0.65rem 1rem;
          font-size: 0.825rem;
          text-decoration: none;
        }
        .fn-suspend-actions {
          display: flex;
          gap: 0.65rem;
          justify-content: center;
        }
        .fn-suspend-contact, .fn-suspend-logout {
          flex: 1;
          min-width: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        @media (max-width: 600px) {
          .fn-suspend-wrapper {
            align-items: flex-start;
            padding: 1rem 0.75rem;
          }
          .fn-suspend-card {
            padding: 1.75rem 1.25rem;
          }
          .fn-suspend-title {
            font-size: 1.3rem;
          }
          .fn-suspend-actions {
            flex-direction: column;
          }
          .fn-suspend-contact, .fn-suspend-logout {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SuspendedAccountPage;

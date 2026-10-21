import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GoogleSignInButton = ({ text = 'Continue with Google', onSuccess, onError }) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [devEmail, setDevEmail] = useState('');
  const [devName, setDevName] = useState('');
  const [devBiz, setDevBiz] = useState('');

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleClick = async () => {
    // If genuine Google Client ID is configured, trigger Google Identity popup
    if (clientId && clientId !== 'your_google_client_id_here' && window.google?.accounts?.id) {
      setLoading(true);
      try {
        window.google.accounts.id.prompt();
      } catch (err) {
        console.error('Google Prompt Error:', err);
        setLoading(false);
      }
      return;
    }

    // If client ID is not configured yet, open helpful prompt / developer test dialog
    setShowConfigModal(true);
  };

  const handleDevGoogleLogin = async (e) => {
    e.preventDefault();
    if (!devEmail) return;

    setLoading(true);
    setShowConfigModal(false);

    // Build a mock JWT credential for dev testing
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: `google_dev_${devEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email: devEmail.toLowerCase().trim(),
        name: devName.trim() || 'Google User',
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${devEmail}`,
        email_verified: true,
      })
    );
    const mockToken = `${header}.${payload}.signature`;

    const res = await googleLogin(mockToken, devBiz.trim());
    setLoading(false);

    if (res.success) {
      if (onSuccess) onSuccess(res.user);
      else navigate(res.user.role === 'admin' ? '/admin' : '/');
    } else {
      if (onError) onError(res.message);
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn-google-auth"
        onClick={handleClick}
        disabled={loading}
      >
        <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{loading ? 'Authenticating with Google...' : text}</span>
      </button>

      {/* Google Configuration / Dev Simulation Modal */}
      {showConfigModal && (
        <div className="modal-backdrop">
          <div className="modal-card fn-google-config-modal">
            <div className="modal-header">
              <h3 className="modal-title">Google OAuth 2.0 Authentication</h3>
              <button className="btn-close" onClick={() => setShowConfigModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="fn-g-info">
                The Google OAuth backend integration using <code>google-auth-library</code> is fully active! To connect your official Google Cloud project:
              </p>
              <ol className="fn-g-steps">
                <li>Create an OAuth 2.0 Client ID in <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer">Google Cloud Console</a>.</li>
                <li>Add authorized JavaScript origin: <code>http://localhost:5173</code></li>
                <li>Set <code>GOOGLE_CLIENT_ID</code> in <code>backend/.env</code> and <code>frontend/.env</code></li>
              </ol>

              <hr className="fn-divider" />
              <p className="fn-g-sub">Or test the Google authentication flow immediately below:</p>

              <form onSubmit={handleDevGoogleLogin} className="fn-g-dev-form">
                <div className="form-group">
                  <label className="form-label">Google Account Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. priya.sharma@gmail.com"
                    value={devEmail}
                    onChange={(e) => setDevEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Priya Sharma"
                    value={devName}
                    onChange={(e) => setDevName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Business Name (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Priya Silk & Sarees"
                    value={devBiz}
                    onChange={(e) => setDevBiz(e.target.value)}
                  />
                </div>

                <div className="modal-footer" style={{ padding: 0, marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowConfigModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>Continue as Google User</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .btn-google-auth {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.7rem 1.25rem;
          background: var(--bg-surface);
          border: 1.5px solid var(--border);
          border-radius: var(--r-xl);
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          font-family: inherit;
          transition: all var(--transition);
          box-shadow: var(--shadow-xs);
        }
        .btn-google-auth:hover {
          background: var(--bg-hover);
          border-color: #4285F4;
          box-shadow: 0 2px 8px rgba(66, 133, 244, 0.15);
        }
        .btn-google-auth:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .fn-google-config-modal {
          max-width: 480px;
        }
        .fn-g-info {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }
        .fn-g-steps {
          font-size: 0.8rem;
          color: var(--text-muted);
          padding-left: 1.25rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        .fn-g-steps code {
          background: var(--bg-hover);
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--brand);
        }
        .fn-g-steps a {
          color: var(--brand);
          text-decoration: underline;
        }
        .fn-divider {
          border: none;
          border-top: 1px solid var(--border);
          margin: 1rem 0;
        }
        .fn-g-sub {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }
        .fn-g-dev-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
      `}</style>
    </>
  );
};

export default GoogleSignInButton;

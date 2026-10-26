import React, { useEffect, useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const GoogleSignInButton = ({
  text = 'Continue with Google',
  businessName = '',
  onSuccess,
  onError,
}) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [buttonWidth, setButtonWidth] = useState(360);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  const isConfigured = clientId && clientId !== 'your_google_client_id_here';

  useEffect(() => {
    const updateButtonWidth = () => {
      setButtonWidth(Math.max(200, Math.min(360, window.innerWidth - 64)));
    };

    updateButtonWidth();
    window.addEventListener('resize', updateButtonWidth);
    return () => window.removeEventListener('resize', updateButtonWidth);
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      const message = 'Google did not return an ID token. Please try again.';
      setError(message);
      onError?.(message);
      return;
    }

    setLoading(true);
    setError('');
    const result = await googleLogin(credentialResponse.credential, businessName.trim());
    setLoading(false);

    if (result.success) {
      if (onSuccess) {
        onSuccess(result.user);
      } else {
        navigate(
          result.user.role === 'admin'
            ? '/admin'
            : location.state?.from?.pathname || '/'
        );
      }
      return;
    }

    if (result.accountStatus === 'suspended') {
      navigate('/suspended');
      return;
    }

    const message = result.message || 'Google authentication failed. Please try again.';
    setError(message);
    onError?.(message);
  };

  const googleButton = isConfigured ? (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="google-login-button">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            const message = 'Google sign-in could not be completed. Please try again.';
            setError(message);
            onError?.(message);
          }}
          text={text === 'Sign Up with Google' ? 'signup_with' : 'continue_with'}
          theme="outline"
          size="large"
          shape="rectangular"
          width={buttonWidth}
        />
        {loading && <span className="google-login-loading">Verifying with VyaparFlow...</span>}
      </div>
    </GoogleOAuthProvider>
  ) : (
    <div className="google-login-setup">
      <button
        type="button"
        className="google-login-placeholder"
        disabled
        aria-describedby="google-login-setup-message"
      >
        <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" transform="translate(0 5)" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.91c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.37 37.99 46.98 31.91 46.98 24.55z" />
          <path fill="#34A853" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.55 2.56 10.78l7.97-6.19z" transform="translate(0 0)" />
          <path fill="#FBBC05" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.14 1.43-4.89 2.28-8.17 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        <span>{text}</span>
      </button>
      <p className="google-login-unavailable" id="google-login-setup-message" role="status">
        Add <code>VITE_GOOGLE_CLIENT_ID</code> to <code>frontend/.env</code> and restart the
        frontend to enable Google account selection.{' '}
        <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">
          Create a Google OAuth Web Client ID
        </a>.
      </p>
    </div>
  );

  return (
    <div className="fn-google-auth">
      {googleButton}
      {error && (
        <p className="fn-google-auth-error" role="alert">
          {error}
        </p>
      )}
      <style>{`
        .fn-google-auth {
          width: 100%;
        }
        .google-login-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          min-height: 40px;
        }
        .google-login-loading {
          color: var(--text-muted);
          font-size: 0.8rem;
        }
        .google-login-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          min-height: 44px;
          padding: 0.65rem 1rem;
          border: 1px solid var(--border);
          border-radius: var(--r-xl);
          background: var(--bg-surface);
          color: var(--text-primary);
          font: inherit;
          font-size: 0.875rem;
          font-weight: 600;
          opacity: 0.7;
          cursor: not-allowed;
        }
        .google-login-unavailable {
          margin: 0.55rem 0 0;
          color: var(--text-secondary);
          font-size: 0.78rem;
          line-height: 1.5;
          text-align: center;
        }
        .google-login-unavailable a {
          color: var(--brand);
          text-decoration: underline;
        }
        .google-login-unavailable code {
          color: var(--brand);
          overflow-wrap: anywhere;
        }
        .fn-google-auth-error {
          margin: 0.5rem 0 0;
          color: var(--danger, #dc2626);
          font-size: 0.8rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default GoogleSignInButton;

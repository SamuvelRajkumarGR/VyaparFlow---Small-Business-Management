import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Store, Phone, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please provide your full name');
      return;
    }
    if (!formData.businessName.trim()) {
      setError('Please enter your business or shop name');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const res = await register({
      name: formData.name.trim(),
      businessName: formData.businessName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
    });
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fn-auth-wrapper">
      <div className="fn-auth-card fn-register-card card">
        {/* Brand Header */}
        <div className="fn-auth-brand">
          <div className="fn-auth-logo">
            <span>₹</span>
          </div>
          <h2 className="fn-auth-title">Create Your VyaparFlow Account</h2>
          <p className="fn-auth-subtitle">Join thousands of shopkeepers managing sales & expenses securely</p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="fn-auth-alert fn-alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Sign Up with Google */}
        <div className="fn-google-section">
          <GoogleSignInButton text="Sign Up with Google" />
        </div>

        <div className="fn-auth-separator">
          <span>or register with email</span>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="fn-auth-form">
          <div className="fn-form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name *</label>
              <div className="fn-input-icon-wrap">
                <User size={16} className="fn-field-icon" />
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  className="form-control fn-has-icon"
                  placeholder="e.g. Ramesh Kumar"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-biz">Business / Shop Name *</label>
              <div className="fn-input-icon-wrap">
                <Store size={16} className="fn-field-icon" />
                <input
                  id="reg-biz"
                  name="businessName"
                  type="text"
                  className="form-control fn-has-icon"
                  placeholder="e.g. Apex Traders"
                  autoComplete="organization"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="fn-form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address *</label>
              <div className="fn-input-icon-wrap">
                <Mail size={16} className="fn-field-icon" />
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className="form-control fn-has-icon"
                  placeholder="ramesh@vyapar.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Phone Number (Optional)</label>
              <div className="fn-input-icon-wrap">
                <Phone size={16} className="fn-field-icon" />
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  className="form-control fn-has-icon"
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="fn-form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-pwd">Password *</label>
              <div className="fn-input-icon-wrap">
                <Lock size={16} className="fn-field-icon" />
                <input
                  id="reg-pwd"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control fn-has-icon fn-has-toggle"
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password *</label>
              <div className="fn-input-icon-wrap">
                <Lock size={16} className="fn-field-icon" />
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control fn-has-icon"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-sale fn-auth-submit" disabled={loading}>
            {loading ? (
              <span className="fn-btn-spinner">Creating Account...</span>
            ) : (
              <>
                <span>Register & Open Business Space</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="fn-auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="fn-auth-link">Log In Here</Link>
          </p>
        </div>

        <div className="fn-security-badge">
          <ShieldCheck size={14} />
          <span>Strict User Isolation: Your business financial records are 100% private.</span>
        </div>
      </div>

      <style>{`
        .fn-auth-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          background:
            radial-gradient(ellipse at 12% 8%, rgba(21, 154, 104, 0.1), transparent 36%),
            var(--bg-app);
        }
        .fn-auth-card {
          width: 100%;
          padding: 2rem;
          border-radius: var(--r-2xl);
          background: var(--bg-surface);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
        }
        .fn-register-card {
          max-width: 580px;
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
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .fn-auth-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 0.35rem;
          line-height: 1.5;
        }
        .fn-auth-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: var(--r-lg);
          font-size: 0.825rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }
        .fn-alert-error {
          background: var(--red-light);
          color: var(--red-text);
          border: 1px solid var(--red-border);
        }
        .fn-google-section {
          margin-bottom: 1rem;
        }
        .fn-auth-separator {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1rem 0;
          color: var(--text-muted);
          font-size: 0.72rem;
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
          gap: 0.85rem;
        }
        .fn-form-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }
        .fn-form-row .form-group {
          min-width: 0;
          margin-bottom: 0;
        }
        .fn-input-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .fn-input-icon-wrap .form-control {
          width: 100%;
          min-width: 0;
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
        .fn-auth-submit {
          width: 100%;
          padding: 0.8rem;
          font-size: 0.9rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.35rem;
        }
        .fn-auth-submit:disabled {
          cursor: wait;
          opacity: 0.75;
        }
        .fn-auth-footer {
          margin-top: 1.25rem;
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
          margin-top: 1.25rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 500;
          text-align: center;
        }
        .fn-security-badge svg {
          flex-shrink: 0;
          color: var(--brand);
        }
        @media (max-width: 600px) {
          .fn-auth-wrapper {
            align-items: flex-start;
            padding: 1rem 0.75rem;
          }
          .fn-auth-card {
            padding: 1.5rem 1.25rem;
          }
          .fn-auth-title {
            font-size: 1.2rem;
          }
          .fn-form-row {
            grid-template-columns: 1fr;
            gap: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;

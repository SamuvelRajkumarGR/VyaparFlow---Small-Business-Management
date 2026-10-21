import React from 'react';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AccessDeniedPage = () => {
  return (
    <div className="fn-auth-wrapper">
      <div className="fn-auth-card card fn-denied-card">
        <div className="fn-denied-icon-wrap">
          <ShieldX size={48} className="fn-denied-icon" />
        </div>

        <h2 className="fn-denied-title">Access Denied (403)</h2>
        <p className="fn-denied-desc">
          You do not have administrative privileges to access this area of VyaparFlow.
        </p>

        <div className="fn-denied-box">
          <p>
            The Super Admin console is strictly restricted to authorized system administrators. Your business account only has access to your private business dashboard.
          </p>
        </div>

        <Link to="/" className="btn btn-primary fn-denied-btn">
          <ArrowLeft size={16} />
          <span>Return to Business Dashboard</span>
        </Link>
      </div>

      <style>{`
        .fn-denied-card {
          text-align: center;
          max-width: 440px;
        }
        .fn-denied-icon-wrap {
          width: 72px;
          height: 72px;
          border-radius: var(--r-full);
          background: var(--amber-light);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
          color: var(--amber);
        }
        .fn-denied-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .fn-denied-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 0.4rem;
          line-height: 1.5;
        }
        .fn-denied-box {
          margin: 1.25rem 0;
          padding: 1rem;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .fn-denied-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default AccessDeniedPage;

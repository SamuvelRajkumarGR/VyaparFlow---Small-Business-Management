import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, TrendingDown, ArrowLeftRight,
  BarChart3, Settings, Sun, Moon, Menu, X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTransaction } from '../context/TransactionContext';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Sales', path: '/sales', icon: TrendingUp },
  { label: 'Expenses', path: '/expenses', icon: TrendingDown },
  { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
];

const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const { businessName } = useTransaction();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-current-w',
      collapsed ? '72px' : 'var(--sidebar-w)'
    );

    return () => {
      document.documentElement.style.removeProperty('--sidebar-current-w');
    };
  }, [collapsed]);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="sb-mobile-btn"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="sb-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${mobileOpen ? 'sidebar--mobile-open' : ''}`}>

        {/* Brand */}
        <div className="sb-brand">
          <div className="sb-brand-icon">
            <span className="sb-brand-symbol">₹</span>
          </div>
          {!collapsed && (
            <div className="sb-brand-text">
              <span className="sb-brand-name">{businessName || 'VyaparFlow'}</span>
              <span className="sb-brand-tag">Business Manager</span>
            </div>
          )}
          <button
            className="sb-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
          {/* Mobile close */}
          <button className="sb-mobile-close" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sb-nav">
          <div className="sb-nav-label">{!collapsed && 'Main Menu'}</div>
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `sb-link ${isActive ? 'sb-link--active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
            >
              <div className="sb-link-icon-wrap">
                <Icon size={17} />
              </div>
              {!collapsed && <span className="sb-link-label">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sb-footer">
          <NavLink
            to="/settings"
            className={({ isActive }) => `sb-link ${isActive ? 'sb-link--active' : ''}`}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? 'Settings' : undefined}
          >
            <div className="sb-link-icon-wrap">
              <Settings size={17} />
            </div>
            {!collapsed && <span className="sb-link-label">Settings</span>}
          </NavLink>

          <button className="sb-theme-btn" onClick={toggleTheme} title="Toggle theme">
            <div className="sb-link-icon-wrap">
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </div>
            {!collapsed && (
              <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
            )}
          </button>
        </div>
      </aside>

      <style>{`
        /* ── Mobile trigger ── */
        .sb-mobile-btn {
          display: none;
          position: fixed;
          top: 0.875rem;
          left: 1rem;
          z-index: 1001;
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 0.5rem;
          border-radius: var(--r-lg);
          cursor: pointer;
          color: var(--text-primary);
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition);
        }
        .sb-mobile-btn:hover { background: var(--bg-hover); }

        .sb-mobile-close {
          display: none;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: var(--r-md);
          align-items: center;
          justify-content: center;
          transition: all var(--transition);
          margin-left: auto;
        }
        .sb-mobile-close:hover { color: var(--text-primary); }

        .sb-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(4px);
          z-index: 999;
        }

        /* ── Sidebar shell ── */
        .sidebar {
          width: var(--sidebar-w);
          height: 100vh;
          position: fixed;
          top: 0; left: 0;
          background: var(--bg-surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          transition: width 0.25s ease, transform 0.25s ease;
          overflow: hidden;
        }
        .sidebar--collapsed { width: 72px; }

        /* ── Brand ── */
        .sb-brand {
          padding: 1.125rem 1rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-height: var(--navbar-h);
        }
        .sb-brand-icon {
          width: 36px;
          height: 36px;
          background: var(--brand);
          border-radius: var(--r-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(21,154,104,0.3);
        }
        .sb-brand-symbol {
          font-size: 1.1rem;
          font-weight: 900;
          color: #fff;
          line-height: 1;
        }
        .sb-brand-text {
          flex: 1;
          min-width: 0;
        }
        .sb-brand-name {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--text-primary);
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.02em;
        }
        .sb-brand-tag {
          font-size: 0.68rem;
          color: var(--text-muted);
          display: block;
          margin-top: 1px;
          white-space: nowrap;
          font-weight: 500;
        }
        .sb-collapse-btn {
          margin-left: auto;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          padding: 0.3rem;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          flex-shrink: 0;
          transition: all var(--transition);
        }
        .sb-collapse-btn:hover {
          color: var(--text-primary);
          background: var(--border);
        }
        .sidebar--collapsed {
          overflow: visible;
        }
        .sidebar--collapsed .sb-brand {
          justify-content: center;
          padding-right: 0.5rem;
          padding-left: 0.5rem;
          position: relative;
        }
        .sidebar--collapsed .sb-collapse-btn {
          position: absolute;
          top: 50%;
          right: -0.75rem;
          width: 1.5rem;
          height: 1.5rem;
          justify-content: center;
          padding: 0;
          border-radius: 50%;
          background: var(--bg-card);
          color: var(--text-secondary);
          box-shadow: var(--shadow-md);
          z-index: 1;
          transform: translateY(-50%);
        }
        .sidebar--collapsed .sb-collapse-btn:hover {
          background: var(--brand);
          border-color: var(--brand);
          color: #FFFFFF;
          transform: translateY(-50%) scale(1.08);
        }
        .sb-collapse-btn:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        /* ── Nav ── */
        .sb-nav {
          flex: 1;
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }
        .sb-nav-label {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          padding: 0 0.5rem;
          margin-bottom: 0.5rem;
          min-height: 1em;
        }
        .sb-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.55rem 0.625rem;
          border-radius: var(--r-lg);
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.875rem;
          transition: all var(--transition);
          white-space: nowrap;
          position: relative;
        }
        .sb-link:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .sb-link--active {
          background: var(--brand-light);
          color: var(--brand);
          font-weight: 600;
        }
        .sb-link--active .sb-link-icon-wrap {
          background: var(--brand);
          color: #fff;
          box-shadow: 0 2px 8px rgba(21,154,104,0.3);
        }
        .sb-link-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: var(--r-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all var(--transition);
          background: transparent;
        }
        .sb-link:hover .sb-link-icon-wrap {
          background: var(--border);
        }

        /* ── Footer ── */
        .sb-footer {
          padding: 0.75rem;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .sb-theme-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.55rem 0.625rem;
          border-radius: var(--r-lg);
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition);
          font-family: inherit;
          white-space: nowrap;
          width: 100%;
          text-align: left;
        }
        .sb-theme-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .sb-theme-btn:hover .sb-link-icon-wrap {
          background: var(--border);
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .sb-mobile-btn { display: flex; }
          .sb-mobile-close { display: flex; }
          .sb-backdrop { display: block; }
          .sb-collapse-btn { display: none; }
          .sidebar {
            transform: translateX(-100%);
            width: var(--sidebar-w) !important;
            overflow: hidden;
          }
          .sidebar--mobile-open { transform: translateX(0); }
        }
      `}</style>
    </>
  );
};

export default Sidebar;

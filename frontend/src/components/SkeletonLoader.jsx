import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="skeleton-grid">
      <div className="skeleton-kpis">
        <div className="glass-card skeleton-box kpi-skeleton"></div>
        <div className="glass-card skeleton-box kpi-skeleton"></div>
        <div className="glass-card skeleton-box kpi-skeleton"></div>
        <div className="glass-card skeleton-box kpi-skeleton"></div>
      </div>
      <div className="skeleton-charts">
        <div className="glass-card skeleton-box chart-skeleton"></div>
        <div className="glass-card skeleton-box chart-skeleton"></div>
      </div>
      <div className="glass-card skeleton-box table-skeleton"></div>

      <style>{`
        .skeleton-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .skeleton-kpis {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
        }

        .skeleton-charts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.25rem;
        }

        .skeleton-box {
          background: linear-gradient(
            90deg,
            var(--bg-secondary) 25%,
            var(--bg-hover) 50%,
            var(--bg-secondary) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: var(--radius-lg);
        }

        .kpi-skeleton {
          height: 120px;
        }

        .chart-skeleton {
          height: 300px;
        }

        .table-skeleton {
          height: 350px;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SkeletonLoader;

import React, { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle, Clock3, MessageSquare, RefreshCw, RotateCcw, ShieldX,
} from 'lucide-react';
import {
  getAdminReactivationRequestsAPI,
  reviewReactivationRequestAPI,
} from '../services/api';

const statusLabels = {
  pending: 'Pending',
  approved: 'Approved',
  denied: 'Denied',
};

const AdminReactivationRequestsPage = () => {
  const [status, setStatus] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [reviewNotes, setReviewNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyRequest, setBusyRequest] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getAdminReactivationRequestsAPI({ status });
      setRequests(result.requests);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load reactivation requests.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleReview = async (request, decision) => {
    setBusyRequest(request._id);
    setError('');
    setNotice('');
    try {
      const result = await reviewReactivationRequestAPI(
        request._id,
        decision,
        reviewNotes[request._id] || ''
      );
      setNotice(result.message);
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update this request.');
    } finally {
      setBusyRequest('');
    }
  };

  return (
    <div className="fn-page-container fn-reactivation-admin">
      <div className="fn-page-header">
        <div>
          <div className="fn-reactivation-eyebrow"><MessageSquare size={14} /> Account support</div>
          <h2 className="fn-page-heading">Reactivation Requests</h2>
          <p className="fn-page-desc">
            Review requests from suspended business owners. Approving a request restores account access.
          </p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={fetchRequests} disabled={loading}>
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="fn-reactivation-toolbar">
        <div className="fn-reactivation-tabs" role="group" aria-label="Filter requests">
          {['pending', 'approved', 'denied', 'all'].map((filter) => (
            <button
              type="button"
              key={filter}
              className={status === filter ? 'is-selected' : ''}
              onClick={() => setStatus(filter)}
            >
              {filter === 'all' ? 'All requests' : statusLabels[filter]}
            </button>
          ))}
        </div>
        <span>{requests.length} {requests.length === 1 ? 'request' : 'requests'}</span>
      </div>

      {error && <div className="fn-reactivation-alert is-error" role="alert">{error}</div>}
      {notice && <div className="fn-reactivation-alert is-success" role="status">{notice}</div>}

      {loading ? (
        <div className="card fn-reactivation-empty">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="card fn-reactivation-empty">
          <MessageSquare size={28} />
          <strong>No {status === 'all' ? '' : `${status} `}requests</strong>
          <span>Requests from suspended users will appear here.</span>
        </div>
      ) : (
        <div className="fn-reactivation-list">
          {requests.map((request) => {
            const requester = request.user;
            const pending = request.status === 'pending';
            return (
              <article className="card fn-reactivation-card" key={request._id}>
                <div className="fn-reactivation-card-header">
                  <div>
                    <h3>{requester?.businessName || 'Business account'}</h3>
                    <p>{requester?.name || 'Unknown user'} · {requester?.email || 'No email'}</p>
                  </div>
                  <span className={`fn-reactivation-status is-${request.status}`}>
                    {request.status === 'pending' ? <Clock3 size={13} /> :
                      request.status === 'approved' ? <CheckCircle size={13} /> : <ShieldX size={13} />}
                    {statusLabels[request.status]}
                  </span>
                </div>

                <div className="fn-reactivation-reason">
                  <strong>Reason for review</strong>
                  <p>{request.reason}</p>
                </div>

                <div className="fn-reactivation-meta">
                  Submitted {new Date(request.createdAt).toLocaleString()}
                  {request.reviewedAt && ` · Reviewed ${new Date(request.reviewedAt).toLocaleString()}`}
                  {request.reviewedBy?.name && ` by ${request.reviewedBy.name}`}
                </div>

                {pending ? (
                  <div className="fn-reactivation-review">
                    <label htmlFor={`review-note-${request._id}`}>Optional note to requester</label>
                    <textarea
                      id={`review-note-${request._id}`}
                      value={reviewNotes[request._id] || ''}
                      onChange={(event) => setReviewNotes((current) => ({
                        ...current,
                        [request._id]: event.target.value,
                      }))}
                      maxLength={1000}
                      rows={2}
                      placeholder="Add a note for your records."
                    />
                    <div className="fn-reactivation-actions">
                      <button
                        type="button"
                        className="btn btn-expense"
                        disabled={busyRequest === request._id}
                        onClick={() => handleReview(request, 'denied')}
                      >
                        <ShieldX size={15} />
                        {busyRequest === request._id ? 'Saving...' : 'Deny request'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sale"
                        disabled={busyRequest === request._id}
                        onClick={() => handleReview(request, 'approved')}
                      >
                        <RotateCcw size={15} />
                        {busyRequest === request._id ? 'Saving...' : 'Approve & reactivate'}
                      </button>
                    </div>
                  </div>
                ) : request.reviewNote ? (
                  <div className="fn-reactivation-note">
                    <strong>Administrator note</strong>
                    <p>{request.reviewNote}</p>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <style>{`
        .fn-reactivation-admin { max-width: 1100px; }
        .fn-reactivation-eyebrow {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.35rem;
          color: var(--amber);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .fn-reactivation-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          color: var(--text-muted);
          font-size: 0.8rem;
        }
        .fn-reactivation-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          padding: 0.25rem;
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          background: var(--bg-surface);
        }
        .fn-reactivation-tabs button {
          border: 0;
          border-radius: var(--r-md);
          padding: 0.5rem 0.75rem;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font: inherit;
        }
        .fn-reactivation-tabs button.is-selected {
          background: var(--brand-light);
          color: var(--brand);
          font-weight: 700;
        }
        .fn-reactivation-list { display: grid; gap: 0.9rem; }
        .fn-reactivation-card { padding: 1.2rem; }
        .fn-reactivation-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }
        .fn-reactivation-card-header h3 { color: var(--text-primary); font-size: 1rem; font-weight: 750; }
        .fn-reactivation-card-header p, .fn-reactivation-reason p, .fn-reactivation-note p {
          margin-top: 0.3rem;
          color: var(--text-secondary);
          font-size: 0.85rem;
          overflow-wrap: anywhere;
        }
        .fn-reactivation-status {
          display: inline-flex;
          flex-shrink: 0;
          align-items: center;
          gap: 0.3rem;
          padding: 0.35rem 0.6rem;
          border-radius: var(--r-full);
          font-size: 0.75rem;
          font-weight: 700;
        }
        .fn-reactivation-status.is-pending { color: var(--amber); background: var(--amber-light); }
        .fn-reactivation-status.is-approved { color: var(--green); background: var(--green-light); }
        .fn-reactivation-status.is-denied { color: var(--red); background: var(--red-light); }
        .fn-reactivation-reason, .fn-reactivation-note {
          margin-top: 1rem;
          padding: 0.8rem;
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          color: var(--text-primary);
          background: var(--bg-app);
          font-size: 0.83rem;
        }
        .fn-reactivation-meta { margin-top: 0.7rem; color: var(--text-muted); font-size: 0.75rem; }
        .fn-reactivation-review { display: grid; gap: 0.5rem; margin-top: 1rem; }
        .fn-reactivation-review label, .fn-reactivation-note strong { color: var(--text-primary); font-size: 0.8rem; font-weight: 700; }
        .fn-reactivation-review textarea {
          width: 100%;
          resize: vertical;
          padding: 0.7rem;
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          background: var(--bg-input);
          color: var(--text-primary);
          font: inherit;
        }
        .fn-reactivation-actions { display: flex; justify-content: flex-end; gap: 0.5rem; flex-wrap: wrap; }
        .fn-reactivation-actions button { display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; }
        .fn-reactivation-alert { margin-bottom: 0.8rem; padding: 0.75rem 1rem; border-radius: var(--r-md); font-size: 0.85rem; }
        .fn-reactivation-alert.is-error { color: var(--red); background: var(--red-light); }
        .fn-reactivation-alert.is-success { color: var(--green); background: var(--green-light); }
        .fn-reactivation-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          min-height: 180px;
          color: var(--text-muted);
          text-align: center;
          font-size: 0.85rem;
        }
        .fn-reactivation-empty strong { color: var(--text-primary); }
        @media (max-width: 600px) {
          .fn-reactivation-toolbar { align-items: flex-start; flex-direction: column; }
          .fn-reactivation-actions { flex-direction: column-reverse; }
          .fn-reactivation-actions button { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default AdminReactivationRequestsPage;

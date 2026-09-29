
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getOwnerDashboard, getOwnerRatings, changePassword } from '../services/api';

function OwnerDashboard() {
  // ── Dashboard & Ratings state ─────────────────────────────────
  const [stores, setStores]               = useState([]);
  const [ratings, setRatings]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  // ── Change Password state ─────────────────────────────────────
  const [showPasswordForm, setShowPasswordForm]   = useState(false);
  const [currentPassword, setCurrentPassword]     = useState('');
  const [newPassword, setNewPassword]             = useState('');
  const [pwdLoading, setPwdLoading]               = useState(false);
  const [pwdError, setPwdError]                   = useState('');
  const [pwdSuccess, setPwdSuccess]               = useState('');

  // ── Fetch Owner Data ──────────────────────────────────────────
  const fetchOwnerData = async () => {
    setLoading(true);
    setError('');
    try {
      // Run both calls in parallel
      const [dashRes, ratingsRes] = await Promise.all([
        getOwnerDashboard(),
        getOwnerRatings(),
      ]);

      setStores(dashRes.data?.data || []);
      setRatings(ratingsRes.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load owner dashboard data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerData();
  }, []);

  // ── Handle Password Submit ────────────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!currentPassword) {
      setPwdError('Current password is required.');
      return;
    }
    if (!newPassword) {
      setPwdError('New password is required.');
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 16) {
      setPwdError('New password must be between 8 and 16 characters.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPwdError('New password must contain at least one uppercase letter.');
      return;
    }
    if (!/[^a-zA-Z0-9]/.test(newPassword)) {
      setPwdError('New password must contain at least one special character.');
      return;
    }

    setPwdLoading(true);

    try {
      const res = await changePassword(currentPassword, newPassword);
      setPwdSuccess(res.data?.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPwdError(
        err.response?.data?.message ||
        err.message ||
        'Failed to change password.'
      );
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar title="Store Owner Dashboard" />

      <div className="page-content">
        <div className="section-header">
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            My Stores Overview
          </h1>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            {showPasswordForm ? 'Close Form' : '🔑 Change Password'}
          </button>
        </div>

        {/* ── Change Password Box ─────────────────────────────── */}
        {showPasswordForm && (
          <div className="card" style={{ marginBottom: 24, maxWidth: 500 }}>
            <h3 className="card-title" style={{ marginBottom: 12 }}>
              Change Password
            </h3>

            {pwdError && <div className="alert alert-error">{pwdError}</div>}
            {pwdSuccess && <div className="alert alert-success">{pwdSuccess}</div>}

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  New Password <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(8–16 chars, 1 uppercase, 1 special)</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={pwdLoading}
              >
                {pwdLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* ── Main Error Alert ────────────────────────────────── */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* ── Loading State ──────────────────────────────────── */}
        {loading ? (
          <div className="loading-text">Loading store data...</div>
        ) : (
          <>
            {/* ── Stores Overview Cards ────────────────────────── */}
            {stores.length === 0 ? (
              <div className="card empty-state" style={{ marginBottom: 24 }}>
                You do not own any stores yet. Ask an Administrator to assign a store to your account.
              </div>
            ) : (
              <div className="stats-row" style={{ marginBottom: 24 }}>
                {stores.map((store) => (
                  <div className="card" key={store.store_id || store.id}>
                    <h3 className="card-title" style={{ fontSize: 18, color: 'var(--gray-900)' }}>
                      {store.store_name}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>
                      📍 {store.store_address || 'No address'}
                    </p>

                    <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Average Rating</div>
                        <div className="card-value">
                          {store.avg_rating !== null && store.avg_rating !== undefined ? (
                            <span>
                              <span className="stars">★</span> {store.avg_rating} / 5
                            </span>
                          ) : (
                            <span style={{ fontSize: 16, color: 'var(--gray-400)' }}>Unrated</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Total Ratings</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-700)' }}>
                          {store.total_ratings || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── User Ratings List ────────────────────────────── */}
            <div className="section-header">
              <h2 className="section-title">Customer Ratings</h2>
              <span style={{ fontSize: 14, color: 'var(--gray-500)' }}>
                Total: {ratings.length}
              </span>
            </div>

            {ratings.length === 0 ? (
              <div className="card empty-state">
                No ratings submitted for your store(s) yet.
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>User Email</th>
                      <th>Store Name</th>
                      <th>Submitted Rating</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratings.map((r) => (
                      <tr key={r.rating_id}>
                        <td style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                          {r.user_name}
                        </td>
                        <td>{r.user_email}</td>
                        <td>{r.store_name}</td>
                        <td>
                          <span className="stars">★</span>{' '}
                          <strong style={{ color: 'var(--gray-900)' }}>{r.rating}</strong> / 5
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                          {r.updated_at
                            ? new Date(r.updated_at).toLocaleDateString()
                            : r.created_at
                            ? new Date(r.created_at).toLocaleDateString()
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default OwnerDashboard;

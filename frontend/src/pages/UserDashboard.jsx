// src/pages/UserDashboard.jsx
// ---------------------------------------------------------------
// Normal User Dashboard
//
// What this page does:
//   1. Displays a searchable list of stores with overall average ratings.
//   2. Displays the user's submitted rating for each store (if rated).
//   3. Allows submitting a new rating or updating an existing rating (1 to 5 stars).
//   4. Provides a "Change Password" section so users can update their password.
//   5. Features search by store name or address.
// ---------------------------------------------------------------

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getStores, rateStore, changePassword } from '../services/api';

function UserDashboard() {
  // ── Stores state ──────────────────────────────────────────────
  const [stores, setStores]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // ── Search inputs ─────────────────────────────────────────────
  const [searchName, setSearchName]       = useState('');
  const [searchAddress, setSearchAddress] = useState('');

  // ── Rating state tracking (per store selected value & status) ──
  const [selectedRatings, setSelectedRatings] = useState({}); // { [storeId]: ratingValue }
  const [ratingMessage, setRatingMessage]     = useState({}); // { [storeId]: { text, type } }
  const [submittingRating, setSubmittingRating] = useState({}); // { [storeId]: boolean }

  // ── Change Password state ─────────────────────────────────────
  const [showPasswordForm, setShowPasswordForm]   = useState(false);
  const [currentPassword, setCurrentPassword]     = useState('');
  const [newPassword, setNewPassword]             = useState('');
  const [pwdLoading, setPwdLoading]               = useState(false);
  const [pwdError, setPwdError]                   = useState('');
  const [pwdSuccess, setPwdSuccess]               = useState('');

  // ── Load Stores ───────────────────────────────────────────────
  const fetchStores = async (nameFilter = '', addressFilter = '') => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (nameFilter.trim()) params.name = nameFilter.trim();
      if (addressFilter.trim()) params.address = addressFilter.trim();

      const response = await getStores(params);
      const storeList = response.data.data || [];
      setStores(storeList);

      // Pre-fill rating selection with user's existing rating if available
      const initialRatings = {};
      storeList.forEach((store) => {
        if (store.user_rating) {
          initialRatings[store.id] = store.user_rating;
        } else {
          initialRatings[store.id] = 5; // default to 5 if unrated
        }
      });
      setSelectedRatings(initialRatings);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load stores. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial load on component mount
  useEffect(() => {
    fetchStores();
  }, []);

  // Handle Search submit
  const handleSearch = (e) => {
    e.preventDefault();
    fetchStores(searchName, searchAddress);
  };

  // Reset Search
  const handleResetSearch = () => {
    setSearchName('');
    setSearchAddress('');
    fetchStores('', '');
  };

  // Handle rating submission/update for a store
  const handleRatingSubmit = async (storeId) => {
    const ratingValue = Number(selectedRatings[storeId] || 5);

    setSubmittingRating((prev) => ({ ...prev, [storeId]: true }));
    setRatingMessage((prev) => ({ ...prev, [storeId]: null }));

    try {
      const res = await rateStore(storeId, ratingValue);
      const successMsg = res.data.message || 'Rating submitted successfully!';

      setRatingMessage((prev) => ({
        ...prev,
        [storeId]: { text: successMsg, type: 'success' },
      }));

      // Refresh stores to update average ratings & user ratings list
      fetchStores(searchName, searchAddress);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to submit rating.';
      setRatingMessage((prev) => ({
        ...prev,
        [storeId]: { text: errorMsg, type: 'error' },
      }));
    } finally {
      setSubmittingRating((prev) => ({ ...prev, [storeId]: false }));
    }
  };

  // Handle Change Password submit
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
      setPwdSuccess(res.data.message || 'Password changed successfully!');
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
      <Navbar title="User Dashboard" />

      <div className="page-content">
        <div className="section-header">
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            Store Directory & Ratings
          </h1>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            {showPasswordForm ? 'Close Password Form' : '🔑 Change Password'}
          </button>
        </div>

        {/* ── Change Password Box ─────────────────────────────── */}
        {showPasswordForm && (
          <div className="card" style={{ marginBottom: 24, maxWidth: 500 }}>
            <h3 className="card-title" style={{ marginBottom: 12 }}>
              Change Your Password
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

        {/* ── Search Bar ──────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: 24 }}>
          <form onSubmit={handleSearch} className="search-row" style={{ margin: 0 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by store name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search by address..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            {(searchName || searchAddress) && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleResetSearch}
              >
                Reset
              </button>
            )}
          </form>
        </div>

        {/* ── Main Error Alert ────────────────────────────────── */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* ── Loading State ──────────────────────────────────── */}
        {loading ? (
          <div className="loading-text">Loading stores...</div>
        ) : stores.length === 0 ? (
          <div className="card empty-state">
            No stores found. Try adjusting your search query.
          </div>
        ) : (
          /* ── Stores Table ────────────────────────────────────── */
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Store Name</th>
                  <th>Address</th>
                  <th>Overall Rating</th>
                  <th>Your Rating</th>
                  <th style={{ width: 220 }}>Submit / Update Rating</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => {
                  const currentVal = selectedRatings[store.id] || 5;
                  const isSubmitting = submittingRating[store.id] || false;
                  const msg = ratingMessage[store.id];

                  return (
                    <tr key={store.id}>
                      <td style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                        {store.name}
                      </td>
                      <td>{store.address || 'N/A'}</td>
                      <td>
                        {store.avg_rating !== null && store.avg_rating !== undefined ? (
                          <span>
                            <span className="stars">★</span> {store.avg_rating} / 5
                            <span style={{ fontSize: 12, color: 'var(--gray-500)', marginLeft: 6 }}>
                              ({store.total_ratings} {store.total_ratings === 1 ? 'rating' : 'ratings'})
                            </span>
                          </span>
                        ) : (
                          <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>No ratings yet</span>
                        )}
                      </td>
                      <td>
                        {store.user_rating ? (
                          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                            <span className="stars">★</span> {store.user_rating} / 5
                          </span>
                        ) : (
                          <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>Not rated yet</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <select
                            className="form-select"
                            style={{ width: 100, padding: '6px 8px' }}
                            value={currentVal}
                            onChange={(e) =>
                              setSelectedRatings((prev) => ({
                                ...prev,
                                [store.id]: Number(e.target.value),
                              }))
                            }
                          >
                            <option value={5}>5 Stars</option>
                            <option value={4}>4 Stars</option>
                            <option value={3}>3 Stars</option>
                            <option value={2}>2 Stars</option>
                            <option value={1}>1 Star</option>
                          </select>

                          <button
                            className="btn btn-primary btn-sm"
                            disabled={isSubmitting}
                            onClick={() => handleRatingSubmit(store.id)}
                          >
                            {isSubmitting
                              ? 'Saving...'
                              : store.user_rating
                              ? 'Update'
                              : 'Submit'}
                          </button>
                        </div>
                        {msg && (
                          <div
                            style={{
                              fontSize: 12,
                              marginTop: 4,
                              color: msg.type === 'success' ? 'var(--success)' : 'var(--danger)',
                            }}
                          >
                            {msg.text}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;

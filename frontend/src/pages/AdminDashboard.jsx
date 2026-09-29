// src/pages/AdminDashboard.jsx
// ---------------------------------------------------------------
// Admin Dashboard
//
// What this page does:
//   1. Displays summary cards (Total Users, Total Stores, Total Ratings).
//   2. User Management:
//      - Search & filter users by name, email, address, or role.
//      - Add new user form (ADMIN, USER, STORE_OWNER).
//      - View details for any user (shows store details if STORE_OWNER).
//   3. Store Management:
//      - Search & list all stores with owner details and ratings.
//      - Add new store form (assigns to a STORE_OWNER).
//   4. Navigation & Logout via shared Navbar.
// ---------------------------------------------------------------

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import {
  getAdminDashboard,
  getAdminUsers,
  getAdminUserById,
  createAdminUser,
  getAdminStores,
  createAdminStore,
} from '../services/api';

function AdminDashboard() {
  // ── Active tab ("users" or "stores") ───────────────────────────
  const [activeTab, setActiveTab] = useState('users');

  // ── Dashboard summary stats ───────────────────────────────────
  const [stats, setStats] = useState({
    total_users: 0,
    total_stores: 0,
    total_ratings: 0,
  });

  // ── Users state ───────────────────────────────────────────────
  const [users, setUsers]                   = useState([]);
  const [usersLoading, setUsersLoading]     = useState(false);
  const [userFilters, setUserFilters]       = useState({ name: '', email: '', address: '', role: '' });
  const [selectedUser, setSelectedUser]     = useState(null); // for user details view
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);

  // ── Stores state ──────────────────────────────────────────────
  const [stores, setStores]                 = useState([]);
  const [storesLoading, setStoresLoading]   = useState(false);
  const [storeFilters, setStoreFilters]     = useState({ name: '', email: '', address: '' });

  // ── Forms toggle state ────────────────────────────────────────
  const [showAddUserModal, setShowAddUserModal]   = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);

  // ── Add User form state ───────────────────────────────────────
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'USER',
  });
  const [userFormError, setUserFormError]     = useState('');
  const [userFormSuccess, setUserFormSuccess] = useState('');
  const [userFormLoading, setUserFormLoading] = useState(false);

  // ── Add Store form state ──────────────────────────────────────
  const [storeForm, setStoreForm] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: '',
  });
  const [storeFormError, setStoreFormError]     = useState('');
  const [storeFormSuccess, setStoreFormSuccess] = useState('');
  const [storeFormLoading, setStoreFormLoading] = useState(false);

  // ── Fetch Dashboard Stats ─────────────────────────────────────
  const fetchStats = async () => {
    try {
      const res = await getAdminDashboard();
      if (res.data?.data) {
        setStats(res.data.data);
      }
    } catch {
      // silently ignore stats error
    }
  };

  // ── Fetch Users List ──────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const params = {};
      if (userFilters.name) params.name = userFilters.name;
      if (userFilters.email) params.email = userFilters.email;
      if (userFilters.address) params.address = userFilters.address;
      if (userFilters.role) params.role = userFilters.role;

      const res = await getAdminUsers(params);
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  }, [userFilters]);

  // ── Fetch Stores List ─────────────────────────────────────────
  const fetchStores = useCallback(async () => {
    setStoresLoading(true);
    try {
      const params = {};
      if (storeFilters.name) params.name = storeFilters.name;
      if (storeFilters.email) params.email = storeFilters.email;
      if (storeFilters.address) params.address = storeFilters.address;

      const res = await getAdminStores(params);
      setStores(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setStoresLoading(false);
    }
  }, [storeFilters]);

  // Load initial data
  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchStores();
  }, [fetchUsers, fetchStores]);

  // ── Handle Add User Submit ────────────────────────────────────
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setUserFormError('');
    setUserFormSuccess('');

    if (!userForm.name.trim() || userForm.name.length < 20 || userForm.name.length > 60) {
      setUserFormError('Name must be between 20 and 60 characters.');
      return;
    }
    if (!userForm.email.trim()) {
      setUserFormError('Email is required.');
      return;
    }
    if (!userForm.password || userForm.password.length < 8 || userForm.password.length > 16) {
      setUserFormError('Password must be 8–16 characters.');
      return;
    }
    if (!/[A-Z]/.test(userForm.password)) {
      setUserFormError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[^a-zA-Z0-9]/.test(userForm.password)) {
      setUserFormError('Password must contain at least one special character.');
      return;
    }

    setUserFormLoading(true);
    try {
      const res = await createAdminUser(userForm);
      setUserFormSuccess(res.data?.message || 'User created successfully!');
      setUserForm({ name: '', email: '', password: '', address: '', role: 'USER' });
      fetchUsers();
      fetchStats();
    } catch (err) {
      setUserFormError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Failed to create user.'
      );
    } finally {
      setUserFormLoading(false);
    }
  };

  // ── Handle Add Store Submit ───────────────────────────────────
  const handleAddStoreSubmit = async (e) => {
    e.preventDefault();
    setStoreFormError('');
    setStoreFormSuccess('');

    if (!storeForm.name.trim() || storeForm.name.length < 20 || storeForm.name.length > 60) {
      setStoreFormError('Store name must be between 20 and 60 characters.');
      return;
    }
    if (!storeForm.email.trim()) {
      setStoreFormError('Store email is required.');
      return;
    }
    if (!storeForm.address.trim()) {
      setStoreFormError('Store address is required.');
      return;
    }
    if (!storeForm.owner_id) {
      setStoreFormError('Please select a Store Owner.');
      return;
    }

    setStoreFormLoading(true);
    try {
      const payload = {
        ...storeForm,
        owner_id: Number(storeForm.owner_id),
      };
      const res = await createAdminStore(payload);
      setStoreFormSuccess(res.data?.message || 'Store created successfully!');
      setStoreForm({ name: '', email: '', address: '', owner_id: '' });
      fetchStores();
      fetchStats();
    } catch (err) {
      setStoreFormError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Failed to create store.'
      );
    } finally {
      setStoreFormLoading(false);
    }
  };

  // ── View User Details ─────────────────────────────────────────
  const handleViewUser = async (id) => {
    setUserDetailsLoading(true);
    setSelectedUser(null);
    try {
      const res = await getAdminUserById(id);
      setSelectedUser(res.data?.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch user details.');
    } finally {
      setUserDetailsLoading(false);
    }
  };

  // Filter owners list for store creation dropdown
  const storeOwners = users.filter((u) => u.role === 'STORE_OWNER');

  return (
    <div className="page-wrapper">
      <Navbar title="Admin Dashboard" />

      <div className="page-content">
        <h1 className="page-title">System Overview</h1>

        {/* ── Summary Cards ───────────────────────────────────── */}
        <div className="stats-row">
          <div className="card">
            <div className="card-title">Total Users</div>
            <div className="card-value">{stats.total_users}</div>
          </div>
          <div className="card">
            <div className="card-title">Total Stores</div>
            <div className="card-value">{stats.total_stores}</div>
          </div>
          <div className="card">
            <div className="card-title">Total Ratings</div>
            <div className="card-value">{stats.total_ratings}</div>
          </div>
        </div>

        {/* ── Tab Selector ────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <button
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('users')}
          >
            👥 User Management ({users.length})
          </button>
          <button
            className={`btn ${activeTab === 'stores' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('stores')}
          >
            🏪 Store Management ({stores.length})
          </button>
        </div>

        {/* ======================================================
            TAB 1: USER MANAGEMENT
           ====================================================== */}
        {activeTab === 'users' && (
          <div>
            <div className="section-header">
              <h2 className="section-title">Users List</h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setShowAddUserModal(!showAddUserModal);
                  setUserFormError('');
                  setUserFormSuccess('');
                }}
              >
                {showAddUserModal ? 'Close Form' : '＋ Add User'}
              </button>
            </div>

            {/* ── Add User Form ──────────────────────────────── */}
            {showAddUserModal && (
              <div className="card" style={{ marginBottom: 24, maxWidth: 600 }}>
                <h3 className="card-title" style={{ marginBottom: 12 }}>Add New User</h3>

                {userFormError && <div className="alert alert-error">{userFormError}</div>}
                {userFormSuccess && <div className="alert alert-success">{userFormSuccess}</div>}

                <form onSubmit={handleAddUserSubmit}>
                  <div className="form-group">
                    <label className="form-label">Full Name (20–60 chars)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      placeholder="e.g. Alexander Pierce"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="e.g. alex@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password (8–16 chars, 1 uppercase, 1 special)</label>
                    <input
                      type="password"
                      className="form-input"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder="e.g. AdminPass@123"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Address (optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={userForm.address}
                      onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                      placeholder="e.g. 123 Main St, New York"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    >
                      <option value="USER">Normal User</option>
                      <option value="ADMIN">System Admin</option>
                      <option value="STORE_OWNER">Store Owner</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={userFormLoading}>
                    {userFormLoading ? 'Creating User...' : 'Create User'}
                  </button>
                </form>
              </div>
            )}

            {/* ── Users Search & Filters ─────────────────────── */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="search-row" style={{ margin: 0 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by name..."
                  value={userFilters.name}
                  onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by email..."
                  value={userFilters.email}
                  onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })}
                />
                <select
                  className="form-select"
                  style={{ minWidth: 140 }}
                  value={userFilters.role}
                  onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                >
                  <option value="">All Roles</option>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="STORE_OWNER">Store Owner</option>
                </select>
              </div>
            </div>

            {/* ── User Details Modal ────────────────────────── */}
            {selectedUser && (
              <div className="card" style={{ marginBottom: 20, backgroundColor: 'var(--primary-light)', borderColor: '#93c5fd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="card-title">User Details: {selectedUser.name}</h3>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedUser(null)}>
                    ✕ Close
                  </button>
                </div>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Address:</strong> {selectedUser.address || 'N/A'}</p>
                <p><strong>Role:</strong> <span className={`badge badge-${selectedUser.role?.toLowerCase().replace('_', '')}`}>{selectedUser.role}</span></p>

                {selectedUser.stores && selectedUser.stores.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <strong>Owned Stores:</strong>
                    <ul style={{ paddingLeft: 20, marginTop: 4 }}>
                      {selectedUser.stores.map((s) => (
                        <li key={s.id}>
                          {s.name} — Rating: <strong>{s.avg_rating || 'N/A'}</strong> ({s.total_ratings} ratings)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ── Users Table ────────────────────────────────── */}
            {usersLoading ? (
              <div className="loading-text">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="card empty-state">No users match your filters.</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Address</th>
                      <th>Role</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>#{u.id}</td>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.address || 'N/A'}</td>
                        <td>
                          <span
                            className={`badge ${
                              u.role === 'ADMIN'
                                ? 'badge-admin'
                                : u.role === 'STORE_OWNER'
                                ? 'badge-owner'
                                : 'badge-user'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleViewUser(u.id)}
                            disabled={userDetailsLoading}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ======================================================
            TAB 2: STORE MANAGEMENT
           ====================================================== */}
        {activeTab === 'stores' && (
          <div>
            <div className="section-header">
              <h2 className="section-title">Stores List</h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setShowAddStoreModal(!showAddStoreModal);
                  setStoreFormError('');
                  setStoreFormSuccess('');
                }}
              >
                {showAddStoreModal ? 'Close Form' : '＋ Add Store'}
              </button>
            </div>

            {/* ── Add Store Form ─────────────────────────────── */}
            {showAddStoreModal && (
              <div className="card" style={{ marginBottom: 24, maxWidth: 600 }}>
                <h3 className="card-title" style={{ marginBottom: 12 }}>Add New Store</h3>

                {storeFormError && <div className="alert alert-error">{storeFormError}</div>}
                {storeFormSuccess && <div className="alert alert-success">{storeFormSuccess}</div>}

                <form onSubmit={handleAddStoreSubmit}>
                  <div className="form-group">
                    <label className="form-label">Store Name (20–60 chars)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={storeForm.name}
                      onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                      placeholder="e.g. Supermarket Grocery Store Branch"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Store Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={storeForm.email}
                      onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                      placeholder="e.g. contact@supermarket.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Store Address</label>
                    <input
                      type="text"
                      className="form-input"
                      value={storeForm.address}
                      onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                      placeholder="e.g. 456 Market Street, Suite 100"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Store Owner</label>
                    {storeOwners.length === 0 ? (
                      <div style={{ fontSize: 13, color: 'var(--danger)' }}>
                        No users with role &quot;STORE_OWNER&quot; found. Please add a Store Owner user first!
                      </div>
                    ) : (
                      <select
                        className="form-select"
                        value={storeForm.owner_id}
                        onChange={(e) => setStoreForm({ ...storeForm, owner_id: e.target.value })}
                      >
                        <option value="">Select an Owner...</option>
                        {storeOwners.map((owner) => (
                          <option key={owner.id} value={owner.id}>
                            {owner.name} ({owner.email})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={storeFormLoading || storeOwners.length === 0}
                  >
                    {storeFormLoading ? 'Creating Store...' : 'Create Store'}
                  </button>
                </form>
              </div>
            )}

            {/* ── Stores Filter ──────────────────────────────── */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="search-row" style={{ margin: 0 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by store name..."
                  value={storeFilters.name}
                  onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by store email..."
                  value={storeFilters.email}
                  onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })}
                />
              </div>
            </div>

            {/* ── Stores Table ──────────────────────────────── */}
            {storesLoading ? (
              <div className="loading-text">Loading stores...</div>
            ) : stores.length === 0 ? (
              <div className="card empty-state">No stores match your filters.</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Store Name</th>
                      <th>Email</th>
                      <th>Address</th>
                      <th>Owner</th>
                      <th>Avg Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((s) => (
                      <tr key={s.id}>
                        <td>#{s.id}</td>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td>{s.email}</td>
                        <td>{s.address}</td>
                        <td>{s.owner_name || `Owner #${s.owner_id}`}</td>
                        <td>
                          {s.avg_rating !== null && s.avg_rating !== undefined ? (
                            <span>
                              <span className="stars">★</span> {s.avg_rating} / 5 ({s.total_ratings})
                            </span>
                          ) : (
                            <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>No ratings</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

// src/pages/LoginPage.jsx
// ---------------------------------------------------------------
// Login Page
//
// What this page does:
//   1. Shows a form with Email and Password fields.
//   2. On submit, calls POST /api/auth/login via our api.js service.
//   3. If successful:
//      - Saves the JWT token to localStorage (key: "token")
//      - Saves the user object to localStorage (key: "user")
//      - Redirects to the correct dashboard based on the user's role:
//          ADMIN       → /admin
//          USER        → /dashboard
//          STORE_OWNER → /owner
//   4. If it fails, shows the error message returned by the backend.
//   5. Shows a loading state while the request is in progress.
// ---------------------------------------------------------------

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';

function LoginPage() {
  // ── Form field state ──────────────────────────────────────────
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  // ── UI state ──────────────────────────────────────────────────
  const [loading, setLoading]   = useState(false);  // true while waiting for backend
  const [error, setError]       = useState('');      // error message to show

  const navigate = useNavigate();

  // ── Form submit handler ───────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();      // prevent the browser from refreshing the page
    setError('');            // clear any previous error

    // Basic front-end validation (backend also validates, but this gives
    // faster feedback without a network round-trip)
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);  // show loading state on the button

    try {
      // Call POST /api/auth/login
      // loginUser() is defined in src/services/api.js
      const response = await loginUser(email, password);

      // The backend returns:
      // { success: true, data: { token, user: { id, name, email, role } } }
      const { token, user } = response.data.data;

      // Save token and user to localStorage so other pages can use them
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect based on the user's role
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'STORE_OWNER') {
        navigate('/owner');
      } else {
        // Default: USER role
        navigate('/dashboard');
      }

    } catch (err) {
      // The backend sends error messages in err.response.data.message
      // If the network is down, err.message will say "Network Error"
      const message =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);  // always stop the loading state
    }
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        {/* Page heading */}
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {/* Error message — only shown when error state is not empty */}
        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} noValidate>

          {/* Email field */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          {/* Password field */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {/* Submit button */}
          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

        </form>

        {/* Link to Register */}
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--gray-500)' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register">Create one here</Link>
        </p>

      </div>
    </div>
  );
}

export default LoginPage;

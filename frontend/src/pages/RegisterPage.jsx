
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from '../services/api';

function RegisterPage() {
  const [form, setForm] = useState({
    name:            '',
    email:           '',
    address:         '',
    password:        '',
    confirmPassword: '',
  });

  // ── UI state ──────────────────────────────────────────────────
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);  // true after registration works


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ── Front-end validation ──────────────────────────────────────

  const validate = () => {
    const { name, email, password, confirmPassword } = form;

    if (!name.trim()) return 'Name is required.';
    if (name.trim().length < 20) return 'Name must be at least 20 characters.';
    if (name.trim().length > 60) return 'Name must not exceed 60 characters.';

    if (!email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';

    if (!password) return 'Password is required.';
    if (password.length < 8)  return 'Password must be at least 8 characters.';
    if (password.length > 16) return 'Password must not exceed 16 characters.';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[^a-zA-Z0-9]/.test(password)) return 'Password must contain at least one special character (e.g. @, #, !).';

    if (!confirmPassword) return 'Please confirm your password.';
    if (password !== confirmPassword) return 'Passwords do not match.';

    return ''; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name:     form.name.trim(),
        email:    form.email.trim(),
        password: form.password,
        address:  form.address.trim() || undefined,  // optional field
      };

      await registerUser(payload);

      setSuccess(true);

    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <h1 className="auth-title">Account created!</h1>
          <div className="alert alert-success" style={{ marginTop: 16 }}>
            Your account has been created successfully. You can now sign in.
          </div>
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <Link to="/login" className="btn btn-primary">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main registration form ─────────────────────────────────────
  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        {/* Page heading */}
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Fill in the details below to register</p>

        {/* Error message */}
        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">
              Full Name <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(20–60 characters)</span>
            </label>
            <input
              id="reg-name"
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. John Michael Smith"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              Email address
            </label>
            <input
              id="reg-email"
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          {/* Address (optional) */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-address">
              Address <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="reg-address"
              type="text"
              name="address"
              className="form-input"
              placeholder="Your address"
              value={form.address}
              onChange={handleChange}
              autoComplete="street-address"
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">
              Password{' '}
              <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>
                (8–16 chars, 1 uppercase, 1 special character)
              </span>
            </label>
            <input
              id="reg-password"
              type="password"
              name="password"
              className="form-input"
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">
              Confirm Password
            </label>
            <input
              id="reg-confirm"
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          {/* Submit button */}
          <button
            id="reg-submit"
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

        </form>

        {/* Link back to Login */}
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--gray-500)' }}>
          Already have an account?{' '}
          <Link to="/login">Sign in here</Link>
        </p>

      </div>
    </div>
  );
}

export default RegisterPage;

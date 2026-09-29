
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';

function LoginPage() {
  // ── Form field state ──────────────────────────────────────────
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  // ── UI state ──────────────────────────────────────────────────
  const [loading, setLoading]   = useState(false); 
  const [error, setError]       = useState('');      

  const navigate = useNavigate();

  // ── Form submit handler ───────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();     
    setError('');            


    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);  

    try {

      const response = await loginUser(email, password);

      const { token, user } = response.data.data;

      // Save token and user to localStorage so other pages can use them
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

    
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'STORE_OWNER') {
        navigate('/owner');
      } else {
        // Default: USER role
        navigate('/dashboard');
      }

    } catch (err) {
   
      const message =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);  
    }
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

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

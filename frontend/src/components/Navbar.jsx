// src/components/Navbar.jsx
// ---------------------------------------------------------------
// Shared Navbar component — used by all three dashboards.
//
// What it does:
//   1. Reads the user's name from localStorage and displays it.
//   2. Shows the app brand/title on the left.
//   3. Has a Logout button that:
//      - Removes the token and user from localStorage
//      - Redirects to /login
//
// Props:
//   title — the page/section title shown on the left (optional)
// ---------------------------------------------------------------

import { useNavigate } from 'react-router-dom';

function Navbar({ title }) {
  const navigate = useNavigate();

  // Read the user from localStorage (saved during login)
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    // ignore parse errors
  }

  const handleLogout = () => {
    // Clear all stored auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login page
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Left side: App brand */}
        <span className="navbar-brand">
          {title || 'Store Rating App'}
        </span>

        {/* Right side: user info + logout */}
        <div className="navbar-right">
          {user && (
            <span className="navbar-user">
              Hello, <strong>{user.name}</strong>
            </span>
          )}
          <button
            id="logout-btn"
            className="btn btn-secondary btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;

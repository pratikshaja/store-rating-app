
import { useNavigate } from 'react-router-dom';

function Navbar({ title }) {
  const navigate = useNavigate();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    // ignore parse errors
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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

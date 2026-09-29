// src/components/PrivateRoute.jsx
// ---------------------------------------------------------------
// PrivateRoute — a route guard component.
//
// How it works:
//   1. Checks if a token exists in localStorage.
//   2. If there is a token AND the user's role matches the
//      allowedRoles list → show the page (children).
//   3. If there is NO token → redirect to /login.
//   4. If there IS a token but the wrong role → redirect to /login.
//
// Usage in App.jsx:
//   <PrivateRoute allowedRoles={['ADMIN']}>
//     <AdminDashboard />
//   </PrivateRoute>
// ---------------------------------------------------------------

import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, allowedRoles }) {
  // Read the stored token and user info from localStorage
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  // If no token → not logged in → go to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Parse the stored user object
  let user = null;
  try {
    user = JSON.parse(userStr);
  } catch {
    // If parsing fails, the stored data is corrupt → redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is provided, check that the user's role is in the list
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // User is logged in but has the wrong role → redirect to login
      return <Navigate to="/login" replace />;
    }
  }

  // All checks passed → render the protected page
  return children;
}

export default PrivateRoute;

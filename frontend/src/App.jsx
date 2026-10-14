// src/App.jsx
// ---------------------------------------------------------------
// Root component — defines all page routes.
//
// Routes:
//   /               → redirect to /login
//   /login          → Login page (public)
//   /register       → Register page (public)
//   /dashboard      → Normal User Dashboard (USER role only)
//   /admin          → Admin Dashboard (ADMIN role only)
//   /owner          → Store Owner Dashboard (STORE_OWNER role only)
//
// PrivateRoute wraps protected pages and enforces role-based access.
// ---------------------------------------------------------------

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import UserDashboard  from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import PrivateRoute   from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public routes ─────────────────────────────── */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Protected routes (role-based) ─────────────── */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['USER']}>
              <UserDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/owner"
          element={
            <PrivateRoute allowedRoles={['STORE_OWNER']}>
              <OwnerDashboard />
            </PrivateRoute>
          }
        />

        {/* ── Catch-all: redirect unknown paths to /login ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

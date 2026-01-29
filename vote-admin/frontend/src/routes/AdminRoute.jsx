import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Protect /admin/* routes so that only ADMIN role can access them.
// Non-admins (VOTER / OBSERVER / unauthenticated) are redirected
// to the public elections view.
const AdminRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user || user.role !== 'ADMIN') {
    return (
      <Navigate
        to="/elections/public"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
};

export default AdminRoute;
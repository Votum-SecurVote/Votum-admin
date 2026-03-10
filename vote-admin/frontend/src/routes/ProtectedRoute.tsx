import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, UserRole } from '../store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles = ['ADMIN', 'SUPER_ADMIN'],
  redirectTo = '/login',
}) => {
  const { user, isAuthenticated, hasRole } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

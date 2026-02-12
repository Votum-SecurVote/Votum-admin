import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Small route guard used in App.jsx
// Only lets users with a stored ADMIN token access /admin/*
const AdminRoute = () => {
  const stored = localStorage.getItem('auth');

  if (!stored) {
    // ❌ No login at all
    return <Navigate to="/login" replace />;
  }

  try {
    const { token, role } = JSON.parse(stored);

    // ❌ Token or role missing
    if (!token || role !== 'ADMIN') {
      return <Navigate to="/login" replace />;
    }

    // ✅ Logged in admin → allow access
    return <Outlet />;
  } catch (err) {
    // ❌ Corrupted storage
    return <Navigate to="/login" replace />;
  }
};

export default AdminRoute;

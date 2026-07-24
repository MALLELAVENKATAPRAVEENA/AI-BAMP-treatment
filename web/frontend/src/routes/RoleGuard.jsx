import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const RoleGuard = ({ allowedRoles }) => {
  const { role } = useAuth();
  if (role === 'Administrator' || allowedRoles.includes(role)) {
    return <Outlet />;
  }
  return <Navigate to="/dashboard" replace />;
};

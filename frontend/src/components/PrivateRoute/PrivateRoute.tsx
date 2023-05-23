import React from 'react';
import { Route, Navigate, RouteProps, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PrivateRoute({
  element: ElementComponent,
  ...rest
}: { element: React.ReactNode } & RouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return isAuthenticated ? (
    <Route {...rest} element={ElementComponent} />
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  );
}

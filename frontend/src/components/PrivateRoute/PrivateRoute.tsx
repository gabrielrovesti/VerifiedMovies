import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PrivateRouteProps {
  children: ReactNode;
  redirectTo: string;
}

export default function PrivateRoute({ children, redirectTo }: PrivateRouteProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate(redirectTo);
    return null; 
  }

  return <>{children}</>;
}

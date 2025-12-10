import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@modules/auth/providers/AuthProvider';
import Loader from '@shared/components/Loader';

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) return <Loader />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;

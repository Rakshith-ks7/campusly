import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
}

export const PublicOnlyRoute: React.FC<Props> = ({ children }) => {
  const { currentUser, onboardingCompleted, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (currentUser) {
    if (!onboardingCompleted) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

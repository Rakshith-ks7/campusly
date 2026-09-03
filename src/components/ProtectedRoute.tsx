import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export const ProtectedRoute: React.FC<Props> = ({ 
  children,
  requireOnboarding = true
}) => {
  const { currentUser, onboardingCompleted, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] border border-[#FFE4E6] flex items-center justify-center text-[#E63946] animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-[#262626]">Loading Campusly...</p>
          <p className="text-xs text-[#666666]">Verifying student authentication session</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login, remembering the page they tried to visit
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user hasn't completed onboarding yet, divert to /onboarding
  if (requireOnboarding && !onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

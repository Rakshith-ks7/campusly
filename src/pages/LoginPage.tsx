import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight 
} from 'lucide-react';
import { firestoreService } from '../services/firestoreService';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Target destination if redirected from ProtectedRoute
  const from = (location.state as any)?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const getFriendlyErrorMessage = (err: any): string => {
    const code = err?.code || '';
    if (
      code === 'auth/invalid-credential' || 
      code === 'auth/wrong-password' || 
      code === 'auth/invalid-login-credentials'
    ) {
      return 'Incorrect email or password. Please try again.';
    }
    if (code === 'auth/user-not-found') {
      return 'No account found with this email. Please sign up to create one.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many unsuccessful attempts. Please wait a few minutes before trying again.';
    }
    // Google Auth specific error codes (Requirements #5 & #12)
    if (code === 'auth/operation-not-allowed') {
      return 'Google Sign-In is not enabled in the Firebase Console. Please enable the Google provider under Authentication → Sign-in method in your Firebase Console.';
    }
    if (code === 'auth/unauthorized-domain') {
      return "Campusly's current domain is not authorized for Google sign-in. Please add localhost (or your Netlify domain) in Firebase Console → Authentication → Settings → Authorized domains.";
    }
    if (code === 'auth/popup-blocked') {
      return 'Your browser blocked the Google sign-in window. Please allow popups for Campusly and try again.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google sign-in was cancelled.';
    }
    if (code === 'auth/cancelled-popup-request') {
      return 'Another sign-in request is already in progress. Please complete or close it.';
    }
    if (code === 'auth/account-exists-with-different-credential') {
      return 'An account already exists with this email using a password. Please sign in with your email and password instead.';
    }
    if (code === 'auth/network-request-failed') {
      return 'Unable to connect to Google. Check your internet connection and try again.';
    }
    return err?.message || 'Unable to log in. Please check your credentials.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle();
      // Flow Check: Profile Setup vs Home (Requirements #6 & #15)
      const profile = await firestoreService.getStudentProfile(user.uid);
      if (!profile || !profile.onboardingCompleted) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate(from || '/', { replace: true });
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2">
          <img
            src="/campusly-logo.jpg"
            alt="Campusly Logo"
            className="w-12 h-12 object-contain rounded-xl border border-[#FFE4E6] p-0.5 bg-white shadow-xs"
          />
        </div>

        <div className="space-y-1">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#262626]">
            Welcome to <span className="text-[#E63946]">Campusly</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#666666]">
            Log in to access your university community, study groups, and project sprints
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          
          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[#262626] mb-1">
                University Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#999999] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campus.edu"
                  className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-[#262626] focus:outline-none focus:border-[#FECDD3] focus:ring-1 focus:ring-[#FECDD3]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-[#262626]">
                  Password *
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-[#E63946] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#999999] absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm text-[#262626] focus:outline-none focus:border-[#FECDD3] focus:ring-1 focus:ring-[#FECDD3]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#999999] hover:text-[#262626]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#E63946] hover:bg-[#D62839] disabled:opacity-60 text-white font-medium text-xs sm:text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Signing you in...</span>
              ) : (
                <>
                  <span>Sign In to Campusly</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-[#E5E5E5] w-full"></div>
            <span className="bg-white px-3 text-xs text-[#999999] uppercase tracking-wider">or</span>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading || googleLoading}
            className="w-full py-2.5 px-4 bg-white hover:bg-[#FFF8F8] disabled:opacity-60 border border-[#E5E5E5] rounded-xl text-xs sm:text-sm font-medium text-[#262626] transition flex items-center justify-center gap-2"
          >
            {googleLoading ? (
              <span className="flex items-center gap-2 text-[#E63946] font-semibold">
                <span className="w-4 h-4 border-2 border-[#E63946] border-t-transparent rounded-full animate-spin"></span>
                <span>Signing you in with Google...</span>
              </span>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Sign up prompt */}
          <div className="text-center pt-2">
            <span className="text-xs text-[#666666]">Don't have an account? </span>
            <Link to="/signup" className="text-xs font-semibold text-[#E63946] hover:underline">
              Create student account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

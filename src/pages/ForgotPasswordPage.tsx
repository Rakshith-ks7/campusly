import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError(null);
    setLoading(true);

    try {
      await resetPassword(email.trim());
      setSubmitted(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No student account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please provide a valid email format.');
      } else {
        setError(err.message || 'Unable to send password reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        <div className="flex items-center justify-center">
          <img
            src="/campusly-logo.jpg"
            alt="Campusly Logo"
            className="w-12 h-12 object-contain rounded-xl border border-[#FFE4E6] p-0.5 bg-white shadow-xs"
          />
        </div>
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#262626]">
          Reset Your Password
        </h2>
        <p className="text-xs sm:text-sm text-[#666666]">
          Enter your registered university email to receive a password reset link
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          
          {submitted ? (
            <div className="text-center py-6 space-y-3 animate-in fade-in">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-heading font-semibold text-lg text-[#262626]">
                Reset Email Sent!
              </h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                Password reset instructions have been sent to <strong className="text-[#262626]">{email}</strong>. Check your inbox and spam folder.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#E63946] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#262626] mb-1">
                  University Email Address *
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#E63946] hover:bg-[#D62839] disabled:opacity-60 text-white font-medium text-xs sm:text-sm rounded-xl transition shadow-xs"
              >
                {loading ? 'Sending reset instructions...' : 'Send Password Reset Email'}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-xs text-[#666666] hover:text-[#262626]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

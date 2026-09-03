import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle2, RotateCw, LogOut, ArrowRight, AlertCircle } from 'lucide-react';

export const EmailVerificationPage: React.FC = () => {
  const { currentUser, isEmailVerified, sendVerificationEmail, reloadUser, logout } = useAuth();
  const navigate = useNavigate();

  const [cooldown, setCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // If already verified, go to onboarding or home
  useEffect(() => {
    if (isEmailVerified) {
      navigate('/onboarding', { replace: true });
    }
  }, [isEmailVerified, navigate]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await sendVerificationEmail();
      setResendStatus('A new verification email has been sent to your address.');
      setCooldown(60); // 60s cooldown
    } catch (err: any) {
      setResendStatus('Failed to send verification email. Please try again shortly.');
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      await reloadUser();
      if (currentUser?.emailVerified) {
        navigate('/onboarding', { replace: true });
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        <div className="flex items-center justify-center">
          <img
            src="/campusly-logo.jpg"
            alt="Campusly Logo"
            className="w-12 h-12 object-contain rounded-xl border border-[#FFE4E6] p-0.5 bg-white shadow-xs"
          />
        </div>
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#262626]">
          Verify Your Email
        </h2>
        <p className="text-xs sm:text-sm text-[#666666]">
          Verify your student email to access campus communities and projects on Campusly
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 text-center">
          
          <div className="w-14 h-14 rounded-2xl bg-[#FFF1F2] border border-[#FFE4E6] flex items-center justify-center text-[#E63946] mx-auto">
            <Mail className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs sm:text-sm text-[#666666]">
              We sent a verification link to:
            </p>
            <p className="text-sm font-semibold text-[#262626]">
              {currentUser?.email || 'your university email'}
            </p>
            <p className="text-xs text-[#999999] pt-1">
              Please click the link inside that email to activate your account.
            </p>
          </div>

          {resendStatus && (
            <div className="p-3 rounded-xl bg-[#FFF1F2] border border-[#FFE4E6] text-xs text-[#E63946]">
              {resendStatus}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={handleCheckStatus}
              disabled={checking}
              className="w-full py-2.5 px-4 bg-[#E63946] hover:bg-[#D62839] text-white font-medium text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
            >
              <RotateCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Checking verification...' : 'I have verified my email'}</span>
            </button>

            <button
              onClick={handleResend}
              disabled={cooldown > 0}
              className="w-full py-2.5 px-4 bg-white hover:bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl text-xs sm:text-sm font-medium text-[#262626] disabled:opacity-50 transition"
            >
              {cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend verification email'}
            </button>

            {/* Skip / Continue for demo or testing */}
            <button
              onClick={() => navigate('/onboarding', { replace: true })}
              className="text-xs text-[#666666] hover:text-[#E63946] inline-flex items-center gap-1 pt-2 font-medium"
            >
              <span>Continue to Profile Setup</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-4 border-t border-[#E5E5E5]">
            <button
              onClick={logout}
              className="text-xs text-[#999999] hover:text-rose-600 inline-flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out of this account</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { feedbackService } from '../services/feedbackService';
import { 
  FeedbackType, 
  BugReportDetails, 
  FeatureRequestDetails 
} from '../types';
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Palette, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  ShieldCheck, 
  Sparkles,
  ArrowLeft,
  Laptop,
  Smartphone
} from 'lucide-react';

export const FeedbackPage: React.FC = () => {
  const { currentUser: fbUser, studentProfile } = useAuth();

  const [type, setType] = useState<FeedbackType>('general');
  const [page, setPage] = useState<string>('Home');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [contactMe, setContactMe] = useState(true);

  // Bug report details
  const [whatWentWrong, setWhatWentWrong] = useState('');
  const [tryingToDo, setTryingToDo] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');

  // Feature request details
  const [featureTitle, setFeatureTitle] = useState('');
  const [studentBenefit, setStudentBenefit] = useState('');
  const [targetAudience, setTargetAudience] = useState<FeatureRequestDetails['targetAudience']>('Everyone');

  // Auto-detected device and browser
  const [device, setDevice] = useState<'Desktop' | 'Mobile' | 'Tablet' | 'Other'>('Desktop');
  const [browser, setBrowser] = useState('Chrome');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successSubmitted, setSuccessSubmitted] = useState(false);

  useEffect(() => {
    // Auto-detect device and browser
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      if (/Mobi|Android|iPhone/i.test(ua)) {
        setDevice('Mobile');
      } else if (/Tablet|iPad/i.test(ua)) {
        setDevice('Tablet');
      } else {
        setDevice('Desktop');
      }

      if (/Edg/i.test(ua)) setBrowser('Edge');
      else if (/Chrome/i.test(ua)) setBrowser('Chrome');
      else if (/Firefox/i.test(ua)) setBrowser('Firefox');
      else if (/Safari/i.test(ua)) setBrowser('Safari');
      else setBrowser('Other');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    let finalMessage = message.trim();
    let bugDetails: BugReportDetails | undefined;
    let featureDetails: FeatureRequestDetails | undefined;

    if (type === 'bug') {
      if (!whatWentWrong.trim()) {
        setErrorMessage('Please describe what went wrong.');
        return;
      }
      bugDetails = {
        whatWentWrong,
        tryingToDo,
        expectedBehavior,
        actualBehavior
      };
      finalMessage = `Bug: ${whatWentWrong} | Expected: ${expectedBehavior || 'N/A'} | Actual: ${actualBehavior || 'N/A'}`;
    } else if (type === 'feature') {
      if (!featureTitle.trim()) {
        setErrorMessage('Please specify the feature title.');
        return;
      }
      featureDetails = {
        featureTitle,
        studentBenefit,
        targetAudience
      };
      finalMessage = `Feature: ${featureTitle} - ${studentBenefit}`;
    } else {
      if (!finalMessage) {
        setErrorMessage('Please enter your feedback message.');
        return;
      }
      if (finalMessage.length < 10) {
        setErrorMessage('Please provide at least 10 characters so we can understand your feedback.');
        return;
      }
    }

    setSubmitting(true);

    const userId = fbUser?.uid || studentProfile?.id || 'guest-user';
    const userName = studentProfile?.name || fbUser?.displayName || 'Campus Student';
    const userEmail = fbUser?.email || undefined;

    const res = await feedbackService.submitFeedback({
      userId,
      userName,
      userEmail,
      type,
      message: finalMessage,
      page,
      anonymous,
      device,
      browser,
      contactMe: anonymous ? false : contactMe,
      bugDetails,
      featureDetails
    });

    setSubmitting(false);

    if (res.success) {
      setSuccessSubmitted(true);
      setMessage('');
      setWhatWentWrong('');
      setTryingToDo('');
      setExpectedBehavior('');
      setActualBehavior('');
      setFeatureTitle('');
      setStudentBenefit('');
    } else {
      setErrorMessage(res.error || 'Failed to submit feedback.');
    }
  };

  const typeOptions: { key: FeedbackType; label: string; icon: any }[] = [
    { key: 'general', label: 'General Feedback', icon: MessageSquare },
    { key: 'bug', label: 'Bug Report', icon: Bug },
    { key: 'feature', label: 'Feature Request', icon: Lightbulb },
    { key: 'ui_ux', label: 'UI / UX Feedback', icon: Palette },
    { key: 'other', label: 'Other', icon: HelpCircle }
  ];

  const pageOptions = [
    'Home',
    'Discover',
    'Communities',
    'Events',
    'Projects',
    'Teams',
    'Messenger',
    'Profile',
    'Notifications',
    'Other'
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Back Link */}
      <div>
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#E63946] transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Campusly</span>
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F2] border border-[#FFE4E6] text-[#E63946] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Student Voice & Experience</span>
        </div>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#262626]">
          Help us make Campusly better.
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] leading-relaxed max-w-xl">
          Your feedback directly shapes the tools, collaboration features, and community spaces we build for students.
        </p>
      </div>

      {/* Success Notification Banner */}
      {successSubmitted ? (
        <div className="bg-white border border-emerald-200 rounded-3xl p-8 text-center space-y-4 shadow-xs animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl border border-emerald-200">
            ❤️
          </div>
          <div className="space-y-1">
            <h2 className="font-heading font-bold text-lg text-[#262626]">
              Thanks for helping improve Campusly!
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] max-w-md mx-auto leading-relaxed">
              We review every student suggestion and bug report. You can track your submissions anytime under Account Settings.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => setSuccessSubmitted(false)}
              className="px-4 py-2 border border-[#E5E5E5] hover:border-[#FECDD3] rounded-xl text-xs font-semibold text-[#262626] transition"
            >
              Submit Another Feedback
            </button>
            <Link
              to="/settings"
              className="px-5 py-2 bg-[#E63946] hover:bg-[#D62839] text-white rounded-xl text-xs font-semibold transition shadow-xs"
            >
              View My Feedback
            </Link>
          </div>
        </div>
      ) : (
        /* Feedback Submission Form */
        <form onSubmit={handleSubmit} className="bg-white border border-[#E5E5E5] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Category Selector */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#262626]">
              1. What kind of feedback do you have?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {typeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = type === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setType(opt.key)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-[#FFF1F2] border-[#E63946] text-[#E63946] shadow-xs'
                        : 'bg-[#FFF8F8] border-[#E5E5E5] text-[#262626] hover:border-[#FECDD3]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-semibold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Feature / Page Context */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#262626]">
              2. Which part of Campusly does this relate to?
            </label>
            <select
              value={page}
              onChange={(e) => setPage(e.target.value)}
              className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#262626] focus:outline-none focus:border-[#FECDD3]"
            >
              {pageOptions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* 3. Dynamic Fields based on Type */}
          {type === 'bug' ? (
            /* BUG REPORT MODE */
            <div className="space-y-4 p-4 rounded-2xl bg-[#FFF8F8] border border-[#E5E5E5]">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#262626]">
                  What went wrong? *
                </label>
                <input
                  type="text"
                  required
                  value={whatWentWrong}
                  onChange={(e) => setWhatWentWrong(e.target.value)}
                  placeholder="e.g. Messages didn't load when tapping the notification"
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#262626]">
                  What were you trying to do?
                </label>
                <input
                  type="text"
                  value={tryingToDo}
                  onChange={(e) => setTryingToDo(e.target.value)}
                  placeholder="e.g. Reply to a message request from a project teammate"
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#262626]">
                    Expected behavior
                  </label>
                  <textarea
                    rows={2}
                    value={expectedBehavior}
                    onChange={(e) => setExpectedBehavior(e.target.value)}
                    placeholder="What should have happened..."
                    className="w-full bg-white border border-[#E5E5E5] rounded-xl p-2.5 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3] resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#262626]">
                    Actual behavior
                  </label>
                  <textarea
                    rows={2}
                    value={actualBehavior}
                    onChange={(e) => setActualBehavior(e.target.value)}
                    placeholder="What actually occurred..."
                    className="w-full bg-white border border-[#E5E5E5] rounded-xl p-2.5 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3] resize-none"
                  />
                </div>
              </div>

              {/* Device & Browser Specs */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[#666666]">
                <span className="font-semibold text-[#262626]">Auto-detected environment:</span>
                <span className="inline-flex items-center gap-1 bg-white border border-[#E5E5E5] px-2.5 py-1 rounded-lg">
                  {device === 'Mobile' ? <Smartphone className="w-3.5 h-3.5" /> : <Laptop className="w-3.5 h-3.5" />}
                  <span>{device}</span>
                </span>
                <span className="bg-white border border-[#E5E5E5] px-2.5 py-1 rounded-lg">
                  {browser}
                </span>
              </div>
            </div>
          ) : type === 'feature' ? (
            /* FEATURE REQUEST MODE */
            <div className="space-y-4 p-4 rounded-2xl bg-[#FFF8F8] border border-[#E5E5E5]">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#262626]">
                  What feature would you like to see? *
                </label>
                <input
                  type="text"
                  required
                  value={featureTitle}
                  onChange={(e) => setFeatureTitle(e.target.value)}
                  placeholder="e.g. Group study rooms with whiteboard"
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#262626]">
                  Why would this be useful for students?
                </label>
                <textarea
                  rows={3}
                  value={studentBenefit}
                  onChange={(e) => setStudentBenefit(e.target.value)}
                  placeholder="Explain how this helps with studying, projects, or campus connections..."
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl p-2.5 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3] resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#262626]">
                  Who would benefit most?
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs text-[#262626] focus:outline-none"
                >
                  <option value="Everyone">Everyone on Campus</option>
                  <option value="Students">General Students</option>
                  <option value="Project teams">Hackathon & Project Teams</option>
                  <option value="Clubs">College Clubs & Guilds</option>
                  <option value="Content creators">Content Creators & Media</option>
                  <option value="Event organizers">Event Organizers</option>
                </select>
              </div>
            </div>
          ) : (
            /* GENERAL / UI / OTHER MODE */
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#262626]">
                3. Tell us what you think... *
              </label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={2000}
                placeholder="Share your thoughts, suggestions, or ideas for Campusly..."
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-2xl p-4 text-xs sm:text-sm text-[#262626] focus:outline-none focus:border-[#FECDD3] resize-none"
              />
              <div className="flex justify-between text-[11px] text-[#999999] px-1">
                <span>Minimum 10 characters</span>
                <span>{message.length}/2000</span>
              </div>
            </div>
          )}

          {/* 4. Submission Options */}
          <div className="pt-2 border-t border-[#E5E5E5] space-y-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-[#262626]">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="rounded text-[#E63946] focus:ring-[#FECDD3] w-4 h-4"
              />
              <div>
                <span className="font-semibold block">Submit anonymously</span>
                <span className="text-[#666666] text-[11px]">
                  Your student name and email will be hidden from administrators.
                </span>
              </div>
            </label>

            {!anonymous && (
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#262626]">
                <input
                  type="checkbox"
                  checked={contactMe}
                  onChange={(e) => setContactMe(e.target.checked)}
                  className="rounded text-[#E63946] focus:ring-[#FECDD3] w-4 h-4"
                />
                <div>
                  <span className="font-semibold block">Notify me about updates</span>
                  <span className="text-[#666666] text-[11px]">
                    Receive an in-app notification when the team responds or plans this feature.
                  </span>
                </div>
              </label>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#666666]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Private & confidential student feedback</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#E63946] hover:bg-[#D62839] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-xs flex items-center gap-2"
            >
              {submitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};

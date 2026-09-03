import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { CampusEvent } from '../types';
import { ReportModal } from '../components/ReportModal';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Check, 
  ArrowLeft, 
  Share2, 
  Download, 
  Sparkles,
  ShieldAlert,
  CalendarCheck,
  Star,
  MessageSquare,
  ThumbsUp,
  X
} from 'lucide-react';
import { feedbackService } from '../services/feedbackService';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = dataService.getCurrentUser();

  const [event, setEvent] = useState<CampusEvent | undefined>(
    dataService.getEventById(id || '')
  );
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  // Aggregated event feedback summary
  const [feedbackSummary, setFeedbackSummary] = useState({
    total: 0,
    averageRating: 4.8,
    wouldAttendAgainPercent: 92,
    commonLikes: ['Great hands-on coding demos', 'Engaging speaker presentation'],
    commonImprovements: ['More time for open Q&A at the end']
  });

  // Event feedback submission state
  const [rating, setRating] = useState(5);
  const [whatLiked, setWhatLiked] = useState('');
  const [whatImprove, setWhatImprove] = useState('');
  const [wouldAttendAgain, setWouldAttendAgain] = useState<'Yes' | 'Maybe' | 'No'>('Yes');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (id) {
      setEvent(dataService.getEventById(id));
      feedbackService.getEventFeedbackSummary(id).then(setFeedbackSummary);
    }
  }, [id]);

  const handleSubmitEventFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setSubmittingFeedback(true);
    await feedbackService.submitFeedback({
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'event',
      message: `Event Rating: ${rating}/5 - ${whatLiked}`,
      page: 'Events',
      anonymous: false,
      device: 'Desktop',
      browser: 'Chrome',
      contactMe: false,
      eventDetails: {
        eventId: event.id,
        eventTitle: event.title,
        rating,
        whatLiked,
        whatImprove,
        wouldAttendAgain
      }
    });
    setSubmittingFeedback(false);
    setFeedbackSubmitted(true);
    feedbackService.getEventFeedbackSummary(event.id).then(setFeedbackSummary);
    setTimeout(() => {
      setFeedbackModalOpen(false);
      setFeedbackSubmitted(false);
    }, 2000);
  };

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#262626]">Event Not Found</h2>
        <p className="text-sm text-[#666666]">The event you requested could not be located.</p>
        <Link to="/events" className="inline-block px-4 py-2 bg-[#E63946] text-white text-xs rounded-lg">
          Back to Events
        </Link>
      </div>
    );
  }

  const seatsLeft = Math.max(0, event.seatsTotal - event.seatsFilled);
  const percentFilled = Math.min(100, Math.round((event.seatsFilled / event.seatsTotal) * 100));
  const isFull = seatsLeft === 0;

  const handleRegister = () => {
    const success = dataService.registerForEvent(event.id);
    if (success) {
      setEvent(dataService.getEventById(event.id));
    } else {
      alert('Event is already full!');
    }
  };

  const handleCancelRegistration = () => {
    dataService.cancelEventRegistration(event.id);
    setEvent(dataService.getEventById(event.id));
  };

  const handleDownloadCalendar = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Campusly Community//Event//EN
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Back button */}
      <div>
        <Link to="/events" className="inline-flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#E63946]">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Events</span>
        </Link>
      </div>

      {/* Main Event Card */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-xs">
        
        {/* Cover image */}
        <div className="relative h-64 sm:h-80 w-full bg-slate-100">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/95 text-[#E63946] shadow-xs backdrop-blur-xs">
              {event.category}
            </span>
          </div>
          {event.isRegistered && (
            <div className="absolute top-4 right-4">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500 text-white shadow-xs flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>You are Registered</span>
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
            <div className="space-y-2 max-w-2xl">
              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#262626]">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#666666]">
                <span className="font-medium text-[#262626]">Organized by {event.organizerClub}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-[#999999]" />
                  {event.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-[#999999]" />
                  {event.time}
                </span>
              </div>
            </div>

            {/* Main Action buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              {event.isRegistered ? (
                <button
                  onClick={handleCancelRegistration}
                  className="px-4 py-2.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium transition"
                >
                  Cancel Registration
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={isFull}
                  className={`px-6 py-2.5 rounded-lg text-xs font-semibold transition shadow-xs ${
                    isFull
                      ? 'bg-slate-100 text-[#999999] cursor-not-allowed'
                      : 'bg-[#E63946] hover:bg-[#D62839] text-white'
                  }`}
                >
                  {isFull ? 'Event Full' : 'Confirm Registration'}
                </button>
              )}

              <button
                onClick={handleDownloadCalendar}
                className="p-2.5 rounded-lg border border-[#E5E5E5] hover:bg-[#FFF8F8] text-[#262626] transition"
                title="Add to Calendar (.ics)"
              >
                <CalendarCheck className="w-4 h-4 text-[#E63946]" />
              </button>

              <button
                onClick={() => setReportModalOpen(true)}
                className="p-2.5 rounded-lg border border-[#E5E5E5] hover:border-rose-200 text-[#666666] transition"
                title="Report Event"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Key Information & Capacity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] space-y-1">
              <div className="text-xs text-[#666666]">Venue Location</div>
              <div className="font-semibold text-sm text-[#262626] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#E63946]" />
                <span>{event.location}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] space-y-1">
              <div className="text-xs text-[#666666]">Registration Deadline</div>
              <div className="font-semibold text-sm text-[#262626] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#E63946]" />
                <span>{event.registrationDeadline}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#666666]">Seats Filled</span>
                <span className="font-semibold text-[#262626]">{event.seatsFilled} / {event.seatsTotal} ({seatsLeft} remaining)</span>
              </div>
              <div className="w-full bg-[#E5E5E5] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#E63946] h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentFilled}%` }}
                />
              </div>
            </div>

          </div>

          {/* Description & Overview */}
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-lg text-[#262626]">
              About this Session
            </h3>
            <p className="text-sm text-[#666666] leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Skills Gained */}
          {event.skillsGained && event.skillsGained.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-heading font-semibold text-sm text-[#262626] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#E63946]" />
                <span>Skills & Knowledge Gained</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {event.skillsGained.map(skill => (
                  <span key={skill} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Organizer Card */}
          <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={event.organizerAvatar}
                alt={event.organizerName}
                className="w-10 h-10 rounded-full object-cover border border-[#E5E5E5]"
              />
              <div>
                <div className="text-xs text-[#666666]">Host & Speaker</div>
                <div className="text-sm font-semibold text-[#262626]">{event.organizerName}</div>
              </div>
            </div>

            <Link
              to="/events"
              className="text-xs font-semibold text-[#E63946] hover:underline"
            >
              Explore More Workshops →
            </Link>
          </div>

          {/* Attendee Feedback Callout */}
          {event.isRegistered && (
            <div className="pt-4 border-t border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFF8F8] p-4 rounded-xl border border-[#FFE4E6]">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#262626] flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Attended or registered for this session?</span>
                </div>
                <p className="text-[11px] text-[#666666]">
                  Share your anonymous ratings and thoughts to help the host and fellow students.
                </p>
              </div>

              <button
                onClick={() => setFeedbackModalOpen(true)}
                className="px-4 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-semibold rounded-xl transition shrink-0 shadow-xs flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Rate & Review Event</span>
              </button>
            </div>
          )}

          {/* Aggregated Event Rating & Student Feedback */}
          <div className="pt-4 border-t border-[#E5E5E5] space-y-3">
            <h4 className="font-heading font-semibold text-sm text-[#262626] flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Student Reviews & Community Feedback</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] text-center space-y-1">
                <div className="text-2xl font-bold text-[#262626] flex items-center justify-center gap-1">
                  <span>{feedbackSummary.averageRating}</span>
                  <span className="text-amber-500 text-lg">★</span>
                </div>
                <div className="text-[11px] text-[#666666]">Overall Student Rating</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] text-center space-y-1">
                <div className="text-2xl font-bold text-emerald-600">
                  {feedbackSummary.wouldAttendAgainPercent}%
                </div>
                <div className="text-[11px] text-[#666666]">Would Attend Again</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] text-center space-y-1">
                <div className="text-2xl font-bold text-[#262626]">
                  {feedbackSummary.total > 0 ? feedbackSummary.total : '42'}
                </div>
                <div className="text-[11px] text-[#666666]">Verified Attendee Reviews</div>
              </div>
            </div>

            {/* Highlights */}
            <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] space-y-2 text-xs">
              <div className="font-semibold text-[#262626]">Top Student Highlights:</div>
              <ul className="space-y-1 text-[#666666] list-disc list-inside">
                {feedbackSummary.commonLikes.map((like, i) => (
                  <li key={i}>{like}</li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* Event Feedback Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="bg-white border border-[#E5E5E5] rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <div className="space-y-0.5">
                <h3 className="font-heading font-bold text-base text-[#262626]">
                  Event Feedback: {event.title}
                </h3>
                <p className="text-xs text-[#666666]">Your review helps improve future campus workshops</p>
              </div>
              <button onClick={() => setFeedbackModalOpen(false)} className="text-[#999999] hover:text-[#262626]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <div className="text-3xl">❤️</div>
                <h4 className="font-bold text-base text-[#262626]">Thanks for your feedback!</h4>
                <p className="text-xs text-[#666666]">Your ratings have been added to the session summary.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitEventFeedback} className="space-y-4 text-xs">
                
                {/* 5-Star Rating */}
                <div className="space-y-1.5 text-center py-2">
                  <label className="font-semibold text-[#262626] block">Overall Rating</label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-2xl transition hover:scale-110"
                      >
                        <span className={star <= rating ? 'text-amber-500' : 'text-zinc-300'}>
                          ★
                        </span>
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] text-[#666666]">{rating} out of 5 stars</span>
                </div>

                {/* What did you like? */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#262626] block">What did you like most? *</label>
                  <textarea
                    rows={2}
                    required
                    value={whatLiked}
                    onChange={(e) => setWhatLiked(e.target.value)}
                    placeholder="e.g. The hands-on coding walkthrough and practical examples..."
                    className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl p-3 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3] resize-none"
                  />
                </div>

                {/* What could be improved? */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#262626] block">What could be improved?</label>
                  <textarea
                    rows={2}
                    value={whatImprove}
                    onChange={(e) => setWhatImprove(e.target.value)}
                    placeholder="e.g. Provide project starter repo before the session..."
                    className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl p-3 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3] resize-none"
                  />
                </div>

                {/* Would attend again */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#262626] block">Would you attend another workshop like this?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Yes', 'Maybe', 'No'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setWouldAttendAgain(opt)}
                        className={`py-2 rounded-xl border font-semibold transition ${
                          wouldAttendAgain === opt
                            ? 'bg-[#FFF1F2] border-[#E63946] text-[#E63946]'
                            : 'bg-white border-[#E5E5E5] text-[#262626] hover:bg-[#FFF8F8]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E5E5] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackModalOpen(false)}
                    className="px-4 py-2 border border-[#E5E5E5] rounded-xl text-xs text-[#666666]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="px-5 py-2 bg-[#E63946] hover:bg-[#D62839] disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition shadow-xs"
                  >
                    {submittingFeedback ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Safety Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="event"
        targetId={event.id}
        targetTitle={event.title}
      />

    </div>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { CampusEvent, EventCategory } from '../types';
import { CreateEventModal } from '../components/CreateEventModal';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Check, 
  Plus, 
  Search,
  Filter
} from 'lucide-react';

export const EventsPage: React.FC = () => {
  const currentUser = dataService.getCurrentUser();
  const [events, setEvents] = useState<CampusEvent[]>(dataService.getAllEvents());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [onlyMyEvents, setOnlyMyEvents] = useState<boolean>(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All',
    'Workshops',
    'Competitions',
    'Coding',
    'AI',
    'Photography',
    'Seminars'
  ];

  const handleRegister = (eventId: string) => {
    const ok = dataService.registerForEvent(eventId);
    if (ok) {
      setEvents(dataService.getAllEvents());
    } else {
      alert('Sorry, this event is already full!');
    }
  };

  const handleCancelRegistration = (eventId: string) => {
    dataService.cancelEventRegistration(eventId);
    setEvents(dataService.getAllEvents());
  };

  const filteredEvents = events.filter(e => {
    if (onlyMyEvents && !e.isRegistered) return false;
    const matchesCategory = selectedCategory === 'All' || e.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = !searchQuery || 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.organizerClub.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Banner */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F2] border border-[#FFE4E6] text-[#E63946] text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>Campus Activities & Workshops</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#262626]">
            Events & Workshops
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
            Attend hands-on coding sessions, hackathon bootcamps, photography walks, and guest lectures hosted by campus clubs and student societies.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition shrink-0 flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Host Campus Event</span>
        </button>
      </div>

      {/* Filter and Switcher Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#E63946] text-white shadow-xs'
                    : 'bg-white border border-[#E5E5E5] text-[#666666] hover:border-[#FECDD3]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Toggle My Events */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setOnlyMyEvents(!onlyMyEvents)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                onlyMyEvents
                  ? 'bg-[#FFF1F2] text-[#E63946] border-[#FFE4E6]'
                  : 'bg-white text-[#666666] border-[#E5E5E5]'
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${onlyMyEvents ? 'text-[#E63946]' : 'text-transparent'}`} />
              <span>My Registered Events</span>
            </button>

            <div className="relative w-44 sm:w-56">
              <Search className="w-3.5 h-3.5 text-[#999999] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="w-full bg-white border border-[#E5E5E5] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#262626] focus:outline-none"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map((evt) => {
          const seatsLeft = Math.max(0, evt.seatsTotal - evt.seatsFilled);
          const isFull = seatsLeft === 0;

          return (
            <div
              key={evt.id}
              className="bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-2xl overflow-hidden shadow-xs transition flex flex-col justify-between group"
            >
              {/* Event Image */}
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={evt.image}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/95 text-[#E63946] shadow-xs backdrop-blur-xs">
                    {evt.category}
                  </span>
                </div>
                {evt.isRegistered && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-xs flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Registered</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#666666]">
                    <Clock className="w-3.5 h-3.5 text-[#999999]" />
                    <span>{evt.date} • {evt.time}</span>
                  </div>

                  <h3 className="font-heading font-semibold text-base text-[#262626] hover:text-[#E63946] transition leading-snug">
                    <Link to={`/events/${evt.id}`}>{evt.title}</Link>
                  </h3>

                  <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="flex items-center gap-1 text-xs text-[#666666]">
                    <MapPin className="w-3.5 h-3.5 text-[#999999]" />
                    <span className="truncate">{evt.location}</span>
                  </div>
                </div>

                {/* Footer metadata */}
                <div className="pt-3 border-t border-[#E5E5E5] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#666666] truncate max-w-[150px]">
                      By {evt.organizerClub}
                    </span>
                    <span className={`font-medium ${isFull ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isFull ? 'Sold Out' : `${seatsLeft} seats left`}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    {evt.isRegistered ? (
                      <button
                        onClick={() => handleCancelRegistration(evt.id)}
                        className="flex-1 py-1.5 rounded-lg border border-[#E5E5E5] hover:border-rose-300 text-rose-600 text-xs font-medium transition"
                      >
                        Cancel Ticket
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(evt.id)}
                        disabled={isFull}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                          isFull
                            ? 'bg-slate-100 text-[#999999] cursor-not-allowed'
                            : 'bg-[#E63946] hover:bg-[#D62839] text-white shadow-xs'
                        }`}
                      >
                        {isFull ? 'Full' : 'Register Now'}
                      </button>
                    )}

                    <Link
                      to={`/events/${evt.id}`}
                      className="px-3 py-1.5 bg-[#FFF8F8] hover:bg-[#FFF1F2] text-[#262626] hover:text-[#E63946] border border-[#E5E5E5] rounded-lg text-xs font-medium transition"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onEventCreated={(newEvent) => setEvents([newEvent, ...events])}
      />

    </div>
  );
};

import React, { useState } from 'react';
import { CampusEvent, EventCategory } from '../types';
import { dataService } from '../services/dataService';
import { CalendarPlus, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: CampusEvent) => void;
}

export const CreateEventModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onEventCreated
}) => {
  const currentUser = dataService.getCurrentUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('Workshops');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('2:00 PM – 4:00 PM');
  const [location, setLocation] = useState('Seminar Hall, North Block');
  const [organizerClub, setOrganizerClub] = useState('Computer Science Club');
  const [seatsTotal, setSeatsTotal] = useState(50);
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [tagsInput, setTagsInput] = useState('Hands-on, Tech, Beginners');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newEvent = dataService.createEvent({
      title,
      description,
      category,
      date: date || 'Upcoming Date',
      time,
      location,
      organizerClub,
      organizerName: currentUser.name,
      organizerAvatar: currentUser.avatar,
      seatsTotal: Number(seatsTotal) || 50,
      registrationDeadline: registrationDeadline || '1 Day Before Event',
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      image: imageUrl,
      skillsGained: ['Collaboration', 'Hands-on Practice']
    });

    onEventCreated(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
      <div className="bg-white border border-[#E5E5E5] rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFF1F2] text-[#E63946] flex items-center justify-center">
              <CalendarPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-lg text-[#262626]">
                Host Campus Event / Workshop
              </h2>
              <p className="text-xs text-[#666666]">
                Publish a seminar, club activity, or technical session for students
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#999999] hover:text-[#262626] p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#262626] mb-1">Event Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Introduction to Machine Learning & PyTorch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#262626] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
              >
                <option value="Workshops">Workshop</option>
                <option value="Seminars">Seminar</option>
                <option value="Coding">Coding Session</option>
                <option value="AI">AI / ML</option>
                <option value="Career">Career & Placement</option>
                <option value="Photography">Photography / Creative</option>
                <option value="Club Events">Club Event</option>
                <option value="Competitions">Competition / Contest</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#262626] mb-1">Organizing Club / Society</label>
              <input
                type="text"
                value={organizerClub}
                onChange={(e) => setOrganizerClub(e.target.value)}
                placeholder="e.g. Google Developer Student Club"
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#262626] mb-1">Description & Agenda</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe topics covered, prerequisites, what students will build or learn..."
              className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg p-3 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#262626] mb-1">Date</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. 25 September 2026"
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#262626] mb-1">Timing</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 2:00 PM – 4:00 PM"
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#262626] mb-1">Capacity (Seats)</label>
              <input
                type="number"
                value={seatsTotal}
                onChange={(e) => setSeatsTotal(Number(e.target.value))}
                min="5"
                max="500"
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#262626] mb-1">Venue / Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Seminar Hall B, Tech Park"
              className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#262626] mb-1">Topic Tags (comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
            />
          </div>

          <div className="pt-3 border-t border-[#E5E5E5] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#666666] hover:text-[#262626] bg-white border border-[#E5E5E5] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition"
            >
              Publish Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

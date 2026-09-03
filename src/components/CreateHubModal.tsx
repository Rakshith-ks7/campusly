import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { Community, CommunityCategory } from '../types';
import { 
  X, 
  Sparkles, 
  Plus, 
  Compass, 
  Check, 
  Tag, 
  ShieldCheck,
  Layers
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onHubCreated?: (hub: Community) => void;
}

const PRESET_EMOJIS = [
  '💻', '🤖', '📚', '🎥', '🚀', '♟️', '🤝', '🎨', 
  '⚡', '💡', '🎮', '🎵', '🔬', '📊', '🏸', '🎸'
];

const CATEGORIES: CommunityCategory[] = [
  'Programming',
  'AI & Data',
  'Exam & Academic',
  'Content & Media',
  'Robotics & Hardware',
  'Social & Hobbies',
  'Entrepreneurship',
  'Design & Creative'
];

export const CreateHubModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onHubCreated
}) => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🚀');
  const [category, setCategory] = useState<CommunityCategory>('Programming');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Campus', 'Students']);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a name for your Campus Hub.');
      return;
    }

    if (!description.trim() && !tagline.trim()) {
      setError('Please provide a short description or tagline for the hub.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullDesc = tagline.trim() 
        ? `${tagline.trim()} — ${description.trim() || 'A student community for collaboration, learning, and projects.'}`
        : description.trim();

      const newHub = dataService.createCommunity({
        name: name.trim(),
        description: fullDesc,
        category,
        emoji: selectedEmoji,
        tags: tags.length > 0 ? tags : [category],
        rules: [
          'Respect fellow students and encourage peer learning',
          'No spam, promotions, or irrelevant links',
          'Keep discussions focused on hub goals'
        ]
      });

      if (onHubCreated) {
        onHubCreated(newHub);
      }

      onClose();
      // Navigate to the newly created hub
      navigate(`/communities/${newHub.id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to create Campus Hub. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white border border-[#E5E5E5] rounded-2xl w-full max-w-xl shadow-xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5] bg-[#FFF8F8]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFE4E6] border border-[#FECDD3] flex items-center justify-center text-lg">
              {selectedEmoji}
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-[#262626] flex items-center gap-1.5">
                <span>Create a Campus Hub</span>
                <Sparkles className="w-3.5 h-3.5 text-[#E63946]" />
              </h2>
              <p className="text-xs text-[#666666]">
                Launch a collaborative space for students around a topic or passion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#999999] hover:text-[#262626] hover:bg-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Error notice */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Emoji / Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#262626] mb-1.5">
              Choose Hub Icon
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {PRESET_EMOJIS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition border ${
                    selectedEmoji === emoji
                      ? 'bg-[#FFF1F2] border-[#E63946] scale-110 shadow-xs'
                      : 'bg-white border-[#E5E5E5] hover:border-[#FECDD3]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Hub Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#262626] mb-1">
                Hub Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Robotics & AI Guild"
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3] focus:ring-1 focus:ring-[#FECDD3]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#262626] mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CommunityCategory)}
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3] focus:ring-1 focus:ring-[#FECDD3]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tagline / Subtitle */}
          <div>
            <label className="block text-xs font-semibold text-[#262626] mb-1">
              Short Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Build autonomous robots and ROS projects together"
              className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3] focus:ring-1 focus:ring-[#FECDD3]"
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-semibold text-[#262626] mb-1">
              About This Hub
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what members will do, frequency of meetups, projects, or study goals..."
              className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl p-3 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3] focus:ring-1 focus:ring-[#FECDD3] resize-none"
            />
          </div>

          {/* Focus Tags */}
          <div>
            <label className="block text-xs font-semibold text-[#262626] mb-1">
              Topics & Focus Tags
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add a topic (e.g. Arduino, C++, Computer Vision)"
                className="flex-1 bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl px-3 py-1.5 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E63946] border border-[#FFE4E6] rounded-xl text-xs font-semibold transition"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E5E5E5] text-[11px] text-[#262626] font-medium"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-[#999999] hover:text-[#E63946] ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Guidelines Banner */}
          <div className="p-3 bg-[#FFF8F8] rounded-xl border border-[#FFE4E6] flex items-start gap-2 text-[11px] text-[#666666]">
            <ShieldCheck className="w-4 h-4 text-[#E63946] shrink-0 mt-0.5" />
            <span>
              You will automatically become the founding lead. All verified campus students can discover, join, and post discussions in your hub.
            </span>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#666666] hover:text-[#262626] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#E63946] hover:bg-[#D62839] disabled:opacity-60 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Creating Hub...</span>
              ) : (
                <>
                  <span>Create Campus Hub</span>
                  <Plus className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

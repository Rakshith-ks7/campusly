import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Community, CommunityCategory } from '../types';
import { Users, Sparkles } from 'lucide-react';

interface Props {
  community: Community;
  className?: string;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'Programming': '💻',
  'AI & Data': '🤖',
  'Exam & Academic': '📚',
  'Content & Media': '🎥',
  'Robotics & Hardware': '🦾',
  'Social & Hobbies': '🤝',
  'Entrepreneurship': '🚀',
  'Design & Creative': '🎨'
};

export const CommunityCard: React.FC<Props> = ({ community, className = '' }) => {
  const [imageError, setImageError] = useState(false);

  // Normalize image source: must be a valid URL string starting with http, https, or /
  const candidateUrl = community.image || (
    community.avatar && (community.avatar.startsWith('http://') || community.avatar.startsWith('https://') || community.avatar.startsWith('/'))
      ? community.avatar
      : ''
  );

  const hasValidImageUrl = Boolean(candidateUrl && !imageError);
  const fallbackEmoji = CATEGORY_EMOJIS[community.category] || (community.avatar && !community.avatar.startsWith('http') ? community.avatar : '🏛️');

  return (
    <Link
      to={`/communities/${community.id}`}
      className={`community-card group bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col hover:-translate-y-0.5 ${className}`}
    >
      {/* Community Image Container (150-180px height, object-fit cover, overflow hidden) */}
      <div className="community-image w-full h-[155px] sm:h-[170px] bg-[#FFF8F8] relative overflow-hidden shrink-0">
        {hasValidImageUrl ? (
          <img
            src={candidateUrl}
            alt={`${community.name} community`}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          /* Safe Fallback: Soft pink placeholder + Category Icon */
          <div className="w-full h-full bg-[#FFF1F2] border-b border-[#FFE4E6] flex flex-col items-center justify-center p-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#FFE4E6] flex items-center justify-center text-2xl shadow-xs mb-1 group-hover:scale-110 transition-transform">
              {fallbackEmoji}
            </div>
          </div>
        )}

        {/* Category Pill Tag */}
        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 backdrop-blur-xs text-[#E63946] border border-[#FFE4E6] shadow-xs">
          {community.category}
        </span>
      </div>

      {/* Community Content */}
      <div className="community-content p-4 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          <h3 className="font-heading font-bold text-sm sm:text-base text-[#262626] group-hover:text-[#E63946] transition line-clamp-1">
            {community.name}
          </h3>

          <p className="text-xs text-[#666666] font-medium flex items-center gap-1.5">
            <Users className="w-3 h-3 text-[#999999]" />
            <span>{community.memberCount} members</span>
            <span className="text-[#D1D5DB]">•</span>
            <span>{community.category}</span>
          </p>

          {community.description && (
            <p className="text-[11px] text-[#777777] line-clamp-2 leading-relaxed pt-0.5">
              {community.description}
            </p>
          )}
        </div>

        {/* Tags footer if available */}
        {community.tags && community.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t border-[#F3F4F6]">
            {community.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-md bg-[#FFF8F8] text-[#666666] border border-[#F3F4F6] font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

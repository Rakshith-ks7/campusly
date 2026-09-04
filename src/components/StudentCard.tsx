import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StudentProfile } from '../types';
import { UserPlus, UserCheck, MessageSquare } from 'lucide-react';
import { followService } from '../services/followService';

interface Props {
  student: StudentProfile;
  currentStudentId?: string;
  currentUser?: StudentProfile;
  isFollowing?: boolean;
  onFollowChange?: (targetStudentId: string, isNowFollowing: boolean) => void;
  onMessageClick?: (student: StudentProfile) => void;
  className?: string;
}

export const StudentCard: React.FC<Props> = ({
  student,
  currentStudentId,
  currentUser,
  isFollowing = false,
  onFollowChange,
  onMessageClick,
  className = '',
}) => {
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Sync state if prop changes
  React.useEffect(() => {
    setFollowing(isFollowing);
  }, [isFollowing]);

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentStudentId || currentStudentId === student.id || loading) return;

    setLoading(true);
    const nextState = !following;
    setFollowing(nextState);

    try {
      if (nextState) {
        await followService.followUser(currentStudentId, student.id, currentUser, student);
      } else {
        await followService.unfollowUser(currentStudentId, student.id);
      }
      onFollowChange?.(student.id, nextState);
    } catch (err) {
      // Revert if error
      setFollowing(!nextState);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMessageClick?.(student);
  };

  const fallbackAvatar = '/avatars/avatar-1.png';

  return (
    <div
      className={`student-card group bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-sm hover:-translate-y-0.5 ${className}`}
    >
      <div>
        {/* Top Header: Avatar + Identity */}
        <div className="flex items-start gap-3.5">
          <Link to={`/profile/${student.id}`} className="shrink-0 overflow-hidden rounded-full">
            <img
              src={imgError || !student.avatar ? fallbackAvatar : student.avatar}
              alt={student.name}
              onError={() => setImgError(true)}
              className="w-12 h-12 rounded-full object-cover border border-[#E5E5E5] p-0.5 bg-white group-hover:border-[#FECDD3] group-hover:scale-[1.02] transition-transform duration-200"
            />
          </Link>

          <div className="min-w-0 flex-1">
            <Link 
              to={`/profile/${student.id}`}
              className="font-heading font-bold text-sm sm:text-base text-[#262626] hover:text-[#E63946] transition truncate block"
            >
              {student.name}
            </Link>
            <p className="text-xs text-[#666666] truncate mt-0.5 font-medium">
              {student.department.split('&')[0]} • {student.year}
            </p>
          </div>
        </div>

        {/* Bio */}
        {student.bio && (
          <p className="text-xs text-[#666666] line-clamp-2 mt-3 leading-relaxed">
            "{student.bio}"
          </p>
        )}

        {/* Skill Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3 pt-1">
          {student.skills && student.skills.slice(0, 3).map((sk) => (
            <span
              key={sk.name}
              className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6]"
            >
              {sk.name}
            </span>
          ))}
          {(!student.skills || student.skills.length === 0) && student.interests?.slice(0, 3).map((interest) => (
            <span
              key={interest}
              className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-[#FFF8F8] text-[#666666] border border-[#E5E5E5]"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer: Action Buttons */}
      <div className="mt-4 pt-3.5 border-t border-[#E5E5E5] flex items-center justify-between gap-2">
        {/* Follow / Following Button */}
        {currentStudentId && currentStudentId !== student.id ? (
          <button
            onClick={handleToggleFollow}
            disabled={loading}
            aria-label={following ? `Following ${student.name}` : `Follow ${student.name}`}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
              following
                ? 'bg-[#FFF8F8] text-[#262626] border border-[#E5E5E5] hover:border-rose-300 hover:text-rose-600'
                : 'bg-[#E63946] hover:bg-[#D62839] text-white shadow-xs'
            }`}
          >
            {following ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Follow</span>
              </>
            )}
          </button>
        ) : (
          <Link
            to="/profile"
            className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold bg-[#FFF1F2] text-[#E63946] text-center"
          >
            You
          </Link>
        )}

        {/* Message Button */}
        {currentStudentId && currentStudentId !== student.id && (
          <button
            onClick={handleMessage}
            aria-label={`Message ${student.name}`}
            className="p-2 rounded-xl text-[#666666] hover:text-[#E63946] hover:bg-[#FFF1F2] border border-[#E5E5E5] hover:border-[#FECDD3] active:scale-[0.96] transition-all duration-150 cursor-pointer"
            title="Message student"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

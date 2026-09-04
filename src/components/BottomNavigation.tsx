import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  Plus, 
  Users, 
  MessageSquare 
} from 'lucide-react';
import { chatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { StudentProfile } from '../types';

interface Props {
  currentUser?: StudentProfile;
  onCreateProjectClick: () => void;
}

export const BottomNavigation: React.FC<Props> = ({
  currentUser,
  onCreateProjectClick,
}) => {
  const location = useLocation();
  const { studentProfile } = useAuth();
  const activeUser = studentProfile || currentUser;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!activeUser?.id) return;
    const unsubscribe = chatService.subscribeToConversations(activeUser.id, (convs) => {
      const total = convs.reduce((sum, c) => sum + (c.unreadCounts?.[activeUser.id] || 0), 0);
      setUnreadCount(total);
    });
    return () => unsubscribe();
  }, [activeUser?.id]);

  const isHome = location.pathname === '/';
  const isDiscover = location.pathname.startsWith('/discover');
  const isCommunities = location.pathname.startsWith('/communities');
  const isMessages = location.pathname.startsWith('/messages');

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E5E5] px-2 pt-1 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] shadow-[0_-2px_10px_rgba(0,0,0,0.04)] select-none"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        
        {/* 1. Home */}
        <Link
          to="/"
          aria-label="Home"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition min-h-[44px] min-w-[44px] ${
            isHome ? 'text-[#E63946]' : 'text-[#666666] hover:text-[#262626]'
          }`}
        >
          <Home className={`w-5 h-5 ${isHome ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className={`text-[10px] mt-0.5 ${isHome ? 'font-bold' : 'font-medium'}`}>
            Home
          </span>
        </Link>

        {/* 2. Discover */}
        <Link
          to="/discover"
          aria-label="Discover"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition min-h-[44px] min-w-[44px] ${
            isDiscover ? 'text-[#E63946]' : 'text-[#666666] hover:text-[#262626]'
          }`}
        >
          <Compass className={`w-5 h-5 ${isDiscover ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className={`text-[10px] mt-0.5 ${isDiscover ? 'font-bold' : 'font-medium'}`}>
            Discover
          </span>
        </Link>

        {/* 3. Create Action */}
        <button
          onClick={onCreateProjectClick}
          aria-label="Create or Post Project"
          className="flex flex-col items-center justify-center -mt-3.5 group focus:outline-none min-h-[48px] min-w-[48px] cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-[#E63946] text-white flex items-center justify-center shadow-md group-hover:bg-[#D62839] group-active:scale-95 transition-transform">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-semibold text-[#262626] mt-0.5">
            Create
          </span>
        </button>

        {/* 4. Communities */}
        <Link
          to="/communities"
          aria-label="Communities"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition min-h-[44px] min-w-[44px] ${
            isCommunities ? 'text-[#E63946]' : 'text-[#666666] hover:text-[#262626]'
          }`}
        >
          <Users className={`w-5 h-5 ${isCommunities ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className={`text-[10px] mt-0.5 ${isCommunities ? 'font-bold' : 'font-medium'}`}>
            Groups
          </span>
        </Link>

        {/* 5. Messages */}
        <Link
          to="/messages"
          aria-label="Messages"
          className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition min-h-[44px] min-w-[44px] ${
            isMessages ? 'text-[#E63946]' : 'text-[#666666] hover:text-[#262626]'
          }`}
        >
          <div className="relative">
            <MessageSquare className={`w-5 h-5 ${isMessages ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-3.5 h-3.5 px-1 rounded-full bg-[#E63946] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] mt-0.5 ${isMessages ? 'font-bold' : 'font-medium'}`}>
            Chat
          </span>
        </Link>

      </div>
    </nav>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { StudentProfile, NotificationItem } from '../types';
import { dataService } from '../services/dataService';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { Tooltip } from './Tooltip';
import { 
  Home,
  Compass, 
  Users, 
  Rocket,
  MessageSquare,
  Bell, 
  Plus, 
  Shield, 
  LogOut, 
  Settings, 
  User, 
  LogIn, 
  UserPlus, 
  MessageSquareHeart,
  FolderKanban
} from 'lucide-react';
import { chatService } from '../services/chatService';

interface Props {
  currentUser: StudentProfile;
  onCreateProjectClick: () => void;
  onAuthClick: () => void;
}

export const Navbar: React.FC<Props> = ({ 
  currentUser: propUser, 
  onCreateProjectClick,
}) => {
  const { currentUser: fbUser, studentProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Active user priority: studentProfile from AuthContext > propUser > fallback
  const activeUser = studentProfile || propUser;

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const profileRef = useRef<HTMLDivElement>(null);

  const loadNotifications = () => {
    // Handled in real-time subscription below
  };

  useEffect(() => {
    if (!activeUser?.id) return;
    const unsubscribe = firestoreService.subscribeToNotifications(activeUser.id, (notifs) => {
      setNotifications(notifs);
    });
    return () => unsubscribe();
  }, [activeUser?.id]);

  // Real-time unread messages listener
  useEffect(() => {
    if (!activeUser?.id) return;

    const unsubscribe = chatService.subscribeToConversations(activeUser.id, (convs) => {
      const total = convs.reduce((sum, c) => sum + (c.unreadCounts?.[activeUser.id] || 0), 0);
      setUnreadMessagesCount(total);
    });

    return () => unsubscribe();
  }, [activeUser?.id]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  // Primary 5 Navigation Items for Desktop Icon-first Nav
  const primaryNavItems = [
    { 
      name: 'Home', 
      href: '/', 
      icon: Home,
      isActive: location.pathname === '/'
    },
    { 
      name: 'Discover', 
      href: '/discover', 
      icon: Compass,
      isActive: location.pathname.startsWith('/discover')
    },
    { 
      name: 'Communities', 
      href: '/communities', 
      icon: Users,
      isActive: location.pathname.startsWith('/communities')
    },
    { 
      name: 'Projects', 
      href: '/projects', 
      icon: Rocket,
      isActive: location.pathname.startsWith('/projects')
    },
    { 
      name: 'Messages', 
      href: '/messages', 
      icon: MessageSquare,
      badge: unreadMessagesCount,
      isActive: location.pathname.startsWith('/messages')
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0" aria-label="Campusly Home">
            <img
              src="/campusly-logo.jpg"
              alt="Campusly Logo"
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl border border-[#FFE4E6] p-0.5 bg-white shadow-xs group-hover:border-[#FECDD3] transition"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-lg sm:text-xl text-[#262626] tracking-tight">
                  Campus<span className="text-[#E63946]">ly</span>
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6] hidden sm:inline-block">
                  Campus
                </span>
              </div>
              <span className="text-[9px] text-[#888888] font-medium tracking-wider hidden lg:block uppercase -mt-0.5">
                Social Home For Students
              </span>
            </div>
          </Link>

          {/* Desktop Center: Icon-First Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 sm:gap-2" aria-label="Main Navigation">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Tooltip key={item.name} content={item.name} position="bottom">
                  <Link
                    to={item.href}
                    aria-label={item.name}
                    className={`relative p-2.5 sm:px-3 sm:py-2 rounded-xl flex items-center gap-1.5 transition ${
                      item.isActive
                        ? 'text-[#E63946] bg-[#FFF1F2] font-semibold'
                        : 'text-[#666666] hover:text-[#262626] hover:bg-[#FFF8F8]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[2.25]' : 'stroke-[1.75]'}`} />
                    
                    {/* Badge for Messages */}
                    {item.badge && item.badge > 0 ? (
                      <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-[#E63946] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    ) : null}
                  </Link>
                </Tooltip>
              );
            })}
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {fbUser ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <Tooltip content="Notifications" position="bottom">
                    <button
                      onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                      aria-label="Notifications"
                      className="relative p-2 sm:p-2.5 rounded-xl text-[#666666] hover:text-[#262626] hover:bg-[#FFF8F8] border border-transparent hover:border-[#E5E5E5] transition focus:outline-none"
                    >
                      <Bell className="w-5 h-5 stroke-[1.75]" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#E63946] ring-2 ring-white"></span>
                      )}
                    </button>
                  </Tooltip>

                  <NotificationDropdown
                    isOpen={notifDropdownOpen}
                    onClose={() => setNotifDropdownOpen(false)}
                    notifications={notifications}
                    onRefresh={loadNotifications}
                  />
                </div>

                {/* Post Project Button (Desktop) */}
                <button
                  onClick={onCreateProjectClick}
                  aria-label="Post Project"
                  className="hidden sm:flex items-center gap-1.5 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Post Project</span>
                </button>

                {/* Profile Avatar with Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    aria-label="Profile and Settings"
                    className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl border border-[#E5E5E5] hover:border-[#FECDD3] hover:bg-[#FFF8F8] transition cursor-pointer min-h-[40px]"
                  >
                    <img
                      src={activeUser.photoURL || activeUser.avatar || '/avatars/avatar-1.png'}
                      alt={activeUser.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/avatars/avatar-1.png';
                      }}
                      className="w-8 h-8 rounded-full object-cover border border-[#E5E5E5]"
                    />
                    <div className="text-left hidden xl:block pr-1">
                      <div className="text-xs font-semibold text-[#262626] leading-tight truncate max-w-[110px]">
                        {activeUser.name}
                      </div>
                      <div className="text-[10px] text-[#666666] leading-tight truncate max-w-[110px]">
                        {activeUser.college.split(' ')[0]}
                      </div>
                    </div>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white border border-[#E5E5E5] rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2.5 border-b border-[#E5E5E5] mb-1">
                        <div className="font-bold text-xs text-[#262626] truncate">
                          {activeUser.name}
                        </div>
                        <div className="text-[11px] text-[#666666] truncate">
                          {fbUser.email}
                        </div>
                        <div className="text-[10px] text-[#E63946] font-semibold mt-0.5">
                          {activeUser.college}
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#262626] hover:bg-[#FFF8F8] hover:text-[#E63946] transition"
                      >
                        <User className="w-4 h-4 text-[#666666]" />
                        <span>View Profile</span>
                      </Link>

                      <Link
                        to="/workspace"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#262626] hover:bg-[#FFF8F8] hover:text-[#E63946] transition"
                      >
                        <FolderKanban className="w-4 h-4 text-[#666666]" />
                        <span>Teams & Workspace</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#262626] hover:bg-[#FFF8F8] hover:text-[#E63946] transition"
                      >
                        <Settings className="w-4 h-4 text-[#666666]" />
                        <span>Account Settings</span>
                      </Link>

                      <Link
                        to="/feedback"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#262626] hover:bg-[#FFF8F8] hover:text-[#E63946] transition"
                      >
                        <MessageSquareHeart className="w-4 h-4 text-[#E63946]" />
                        <span>Give Feedback</span>
                      </Link>

                      {activeUser.isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </Link>
                      )}

                      <div className="border-t border-[#E5E5E5] my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Logged Out Actions */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#262626] hover:text-[#E63946] hover:bg-[#FFF8F8] rounded-xl transition flex items-center gap-1.5 border border-[#E5E5E5]"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </Link>

                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-[#E63946] hover:bg-[#D62839] text-white rounded-xl transition flex items-center gap-1.5 shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

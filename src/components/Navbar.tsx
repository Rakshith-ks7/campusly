import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { StudentProfile, NotificationItem } from '../types';
import { dataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { 
  Users, 
  Compass, 
  FolderKanban, 
  Calendar,
  Layers,
  Plus, 
  Menu, 
  X,
  Bell,
  Shield,
  LogOut,
  Settings,
  User,
  LogIn,
  UserPlus,
  MessageSquare,
  MessageSquareHeart
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const profileRef = useRef<HTMLDivElement>(null);

  const loadNotifications = () => {
    if (activeUser?.id) {
      setNotifications(dataService.getNotificationsForUser(activeUser.id));
    }
  };

  useEffect(() => {
    loadNotifications();
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
    setMobileMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  // Nav links based on auth state
  const navLinks = fbUser ? [
    { name: 'Home', href: '/', icon: Users },
    { name: 'Discover', href: '/discover', icon: Compass },
    { name: 'Communities', href: '/communities', icon: Layers },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Projects', href: '/projects', icon: Compass },
    { name: 'Teams', href: '/workspace', icon: FolderKanban },
    { name: 'Messages', href: '/messages', icon: MessageSquare, badge: unreadMessagesCount },
  ] : [
    { name: 'Home', href: '/', icon: Users },
    { name: 'Discover', href: '/discover', icon: Compass },
    { name: 'Communities', href: '/communities', icon: Layers },
    { name: 'Events', href: '/events', icon: Calendar },
  ];

  return (
    <header className="sticky top-[37px] z-40 bg-white border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/campusly-logo.jpg"
              alt="Campusly Logo"
              className="w-10 h-10 object-contain rounded-xl border border-[#FFE4E6] p-0.5 bg-white shadow-xs group-hover:border-[#FECDD3] transition"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-lg sm:text-xl text-[#262626] tracking-tight">
                  Campus<span className="text-[#E63946]">ly</span>
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6]">
                  Campus
                </span>
              </div>
              <span className="text-[9px] text-[#888888] font-medium tracking-wider hidden sm:block uppercase -mt-0.5">
                Connect • Collaborate • Grow
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'text-[#E63946] bg-[#FFF1F2] font-semibold'
                      : 'text-[#666666] hover:text-[#262626] hover:bg-[#FFF8F8]'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="hidden sm:flex items-center gap-2.5">
            
            {fbUser ? (
              <>
                {/* Messages Link with Unread Badge */}
                <Link
                  to="/messages"
                  className="relative p-2 rounded-lg text-[#666666] hover:text-[#262626] hover:bg-[#FFF8F8] border border-transparent hover:border-[#E5E5E5] transition"
                  title="Messages & Requests"
                >
                  <MessageSquare className="w-4 h-4" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E63946] ring-2 ring-white"></span>
                  )}
                </Link>

                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="relative p-2 rounded-lg text-[#666666] hover:text-[#262626] hover:bg-[#FFF8F8] border border-transparent hover:border-[#E5E5E5] transition"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E63946] ring-2 ring-white"></span>
                    )}
                  </button>

                  <NotificationDropdown
                    isOpen={notifDropdownOpen}
                    onClose={() => setNotifDropdownOpen(false)}
                    notifications={notifications}
                    onRefresh={loadNotifications}
                  />
                </div>

                {/* Admin Portal Quick Link */}
                <Link
                  to="/admin"
                  className="p-2 rounded-lg text-[#666666] hover:text-[#E63946] hover:bg-[#FFF8F8] border border-transparent hover:border-[#E5E5E5] transition"
                  title="College Admin Panel"
                >
                  <Shield className="w-4 h-4" />
                </Link>

                {/* Post Project Button */}
                <button
                  onClick={onCreateProjectClick}
                  className="flex items-center gap-1.5 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium px-3.5 py-2 rounded-lg transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Post Project</span>
                </button>

                {/* Profile Avatar with Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg border border-[#E5E5E5] hover:border-[#FECDD3] hover:bg-[#FFF8F8] transition"
                  >
                    <img
                      src={activeUser.avatar}
                      alt={activeUser.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#E5E5E5]"
                    />
                    <div className="text-left hidden xl:block">
                      <div className="text-xs font-semibold text-[#262626] leading-tight truncate max-w-[120px]">
                        {activeUser.name}
                      </div>
                      <div className="text-[11px] text-[#666666] leading-tight truncate max-w-[120px]">
                        {activeUser.college.split(' ')[0]}
                      </div>
                    </div>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E5E5] rounded-xl shadow-xl z-50 py-2 animate-in fade-in">
                      <div className="px-4 py-2 border-b border-[#E5E5E5] mb-1">
                        <div className="font-semibold text-xs text-[#262626] truncate">
                          {activeUser.name}
                        </div>
                        <div className="text-[11px] text-[#666666] truncate">
                          {fbUser.email}
                        </div>
                        <div className="text-[10px] text-[#E63946] font-medium mt-0.5">
                          {activeUser.college}
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-[#262626] hover:bg-[#FFF8F8] hover:text-[#E63946] transition"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>View Profile</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-[#262626] hover:bg-[#FFF8F8] hover:text-[#E63946] transition"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Account Settings</span>
                      </Link>

                      <Link
                        to="/feedback"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-[#262626] hover:bg-[#FFF8F8] hover:text-[#E63946] transition"
                      >
                        <MessageSquareHeart className="w-3.5 h-3.5 text-[#E63946]" />
                        <span>Give Feedback</span>
                      </Link>

                      <div className="border-t border-[#E5E5E5] my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
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
                  className="px-4 py-2 text-xs font-medium text-[#262626] hover:text-[#E63946] hover:bg-[#FFF8F8] rounded-lg transition flex items-center gap-1.5 border border-[#E5E5E5]"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </Link>

                <Link
                  to="/signup"
                  className="px-4 py-2 text-xs font-medium bg-[#E63946] hover:bg-[#D62839] text-white rounded-lg transition flex items-center gap-1.5 shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}

          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex lg:hidden items-center gap-2">
            {fbUser && (
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-lg text-[#666666]"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E63946]"></span>
                )}
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#666666] hover:text-[#262626] hover:bg-[#FFF8F8]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E5E5E5] px-4 pt-2 pb-4 space-y-1 animate-in fade-in">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-[#FFF1F2] text-[#E63946] font-semibold' : 'text-[#666666] hover:bg-[#FFF8F8]'
                }`}
              >
                <span>{item.name}</span>
                {item.badge && item.badge > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-[#E63946] text-white text-[10px] font-bold">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-[#E5E5E5] mt-2 flex flex-col gap-1 text-sm">
            {fbUser ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-[#262626] font-medium hover:bg-[#FFF8F8] rounded-lg"
                >
                  My Profile ({activeUser.name})
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-[#262626] font-medium hover:bg-[#FFF8F8] rounded-lg"
                >
                  Account Settings
                </Link>
                <Link
                  to="/feedback"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-[#262626] font-medium hover:bg-[#FFF8F8] rounded-lg flex items-center gap-1.5"
                >
                  <MessageSquareHeart className="w-3.5 h-3.5 text-[#E63946]" />
                  <span>Give Feedback</span>
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-[#666666] hover:text-[#E63946] rounded-lg flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>College Admin Panel</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left px-3 py-2 text-rose-600 font-medium hover:bg-rose-50 rounded-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-medium border border-[#E5E5E5] rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-medium bg-[#E63946] text-white rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { NotificationItem } from '../types';
import { dataService } from '../services/dataService';
import { Bell, CheckCheck, Calendar, Users, FolderGit2, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onRefresh: () => void;
}

export const NotificationDropdown: React.FC<Props> = ({
  isOpen,
  onClose,
  notifications,
  onRefresh
}) => {
  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    notifications.forEach(n => dataService.markNotificationRead(n.id));
    onRefresh();
  };

  const handleItemClick = (id: string) => {
    dataService.markNotificationRead(id);
    onRefresh();
    onClose();
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'connection':
        return <Users className="w-4 h-4 text-[#E63946]" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-[#E63946]" />;
      case 'project':
        return <FolderGit2 className="w-4 h-4 text-[#E63946]" />;
      default:
        return <Bell className="w-4 h-4 text-[#E63946]" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E5E5E5] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in">
      {/* Header */}
      <div className="p-3.5 border-b border-[#E5E5E5] flex items-center justify-between bg-[#FFF8F8]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#E63946]" />
          <h3 className="font-heading font-semibold text-sm text-[#262626]">Notifications</h3>
          <span className="text-[11px] font-semibold bg-[#FFF1F2] text-[#E63946] px-2 py-0.5 rounded-full border border-[#FFE4E6]">
            {notifications.filter(n => !n.read).length} new
          </span>
        </div>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.read) && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] text-[#666666] hover:text-[#E63946] flex items-center gap-1 font-medium"
            >
              <CheckCheck className="w-3 h-3" />
              <span>Mark read</span>
            </button>
          )}
          <button onClick={onClose} className="text-[#999999] hover:text-[#262626]">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-[#E5E5E5]">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#666666]">
            No notifications yet. You're all caught up!
          </div>
        ) : (
          notifications.map((n) => (
            <Link
              key={n.id}
              to={n.link}
              onClick={() => handleItemClick(n.id)}
              className={`block p-3 hover:bg-[#FFF8F8] transition ${
                !n.read ? 'bg-[#FFF1F2]/40' : ''
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#FFF1F2] border border-[#FFE4E6] flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-[#262626] truncate">{n.title}</span>
                    <span className="text-[10px] text-[#999999] shrink-0">{n.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#666666] mt-0.5 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

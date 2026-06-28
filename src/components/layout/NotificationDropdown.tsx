import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';

import { formatDistanceToNow } from 'date-fns';

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { user } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, subscribe, unsubscribe } = useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications(user.id);
      subscribe(user.id);
    }
    return () => {
      unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="relative text-gray-500 hover:bg-gray-100 p-2 rounded-full dark:hover:bg-[#272729] transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-reddit-orange rounded-full"></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden dark:bg-[#1a1a1b] dark:border-[#343536] z-50">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-[#272729]">
            <h3 className="font-bold text-gray-800 dark:text-gray-200">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead(user.id)}
                className="text-xs text-blue-500 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                You have no notifications.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`flex items-start gap-3 p-3 border-b border-gray-50 dark:border-[#272729] hover:bg-gray-50 dark:hover:bg-[#272729] transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif.id);
                    if (notif.link) {
                      window.location.href = notif.link;
                    }
                  }}
                >
                  <div className="mt-1 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                      <Bell className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                      {notif.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

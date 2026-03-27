"use client";

import { Bell } from "lucide-react";
import { Notification } from "./NotificationItem";
import NotificationDropdown from "./NotificationDropdown";

interface NotificationBellProps {
  isOpen: boolean;
  onToggle: () => void;
  // Panel data passed from parent (state lives in Header)
  notifications: Notification[];
  onMarkAllRead: () => void;
  onRead: (id: string) => void;
  // On mobile the dropdown is suppressed; only the bell + badge renders
  showDropdown?: boolean;
}

export default function NotificationBell({
  isOpen,
  onToggle,
  notifications,
  onMarkAllRead,
  onRead,
  showDropdown = true,
}: NotificationBellProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={onToggle}
        aria-label="Toggle notifications"
        className="relative p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <Bell className="w-5 h-5" />

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Desktop dropdown only */}
      {showDropdown && (
        <NotificationDropdown
          isOpen={isOpen}
          onClose={onToggle}
          notifications={notifications}
          onMarkAllRead={onMarkAllRead}
          onRead={onRead}
        />
      )}
    </div>
  );
}

// Notification data is now managed by NotificationContext and fetched from backend

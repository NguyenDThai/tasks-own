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

// ─── Shared mock data (exported so Header can own state) ────────────────────
export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    avatarInitials: "NA",
    avatarColor: "bg-violet-500",
    content: 'Nguyễn A đã thêm bạn vào task "Thiết kế UI Dashboard"',
    time: "2 phút trước",
    isRead: false,
  },
  {
    id: "2",
    avatarInitials: "TB",
    avatarColor: "bg-emerald-500",
    content: 'Trần B đã comment vào task "Fix bug authentication"',
    time: "15 phút trước",
    isRead: false,
  },
  {
    id: "3",
    avatarInitials: "LC",
    avatarColor: "bg-orange-500",
    content: 'Lê C đã hoàn thành task "Viết unit test cho UserService"',
    time: "1 giờ trước",
    isRead: false,
  },
  {
    id: "4",
    avatarInitials: "PD",
    avatarColor: "bg-pink-500",
    content: 'Phạm D đã đổi deadline của task "Deploy lên staging" sang ngày mai',
    time: "3 giờ trước",
    isRead: true,
  },
  {
    id: "5",
    avatarInitials: "VE",
    avatarColor: "bg-sky-500",
    content: 'Vũ E đã assign task "Review PR #42" cho bạn',
    time: "Hôm qua",
    isRead: true,
  },
  {
    id: "6",
    avatarInitials: "HF",
    avatarColor: "bg-rose-500",
    content: 'Hoàng F đã tạo project mới "Mobile App v2"',
    time: "2 ngày trước",
    isRead: true,
  },
];

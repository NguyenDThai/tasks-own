"use client";

import { useState } from "react";

export interface Notification {
  id: string;
  avatarUrl?: string;
  avatarInitials: string;
  avatarColor: string;
  content: string;
  time: string;
  isRead: boolean;
}

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

export default function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps) {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    onRead(notification.id);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors rounded-lg
        ${clicked ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}
      `}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold ${notification.avatarColor}`}
      >
        {notification.avatarInitials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-800 dark:text-zinc-100 leading-snug">
          {notification.content}
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
          {notification.time}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-blue-500" />
      )}
    </button>
  );
}

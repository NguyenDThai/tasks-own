"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { Notification } from "./NotificationItem";
import { INITIAL_NOTIFICATIONS } from "./NotificationBell";

/**
 * Interface for Notification Context data and methods
 */
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  /**
   * Add a new mock notification to the list
   */
  addNotification: (notification: Partial<Notification>) => void;
  /**
   * Mark all notifications as read
   */
  markAllRead: () => void;
  /**
   * Mark a specific notification as read by ID
   */
  markAsRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Provider component that holds the global state of notifications.
 * Currently uses mock data but is structured to potentially connect to a DB.
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load initial notifications only once on client side
  useEffect(() => {
    setNotifications(INITIAL_NOTIFICATIONS);
    setIsMounted(true);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const addNotification = useCallback((notif: Partial<Notification>) => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      avatarInitials: notif.avatarInitials || "U",
      avatarColor: notif.avatarColor || "bg-blue-500",
      content: notif.content || "Có thông báo mới",
      time: "Vừa mới đây",
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  return (
    <NotificationContext.Provider
      value={{ 
        notifications: isMounted ? notifications : [], 
        unreadCount: isMounted ? unreadCount : 0, 
        addNotification, 
        markAllRead, 
        markAsRead 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to access notification global state and actions
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

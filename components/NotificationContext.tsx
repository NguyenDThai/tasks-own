"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { Notification } from "./NotificationItem";
import { useAuth } from "./AuthContext";

/**
 * Interface for Notification Context data and methods
 */
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  /**
   * Fetch notifications from the server
   */
  fetchNotifications: () => Promise<void>;
  /**
   * Mark all notifications as read
   */
  markAllRead: () => Promise<void>;
  /**
   * Mark a specific notification as read by ID
   */
  markAsRead: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
}

/**
 * Provider component that holds the global state of notifications.
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        const mapped: Notification[] = data.map((n: any) => ({
          id: n._id,
          avatarInitials: n.type === "TASK_ASSIGNED" ? "T" : "S",
          avatarColor: n.type === "TASK_ASSIGNED" ? "bg-blue-500" : "bg-zinc-500",
          content: n.message,
          time: formatRelativeTime(n.createdAt),
          isRead: n.isRead,
        }));
        setNotifications(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load notifications on mount and poll
  useEffect(() => {
    setIsMounted(true);
    if (user) {
      fetchNotifications();
      
      // Refresh every 5 seconds (Polling)
      const interval = setInterval(fetchNotifications, 5000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]); // Clear notifications on logout
    }
  }, [fetchNotifications, user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PUT" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    // For now we don't have a specific mark as read by ID endpoint in the simple version, 
    // but we can update local state
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  return (
    <NotificationContext.Provider
      value={{ 
        notifications: isMounted ? notifications : [], 
        unreadCount: isMounted ? unreadCount : 0, 
        loading,
        fetchNotifications,
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

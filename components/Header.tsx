"use client";

import { useState } from "react";
import { CheckSquare, LogOut, User, Menu } from "lucide-react";
import NotificationBell from "./NotificationBell";
import NotificationBottomSheet from "./NotificationBottomSheet";
import MobileMenu from "./MobileMenu";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useAuth } from "./AuthContext";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import { useNotifications } from "./NotificationContext";

/**
 * Header component that manages the top navigation and global notification state.
 * It uses NotificationContext for centralized notification management.
 */
export default function Header() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  // Get notifications from global context
  const { notifications, unreadCount, markAllRead, markAsRead } =
    useNotifications();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  /** Open notification panel — always close menu first */
  const openNotification = () => {
    setIsMenuOpen(false);
    setIsNotificationOpen((v) => !v);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/75 dark:bg-zinc-950/75 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* ── Logo ──────────────────────────────────────────────────────── */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg shadow-sm">
              <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              TaskMaster
            </h1>
          </div>

          {/* ── Desktop right side (sm+) ───────────────────────────────── */}
          <div className="hidden sm:flex items-center gap-3 min-w-0">
            {user && (
              <div className="flex items-center gap-4 mr-2 pr-4 border-r border-zinc-200 dark:border-zinc-800 min-w-0">
                {/* Desktop: bell with dropdown */}
                <NotificationBell
                  isOpen={isNotificationOpen}
                  onToggle={openNotification}
                  notifications={notifications}
                  onMarkAllRead={markAllRead}
                  onRead={markAsRead}
                  showDropdown
                />

                {/* User info */}
                <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 min-w-0">
                  <div className="relative shrink-0">
                    <User className="w-4 h-4" />
                    {user.provider === "google" && (
                      <div className="absolute -top-1 -right-1 bg-white dark:bg-zinc-900 rounded-full">
                        <svg
                          className="w-2.5 h-2.5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="truncate max-w-[120px] sm:max-w-none">
                    {user.name}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors shrink-0"
                  title={t("logout")}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t("logout")}</span>
                </button>
              </div>
            )}
            <LanguageToggle />
            <ThemeToggle />
          </div>

          {/* ── Mobile: hamburger only (< sm) ────────────────────────── */}
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            className="sm:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Mobile slide-in drawer ─────────────────────────────────────── */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={user}
        logout={logout}
        unreadCount={unreadCount}
        onOpenNotification={openNotification}
      />

      {/* ── Mobile notification bottom sheet ──────────────────────────── */}
      <div className="sm:hidden">
        <NotificationBottomSheet
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          notifications={notifications}
          onMarkAllRead={markAllRead}
          onRead={markAsRead}
        />
      </div>
    </>
  );
}

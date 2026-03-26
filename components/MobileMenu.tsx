"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogOut, User } from "lucide-react";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useTranslation } from "react-i18next";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; provider?: string } | null;
  logout: () => void;
}

// Google G badge SVG extracted for reuse
function GoogleBadge() {
  return (
    <div className="absolute -top-1 -right-1 bg-white dark:bg-zinc-900 rounded-full">
      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
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
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    </div>
  );
}

export default function MobileMenu({
  isOpen,
  onClose,
  user,
  logout,
}: MobileMenuProps) {
  const { t } = useTranslation();

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-0 right-0 h-full w-72 z-50
              bg-white dark:bg-zinc-900
              border-l border-zinc-200 dark:border-zinc-800
              shadow-2xl flex flex-col"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Menu
              </span>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 flex flex-col gap-0 p-4 overflow-y-auto">
              {/* User row */}
              {user && (
                <div className="flex flex-col gap-4">
                  {/* User info */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                        <User className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                      </div>
                      {user.provider === "google" && <GoogleBadge />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                        {user.name}
                      </p>
                      {user.provider === "google" && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                          Google Account
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Notifications inline */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                      Notifications
                    </span>
                    <NotificationBell />
                  </div>

                  <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
                </div>
              )}

              {/* Settings row: language + theme */}
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center justify-between px-1 py-2">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                    Language
                  </span>
                  <LanguageToggle />
                </div>
                <div className="flex items-center justify-between px-1 py-2">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                    Theme
                  </span>
                  <ThemeToggle />
                </div>
              </div>
            </div>

            {/* Footer – Logout */}
            {user && (
              <div className="px-4 pb-6 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                    text-sm font-medium text-red-600 dark:text-red-400
                    bg-red-50 dark:bg-red-900/20
                    hover:bg-red-100 dark:hover:bg-red-900/40
                    transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t("logout")}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

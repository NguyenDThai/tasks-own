"use client";

import { CheckSquare, LogOut, User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useAuth } from "./AuthContext";

import { useTranslation } from "react-i18next";
import "@/lib/i18n";

export default function Header() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/75 dark:bg-zinc-950/75 border-b border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            TaskMaster
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          {user && (
            <div className="flex items-center mr-4 pr-4 border-r border-zinc-200 dark:border-zinc-800 space-x-4">
              <div className="flex items-center space-x-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                <User className="w-4 h-4" />
                <span>{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                title={t("logout")}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t("logout")}</span>
              </button>
            </div>
          )}
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

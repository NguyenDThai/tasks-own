"use client";

import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { useEffect, useState } from "react";
import "@/lib/i18n";

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-9 h-9" />;

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-400 rounded-full transition-colors border border-zinc-200 dark:border-zinc-800"
      aria-label="Toggle language"
    >
      <Languages className="w-4 h-4" />
      <span className="text-xs font-semibold uppercase">{i18n.language === "en" ? "EN" : "VI"}</span>
    </button>
  );
}

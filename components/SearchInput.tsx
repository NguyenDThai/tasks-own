"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

type SearchInputProps = {
  onSearch: (value: string) => void;
};

export function SearchInput({ onSearch }: SearchInputProps) {
  const { t } = useTranslation();
  const [term, setTerm] = useState("");
  
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(term);
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [term, onSearch]);

  return (
    <div className="relative w-full md:w-80">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-zinc-400" />
      </div>
      <input
        type="text"
        placeholder={t("searchPlaceholder")}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-full leading-5 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
      />
    </div>
  );
}

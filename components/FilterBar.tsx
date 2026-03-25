import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

type FilterBarProps = {
  currentFilter: string;
  onFilterChange: (status: string) => void;
};

export function FilterBar({ currentFilter, onFilterChange }: FilterBarProps) {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const translated = (key: string) =>
    mounted ? t(key) : i18n.getResource("en", "common", key) || key;

  const FILTERS = [
    { label: translated("allTasks"), value: "" },
    { label: translated("todo"), value: "TODO" },
    { label: translated("inProgress"), value: "IN_PROGRESS" },
    { label: translated("done"), value: "DONE" },
  ];

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onFilterChange(f.value)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
            currentFilter === f.value
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700",
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

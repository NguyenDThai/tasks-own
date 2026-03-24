"use client";

import { TaskType } from "@/types";
import { cn } from "@/lib/utils";

type StatusSelectProps = {
  status: TaskType["status"];
  onChange: (newStatus: TaskType["status"]) => void;
  disabled?: boolean;
};

export function StatusSelect({ status, onChange, disabled }: StatusSelectProps) {
  const options: { value: TaskType["status"]; label: string; color: string }[] = [
    { value: "TODO", label: "Chưa làm", color: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700" },
    { value: "IN_PROGRESS", label: "Đang làm", color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" },
    { value: "DONE", label: "Hoàn thành", color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" },
  ];

  const currentOption = options.find((opt) => opt.value === status) || options[0];

  return (
    <div className="relative inline-block w-full mt-3 md:hidden">
      <select
        value={status}
        onChange={(e) => onChange(e.target.value as TaskType["status"])}
        disabled={disabled}
        className={cn(
          "w-full appearance-none px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          currentOption.color
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className={cn("w-4 h-4", status === "TODO" ? "text-zinc-500" : status === "IN_PROGRESS" ? "text-amber-500" : "text-emerald-500")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

"use client";

import { TaskType } from "@/types";
import { isPast, parseISO } from "date-fns";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

export function StatsDashboard({ tasks }: { tasks: TaskType[] }) {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const translated = (key: string) => mounted ? t(key) : i18n.getResource("en", "common", key) || key;

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "DONE").length;
  const overdue = tasks.filter((t) => {
    if (t.status === "DONE" || !t.deadline) return false;
    return isPast(parseISO(t.deadline));
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center space-x-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">{translated("totalTasks")}</p>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">{total}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center space-x-4">
        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">{translated("completed")}</p>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">{done}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center space-x-4">
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">{translated("overdueTasks")}</p>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">{overdue}</h3>
        </div>
      </div>
    </div>
  );
}

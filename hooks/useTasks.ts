"use client";

import { useState, useEffect, useCallback } from "react";
import { TaskType } from "@/types";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

export function useTasks() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (status?: string, search?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (search) params.append("search", search);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (!res.ok) throw new Error(t("errorFetch"));
      const data = await res.json();
      setTasks(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (taskData: Partial<TaskType>) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    if (!res.ok) throw new Error(t("errorCreate"));
    const newTask = await res.json();
    setTasks((prev) => [newTask, ...prev]);
    toast.success(t("taskCreated"));
    return newTask;
  };

  const updateTask = async (id: string, taskData: Partial<TaskType>) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    if (!res.ok) throw new Error(t("errorUpdate"));
    const updatedTask = await res.json();
    setTasks((prev) => prev.map((t) => (t._id === id ? updatedTask : t)));
    toast.success(t("taskUpdated"));
    return updatedTask;
  };

  const deleteTask = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(t("errorDelete"));
    setTasks((prev) => prev.filter((t) => t._id !== id));
    toast.success(t("taskDeleted"));
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    setTasks,
  };
}

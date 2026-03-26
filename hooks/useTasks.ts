"use client";

import { useState, useEffect, useCallback } from "react";
import { TaskType } from "@/types";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import { useNotifications } from "@/components/NotificationContext";

export function useTasks() {
  const { t } = useTranslation();
  const { addNotification } = useNotifications();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm load danh sách task
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

  // Hàm tạo task
  const createTask = async (taskData: Partial<TaskType>) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (res.status === 401) {
        throw new Error("Bạn chưa đăng nhập");
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || t("errorCreate"));
      }

      const newTask = data;
      setTasks((prev) => [newTask, ...prev]);
      toast.success(t("taskCreated"));
      return newTask;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  // Hàm cập nhật task
  const updateTask = async (id: string, taskData: Partial<TaskType>) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (res.status === 401) {
        throw new Error("Bạn chưa đăng nhập");
      }

      if (res.status === 403) {
        throw new Error("Bạn không có quyền chỉnh sửa task này");
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || t("errorUpdate"));
      }

      const updatedTask = data;
      setTasks((prev) => prev.map((t) => (t._id === id ? updatedTask : t)));
      toast.success(t("taskUpdated"));
      return updatedTask;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  // Hàm xóa task
  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });

      if (res.status === 403) {
        throw new Error("Bạn không có quyền xóa task này");
      }

      if (res.status === 401) {
        throw new Error("Bạn chưa đăng nhập");
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || t("errorDelete"));
      }

      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast.success(t("taskDeleted"));
    } catch (error: any) {
      toast.error(error.message);
    }
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

"use client";

import { useState, useMemo, useEffect } from "react";
import { useTasks } from "@/hooks/useTasks";
import { StatsDashboard } from "@/components/StatsDashboard";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { TaskList } from "@/components/TaskList";
import { TaskForm } from "@/components/TaskForm";
import { ConfirmModal } from "@/components/ConfirmModal";
import { TaskType } from "@/types";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

export default function Home() {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    setTasks,
  } = useTasks();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [currentFilter, setCurrentFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Confirmation Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesFilter = currentFilter
        ? task.status === currentFilter
        : true;
      const matchesSearch = searchTerm
        ? task.title.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchesFilter && matchesSearch;
    });
  }, [tasks, currentFilter, searchTerm]);

  // Prevent hydration mismatch by rendering default content until mounted
  const translated = (key: string) => mounted ? t(key) : i18n.getResource("en", "common", key) || key;

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleOpenEditTask = (task: TaskType) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleOpenConfirmDelete = (id: string) => {
    setTaskToDeleteId(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDeleteId) return;
    setIsDeleteLoading(true);
    try {
      await deleteTask(taskToDeleteId);
      setIsConfirmModalOpen(false);
    } catch (err) {
      // Error handled in useTasks or should be handled here
    } finally {
      setIsDeleteLoading(false);
      setTaskToDeleteId(null);
    }
  };

  const handleSubmitTask = async (taskData: Partial<TaskType>) => {
    if (editingTask) {
      await updateTask(editingTask._id, taskData);
    } else {
      await createTask(taskData);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full mb-4">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">{translated("errorLoading")}</h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {translated("dashboard")}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {translated("subtitle")}
          </p>
        </div>
        <button
          onClick={handleOpenNewTask}
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5 mr-1.5 -ml-1" />
          {translated("newTask")}
        </button>
      </div>

      <StatsDashboard tasks={tasks} />

      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-[72px] z-30">
        <FilterBar
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
        />
        <SearchInput onSearch={setSearchTerm} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <TaskList
          tasks={filteredTasks}
          onUpdateTask={updateTask}
          onEditTask={handleOpenEditTask}
          onDeleteTask={handleOpenConfirmDelete}
          setTasksLocally={setTasks}
        />
      )}

      <TaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitTask}
        initialData={editingTask}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={isDeleteLoading}
      />
    </div>
  );
}

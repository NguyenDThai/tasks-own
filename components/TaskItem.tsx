"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskType } from "@/types";
import { format, isPast, parseISO, differenceInHours } from "date-fns";
import { Calendar, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { StatusSelect } from "./StatusSelect";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";

type TaskItemProps = {
  task: TaskType;
  onEdit: (task: TaskType) => void;
  onDelete: (id: string) => void;
  onUpdateStatus?: (id: string, newStatus: TaskType["status"]) => Promise<void>;
};

export function TaskItem({
  task,
  onEdit,
  onDelete,
  onUpdateStatus,
}: TaskItemProps) {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [localStatus, setLocalStatus] = useState<TaskType["status"]>(
    task.status,
  );
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update local status if prop changes
  useEffect(() => {
    setLocalStatus(task.status);
  }, [task.status]);

  const translated = (key: string) =>
    mounted ? t(key) : i18n.getResource("en", "common", key) || key;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: { type: "Task", task },
    disabled: isMobile,
  });

  const handleStatusChange = async (newStatus: TaskType["status"]) => {
    if (!onUpdateStatus || newStatus === localStatus) return;

    const previousStatus = localStatus;
    setLocalStatus(newStatus);
    setIsUpdating(true);

    try {
      await onUpdateStatus(task._id, newStatus);
    } catch (error) {
      setLocalStatus(previousStatus);
      toast.error(t("errorUpdate") || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const isCompleted = localStatus === "DONE";
  // Tasks hết hạn
  let isOverdue = false;
  // Tasks gần hết hạn
  let isNearDeadline = false;

  if (!isCompleted && task.deadline) {
    const deadlineDate = parseISO(task.deadline);
    if (isPast(deadlineDate)) {
      isOverdue = true;
    } else {
      const hoursDiff = differenceInHours(deadlineDate, new Date());
      if (hoursDiff <= 24) {
        isNearDeadline = true;
      }
    }
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 min-h-[100px] rounded-xl border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-900/20 z-50 relative"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isMobile ? {} : listeners)}
      className={cn(
        "group bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] border mb-3 transition-all hover:shadow-md select-none",
        isDragging
          ? "cursor-grabbing scale-[1.02] shadow-xl z-50 ring-2 ring-blue-500/20"
          : isMobile
            ? "cursor-default"
            : "cursor-grab",
        isOverdue
          ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
          : "border-zinc-200 dark:border-zinc-800",
        isNearDeadline && !isOverdue
          ? "border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10"
          : "",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-1 w-full pr-2">
          <div className="flex-1 w-full overflow-hidden">
            <h4
              className={cn(
                "text-base font-semibold truncate",
                localStatus === "DONE"
                  ? "line-through text-zinc-500"
                  : "text-zinc-900 dark:text-zinc-100",
              )}
            >
              {task.title}
              {isUpdating && (
                <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </h4>
            {task.description && (
              <div
                className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(task.description),
                }}
              />
            )}
            {task.deadline && (
              <div
                className={cn(
                  "flex items-center space-x-1 mt-3 text-xs font-medium",
                  isOverdue
                    ? "text-red-600 dark:text-red-400"
                    : isNearDeadline
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-zinc-500 dark:text-zinc-400",
                )}
              >
                <Calendar className="w-4 h-4" />
                <span>
                  {isOverdue ? translated("overdue") : translated("due")}
                  {format(parseISO(task.deadline), "MMM d, yyyy HH:mm")}
                </span>
              </div>
            )}

            <StatusSelect
              status={localStatus}
              onChange={handleStatusChange}
              disabled={isUpdating}
            />
          </div>
        </div>

        {/* Members Avatars (Compact) - Chỉ hiển thị tối đa 3 người */}
        <div className="flex -space-x-1.5 ml-2 mr-2">
          {task.members?.slice(0, 3).map((member) => (
            <div
              key={member._id}
              title={member.name}
              className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden shadow-sm"
            >
              {member.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {(task.members?.length || 0) > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-zinc-500 shadow-sm">
              +{(task.members?.length || 0) - 3}
            </div>
          )}
        </div>

        {/* Action tasks */}
        <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg cursor-pointer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task._id);
            }}
            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskType } from "@/types";
import { TaskItem } from "./TaskItem";
import { useTranslation } from "react-i18next";

type TaskListProps = {
  tasks: TaskType[];
  onUpdateTask: (id: string, updates: Partial<TaskType>) => Promise<void>;
  onEditTask: (task: TaskType) => void;
  onDeleteTask: (id: string) => void;
  setTasksLocally: React.Dispatch<React.SetStateAction<TaskType[]>>;
};

type ColumnProps = {
  id: string;
  title: string;
  tasks: TaskType[];
  onEditTask: (task: TaskType) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<TaskType>) => Promise<void>;
};

function Column({ id, title, tasks, onEditTask, onDeleteTask, onUpdateTask }: ColumnProps) {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const translated = (key: string) =>
    mounted ? t(key) : i18n.getResource("en", "common", key) || key;

  return (
    <div className="flex flex-col bg-zinc-50/50 dark:bg-zinc-900/40 rounded-3xl p-5 min-h-[500px] border border-zinc-100 dark:border-zinc-800 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-5 px-1">
        <h3 className="font-semibold text-sm tracking-wide uppercase text-zinc-500 dark:text-zinc-400">
          {title}
        </h3>
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-700">
          {tasks.length}
        </span>
      </div>
      <SortableContext
        id={id}
        items={tasks.map((t) => t._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 space-y-3">
          {tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onUpdateStatus={(id, newStatus) => onUpdateTask(id, { status: newStatus })}
            />
          ))}
          {tasks.length === 0 && (
            <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 text-sm">
              {translated("dropHere")}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function TaskList({
  tasks,
  onUpdateTask,
  onEditTask,
  onDeleteTask,
  setTasksLocally,
}: TaskListProps) {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const translated = (key: string) =>
    mounted ? t(key) : i18n.getResource("en", "common", key) || key;

  const [activeTask, setActiveTask] = useState<TaskType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const todoTasks = tasks.filter((t) => t.status === "TODO");
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
  const doneTasks = tasks.filter((t) => t.status === "DONE");

  // Xử lý bắt đầu kéo tasks
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    if (task) setActiveTask(task);
  };

  // kiểm tra khi thả tasks và kết thúc
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t._id === activeId);

    const isOverAColumn =
      overId === "TODO" || overId === "IN_PROGRESS" || overId === "DONE";

    let newStatus = activeTask?.status;

    if (isOverAColumn) {
      newStatus = overId as TaskType["status"];
    } else {
      const overTask = tasks.find((t) => t._id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (activeTask && newStatus && activeTask.status !== newStatus) {
      setTasksLocally((prev) =>
        prev.map((t) =>
          t._id === activeId ? { ...t, status: newStatus as any } : t,
        ),
      );
      onUpdateTask(activeId, { status: newStatus as any });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Column
          id="TODO"
          title={translated("todo")}
          tasks={todoTasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onUpdateTask={async (id, updates) => onUpdateTask(id, updates)}
        />
        <Column
          id="IN_PROGRESS"
          title={translated("inProgress")}
          tasks={inProgressTasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onUpdateTask={async (id, updates) => onUpdateTask(id, updates)}
        />
        <Column
          id="DONE"
          title={translated("done")}
          tasks={doneTasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onUpdateTask={async (id, updates) => onUpdateTask(id, updates)}
        />
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90 rotate-2 scale-105 shadow-2xl cursor-grabbing">
            <TaskItem task={activeTask} onEdit={() => {}} onDelete={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

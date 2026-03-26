"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar as CalendarIcon, FileText, Type, UserPlus, Users } from "lucide-react";
import { TaskType, UserType } from "@/types";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "./RichTextEditor";
import { UserSelector } from "./UserSelector";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

type TaskFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<TaskType>) => void;
  initialData?: TaskType | null;
};

export function TaskForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: TaskFormProps) {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const translated = (key: string) =>
    mounted ? t(key) : i18n.getResource("en", "common", key) || key;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [deadline, setDeadline] = useState("");
  const [deadlineError, setDeadlineError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [members, setMembers] = useState<UserType[]>([]);

  const getMinDateTime = () => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const validateTitle = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setTitleError("Tiêu đề không được để trống");
      return false;
    }
    if (value.length > 100) {
      setTitleError("Tiêu đề tối đa 100 ký tự");
      return false;
    }
    setTitleError("");
    return true;
  };

  const validateDescription = (textValue: string) => {
    if (textValue.length > 500) {
      setDescriptionError("Mô tả tối đa 500 ký tự");
      return false;
    }
    setDescriptionError("");
    return true;
  };

  const validateDeadline = (value: string) => {
    if (!value) {
      setDeadlineError("");
      return true;
    }
    const selectedDate = new Date(value);
    const now = new Date();
    if (selectedDate < now) {
      setDeadlineError("Deadline phải lớn hơn thời gian hiện tại");
      return false;
    }
    setDeadlineError("");
    return true;
  };

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || "");
      setDescription(initialData?.description || "");
      // Calculate plain text length for initial display
      const plainText = (initialData?.description || "").replace(/<[^>]*>/g, "");
      setDescriptionLength(plainText.length);
      setStatus(initialData?.status || "TODO");
      if (initialData?.deadline) {
        const d = new Date(initialData.deadline);
        const pad = (n: number) => n.toString().padStart(2, "0");
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setDeadline(formatted);
      } else {
        setDeadline("");
      }
      setMembers(initialData?.members || []);
      setDeadlineError("");
      setTitleError("");
      setDescriptionError("");
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !validateTitle(title) ||
      !validateDescription(descriptionLength > 0 ? description : "") || // Using descriptionLength implicitly
      !validateDeadline(deadline)
    )
      return;

    onSubmit({
      title: title.trim(),
      description,
      status,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      members,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-full sm:max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 border border-zinc-200 dark:border-zinc-800 max-h-[92dvh] flex flex-col"
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            </div>

            <div className="flex justify-between items-center px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                {initialData ? translated("editTask") : translated("createTask")}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden flex-1">
              <div className="p-5 space-y-5 overflow-y-auto flex-1">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <Type className="w-4 h-4 text-zinc-400" />{" "}
                    {translated("title")}
                  </label>
                  <span
                    className={cn(
                      "text-xs transition-colors",
                      title.length > 100
                        ? "text-red-500 font-bold"
                        : "text-zinc-400",
                    )}
                  >
                    {title.length} / 100
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    validateTitle(e.target.value);
                  }}
                  className={cn(
                    "w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-all shadow-sm",
                    titleError
                      ? "border-red-500 ring-1 ring-red-500/20"
                      : "border-zinc-300 dark:border-zinc-700",
                  )}
                  placeholder={translated("taskTitlePlaceholder")}
                />
                {titleError && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">
                    {titleError}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <FileText className="w-4 h-4 text-zinc-400" />{" "}
                    {translated("description")}
                  </label>
                  <span
                    className={cn(
                      "text-xs transition-colors",
                      descriptionLength > 500
                        ? "text-red-500 font-bold"
                        : "text-zinc-400",
                    )}
                  >
                    {descriptionLength} / 500
                  </span>
                </div>
                <RichTextEditor
                  content={description}
                  onChange={setDescription}
                  onTextChange={(text: string) => {
                    setDescriptionLength(text.length);
                    validateDescription(text);
                  }}
                  placeholder={translated("taskDescPlaceholder")}
                  error={!!descriptionError}
                />
                {descriptionError && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">
                    {descriptionError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {translated("status")}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white shadow-sm"
                  >
                    <option value="TODO">{translated("todo")}</option>
                    <option value="IN_PROGRESS">
                      {translated("inProgress")}
                    </option>
                    <option value="DONE">{translated("done")}</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    <CalendarIcon className="w-4 h-4 text-zinc-400" />{" "}
                    {translated("deadline")}
                  </label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    min={getMinDateTime()}
                    onChange={(e) => {
                      setDeadline(e.target.value);
                      validateDeadline(e.target.value);
                    }}
                    className={cn(
                      "w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white shadow-sm transition-all",
                      deadlineError
                        ? "border-red-500 ring-1 ring-red-500/20"
                        : "border-zinc-300 dark:border-zinc-700",
                    )}
                  />
                  {deadlineError && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      {deadlineError}
                    </p>
                  )}
                </div>
              </div>

              {/* Members Section */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Users className="w-4 h-4 text-zinc-400" />{" "}
                  {translated("members") || "Thành viên"}
                </label>
                
                {/* Selected Members List */}
                <div className="flex flex-wrap gap-2 min-h-[40px] px-1">
                  {members.map((member) => (
                    <motion.div 
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      key={member._id}
                      className="flex items-center gap-2 pl-1 pr-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full border border-blue-100 dark:border-blue-800/50 text-xs font-semibold shadow-xs"
                    >
                      <div className="w-5 h-5 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] text-white">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="max-w-[100px] truncate">{member.name}</span>
                      <button 
                        type="button"
                        onClick={() => setMembers(prev => prev.filter(m => m._id !== member._id))}
                        className="hover:bg-blue-200/50 dark:hover:bg-blue-800/50 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                  {members.length === 0 && (
                    <div className="w-full flex items-center justify-center py-2 border-2 border-dashed border-zinc-100 dark:border-zinc-800/50 rounded-xl">
                      <p className="text-xs text-zinc-400 italic">Chưa có thành viên nào được gán</p>
                    </div>
                  )}
                </div>

                <div className="w-full">
                  <UserSelector 
                    selectedUserIds={members.map(m => m._id)}
                    onSelectUser={(user) => {
                      setMembers(prev => {
                        if (prev.some(m => m._id === user._id)) {
                          return prev.filter(m => m._id !== user._id);
                        }
                        return [...prev, user];
                      });
                    }}
                    label={translated("addMember") || "Thêm thành viên"}
                  />
                </div>
              </div>
              </div>

              {/* Sticky footer */}
              <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 shrink-0 bg-white dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                >
                  {translated("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={
                    !!deadlineError ||
                    !!titleError ||
                    !!descriptionError ||
                    !title.trim()
                  }
                  className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm transform active:scale-[0.98]"
                >
                  {initialData ? translated("saveChanges") : translated("createTask")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

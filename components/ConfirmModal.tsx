"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận xóa",
  message = "Bạn có chắc muốn xóa task này không? Hành động này không thể hoàn tác.",
  confirmLabel = "Xác nhận xóa",
  cancelLabel = "Hủy",
  loading = false,
}) => {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden"; // Prevent scroll when modal is open
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={loading ? undefined : onClose}
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Close button */}
            <div className="absolute top-4 right-4">
              <button
                onClick={onClose}
                disabled={loading}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 pt-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
              </div>

              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                {title}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400">
                {message}
              </p>
            </div>

            <div className="flex gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md shadow-red-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

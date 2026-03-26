"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, UserPlus, X, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { UserType } from "@/types";

/**
 * Props cho UserSelector component
 */
interface UserSelectorProps {
  /** Callback gọi khi chọn một user mới để thêm vào task */
  onAddMember?: (userId: string) => Promise<void>;
  /** Callback trả về toàn bộ thông tin user khi được chọn (dùng cho form) */
  onSelectUser?: (user: UserType) => void;
  /** Danh sách ID các user đã là thành viên của task */
  selectedUserIds?: string[];
  label?: string;
}

/**
 * Component chọn thành viên:
 * - Tự động fetch danh sách user từ API khi mở
 * - Có trạng thái loading và lỗi
 * - Hỗ trợ search và hiển thị trạng thái đã chọn
 */
export function UserSelector({
  onAddMember,
  onSelectUser,
  selectedUserIds = [],
  label = "Thêm thành viên",
}: UserSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  /**
   * Fetch danh sách user từ API thực tế khi dropdown được mở
   */
  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setIsLoading(true);
        try {
          const res = await fetch("/api/users");
          if (res.ok) {
            const data = await res.json();
            setUsers(data);
          }
        } catch (error) {
          console.error("Lỗi khi lấy danh sách user:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleToggleUser = async (user: UserType) => {
    // Nếu có onSelectUser (thường dùng trong Form) thì gọi nó
    if (onSelectUser) {
      onSelectUser(user);
      return;
    }

    if (!onAddMember) return;

    // Nếu user chưa có trong task thì mới cho phép add
    if (!selectedUserIds.includes(user._id)) {
      setIsActionLoading(user._id);
      try {
        await onAddMember(user._id);
      } catch (err) {
        console.error(err);
      } finally {
        setIsActionLoading(null);
      }
    }
  };

  /**
   * Đóng dropdown khi click ra ngoài
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setSearchTerm(""), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block w-full" ref={dropdownRef}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-zinc-900",
          "border border-zinc-200 dark:border-zinc-800 rounded-xl",
          "hover:border-blue-500 dark:hover:border-blue-500 hover:ring-4 hover:ring-blue-500/10",
          "transition-all duration-200 shadow-sm active:scale-[0.99] group",
          isOpen && "border-blue-500 ring-4 ring-blue-500/10",
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div
            className={cn(
              "flex items-center justify-center w-7 h-7 rounded-lg transition-colors",
              selectedUserIds.length > 0
                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30",
            )}
          >
            <UserPlus className="w-3.5 h-3.5" />
          </div>
          <span className="text-zinc-700 dark:text-zinc-200 text-xs font-semibold truncate">
            {selectedUserIds.length > 0
              ? `${selectedUserIds.length} members`
              : label}
          </span>
        </div>

        <div className="flex -space-x-1.5 ml-2 shrink-0">
          {selectedUserIds.slice(0, 3).map((id) => (
            <div
              key={id}
              className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden"
            >
              <div className="w-full h-full bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-inner">
                <span className="text-[9px] font-bold uppercase">?</span>
              </div>
            </div>
          ))}
          {selectedUserIds.length > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <span className="text-[9px] font-bold text-zinc-500">
                +{selectedUserIds.length - 3}
              </span>
            </div>
          )}
        </div>
      </button>

      {/* DROPDOWN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 z-60"
          >
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* SEARCH HEADER */}
              <div className="p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc email..."
                    className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-transparent focus:border-blue-500/30 rounded-xl text-sm transition-all outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                    >
                      <X className="w-3 h-3 text-zinc-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* USER LIST */}
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin mb-2" />
                    <p className="text-xs text-zinc-500 font-medium">
                      Đang tải danh sách...
                    </p>
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <div className="p-2 space-y-0.5">
                    {filteredUsers.map((user) => {
                      const isSelected = selectedUserIds.includes(user._id);
                      const isTargetLoading = isActionLoading === user._id;

                      return (
                        <button
                          key={user._id}
                          type="button"
                          disabled={isSelected || isTargetLoading}
                          onClick={() => handleToggleUser(user)}
                          className={cn(
                            "w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 group/item",
                            isSelected
                              ? "bg-blue-50 dark:bg-blue-900/20 opacity-80"
                              : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60",
                          )}
                        >
                          <div
                            className={cn(
                              "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-700",
                            )}
                          >
                            {isTargetLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isSelected ? (
                              <Check
                                className="w-4 h-4 animate-in zoom-in spin-in-12 duration-300"
                                strokeWidth={3}
                              />
                            ) : (
                              <span className="text-xs font-bold">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 text-left overflow-hidden">
                            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {user.name}
                            </div>
                            <div className="text-[10px] text-zinc-500 truncate leading-tight">
                              {user.email}
                            </div>
                          </div>

                          {!isSelected && !isTargetLoading && (
                            <div className="w-6 h-6 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <div className="p-1 bg-blue-50 dark:bg-blue-900/40 rounded-full">
                                <UserPlus className="w-3.5 h-3.5 text-blue-500" />
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800/50 outline-zinc-50/30 dark:outline-zinc-800/20 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Không tìm thấy thành viên
                    </p>
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div className="p-3 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <p className="text-[10px] text-zinc-400 font-bold tracking-tight uppercase">
                  {selectedUserIds.length} Members
                </p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 bg-zinc-900 dark:bg-zinc-50 hover:bg-black dark:hover:bg-white text-zinc-50 dark:text-zinc-900 text-[10px] font-bold rounded-lg transition-all active:scale-[0.98]"
                >
                  Xong
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
        }
        .dark .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}

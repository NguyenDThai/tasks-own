import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    common: {
      dashboard: "Dashboard",
      subtitle: "Manage your tasks efficiently and stay organized.",
      newTask: "New Task",
      totalTasks: "Total Tasks",
      completed: "Completed",
      overdueTasks: "Overdue Tasks",
      allTasks: "All Tasks",
      todo: "To Do",
      inProgress: "In Progress",
      done: "Done",
      searchPlaceholder: "Search tasks...",
      editTask: "Edit Task",
      createTask: "Create Task",
      title: "Title",
      description: "Description",
      status: "Status",
      deadline: "Deadline",
      cancel: "Cancel",
      saveChanges: "Save Changes",
      dropHere: "Drop tasks here",
      errorLoading: "Error Loading Tasks",
      due: "Due: ",
      overdue: "Overdue: ",
      taskTitlePlaceholder: "Task title",
      taskDescPlaceholder: "Add details...",
      taskCreated: "Task created successfully",
      taskUpdated: "Task updated successfully",
      taskDeleted: "Task deleted successfully",
      confirmDelete: "Are you sure you want to delete this task?",
      errorFetch: "Failed to fetch tasks",
      errorCreate: "Failed to create task",
      errorUpdate: "Failed to update task",
      errorDelete: "Failed to delete task",
    },
  },
  vi: {
    common: {
      dashboard: "Bảng điều khiển",
      subtitle: "Quản lý công việc hiệu quả và luôn ngăn nắp.",
      newTask: "Nhiệm vụ mới",
      totalTasks: "Tổng nhiệm vụ",
      completed: "Đã hoàn thành",
      overdueTasks: "Quá hạn",
      allTasks: "Tất cả",
      todo: "Cần làm",
      inProgress: "Đang làm",
      done: "Hoàn thành",
      searchPlaceholder: "Tìm kiếm công việc...",
      editTask: "Chỉnh sửa công việc",
      createTask: "Tạo công việc",
      title: "Tiêu đề",
      description: "Mô tả",
      status: "Trạng thái",
      deadline: "Hạn chót",
      cancel: "Hủy",
      saveChanges: "Lưu thay đổi",
      dropHere: "Thả công việc tại đây",
      errorLoading: "Lỗi khi tải công việc",
      due: "Hạn: ",
      overdue: "Quá hạn: ",
      taskTitlePlaceholder: "Tiêu đề công việc",
      taskDescPlaceholder: "Thêm chi tiết...",
      taskCreated: "Đã tạo công việc thành công",
      taskUpdated: "Đã cập nhật công việc thành công",
      taskDeleted: "Đã xóa công việc thành công",
      confirmDelete: "Bạn có chắc chắn muốn xóa công việc này không?",
      errorFetch: "Không thể tải danh sách công việc",
      errorCreate: "Không thể tạo công việc",
      errorUpdate: "Không thể cập nhật công việc",
      errorDelete: "Không thể xóa công việc",
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    ns: ["common"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;

# 📝 Trang Quản Lý Công Việc Cá Nhân (Task Manager)

Ứng dụng quản lý công việc cá nhân được xây dựng bằng **Next.js (App Router)**, **TypeScript**, **TailwindCSS** và **MongoDB**.

## 🚀 Tính năng chính

* ✅ Thêm / sửa / xóa công việc
* 📌 Kéo thả task giữa các trạng thái (TODO, IN_PROGRESS, DONE)
* 📱 Responsive (mobile có select để đổi trạng thái)
* 🔍 Tìm kiếm và lọc task
* ⏰ Deadline + cảnh báo quá hạn
* 📊 Thống kê task (tổng, hoàn thành, quá hạn)
* ✍️ Rich text editor cho mô tả (bold, italic, underline)
* ⚠️ Validate form (title, description, deadline)
* 🧩 Confirm modal khi xóa task
* 🌍 Hỗ trợ đa ngôn ngữ (Tiếng Việt / English)
* 🌑 Dark mode và Light mode

---

## 🛠️ Công nghệ sử dụng

* Next.js (App Router)
* React + TypeScript
* TailwindCSS
* MongoDB
* Mongoose
* Framer Motion (animation)
* Tiptap (rich text editor)
* DnD Kit (drag & drop)

---

## 📦 Cài đặt dự án

### 1. Clone project

```bash
git clone https://github.com/NguyenDThai/tasks-own.git
cd task-own
```

---

### 2. Cài đặt dependencies

```bash
npm install
```

hoặc

```bash
yarn install
```

---

### 3. Cấu hình biến môi trường

Tạo file `.env.local` ở root project:

```env
MONGODB_URI=mongodb://localhost:27017/task-manager
```

> ⚠️ Đảm bảo bạn đã cài MongoDB trên máy và đang chạy

---

### 4. Chạy project

```bash
npm run dev
```

hoặc

```bash
yarn dev
```

---

### 5. Truy cập ứng dụng

Mở trình duyệt và truy cập:

```
http://localhost:3000
```

---

## 📁 Cấu trúc thư mục

```
/app
  /api
    /tasks
/components
/models
/lib
/hooks
/types
/utils
```

---

## 🔌 API Endpoints

| Method | Endpoint       | Mô tả              |
| ------ | -------------- | ------------------ |
| GET    | /api/tasks     | Lấy danh sách task |
| POST   | /api/tasks     | Tạo task mới       |
| PUT    | /api/tasks/:id | Cập nhật task      |
| DELETE | /api/tasks/:id | Xóa task           |

---

## ⚙️ Validation

* **Title**

  * Bắt buộc
  * Tối đa 100 ký tự

* **Description**

  * Tối đa 500 ký tự

* **Deadline**

  * Phải lớn hơn thời gian hiện tại

---

## Tính năng cần cải thiện
* Authentication (Login/Register)
* Attach file vào task
* Notification deadline
* AI gợi ý task (nice-to-have 😄)

## 💡 Ghi chú

* Mobile sẽ **không dùng drag & drop**, thay vào đó dùng dropdown để đổi trạng thái
* Desktop sử dụng drag & drop để tối ưu trải nghiệm
* Dữ liệu được lưu trong MongoDB
* Rich text editor lưu dưới dạng HTML

---

## 🚀 Deploy

* Frontend + Backend: https://tasks-own.vercel.app (vercel)
* Database: MongoDB Atlas

---

## 👨‍💻 Tác giả

* Nguyễn Đức Thái

---

## 📄 License

MIT

# 🏁 ĐUA BI LỚP HỌC (Marble Race Classroom)

Trò chơi tương tác lớp học mô phỏng đua bi vật lý, lấy cảm hứng từ phương pháp dạy học sáng tạo của Thầy Giáo Tin (Giáo Viên Đổi Mới). Ứng dụng giúp giáo viên khuấy động không khí lớp học, gọi tên học sinh ngẫu nhiên, đua bằng ảnh avatar và kiểm tra kiến thức bài cũ qua AI Gemini.

![Đua Bi Lớp Học Banner](https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80)

---

## 🌟 Tính Năng Nổi Bật

### 1. 3 Chế Độ Đua Đa Dạng
- 🎯 **Đua Cho Vui (Gọi tên ngẫu nhiên):** Mô phỏng bi ve 3D lăn qua bàn đinh Plinko, máng dốc và phễu hẹp để chọn Top 1, Top 3, Top 5 học sinh lên bảng hoặc phát thưởng.
- 📸 **Đua Bằng Ảnh (Face Avatar Marbles):** Tải lên ảnh học sinh (hỗ trợ kéo thả hàng loạt hoặc chọn bộ avatar hoạt hình có sẵn). Ảnh khuôn mặt xoay tròn chân thực theo viên bi.
- 📝 **Đua Kiểm Tra Đánh Giá (Quiz & Race):** Học sinh về đích sẽ mở gói câu hỏi kiểm tra bài cũ (hỗ trợ công thức Toán LaTeX).

### 2. Tích Hợp AI Gemini Thông Minh (Chuẩn Google AI Studio)
- Giáo viên chỉ cần nhập chủ đề (ví dụ: *"Toán 7 - Số vô tỉ"*, *"Lịch sử 8 - Cách mạng tư sản"*, *"Tiếng Anh 9 - Câu điều kiện"*), AI sẽ tự động tạo bộ câu hỏi trắc nghiệm kèm 4 đáp án và lời giải thích sư phạm chi tiết.
- Tự động luân chuyển model chống quá tải: `gemini-3.1-flash-lite`, `gemini-3.5-flash`, `gemini-2.5-flash-lite`.

### 3. Hệ Thống Vật Lý 2D & Đồ Họa Sống Động
- Công nghệ HTML5 Canvas 2D tốc độ 60fps mượt mà trên cả tivi trường học và máy chiếu.
- Camera bám đuổi (Auto Camera Tracking) thông minh theo sát nhóm bi dẫn đầu.
- Hiệu ứng âm thanh chân thực bằng **Web Audio API** (không cần tải file âm thanh tĩnh bên ngoài).

### 4. Đếm Lượt Truy Cập Server-Side
- Tích hợp `counterapi.dev` namespace riêng (`duabi-edugenvn`), hiển thị tổng lượt chơi toàn hệ thống và số lượt chơi cá nhân.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local)

Yêu cầu máy tính đã cài đặt **Node.js** (phiên bản 18+ trở lên).

```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Khởi chạy máy chủ phát triển
npm run dev
```

Mở trình duyệt tại địa chỉ: `http://localhost:3000`

---

## 🌐 Hướng Dẫn Tải Lên GitHub & Triển Khai Lên Vercel

### Cách 1: Triển khai trực tiếp qua GitHub & Vercel
1. Đẩy mã nguồn lên kho chứa GitHub của bạn:
   ```bash
   git init
   git add .
   git commit -m "feat: Khoi tao game Dua Bi Lop Hoc"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo>.git
   git push -u origin main
   ```
2. Truy cập [Vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
3. Bấm **"Add New..."** → **"Project"** → Chọn kho chứa vừa tạo.
4. Framework Preset: **Vite** (Vercel tự động nhận diện).
5. Bấm **"Deploy"** — Dự án sẽ tự động build và bàn giao đường link web hoạt động 24/7!

---

## ⌨️ Phím Tắt Tiện Dụng Trong Lớp Học
- **[Phím Cách - Space]:** Bắt đầu / Tạm dừng cuộc đua
- **[Phím B]:** Bật NITRO tăng tốc toàn bộ các viên bi (học sinh hò reo hào hứng!)
- **[Phím R]:** Đặt lại các viên bi về vạch xuất phát

# Marble Race Classroom WebApp — Implementation Plan

> **REQUIRED:** Follow disciplined implementation. Every module must be verified. App must build cleanly for Vercel deployment with zero errors.

**Goal:** Xây dựng ứng dụng web game ĐUA BI (Marble Race) phục vụ dạy học và tạo không khí lớp học sôi nổi theo video Thầy Giáo Tin / Giáo Viên Đổi Mới.
**Stack:** React 18/19 + Vite + TypeScript + Tailwind CSS + HTML5 Canvas Physics Engine + Web Audio API + Gemini API.
**Deploy Target:** GitHub & Vercel (100% build pass).

---

## Danh Sách Công Việc (Checklist)

- [ ] **Task 1: Khởi tạo Project & Cấu trúc Thư mục**
  - Khởi tạo Vite + React + TypeScript + Tailwind CSS.
  - Cài đặt Lucide React, Canvas confetti, và cấu hình build Vercel (`vercel.json`, `package.json`).
  - Cấu hình Tailwind colors (`indigo`, `amber`, `emerald`, `red`) theo `giaodien.md`.

- [ ] **Task 2: Hệ thống Audio & Âm thanh Vật lý (Web Audio API)**
  - Âm thanh va chạm bi (marble clack pitch ngẫu nhiên).
  - Âm thanh còi xuất phát, tiếng nitro phóng nhanh, pháo hoa chiến thắng.
  - Âm thanh đúng/sai cho phần trắc nghiệm.

- [ ] **Task 3: Core Physics Engine cho Đua Bi (Canvas 2D)**
  - Lực hấp dẫn (gravity), ma sát không khí (friction), độ đàn hồi (restitution).
  - Va chạm giữa các quả bi với nhau (Circle-Circle Elastic Collision).
  - Hệ thống chướng ngại vật:
    - Bàn đinh Plinko (Pegs).
    - Máng trượt dốc (Ramps/Slides).
    - Cánh quạt / chong chóng quay đẩy bi (Spinners).
    - Phễu xoay ma trận (Funnel).
    - Đệm lò xo nảy (Bouncers) & Cổng tăng tốc (Boosters).
  - Hệ thống render:
    - Vẽ bi 3D bóng bẩy kèm màu sắc đa dạng.
    - Vẽ vệt sáng neon sau bi (Trail effect).
    - Vẽ nhãn tên học sinh tiếng Việt sắc nét.
    - Vẽ ảnh avatar khuôn mặt học sinh xoay theo chiều lăn của bi.
  - 3 bản đồ đường đua:
    - Map 1: Trường đua Cổ điển (Classic Pegs & Ramps).
    - Map 2: Vòng xoáy Gia tốc (Speed Boosters & Funnels).
    - Map 3: Thử thách Bậc thang (Step Drop & Obstacles).

- [ ] **Task 4: Quản lý Danh sách Học sinh & Tải Avatar**
  - Mẫu danh sách lớp nhanh (Lớp 30-40 học sinh).
  - Nhập danh sách từ văn bản / paste từ Excel.
  - Tải ảnh đại diện cho học sinh hoặc chọn bộ avatar hoạt hình/chibi dễ thương có sẵn.

- [ ] **Task 5: Ngân hàng Câu hỏi & Tích hợp Gemini AI (Tuân thủ api.md)**
  - Hỗ trợ công thức Toán học LaTeX.
  - Nhập/chọn câu hỏi trắc nghiệm A, B, C, D kèm giải thích.
  - Tích hợp Gemini API với:
    - Regex kiểm tra API Key `/^(?:AIzaSy|AQ)\S{8,}$/`.
    - Danh sách fallback model: `gemini-3.1-flash-lite`, `gemini-3.5-flash`, `gemini-2.5-flash-lite`.
    - Xử lý lỗi 503 UNAVAILABLE thông minh.

- [ ] **Task 6: 3 Chế độ chơi hoàn chỉnh**
  - Mode 1: Đua vui gọi tên (chọn Top 1, Top 3, Top 5; vinh danh bục Podium).
  - Mode 2: Đua bằng ảnh (Face Avatar Race).
  - Mode 3: Đua kiểm tra đánh giá (Quiz & Race: thi đấu trả lời câu hỏi, ghi điểm sao/XP).

- [ ] **Task 7: Bộ đếm truy cập VisitCounter (Tuân thủ visit.md)**
  - Tích hợp `counterapi.dev` namespace `duabi-edugenvn` + fallback localStorage + AnimatedNumber.

- [ ] **Task 8: Kiểm tra toàn diện & Build Vercel**
  - `npm run build` xuất thư mục `dist` thành công không cảnh báo.
  - Kiểm tra giao diện responsive từ 375px đến 4K máy chiếu.

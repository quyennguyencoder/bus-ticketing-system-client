# Bus Ticketing System - Web Client

Dự án Hệ thống Đặt vé Xe khách - Giao diện Web Client. Ứng dụng cung cấp trải nghiệm người dùng hiện đại, tương tác mượt mà cho việc tìm kiếm chuyến xe, đặt vé, và bảng điều khiển quản trị (Admin Dashboard).

## 🚀 Công nghệ sử dụng

- **Core:** React 19, TypeScript, Vite
- **State Management:** Zustand
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS 4
- **Data Fetching:** Axios
- **Real-time:** STOMP.js & SockJS-client (Kết nối WebSocket với Backend)
- **UI Components & Charts:** Recharts, Lucide React, React Hot Toast

## ✨ Tính năng nổi bật

- **Giao diện Đặt vé:** Tìm kiếm chuyến đi, chọn chỗ ngồi trực quan theo thời gian thực.
- **Cập nhật Real-time:** Nhận thông báo và đồng bộ trạng thái ghế ngồi sử dụng WebSocket giúp tránh trùng lặp đặt chỗ.
- **Admin Dashboard:** Thống kê doanh thu, số lượng vé, quản lý hệ thống chuyến xe với biểu đồ trực quan (Recharts).
- **Xác thực & Phân quyền:** Đăng nhập an toàn, phân chia quyền User và Admin.

## 🛠 Hướng dẫn Cài đặt (Local Development)

### Yêu cầu hệ thống
- Node.js (phiên bản 18+ hoặc 20+ khuyến nghị)
- npm (hoặc yarn/pnpm)

### Các bước chạy dự án

1. **Clone dự án:**
   ```bash
   git clone <repo-url>
   cd bus-ticketing-system-client
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Cấu hình môi trường:**
   Đảm bảo bạn có file `.env` ở thư mục gốc để cấu hình URL kết nối với Backend API.
   Ví dụ nội dung file `.env`:
   ```env
   VITE_API_URL=http://localhost:8080/api
   VITE_WS_URL=http://localhost:8080/ws
   ```

4. **Khởi chạy môi trường phát triển (Dev server):**
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy mặc định tại `http://localhost:5173`.

5. **Build cho Production:**
   ```bash
   npm run build
   ```
   Thư mục `dist` sẽ được tạo ra chứa các file tĩnh đã tối ưu sẵn sàng cho việc deploy (ví dụ qua Vercel, Netlify).

## 📂 Cấu trúc thư mục chính
- `src/components/`: Chứa các UI Component dùng chung trên toàn hệ thống.
- `src/pages/`: Các trang giao diện chính (Trang chủ, Admin Dashboard, Order, v.v.).
- `src/store/`: Quản lý trạng thái ứng dụng với Zustand.
- `src/types/`: Khai báo Type/Interface TypeScript giúp đảm bảo Type-Safety (ví dụ: `OrderResponse.ts`).
- `src/services/`: Cấu hình Axios, WebSockets và các hàm gọi API.

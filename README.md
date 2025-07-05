# API Orchestrator Pro (Trình điều phối API)

Một ứng dụng để kết nối và điều phối trực quan nhiều lệnh gọi API trong một quy trình làm việc. Sử dụng sức mạnh của Gemini để giúp định cấu hình các bước API của bạn.

## Cài đặt và chạy

**Yêu cầu:** Node.js

1. Cài đặt dependencies:
   ```bash
   npm install
   ```

2. Cấu hình API Key:
   - Tạo file `.env.local` trong thư mục gốc
   - Thêm dòng sau vào file:
     ```
     VITE_API_KEY=your_gemini_api_key_here
     ```
   - Lấy API key từ: https://makersuite.google.com/app/apikey

3. Chạy ứng dụng:
   ```bash
   npm run dev
   ```

## Tính năng

- Tạo và quản lý workflow API trực quan
- Tích hợp AI để tự động tạo cấu hình API
- Thực thi workflow và xem kết quả
- Xuất dữ liệu ra CSV
- Hỗ trợ template variables giữa các bước

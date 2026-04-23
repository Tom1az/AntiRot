# Project Overview: Nền tảng ĐKTN (Anti-Rot LMS)
ĐKTN là một nền tảng học tập thông minh sử dụng AI để cá nhân hoá lộ trình và kích thích tư duy chủ động (Socratic Method). 
Triết lý cốt lõi: Không bao giờ cung cấp đáp án ăn sẵn. Chống lại sự bế tắc (Frustration) và sự lười biếng (Laziness) của người học.

# 1. System Architecture (Kiến trúc Hệ thống)
Hệ thống được chia thành 3 phân hệ chính (Microservices-oriented):

## A. Frontend (Client Tier)
- **Stack:** Next.js (React), TailwindCSS, TypeScript.
- **Nhiệm vụ:** Render UI/UX theo Design System (Blue/Purple/Teal).
- **Quy tắc:** Dumb Client. Không chứa logic xử lý AI. Mọi dữ liệu (từ chat, quiz đến biểu đồ dashboard) đều phải gọi từ Backend API.

## B. Backend Core (Logic & API Tier)
- **Stack:** Python (FastAPI).
- **Database:** PostgreSQL (Lưu User, Course, Quiz) + MongoDB hoặc File-based JSONL (Lưu log chat để làm custom dataset).
- **Nhiệm vụ:**
  - Quản lý Auth, CRUD bài học, chấm điểm Quiz.
  - Chạy middleware phân tích hành vi học tập (Time-on-task, tốc độ gõ phím).
  - Cập nhật chỉ số `frustration_score` (0-100) liên tục.

## C. AI Engine & Data Service (Model Tier)
- **Core Model:** Qwen2.5-7B-Instruct (Fine-tuned trên custom dataset).
- **Inference:** vLLM hoặc Ollama API.
- **Nhiệm vụ:** Xử lý Socratic Chat, tự động sinh Adaptive Quiz dựa trên lỗ hổng kiến thức.

## D. [Advanced] Behavior Tracker Module (Mở rộng)
- **Stack:** OpenCV, MediaPipe.
- **Nhiệm vụ:** Nhận diện mức độ tập trung qua webcam (nếu học sinh cấp quyền). Module xử lý ảnh này chạy độc lập ở background client hoặc qua WebSocket về Backend để phân tích nét mặt, trạng thái chú ý (Focus/Distracted), từ đó điều chỉnh `frustration_score` với độ chính xác tuyệt đối.

# 2. Data Flow (Luồng Dữ liệu Cốt lõi)
**Luồng Chat Anti-Rot:**
1. Học sinh gửi tin nhắn ("Bài này khó quá") -> `Frontend`.
2. `Frontend` gửi REST POST đến `Backend` (kèm thông tin: thời gian thao tác, số lần xoá sửa).
3. `Backend` tính toán lại `frustration_score` (VD: tăng lên 75).
4. `Backend` xây dựng System Prompt (chuẩn ChatML), chèn `frustration_score` và Topic hiện tại vào, rồi gọi qua `AI Engine`.
5. `AI Engine (Qwen2.5)` sinh ra JSON (chứa phân tích ẩn và câu hỏi gợi mở).
6. `Backend` lưu log vào DB, trích xuất text trả về cho `Frontend`.

# 3. API Contracts Standard
Tất cả các API giao tiếp nội bộ phải tuân thủ chuẩn JSON Response sau:
```json
{
  "status": "success" | "error" | "action_required",
  "data": { ... },
  "message": "Thông điệp (nếu có)"
}
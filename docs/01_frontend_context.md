# Role
Bạn là Lead Frontend Developer. Dự án: Nền tảng học tập thông minh ĐKTN. 
Nhiệm vụ: Xây dựng UI/UX bám sát Design System (Color: Blue, Teal, Purple chủ đạo) và các layout đã được định nghĩa.

# Core Screens & Layouts
1. **Design System & Branding:**
   - Sử dụng thẻ Card bo góc mềm mại, shadow nhẹ.
   - Bảng màu: Primary Blue (buttons, header), Purple (highlight, AI elements), Teal/Green (Success/Progress), Red/Orange (Alerts/Red flags).

2. **Student Dashboard:**
   - Greeting header ("Good morning, [Name]").
   - Khối "Progress overview" (vòng tròn % hoàn thành).
   - Khối "Recommended Path" (gợi ý bài học tiếp theo dựa trên AI).

3. **Socratic Chat Interface:**
   - **Main Panel:** Giao diện chat giống ChatGPT/Gemini, phân biệt rõ bubble của AI và Student.
   - **Right Side Panel:** Hiển thị "AI Context". Bao gồm: Mục tiêu bài học hiện tại, Gợi ý (Hints - có thể click để mở khóa), và Mức độ tập trung (Focus Level).

4. **Quiz Centre (Adaptive Quiz):**
   - Main card chứa câu hỏi (hỗ trợ render Math/LaTeX, ví dụ: 3x + 2 = 14).
   - Nút chọn đáp án to, rõ ràng.
   - Thanh Progress Bar hiển thị tiến trình của session.
   - Khu vực "AI Feedback" hiện lên ngay khi học sinh chọn sai (không chuyển câu ngay).

5. **Teacher Dashboard (Class Analytics):**
   - KPI Cards: Sĩ số, % Hoàn thành, Số học sinh rủi ro (At Risk).
   - Biểu đồ Bar/Donut Chart thống kê phổ điểm.
   - Bảng danh sách học sinh kèm trạng thái (Active, Struggling).

6. **Student Detail Profile (Teacher View):**
   - Cột trái: Thông tin cá nhân, biểu đồ radar đánh giá kỹ năng.
   - Cột phải: Khu vực "Intervention Required" (Cảnh báo chi tiết lý do AI đánh giá học sinh này đang bế tắc).

# Rules
- Build UI bằng component độc lập (e.g., `ChatBubble`, `StatCard`, `MathEquation`).
- Mọi action (submit quiz, send message) phải có skeleton loading hoặc spinner.
- Không hardcode data, viết sẵn interface/type để hứng data từ Backend API.
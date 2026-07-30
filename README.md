# AntiRot — AI Socratic LMS

Nền tảng học tập giúp sinh viên giảm lệ thuộc AI và rèn tư duy theo phương pháp Socratic: AI chỉ hỏi gợi mở, không đưa đáp án sẵn.

## Tính năng

### Học sinh
- **Dashboard** — theo dõi tiến độ học tập
- **Chat Socratic** — trao đổi với AI coach (chỉ gợi mở, không spoiler đáp án)
- **Quiz** — bài kiểm tra do giáo viên hoặc AI tạo
- **Knowledge Graph** — cây kiến thức theo môn (DSA, LTNC, HĐH)
- **Recovery Plan** — lộ trình phục hồi khi học bị tụt

### Giáo viên
- **Class Analytics** — phân tích lớp, mức độ rủi ro / phụ thuộc AI
- **Quản lý học sinh** — tìm kiếm và xem chi tiết từng học sinh
- **Tạo Quiz** — tạo và lưu đề kiểm tra
- **Chat hỗ trợ sư phạm** — hỗ trợ giảng dạy bằng AI

## Cách chạy

### Yêu cầu
- Python 3.11+
- Node.js 18+
- PostgreSQL
- Gemini API key ([Google AI Studio](https://aistudio.google.com/apikey))

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # điền DATABASE_URL, SECRET_KEY, GEMINI_API_KEY
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # đặt NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

App: http://localhost:3000

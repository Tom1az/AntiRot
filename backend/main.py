from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine, Base
import models 
from routers.student_route import student
from routers.teacher_route import teacher

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AntiRot API - AI Socratic LMS",
    description="Backend system for monitoring AI dependency and Socratic coaching",
    version="1.0.0"
)

# 2. Cấu hình CORS (Gatekeeper cho phép React kết nối)
# allow_origins=["*"] cho phép tất cả các nguồn truy cập, cực kỳ hữu ích khi demo.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Đăng ký các Routers (Phân quyền Student và Teacher)
app.include_router(student)
app.include_router(teacher)

@app.get("/", tags=["Health Check"])
def health_check():
    """Endpoint để kiểm tra tình trạng server sau khi deploy"""
    return {
        "status": "AntiRot Backend is running!", 
        "academic_context": "HCMUT Computer Science Project", # Điểm nhấn cá nhân
        "version": "1.0.0"
    }

# 4. Lưu ý khi chạy lệnh khởi động trên Render:
# Lệnh Start Command sẽ là: uvicorn main:app --host 0.0.0.0 --port 10000
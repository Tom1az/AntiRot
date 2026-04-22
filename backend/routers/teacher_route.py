from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from core.database import get_db
import models
from sqlalchemy import func
from uuid import UUID
from typing import Optional

teacher = APIRouter(prefix="/teacher", tags=["Teacher Dashboard"])

# --- 1. TÌM KIẾM HỌC SINH ---
@teacher.get("/search-students")
def search_students(
    name: Optional[str] = Query(None, description="Tìm theo tên học sinh"),
    db: Session = Depends(get_db)
):
    query = db.query(models.User).filter(models.User.role == "student")
    if name:
        query = query.filter(models.User.full_name.ilike(f"%{name}%"))
    return query.all()

# --- 2. BIỂU ĐỒ LỚP HỌC (Frame 4) ---
@teacher.get("/class-analytics")
def get_class_stats(db: Session = Depends(get_db)):
    # Đếm số lượng theo rủi ro (Dùng cho biểu đồ tròn Frame 4)
    risk_dist = db.query(models.LearningProgress.risk_level, func.count(models.LearningProgress.id))\
                  .group_by(models.LearningProgress.risk_level).all()
    
    # Lấy danh sách học sinh rủi ro cao (Intervention Needed)
    high_risk_students = db.query(models.User).join(models.LearningProgress)\
                           .filter(models.LearningProgress.risk_level == 'high_risk').all()
    
    return {
        "risk_distribution": dict(risk_dist),
        "intervention_needed": high_risk_students
    }

# --- 3. DASHBOARD TỔNG QUAN ---
@teacher.get("/dashboard-summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_students = db.query(models.User).filter(models.User.role == "student").count()
    
    # Lấy các cảnh báo chưa được giải quyết của cả lớp
    recent_alerts = db.query(models.AlertInsight)\
                      .filter(models.AlertInsight.is_resolved == False)\
                      .order_by(models.AlertInsight.created_at.desc())\
                      .limit(5).all()
                      
    return {
        "total_students": total_students,
        "recent_alerts": recent_alerts
    }

# --- 4. CHI TIẾT RỦI RO (Frame 5) ---
@teacher.get("/student/{student_id}/detail")
def get_student_detail_analysis(student_id: UUID, db: Session = Depends(get_db)):
    # 1. Thông tin cá nhân & Chỉ số tổng quát (Frame 5 top bar)
    student = db.query(models.User).filter(models.User.id == student_id).first()
    
    # 2. Performance Trend (Dữ liệu vẽ biểu đồ cột Frame 5)
    trend = db.query(models.LearningProgress)\
              .filter(models.LearningProgress.student_id == student_id)\
              .order_by(models.LearningProgress.last_active.asc()).all()

    # 3. AI Dependency & Insights (Phần bên phải Frame 5)
    current_status = db.query(models.LearningProgress)\
                       .filter(models.LearningProgress.student_id == student_id)\
                       .order_by(models.LearningProgress.last_active.desc()).first()

    # 4. Personalized Recovery Track (Cái box xanh to ở giữa Frame 5)
    recovery_plan = db.query(models.AiRecoveryPlan)\
                      .filter(models.AiRecoveryPlan.student_id == student_id)\
                      .order_by(models.AiRecoveryPlan.created_at.desc()).first()

    # 5. Recent Activity Table (Bảng dưới cùng Frame 5)
    activities = db.query(models.LearningProgress)\
                   .filter(models.LearningProgress.student_id == student_id)\
                   .limit(5).all()

    return {
        "profile": student,
        "performance_trend": trend,
        "ai_dependency_score": current_status.ai_dependency if current_status else "low",
        "recovery_track": recovery_plan,
        "recent_activity": activities
    }
from pydantic import BaseModel, HttpUrl
from uuid import UUID
from datetime import datetime
from typing import Optional
from .enums_schema import UserRole

class UserBase(BaseModel):
    full_name: str
    role: UserRole
    grade: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    total_points: int
    current_streak: int
    study_hours_this_week: float
    created_at: datetime

    class Config:
        from_attributes = True
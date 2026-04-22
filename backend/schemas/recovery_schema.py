from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, Dict, Any, List
from .enums_schema import AlertType

class AlertResponse(BaseModel):
    id: UUID
    student_id: Optional[UUID]
    type: AlertType
    title: str
    content: str
    is_resolved: bool
    created_at: datetime

class RecoveryPlanResponse(BaseModel):
    id: UUID
    student_id: UUID
    plan_details: Dict[str, Any] # Chứa phases, expected_outcome
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
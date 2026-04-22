from enum import Enum

class UserRole(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"

class AIDependency(str, Enum):
    NONE = "none"
    LOW = "low"
    HIGH = "high"

class RiskLevel(str, Enum):
    OPTIMAL = "optimal"
    MODERATE = "moderate"
    HIGH_RISK = "high_risk"

class AlertType(str, Enum):
    KNOWLEDGE_DECAY = "knowledge_decay"
    INTERVENTION = "intervention_needed"
    AI_INSIGHT = "ai_insight"
"""
Student Data Models
Defines the structure for student information
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class GenderType(str, Enum):
    """Student gender types"""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class BehaviorLevel(str, Enum):
    """Student behavior levels"""
    EXCELLENT = "excellent"
    GOOD = "good"
    AVERAGE = "average"
    CHALLENGING = "challenging"


class AcademicLevel(str, Enum):
    """Academic performance levels"""
    ADVANCED = "advanced"
    PROFICIENT = "proficient"
    BASIC = "basic"
    BELOW_BASIC = "below_basic"


class SpecialNeed(BaseModel):
    """Special needs or accommodations"""
    type: str = Field(..., description="Type of special need")
    description: Optional[str] = Field(None, description="Detailed description")
    requires_front_seat: bool = Field(False, description="Needs to sit in front")
    requires_support_buddy: bool = Field(False, description="Needs peer support")


class Student(BaseModel):
    """
    Student model with all attributes needed for optimization
    """
    # Basic Information
    id: str = Field(..., description="Unique student identifier")
    name: str = Field(..., description="Student full name")
    gender: GenderType = Field(..., description="Student gender")
    age: Optional[int] = Field(None, ge=5, le=18, description="Student age")

    # Academic Attributes
    academic_level: AcademicLevel = Field(..., description="Academic performance level")
    academic_score: float = Field(0.0, ge=0.0, le=100.0, description="Overall academic score")
    math_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    reading_score: Optional[float] = Field(None, ge=0.0, le=100.0)

    # Behavioral Attributes
    behavior_level: BehaviorLevel = Field(..., description="Behavior level")
    behavior_score: float = Field(0.0, ge=0.0, le=100.0, description="Behavior score")
    attention_span: Optional[int] = Field(None, ge=1, le=10, description="Attention span (1-10)")
    participation_level: Optional[int] = Field(None, ge=1, le=10, description="Class participation (1-10)")

    # Social Attributes
    is_leader: bool = Field(False, description="Natural leader")
    is_shy: bool = Field(False, description="Shy or introverted")
    friends_ids: List[str] = Field(default_factory=list, description="IDs of friends")
    incompatible_ids: List[str] = Field(default_factory=list, description="IDs of incompatible students")

    # Special Needs
    special_needs: List[SpecialNeed] = Field(default_factory=list, description="List of special needs")
    requires_front_row: bool = Field(False, description="Must sit in front row")
    requires_quiet_area: bool = Field(False, description="Needs quiet seating area")
    has_mobility_issues: bool = Field(False, description="Has mobility constraints")

    # Language & Culture
    primary_language: Optional[str] = Field(None, description="Primary language spoken")
    is_bilingual: bool = Field(False, description="Speaks multiple languages")
    cultural_background: Optional[str] = Field(None, description="Cultural background")

    # Additional Attributes
    notes: Optional[str] = Field(None, description="Additional notes from teacher")
    preferred_seat_position: Optional[str] = Field(None, description="Teacher's preferred position")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "S001",
                "name": "יוסי כהן",
                "gender": "male",
                "age": 12,
                "academic_level": "proficient",
                "academic_score": 85.0,
                "behavior_level": "good",
                "behavior_score": 90.0,
                "attention_span": 7,
                "is_leader": True,
                "friends_ids": ["S002", "S005"],
                "incompatible_ids": ["S010"],
                "special_needs": [],
                "requires_front_row": False,
                "primary_language": "Hebrew"
            }
        }


class StudentCompatibility(BaseModel):
    """Compatibility score between two students"""
    student1_id: str
    student2_id: str
    compatibility_score: float = Field(..., ge=0.0, le=1.0, description="Compatibility (0-1)")
    reason: Optional[str] = Field(None, description="Reason for score")

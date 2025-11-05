"""
Classroom and Seating Models
Defines classroom layouts and seating arrangements
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class LayoutType(str, Enum):
    """Classroom layout types"""
    ROWS = "rows"
    PAIRS = "pairs"
    CLUSTERS = "clusters"
    U_SHAPE = "u-shape"
    CIRCLE = "circle"
    FLEXIBLE = "flexible"


class SeatPosition(BaseModel):
    """Position of a seat in the classroom"""
    row: int = Field(..., ge=0, description="Row number (0-indexed)")
    col: int = Field(..., ge=0, description="Column number (0-indexed)")
    x: Optional[float] = Field(None, description="X coordinate (optional)")
    y: Optional[float] = Field(None, description="Y coordinate (optional)")
    is_front_row: bool = Field(False, description="Is this in the front row")
    is_near_teacher: bool = Field(False, description="Is this near teacher desk")
    is_window_seat: bool = Field(False, description="Is this near window")
    is_door_seat: bool = Field(False, description="Is this near door")


class Seat(BaseModel):
    """Individual seat in the classroom"""
    position: SeatPosition
    student_id: Optional[str] = Field(None, description="ID of student assigned to this seat")
    is_empty: bool = Field(True, description="Is this seat empty")


class ClassroomLayout(BaseModel):
    """Classroom physical layout"""
    layout_type: LayoutType
    rows: int = Field(..., ge=1, description="Number of rows")
    cols: int = Field(..., ge=1, description="Number of columns per row")
    total_seats: int = Field(..., ge=1, description="Total number of seats")
    seats: List[Seat] = Field(default_factory=list, description="List of all seats")

    class Config:
        json_schema_extra = {
            "example": {
                "layout_type": "rows",
                "rows": 5,
                "cols": 6,
                "total_seats": 30
            }
        }


class OptimizationObjectives(BaseModel):
    """
    Weights for different optimization objectives
    All weights should sum to 1.0
    """
    academic_balance: float = Field(0.3, ge=0.0, le=1.0, description="Weight for academic balance")
    behavioral_balance: float = Field(0.3, ge=0.0, le=1.0, description="Weight for behavioral balance")
    diversity: float = Field(0.2, ge=0.0, le=1.0, description="Weight for diversity (gender, culture)")
    special_needs: float = Field(0.2, ge=0.0, le=1.0, description="Weight for special needs accommodation")

    class Config:
        json_schema_extra = {
            "example": {
                "academic_balance": 0.3,
                "behavioral_balance": 0.3,
                "diversity": 0.2,
                "special_needs": 0.2
            }
        }


class SeatingConstraints(BaseModel):
    """Constraints for seating optimization"""
    max_same_gender_row: Optional[int] = Field(None, description="Max consecutive students of same gender in a row")
    separate_student_pairs: List[List[str]] = Field(default_factory=list, description="Pairs of students to separate")
    keep_student_pairs_together: List[List[str]] = Field(default_factory=list, description="Pairs to keep together")
    front_row_student_ids: List[str] = Field(default_factory=list, description="Students who must sit in front")
    back_row_student_ids: List[str] = Field(default_factory=list, description="Students who can sit in back")


class SeatingArrangement(BaseModel):
    """Complete seating arrangement result"""
    layout: ClassroomLayout
    student_seats: Dict[str, SeatPosition] = Field(default_factory=dict, description="Map of student_id to seat position")
    fitness_score: float = Field(0.0, ge=0.0, le=1.0, description="Overall fitness score (0-1)")
    objective_scores: Dict[str, float] = Field(default_factory=dict, description="Individual objective scores")
    generation_count: int = Field(0, description="Number of generations used")
    computation_time: float = Field(0.0, description="Time taken in seconds")
    warnings: List[str] = Field(default_factory=list, description="Any warnings or issues")

    class Config:
        json_schema_extra = {
            "example": {
                "fitness_score": 0.92,
                "generation_count": 100,
                "computation_time": 2.3,
                "objective_scores": {
                    "academic_balance": 0.95,
                    "behavioral_balance": 0.88,
                    "diversity": 0.90,
                    "special_needs": 1.0
                }
            }
        }

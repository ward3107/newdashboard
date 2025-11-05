"""
API Request/Response Models
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from app.models.student import Student
from app.models.classroom import (
    LayoutType,
    OptimizationObjectives,
    SeatingConstraints,
    SeatingArrangement
)


class OptimizeClassroomRequest(BaseModel):
    """Request to optimize classroom seating"""
    students: List[Student] = Field(..., description="List of students to arrange")
    layout_type: LayoutType = Field(LayoutType.ROWS, description="Desired classroom layout")
    rows: int = Field(5, ge=1, le=20, description="Number of rows")
    cols: int = Field(6, ge=1, le=20, description="Seats per row")
    objectives: Optional[OptimizationObjectives] = Field(None, description="Optimization objectives weights")
    constraints: Optional[SeatingConstraints] = Field(None, description="Seating constraints")
    max_generations: Optional[int] = Field(None, ge=10, le=500, description="Max GA generations")

    class Config:
        json_schema_extra = {
            "example": {
                "layout_type": "rows",
                "rows": 5,
                "cols": 6,
                "objectives": {
                    "academic_balance": 0.3,
                    "behavioral_balance": 0.3,
                    "diversity": 0.2,
                    "special_needs": 0.2
                },
                "max_generations": 100
            }
        }


class OptimizeClassroomResponse(BaseModel):
    """Response from classroom optimization"""
    success: bool = Field(..., description="Whether optimization succeeded")
    optimization_id: str = Field(..., description="Unique ID for this optimization")
    result: Optional[SeatingArrangement] = Field(None, description="Optimized seating arrangement")
    error: Optional[str] = Field(None, description="Error message if failed")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "optimization_id": "opt_12345",
                "result": {
                    "fitness_score": 0.92,
                    "generation_count": 100,
                    "computation_time": 2.3
                }
            }
        }


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")
    message: str = Field(..., description="Status message")

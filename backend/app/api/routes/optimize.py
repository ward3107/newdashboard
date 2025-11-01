"""
Optimization API Routes
Handles classroom seating optimization requests
"""

from fastapi import APIRouter, HTTPException, status
from typing import Dict
import uuid
import logging

from app.models.request import OptimizeClassroomRequest, OptimizeClassroomResponse
from app.models.classroom import OptimizationObjectives, SeatingConstraints
from app.services.genetic_algorithm import ClassroomOptimizer

# Setup logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/v1/optimize", tags=["optimization"])


@router.post("/classroom", response_model=OptimizeClassroomResponse)
async def optimize_classroom(request: OptimizeClassroomRequest):
    """
    Optimize classroom seating arrangement using genetic algorithm

    This endpoint accepts student data and optimization parameters,
    then returns an optimized seating arrangement.

    Args:
        request: OptimizeClassroomRequest with students and parameters

    Returns:
        OptimizeClassroomResponse with optimized arrangement

    Raises:
        HTTPException: If optimization fails
    """
    try:
        # Generate unique optimization ID
        optimization_id = f"opt_{uuid.uuid4().hex[:12]}"

        logger.info(f"Starting optimization {optimization_id} for {len(request.students)} students")

        # Validate input
        if len(request.students) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No students provided"
            )

        total_seats = request.rows * request.cols
        if len(request.students) > total_seats:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Too many students ({len(request.students)}) for available seats ({total_seats})"
            )

        # Use default objectives if not provided
        objectives = request.objectives or OptimizationObjectives()
        constraints = request.constraints or SeatingConstraints()

        # Create optimizer
        optimizer = ClassroomOptimizer(
            students=request.students,
            layout_type=request.layout_type,
            rows=request.rows,
            cols=request.cols,
            objectives=objectives,
            constraints=constraints
        )

        # Run optimization
        result = optimizer.optimize(max_generations=request.max_generations)

        logger.info(
            f"Optimization {optimization_id} completed: "
            f"fitness={result.fitness_score:.3f}, "
            f"time={result.computation_time:.2f}s"
        )

        return OptimizeClassroomResponse(
            success=True,
            optimization_id=optimization_id,
            result=result,
            error=None
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Optimization failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Optimization failed: {str(e)}"
        )


@router.get("/status")
async def get_optimization_status():
    """
    Get the status of the optimization service

    Returns:
        Service status information
    """
    return {
        "status": "operational",
        "service": "classroom optimization",
        "algorithm": "genetic algorithm (DEAP)",
        "capabilities": {
            "max_students": 100,
            "layouts": ["rows", "pairs", "clusters", "u-shape", "circle", "flexible"],
            "features": [
                "academic balance",
                "behavioral compatibility",
                "diversity optimization",
                "special needs accommodation"
            ]
        }
    }

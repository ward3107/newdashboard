"""
ISHEBOT Optimization API
FastAPI application for classroom seating optimization
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.routes import optimize
from app.models.request import HealthCheckResponse
from app.middleware import RateLimiter

# Setup logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Debug mode: {settings.DEBUG}")

    # Security validation
    if not settings.DEBUG:
        if not settings.requires_secret_key:
            logger.error("❌ CRITICAL: SECRET_KEY not configured or too short!")
            logger.error("Production mode requires a SECRET_KEY of at least 32 characters.")
            logger.error("Set SECRET_KEY environment variable before starting the server.")
            raise RuntimeError(
                "SECRET_KEY not configured for production. "
                "Please set a SECRET_KEY environment variable (min 32 characters)."
            )
        logger.info("✅ SECRET_KEY validated")

    if not settings.is_production_ready:
        logger.warning("⚠️ Application configuration incomplete for production")

    yield
    # Shutdown
    logger.info("Shutting down application")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ISHEBOT Classroom Optimization API

    This API provides intelligent classroom seating optimization using genetic algorithms.

    ## Features

    * **Genetic Algorithm Optimization**: Uses DEAP for advanced evolutionary optimization
    * **Multi-Objective**: Balances academic performance, behavior, diversity, and special needs
    * **Flexible Layouts**: Supports multiple classroom configurations
    * **Real-time Processing**: Fast optimization with configurable generation limits

    ## Integration

    Designed to work seamlessly with the ISHEBOT React dashboard for a complete
    classroom management solution.
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
# Restrict to specific origins, methods, and headers for security
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_origin_regex=settings.allowed_origins_regex if settings.DEBUG else None,  # Only allow regex in dev
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Specific methods only
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
    ],  # Specific headers only
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Include routers
app.include_router(optimize.router)

# Add rate limiter middleware
# Must be added after CORS but before routes
app.add_middleware(
    RateLimiter,
    requests_per_minute=settings.RATE_LIMIT_REQUESTS_PER_MINUTE,
    burst_size=settings.RATE_LIMIT_BURST,
    exclude_paths=["/", "/health", "/docs", "/redoc", "/openapi.json"]
)


# Root endpoint
@app.get("/", response_model=HealthCheckResponse)
async def root():
    """
    Root endpoint - Health check

    Returns:
        Service status and version information
    """
    return HealthCheckResponse(
        status="healthy",
        version=settings.APP_VERSION,
        message=f"{settings.APP_NAME} is running"
    )


# Health check endpoint
@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """
    Health check endpoint

    Returns:
        Service health status
    """
    return HealthCheckResponse(
        status="healthy",
        version=settings.APP_VERSION,
        message="Service is operational"
    )


# Error handlers
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)

    # Sanitize error message - never expose raw exceptions
    if settings.DEBUG:
        # In dev, show error type but not full details
        error_type = type(exc).__name__
        user_message = f"Internal server error: {error_type}"
    else:
        # In production, show generic message
        user_message = "An error occurred"

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": user_message
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )

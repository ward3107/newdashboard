"""
Rate Limiter Middleware for FastAPI

Implements token bucket rate limiting to prevent API abuse.
Uses in-memory storage with client IP as the key.
"""

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from typing import Dict, Tuple
import time
import logging
from collections import defaultdict

logger = logging.getLogger(__name__)


class RateLimiter(BaseHTTPMiddleware):
    """
    Rate limiter middleware using token bucket algorithm.

    Limits requests per IP address to prevent abuse and DDoS attacks.
    """

    def __init__(
        self,
        app,
        requests_per_minute: int = 60,
        burst_size: int = 10,
        exclude_paths: list = None
    ):
        """
        Initialize rate limiter.

        Args:
            app: FastAPI app instance
            requests_per_minute: Sustained rate limit (requests per minute)
            burst_size: Maximum burst size (requests allowed instantly)
            exclude_paths: Paths to exclude from rate limiting (e.g., /health)
        """
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.burst_size = burst_size
        self.exclude_paths = exclude_paths or ["/", "/health", "/docs", "/redoc", "/openapi.json"]

        # Token buckets: {ip: (tokens, last_update_time)}
        self.buckets: Dict[str, Tuple[float, float]] = defaultdict(lambda: (burst_size, time.time()))

        logger.info(
            f"Rate limiter initialized: {requests_per_minute} req/min, "
            f"burst={burst_size}, excluded_paths={exclude_paths}"
        )

    async def dispatch(self, request: Request, call_next):
        """
        Process request through rate limiter.

        Args:
            request: Incoming request
            call_next: Next middleware/route handler

        Returns:
            Response or rate limit error
        """
        # Skip rate limiting for excluded paths
        if request.url.path in self.exclude_paths:
            return await call_next(request)

        # Get client IP
        client_ip = self._get_client_ip(request)

        # Check rate limit
        allowed, retry_after = self._check_rate_limit(client_ip)

        if not allowed:
            logger.warning(f"Rate limit exceeded for {client_ip}")
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Rate limit exceeded",
                    "message": f"Too many requests. Try again in {retry_after:.1f} seconds.",
                    "retry_after": retry_after
                },
                headers={
                    "Retry-After": str(int(retry_after)),
                    "X-RateLimit-Limit": str(self.requests_per_minute),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(time.time() + retry_after))
                }
            )

        # Update tokens after successful request
        self._update_tokens(client_ip)

        # Add rate limit headers to response
        response = await call_next(request)
        tokens, _ = self.buckets[client_ip]
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(int(tokens))

        return response

    def _get_client_ip(self, request: Request) -> str:
        """
        Get client IP address from request.

        Handles proxy headers (X-Forwarded-For, X-Real-IP)
        """
        # Check for forwarded IP (behind proxy/load balancer)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Take the first IP (original client)
            return forwarded_for.split(",")[0].strip()

        # Check for real IP header
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        # Fall back to direct connection IP
        if request.client:
            return request.client.host

        return "unknown"

    def _check_rate_limit(self, client_ip: str) -> Tuple[bool, float]:
        """
        Check if request is within rate limit.

        Uses token bucket algorithm:
        - Bucket starts with `burst_size` tokens
        - Tokens refill at `requests_per_minute` per minute
        - Each request consumes 1 token
        - Request denied if bucket is empty

        Args:
            client_ip: Client IP address

        Returns:
            Tuple of (allowed: bool, retry_after: float)
        """
        now = time.time()
        tokens, last_update = self.buckets[client_ip]

        # Calculate time passed and refill tokens
        time_passed = now - last_update
        refill_rate = self.requests_per_minute / 60.0  # tokens per second
        new_tokens = min(self.burst_size, tokens + time_passed * refill_rate)

        # Update bucket
        self.buckets[client_ip] = (new_tokens, now)

        # Check if request is allowed
        if new_tokens >= 1.0:
            return True, 0.0
        else:
            # Calculate retry after (time to refill 1 token)
            retry_after = (1.0 - new_tokens) / refill_rate
            return False, retry_after

    def _update_tokens(self, client_ip: str):
        """Consume one token from bucket after successful request."""
        tokens, last_update = self.buckets[client_ip]
        self.buckets[client_ip] = (max(0, tokens - 1.0), last_update)

    def reset_bucket(self, client_ip: str):
        """Reset rate limit bucket for a specific IP (admin function)."""
        if client_ip in self.buckets:
            del self.buckets[client_ip]
            logger.info(f"Rate limit bucket reset for {client_ip}")

    def get_stats(self) -> Dict:
        """Get rate limiter statistics."""
        return {
            "active_buckets": len(self.buckets),
            "requests_per_minute": self.requests_per_minute,
            "burst_size": self.burst_size,
            "excluded_paths": self.exclude_paths
        }

"""
Application Configuration
Manages all settings using Pydantic BaseSettings
"""

from pydantic_settings import BaseSettings
from typing import List, Union, Optional
import os


class Settings(BaseSettings):
    """Application settings and configuration"""

    # App Info
    APP_NAME: str = "ISHEBOT Optimization API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    ALLOWED_ORIGINS: Union[List[str], str] = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    )

    @property
    def allowed_origins_list(self) -> List[str]:
        """Convert ALLOWED_ORIGINS to list if it's a string, excluding wildcards"""
        origins = []
        if isinstance(self.ALLOWED_ORIGINS, str):
            origins = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(',')]
        else:
            origins = self.ALLOWED_ORIGINS

        # Filter out wildcard patterns (they'll be handled by allowed_origins_regex)
        return [origin for origin in origins if '*' not in origin]

    @property
    def allowed_origins_regex(self) -> Optional[str]:
        r"""
        Convert wildcard patterns to regex for CORS middleware
        Converts https://*.vercel.app to https://.*\.vercel\.app
        """
        origins = []
        if isinstance(self.ALLOWED_ORIGINS, str):
            origins = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(',')]
        else:
            origins = self.ALLOWED_ORIGINS

        # Find wildcard patterns and convert to regex
        wildcard_patterns = [origin for origin in origins if '*' in origin]

        if not wildcard_patterns:
            return None

        # Convert wildcards to regex patterns
        regex_parts = []
        for pattern in wildcard_patterns:
            # Escape special regex characters except *
            escaped = pattern.replace('.', r'\.').replace('*', '.*')
            regex_parts.append(escaped)

        # Combine all patterns with | (OR)
        return '|'.join(regex_parts)

    # Genetic Algorithm
    GA_POPULATION_SIZE: int = 100
    GA_GENERATIONS: int = 100
    GA_MUTATION_RATE: float = 0.1
    GA_CROSSOVER_RATE: float = 0.8

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-key-only-never-use-in-production")
    ALGORITHM: str = "HS256"

    @property
    def is_production_ready(self) -> bool:
        """Check if production configuration is complete"""
        if self.DEBUG:
            return True  # Dev mode is always OK
        return self.SECRET_KEY != "dev-key-only-never-use-in-production"

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create a single instance
settings = Settings()

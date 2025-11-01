"""
Application Configuration
Manages all settings using Pydantic BaseSettings
"""

from pydantic_settings import BaseSettings
from typing import List, Union
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
    ALLOWED_ORIGINS: Union[List[str], str] = [
        "http://localhost:3003",
        "http://localhost:3000",
        "http://127.0.0.1:3003"
    ]

    @property
    def allowed_origins_list(self) -> List[str]:
        """Convert ALLOWED_ORIGINS to list if it's a string"""
        if isinstance(self.ALLOWED_ORIGINS, str):
            return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(',')]
        return self.ALLOWED_ORIGINS

    # Genetic Algorithm
    GA_POPULATION_SIZE: int = 100
    GA_GENERATIONS: int = 100
    GA_MUTATION_RATE: float = 0.1
    GA_CROSSOVER_RATE: float = 0.8

    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create a single instance
settings = Settings()

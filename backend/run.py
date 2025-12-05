#!/usr/bin/env python3
"""
NeuroLoad Backend Server Runner
"""
import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=True,  # Enable auto-reload during development
        log_level="info"
    )

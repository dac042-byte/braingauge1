import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Application settings"""
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./neuroload.db")
    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8000"))

    # Speech analysis parameters
    TARGET_WPM: float = 150.0  # Average speaking rate
    FILLER_WORDS: list = ["um", "uh", "like", "you know", "basically", "actually", "literally"]

    # Score weights
    SPEECH_WEIGHT: float = 0.35
    COGNITIVE_WEIGHT: float = 0.40
    VISUAL_WEIGHT: float = 0.25

    # Upload settings
    UPLOAD_DIR: str = "uploads"
    MAX_AUDIO_SIZE_MB: int = 10

settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

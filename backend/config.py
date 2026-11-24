import os
from pathlib import Path
from typing import List, Dict
from pydantic import BaseModel
from dotenv import load_dotenv

# Load from both current dir and parent dir
load_dotenv(Path(__file__).parent / ".env")
load_dotenv(Path(__file__).parent.parent / ".env")

class KeyConfig(BaseModel):
    id: str
    key: str

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    ALLOWED_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,*").split(",")
        if origin.strip()
    ]
    ENABLE_FAILURE_SIMULATION: bool = os.getenv("ENABLE_FAILURE_SIMULATION", "true").lower() in ("true", "1", "yes")
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "gemini/gemini-3.5-flash-lite")
    DEFAULT_SYSTEM_PROMPT: str = os.getenv(
        "DEFAULT_SYSTEM_PROMPT",
        "You are TITAN AI, an intelligent, resilient, and precise conversational assistant."
    )
    
    @property
    def key_pool(self) -> List[KeyConfig]:
        raw_keys = os.getenv("LLM_API_KEYS", "")
        if not raw_keys:
            raw_keys = "dummy_key_1,dummy_key_2"
        keys = [k.strip() for k in raw_keys.split(",") if k.strip()]
        return [KeyConfig(id=f"key_{i+1}", key=k) for i, k in enumerate(keys)]

settings = Settings()

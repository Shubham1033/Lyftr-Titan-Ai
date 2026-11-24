from typing import Optional, List, Any
from pydantic import BaseModel, Field, field_validator

class ChatRequest(BaseModel):
    session_id: str = Field(..., min_length=1, max_length=128, description="Required, 1-128 chars")
    message: str = Field(..., min_length=1, max_length=4000, description="Required, 1-4000 chars after trimming")
    system_prompt: Optional[str] = Field(default=None, description="Optional system prompt override")

    @field_validator("session_id")
    @classmethod
    def validate_session_id(cls, v: str) -> str:
        s = v.strip()
        if not s or len(s) > 128:
            raise ValueError("session_id must be between 1 and 128 characters")
        return s

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("message cannot be empty after trimming whitespace")
        if len(s) > 4000:
            raise ValueError("message cannot exceed 4000 characters")
        return s

class ResponseMetadata(BaseModel):
    resolution_source: str # Exactly "LIVE_INFERENCE" or "LLM_CACHE"
    model: str
    latency_ms: int
    input_tokens: int
    output_tokens: int
    key_id: Optional[str] # string or null
    fallback_attempts: int

class ChatResponse(BaseModel):
    session_id: str
    reply: str
    metadata: ResponseMetadata

class HealthResponse(BaseModel):
    status: str
    keys_configured: int
    cache_enabled: bool

class AssistantStoredMetadata(BaseModel):
    resolution_source: str
    input_tokens: int
    output_tokens: int

class SessionMessage(BaseModel):
    role: str
    content: str
    metadata: Optional[dict] = None

class SessionMessagesResponse(BaseModel):
    session_id: str
    messages: List[SessionMessage]

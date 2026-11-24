from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Request, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder
from starlette.exceptions import HTTPException as StarletteHTTPException

from config import settings
import database
from models import (
    ChatRequest,
    ChatResponse,
    ResponseMetadata,
    HealthResponse,
    SessionMessagesResponse,
    SessionMessage
)
import llm_gateway

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure SQLite tables and indexes exist
    await database.init_db()
    yield
    # Shutdown logic if any

app = FastAPI(
    title="TITAN AI Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in settings.ALLOWED_ORIGINS else settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception handler for 422 Validation Errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": jsonable_encoder(exc.errors())}
    )

# Custom exception handler for Starlette/FastAPI HTTPExceptions
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# Generic fallback error handler ensuring JSON with detail
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc)}
    )

@app.get("/health", response_model=HealthResponse)
async def get_health():
    db_healthy = await database.check_db_health()
    if not db_healthy:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unreachable"
        )
    
    return HealthResponse(
        status="ok",
        keys_configured=len(settings.key_pool),
        cache_enabled=True
    )

@app.post("/chat", response_model=ChatResponse)
async def post_chat(
    payload: ChatRequest,
    x_simulate_failure: Optional[str] = Header(None, alias="X-Simulate-Failure")
):
    session_id = payload.session_id
    message_content = payload.message.strip()
    
    # 1. Fetch prior history from SQLite
    history_messages = await database.get_session_messages(session_id)
    
    # 2. Build full message sequence for the LLM
    sys_prompt = payload.system_prompt.strip() if payload.system_prompt and payload.system_prompt.strip() else settings.DEFAULT_SYSTEM_PROMPT
    
    llm_messages: List[Dict[str, str]] = [
        {"role": "system", "content": sys_prompt}
    ]
    
    if history_messages:
        for m in history_messages:
            llm_messages.append({"role": m["role"], "content": m["content"]})
            
    llm_messages.append({"role": "user", "content": message_content})

    # 3. Call LLM Gateway (with caching & failover)
    try:
        reply_text, meta = await llm_gateway.execute_chat(
            session_id=session_id,
            messages=llm_messages,
            model=settings.DEFAULT_MODEL,
            simulate_failure_header=x_simulate_failure
        )
    except llm_gateway.AllProvidersUnavailableException:
        # Crucial requirement: failed requests are NOT added to session history
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="all providers unavailable"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )

    # 4. Save both user message and assistant reply to SQLite
    await database.save_message(session_id, "user", message_content)
    
    stored_metadata = {
        "resolution_source": meta["resolution_source"],
        "input_tokens": meta["input_tokens"],
        "output_tokens": meta["output_tokens"]
    }
    await database.save_message(session_id, "assistant", reply_text, metadata=stored_metadata)

    return ChatResponse(
        session_id=session_id,
        reply=reply_text,
        metadata=ResponseMetadata(**meta)
    )

@app.get("/sessions/{session_id}/messages", response_model=SessionMessagesResponse)
async def get_session_history(session_id: str):
    messages = await database.get_session_messages(session_id)
    if messages is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="session not found"
        )
    
    session_messages = [SessionMessage(**m) for m in messages]
    return SessionMessagesResponse(
        session_id=session_id,
        messages=session_messages
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

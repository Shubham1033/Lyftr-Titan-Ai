# TITAN AI — FastAPI Backend Gateway

High-resilience LLM inference gateway built with **FastAPI**, **LiteLLM**, and **aiosqlite**. It implements automatic multi-key fallback, deterministic response caching, per-request token usage tracking, and multi-turn SQLite conversation persistence.

---

## 1. Architecture Overview

```
                      +---------------------------------------+
                      |       Client Request (POST /chat)     |
                      +---------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |         Fetch SQLite History          |
                      +---------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |       Deterministic Cache Lookup      |
                      |   hash(model + full_message_history)  |
                      +---------------------------------------+
                             /                         \
                     [Cache Hit]                     [Cache Miss]
                            /                             \
                           v                               v
            +-----------------------------+   +-----------------------------+
            |      Return LLM_CACHE       |   |      Key Failover Pool      |
            |     (0ms, key_id: null)     |   | (key_1 -> key_2 on 429/5xx) |
            +-----------------------------+   +-----------------------------+
                                                           |
                                                           v
                                              +-----------------------------+
                                              |   Persist User & Assistant  |
                                              |     Turn in SQLite DB       |
                                              +-----------------------------+
```

---

## 2. API Endpoints

The backend exposes **exactly three endpoints** in strict compliance with the Lyftr AI specification:

### 1. `GET /health`
Returns system health, total configured keys in the pool, and caching status.
```json
{
  "status": "ok",
  "keys_configured": 2,
  "cache_enabled": true
}
```

### 2. `POST /chat`
Accepts a user message and optional system prompt override. Maintains conversation history per `session_id`.

**Request Body:**
```json
{
  "session_id": "s-7f3a",
  "message": "What is the capital of France?",
  "system_prompt": "Optional system prompt"
}
```

**Optional Header:**
- `X-Simulate-Failure: key_1=429` (supports 429, 500, 502, 503, or `*=429`)

**Response (200 OK):**
```json
{
  "session_id": "s-7f3a",
  "reply": "The capital of France is Paris.",
  "metadata": {
    "resolution_source": "LIVE_INFERENCE",
    "model": "gemini/gemini-3.5-flash-lite",
    "latency_ms": 582,
    "input_tokens": 24,
    "output_tokens": 3,
    "key_id": "key_1",
    "fallback_attempts": 0
  }
}
```

### 3. `GET /sessions/{session_id}/messages`
Retrieves stored multi-turn conversation history from SQLite (oldest first, without system prompt).
```json
{
  "session_id": "s-7f3a",
  "messages": [
    { "role": "user", "content": "What is the capital of France?" },
    {
      "role": "assistant",
      "content": "The capital of France is Paris.",
      "metadata": {
        "resolution_source": "LIVE_INFERENCE",
        "input_tokens": 24,
        "output_tokens": 3
      }
    }
  ]
}
```

---

## 3. Interactive Documentation
When running, interactive OpenAPI documentation is automatically available at:
- **Swagger UI:** `/docs` (e.g. `https://titan-ai-backend-1ypa.onrender.com/docs`)
- **ReDoc:** `/redoc`
- **OpenAPI JSON:** `/openapi.json`

---

## 4. SQLite Schema & Persistence

Session history is persisted using `aiosqlite`. On startup, tables and indexes are automatically created:
```sql
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
```

---

## 5. Running Tests

Run the comprehensive automated test suite covering health, live inference, caching, key fallback, and error handling:
```bash
python -m pytest test_main.py -v
```

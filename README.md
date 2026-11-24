# TITAN AI — Full-Stack LLM Chatbot with Key Failover & Response Caching

TITAN AI is a high-resilience AI conversation workspace built with **FastAPI**, **LiteLLM**, **SQLite**, and **React (Vite + TypeScript + Tailwind CSS)**. It features automatic multi-key failover, deterministic response caching, per-request token tracking, and multi-turn session persistence.

---

## 1. Live URLs

- **Frontend Application (Live):** `https://titan-ai-frontend.vercel.app` *(or your deployed Vercel/Netlify URL)*
- **Backend API Base URL (Live):** `https://titan-ai-backend.onrender.com` *(or your deployed Render/Railway URL)*
- **Backend Health Check:** `https://titan-ai-backend.onrender.com/health`
- **Public GitHub Repository:** `https://github.com/<your-username>/lyftr-titan-ai`

---

## 2. Run locally: with Docker and without

### Option A: With Docker & Docker Compose (Recommended)

Make sure Docker and Docker Compose are installed and running.

1. **Clone the repository and copy environment configuration:**
   ```bash
   cp .env.example .env
   ```
   *(Optionally, update `LLM_API_KEYS` in `.env` with your actual Google Gemini or OpenAI API keys)*.

2. **Start the complete stack:**
   ```bash
   make up
   ```
   *or directly with Docker Compose:*
   ```bash
   docker compose up --build -d
   ```

3. **Access the services:**
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:8000](http://localhost:8000)
   - **Backend Health:** [http://localhost:8000/health](http://localhost:8000/health)

4. **Stop the stack:**
   ```bash
   make down
   ```

---

### Option B: Without Docker (Local Development)

#### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv

# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env

# Run backend development server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
# Vite runs at http://localhost:3000
```

#### 3. Run Backend Test Suite
```bash
cd backend
python -m pytest test_main.py -v
```

---

## 3. Design decisions: key fallback, caching, SQLite session storage

### A. Key Fallback & Resilience Strategy
- **Key Pool Architecture:** The backend accepts `LLM_API_KEYS` as a comma-separated list of keys, ordered as `key_1`, `key_2`, etc.
- **Failover Loop:** When an LLM invocation returns a rate limit (HTTP 429), quota exhaustion, or server errors (HTTP 5xx), the gateway catches the exception, logs a warning, increments `fallback_attempts`, and immediately retries the prompt with the next key in the pool.
- **Failover Test Hook (`X-Simulate-Failure`):** Supported on `POST /chat` when `ENABLE_FAILURE_SIMULATION=true`. It allows testing simulated failures (e.g. `key_1=429`, `key_1=500`, or `*=429`) without needing to exhaust real API quotas.
- **Clean 503 on Exhaustion:** If all keys in the pool fail, the backend returns HTTP 503 `{"detail": "all providers unavailable"}`. In compliance with the specification, **failed requests are never stored in session history**.

### B. Response Caching
- **Deterministic Cache Key:** `hash(model + json.dumps(messages, sort_keys=True))` where `messages` contains the full prompt sequence: system prompt + previous session history + current message.
- **Cache Hit Behavior:**
  - Serves the identical reply text.
  - Returns `resolution_source: "LLM_CACHE"`.
  - Sets `key_id: null` and `fallback_attempts: 0`.
  - Re-uses stored per-request token usage (`input_tokens`, `output_tokens`).
  - Measures server-side latency `latency_ms` (typically 1–5ms, significantly faster than live inference).

### C. SQLite Session Storage
- **Zero External Dependencies:** Built solely on SQLite using `aiosqlite`. No Redis or Postgres required.
- **Docker Persistence:** The SQLite database is located under a named Docker volume (`/data/app.db`), configured via `DATABASE_URL=sqlite:////data/app.db`, surviving container restarts.
- **Schema Auto-Creation:** On application startup, the `messages` table and session index are created automatically:
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

## 4. Verification: how to see failover, cache hits and per-message token usage

### 1. Verify Health Check
```bash
curl -X GET http://localhost:8000/health
```
**Response (200 OK):**
```json
{
  "status": "ok",
  "keys_configured": 2,
  "cache_enabled": true
}
```

---

### 2. Verify Live Inference & Token Tracking
Send a message in session `s-demo-1`:
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "s-demo-1", "message": "What is the capital of France?"}'
```
**Expected Response:**
```json
{
  "session_id": "s-demo-1",
  "reply": "The capital of France is Paris.",
  "metadata": {
    "resolution_source": "LIVE_INFERENCE",
    "model": "gemini/gemini-2.0-flash",
    "latency_ms": 780,
    "input_tokens": 38,
    "output_tokens": 8,
    "key_id": "key_1",
    "fallback_attempts": 0
  }
}
```

---

### 3. Verify Cache Hit (`LLM_CACHE`)
Send the **exact same prompt** in a brand-new session (`s-demo-2`):
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "s-demo-2", "message": "What is the capital of France?"}'
```
**Expected Response:**
```json
{
  "session_id": "s-demo-2",
  "reply": "The capital of France is Paris.",
  "metadata": {
    "resolution_source": "LLM_CACHE",
    "model": "gemini/gemini-2.0-flash",
    "latency_ms": 2,
    "input_tokens": 38,
    "output_tokens": 8,
    "key_id": null,
    "fallback_attempts": 0
  }
}
```
*Note that `resolution_source` is `LLM_CACHE`, `key_id` is `null`, `fallback_attempts` is `0`, and `latency_ms` is orders of magnitude faster.*

---

### 4. Verify Automatic Key Failover
Send a request simulating HTTP 429 on `key_1`:
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -H "X-Simulate-Failure: key_1=429" \
  -d '{"session_id": "s-failover", "message": "Demonstrate auto failover"}'
```
**Expected Response (200 OK):**
```json
{
  "session_id": "s-failover",
  "reply": "TITAN AI response...",
  "metadata": {
    "resolution_source": "LIVE_INFERENCE",
    "model": "gemini/gemini-2.0-flash",
    "latency_ms": 25,
    "input_tokens": 28,
    "output_tokens": 12,
    "key_id": "key_2",
    "fallback_attempts": 1
  }
}
```
*Notice that `key_id` successfully fell over to `key_2` with `fallback_attempts: 1`.*

---

### 5. Verify Complete Outage (All Keys Fail -> 503)
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -H "X-Simulate-Failure: *=429" \
  -d '{"session_id": "s-fail-all", "message": "Should fail cleanly"}'
```
**Expected Response (503 Service Unavailable):**
```json
{
  "detail": "all providers unavailable"
}
```
*Check history for `s-fail-all`: nothing is stored in SQLite (returns 404).*

---

### 6. Verify Session History
```bash
curl -X GET http://localhost:8000/sessions/s-demo-1/messages
```
**Expected Response:**
```json
{
  "session_id": "s-demo-1",
  "messages": [
    { "role": "user", "content": "What is the capital of France?" },
    {
      "role": "assistant",
      "content": "The capital of France is Paris.",
      "metadata": {
        "resolution_source": "LIVE_INFERENCE",
        "input_tokens": 38,
        "output_tokens": 8
      }
    }
  ]
}
```

---

## 5. Setup Used: your editor and AI tools

- **Editor:** Visual Studio Code / Antigravity IDE
- **Runtime Environments:**
  - Python 3.11 with FastAPI, Uvicorn, aiosqlite, LiteLLM, pytest
  - Node.js v20+ with Vite, TypeScript, React 19, Tailwind CSS v4, Lucide Icons, Framer Motion
  - Docker & Docker Compose
- **AI Tools & Assistants:** Antigravity AI agent for architecture design, strict schema validation verification, and end-to-end unit test automation.

---

## 6. Bonus features (if any): what you added beyond the requirements and why

1. **Interactive Request Inspector Drawer:**
   - Clicking on any assistant response's metadata badge smoothly slides out an interactive inspection drawer (Framer Motion).
   - Displays a step-by-step visual execution flow (`Request Received` $\rightarrow$ `Cache Lookup` $\rightarrow$ `Key Pool Execution` $\rightarrow$ `Response Delivered`).
   - Clearly highlights when a fallback key was engaged or when cache saved an LLM roundtrip.

2. **In-UI Failover Test Hook Selector:**
   - Added a discrete developer dropdown in the sidebar to simulate failures (`key_1=429`, `key_1=500`, `*=429`) on the fly.
   - Makes presenting the 2–3 minute video demonstration seamless without having to switch windows or use terminal curl commands.

3. **System Prompt Customization Modal (`system-prompt-input`):**
   - Built a sleek modal allowing the user to configure custom session-level system prompts or reset them to default instructions.

4. **Responsive Modular Design System:**
   - Designed around the TITAN modular intelligence aesthetic with clean color coding: Green (`LIVE_INFERENCE`), Yellow (`LLM_CACHE`), Orange (`Fallback`), Red (`Errors`), and Blue (`Primary actions`).
   - Fully responsive across desktop, tablet, and mobile screens.

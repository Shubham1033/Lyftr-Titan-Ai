# TITAN AI — Full-Stack LLM Chatbot with Key Failover & Response Caching

TITAN AI is a high-resilience AI conversation workspace built with **FastAPI**, **LiteLLM**, **SQLite**, and **React (Vite + TypeScript + Tailwind CSS)**. It features automatic multi-key failover, deterministic response caching, per-request token tracking, and multi-turn session persistence.

**Author:** Shubham Singh Mewada  
**Architecture Concept:** Modular Intelligence Workspace

---

## 1. Live URLs

- **Frontend Application (Live):** [https://lyftr-titan-ai.vercel.app/](https://lyftr-titan-ai.vercel.app/)
- **Backend API Base URL (Live):** [https://titan-ai-backend-1ypa.onrender.com](https://titan-ai-backend-1ypa.onrender.com)
- **Backend Health Check:** [https://titan-ai-backend-1ypa.onrender.com/health](https://titan-ai-backend-1ypa.onrender.com/health)
- **Public GitHub Repository:** [https://github.com/Shubham1033/Lyftr-Titan-Ai](https://github.com/Shubham1033/Lyftr-Titan-Ai)

---

## 2. Run locally: with Docker and without

### Option A: With Docker & Docker Compose (Recommended)

Make sure Docker and Docker Compose are running.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shubham1033/Lyftr-Titan-Ai.git
   cd Lyftr-Titan-Ai
   cp .env.example .env
   ```

2. **Start the complete stack:**
   ```bash
   make up
   ```
   *or via Docker Compose directly:*
   ```bash
   docker compose up --build -d
   ```

3. **Access the services:**
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:8000](http://localhost:8000)
   - **Backend Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

4. **Stop the stack:**
   ```bash
   make down
   ```

---

### Option B: Without Docker (Local Development)

#### 1. Backend Setup (FastAPI + LiteLLM + SQLite)
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Start FastAPI development server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Setup (React + Vite + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
# Vite runs at http://localhost:3000
```

#### 3. Run Backend Automated Test Suite
```bash
cd backend
python -m pytest test_main.py -v
```

---

## 3. Design decisions: key fallback, caching, SQLite session storage

### A. Key Fallback & Resilience Strategy
- **Key Pool Architecture:** The backend accepts `LLM_API_KEYS` as a comma-separated list of keys, ordered as `key_1`, `key_2`, etc.
- **Failover Loop:** When an LLM invocation returns a rate limit (HTTP 429), quota exhaustion, or server errors (HTTP 5xx), the gateway catches the exception, logs a warning, increments `fallback_attempts`, and immediately retries the prompt with the next key in the pool without dropping the user's turn.
- **Failover Test Hook (`X-Simulate-Failure`):** Supported on `POST /chat` when `ENABLE_FAILURE_SIMULATION=true`. It allows testing simulated failures (e.g. `key_1=429`, `key_1=500`, or `*=429`) on demand without exhausting real API keys.
- **Clean 503 on Complete Outage:** If all keys in the pool fail, the backend returns HTTP 503 `{"detail": "all providers unavailable"}`. In strict compliance with the specification, **failed requests are never stored in session history**.

### B. Response Caching
- **Deterministic Cache Key:** `hash(model + json.dumps(messages, sort_keys=True))` where `messages` contains the full prompt sequence: system prompt + previous session history + current message.
- **Cache Hit Behavior:**
  - Serves the identical reply text.
  - Returns `resolution_source: "LLM_CACHE"`.
  - Sets `key_id: null` and `fallback_attempts: 0`.
  - Re-uses stored per-request token usage (`input_tokens`, `output_tokens`).
  - Measures server-side latency `latency_ms` (typically 0–2ms, significantly faster than live inference).

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
curl -X GET https://titan-ai-backend-1ypa.onrender.com/health
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
curl -X POST https://titan-ai-backend-1ypa.onrender.com/chat \
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
    "model": "gemini/gemini-3.5-flash-lite",
    "latency_ms": 582,
    "input_tokens": 24,
    "output_tokens": 3,
    "key_id": "key_1",
    "fallback_attempts": 0
  }
}
```

---

### 3. Verify Cache Hit (`LLM_CACHE`)
Send the **exact same prompt** in a brand-new session (`s-demo-2`):
```bash
curl -X POST https://titan-ai-backend-1ypa.onrender.com/chat \
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
    "model": "gemini/gemini-3.5-flash-lite",
    "latency_ms": 0,
    "input_tokens": 24,
    "output_tokens": 3,
    "key_id": null,
    "fallback_attempts": 0
  }
}
```
*Notice that `resolution_source` is `LLM_CACHE`, `key_id` is `null`, `fallback_attempts` is `0`, and `latency_ms` is 0 ms.*

---

### 4. Verify Automatic Key Failover
Send a request simulating HTTP 429 on `key_1`:
```bash
curl -X POST https://titan-ai-backend-1ypa.onrender.com/chat \
  -H "Content-Type: application/json" \
  -H "X-Simulate-Failure: key_1=429" \
  -d '{"session_id": "s-failover", "message": "Demonstrate auto failover"}'
```
**Expected Response (200 OK):**
```json
{
  "session_id": "s-failover",
  "reply": "...",
  "metadata": {
    "resolution_source": "LIVE_INFERENCE",
    "model": "gemini/gemini-3.5-flash-lite",
    "latency_ms": 1446,
    "input_tokens": 26,
    "output_tokens": 10,
    "key_id": "key_2",
    "fallback_attempts": 1
  }
}
```
*Notice that `key_id` successfully fell over to `key_2` with `fallback_attempts: 1`, and a visual Failover Toast appears in the UI.*

---

### 5. Verify Complete Outage (All Keys Fail -> 503)
```bash
curl -X POST https://titan-ai-backend-1ypa.onrender.com/chat \
  -H "Content-Type: application/json" \
  -H "X-Simulate-Failure: *=429" \
  -d '{"session_id": "s-fail-all", "message": "This should fail completely"}'
```
**Expected Response (503 Service Unavailable):**
```json
{
  "detail": "all providers unavailable"
}
```
*History check for `s-fail-all` confirms nothing was stored in SQLite (returns 404).*

---

### 6. Verify Session History
```bash
curl -X GET https://titan-ai-backend-1ypa.onrender.com/sessions/s-demo-1/messages
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
        "input_tokens": 24,
        "output_tokens": 3
      }
    }
  ]
}
```

---

## 5. Setup Used: your editor and AI tools

- **Author / Developer:** Shubham Singh Mewada
- **Editor / Environment:** Visual Studio Code / Antigravity IDE
- **Runtimes & Tooling:**
  - Python 3.11 with FastAPI, Uvicorn, LiteLLM, aiosqlite, Pytest, HTTPX
  - Node.js v20+ with Vite, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide Icons
  - Docker & Docker Compose (Multi-stage builds)
  - Hosted on **Vercel** (Frontend) & **Render** (Backend)
- **AI Tools & Assistants:** Antigravity AI agent for architecture design, strict schema validation verification, and end-to-end unit test automation.

---

## 6. Bonus features (if any): what you added beyond the requirements and why

1. **⚡ Live Gateway Efficiency Dashboard:**
   - A real-time card in the sidebar computing **Cache Hit Rate (%)**, **Cumulative Latency Saved (seconds)**, and **Tokens Saved** from duplicate LLM calls during the active session.

2. **🛡️ Failover Event Visual Toast:**
   - When an automatic key fallback occurs (e.g. `X-Simulate-Failure: key_1=429`), an animated toast appears:
     > *"⚡ Key key_1 rate-limited (429) → Automatically failed over to key_2 without interruption."*
   - Makes the resilience mechanism immediately obvious to evaluators during the video demonstration.

3. **🌓 Pitch Black Linear Dark Mode & Theme Toggle:**
   - A sleek one-click toggle in the header between clean Paper Light and a deep `#000000` pitch-black developer theme with persistent `localStorage` support.

4. **💻 Enhanced Code Blocks with Syntax Highlighting & 1-Click Copy:**
   - Markdown code snippets render inside dark containers with language badges (`python`, `sql`, `json`, `bash`) and an interactive **Copy Code** button with instant checkmark feedback.

5. **🔍 Interactive Request Inspector Drawer:**
   - Clicking any response's metadata pill slides out a 4-stage visual execution pipeline: `Validated & Hashed` $\rightarrow$ `Cache Lookup` $\rightarrow$ `Key Pool / Cache Retrieval` $\rightarrow$ `SQLite Persistence`.

6. **⚙️ System Prompt Customization Modal (`system-prompt-input`):**
   - Popover modal allowing custom session-level instructions or instant reset to default prompt.

7. **🧪 In-UI Failover Selector:**
   - Integrated dropdown in the sidebar to inject `X-Simulate-Failure` headers on the fly without needing terminal curl commands.

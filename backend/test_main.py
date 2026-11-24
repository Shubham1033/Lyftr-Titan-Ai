import os
import pytest
from fastapi.testclient import TestClient

# Configure environment before imports
os.environ["LLM_API_KEYS"] = "dummy_key_1,dummy_key_2"
os.environ["DATABASE_URL"] = "sqlite:///./test_app.db"
os.environ["ENABLE_FAILURE_SIMULATION"] = "true"

from main import app
import llm_gateway

@pytest.fixture(autouse=True)
def clean_state():
    test_db = "./test_app.db"
    if os.path.exists(test_db):
        try:
            os.remove(test_db)
        except OSError:
            pass
    llm_gateway._CACHE_STORE.clear()
    yield
    if os.path.exists(test_db):
        try:
            os.remove(test_db)
        except OSError:
            pass

def test_get_health():
    with TestClient(app) as client:
        res = client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert data["keys_configured"] >= 2
        assert data["cache_enabled"] is True

def test_post_chat_and_caching():
    with TestClient(app) as client:
        # First request in session 1 -> LIVE_INFERENCE
        res1 = client.post("/chat", json={
            "session_id": "session-1",
            "message": "What is the capital of France?"
        })
        assert res1.status_code == 200
        data1 = res1.json()
        assert data1["session_id"] == "session-1"
        assert data1["reply"] != ""
        meta1 = data1["metadata"]
        assert meta1["resolution_source"] == "LIVE_INFERENCE"
        assert meta1["key_id"] == "key_1"
        assert meta1["fallback_attempts"] == 0
        assert meta1["input_tokens"] > 0
        assert meta1["output_tokens"] > 0
        assert isinstance(meta1["latency_ms"], int)

        # Same first message in a NEW session -> LLM_CACHE
        res2 = client.post("/chat", json={
            "session_id": "session-2",
            "message": "What is the capital of France?"
        })
        assert res2.status_code == 200
        data2 = res2.json()
        assert data2["session_id"] == "session-2"
        assert data2["reply"] == data1["reply"]  # Identical reply
        meta2 = data2["metadata"]
        assert meta2["resolution_source"] == "LLM_CACHE"
        assert meta2["key_id"] is None
        assert meta2["fallback_attempts"] == 0
        assert meta2["input_tokens"] == meta1["input_tokens"]
        assert meta2["output_tokens"] == meta1["output_tokens"]

        # Different message in session 2 -> LIVE_INFERENCE
        res3 = client.post("/chat", json={
            "session_id": "session-2",
            "message": "What is the capital of Italy?"
        })
        assert res3.status_code == 200
        assert res3.json()["metadata"]["resolution_source"] == "LIVE_INFERENCE"

def test_key_failover_simulation():
    with TestClient(app) as client:
        # Simulate key_1 failure with 429 -> Should failover to key_2
        res = client.post(
            "/chat",
            json={"session_id": "session-failover-1", "message": "Test failover 429"},
            headers={"X-Simulate-Failure": "key_1=429"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["metadata"]["key_id"] == "key_2"
        assert data["metadata"]["fallback_attempts"] == 1
        assert data["metadata"]["resolution_source"] == "LIVE_INFERENCE"

        # Simulate key_1 failure with 500 -> Should failover to key_2
        res2 = client.post(
            "/chat",
            json={"session_id": "session-failover-2", "message": "Test failover 500"},
            headers={"X-Simulate-Failure": "key_1=500"}
        )
        assert res2.status_code == 200
        data2 = res2.json()
        assert data2["metadata"]["key_id"] == "key_2"
        assert data2["metadata"]["fallback_attempts"] == 1

def test_all_keys_failed_returns_503_and_not_saved_to_history():
    with TestClient(app) as client:
        # Simulate all keys failure (*=429)
        res = client.post(
            "/chat",
            json={"session_id": "session-all-fail", "message": "This should fail completely"},
            headers={"X-Simulate-Failure": "*=429"}
        )
        assert res.status_code == 503
        assert res.json() == {"detail": "all providers unavailable"}

        # Verify that nothing was saved to history for this session
        res_hist = client.get("/sessions/session-all-fail/messages")
        assert res_hist.status_code == 404
        assert res_hist.json() == {"detail": "session not found"}

def test_session_history_and_multi_turn():
    with TestClient(app) as client:
        # Post turn 1
        client.post("/chat", json={
            "session_id": "multi-session",
            "message": "First message"
        })
        # Post turn 2
        client.post("/chat", json={
            "session_id": "multi-session",
            "message": "Second message"
        })

        # Fetch history
        res = client.get("/sessions/multi-session/messages")
        assert res.status_code == 200
        data = res.json()
        assert data["session_id"] == "multi-session"
        msgs = data["messages"]
        assert len(msgs) == 4  # user, assistant, user, assistant
        assert msgs[0]["role"] == "user"
        assert msgs[0]["content"] == "First message"
        assert msgs[1]["role"] == "assistant"
        assert msgs[1]["metadata"]["resolution_source"] in ("LIVE_INFERENCE", "LLM_CACHE")
        assert msgs[2]["role"] == "user"
        assert msgs[2]["content"] == "Second message"
        assert msgs[3]["role"] == "assistant"

def test_validation_errors_422():
    with TestClient(app) as client:
        # Empty message
        res1 = client.post("/chat", json={"session_id": "s1", "message": "   "})
        assert res1.status_code == 422
        assert "detail" in res1.json()

        # Missing session_id
        res2 = client.post("/chat", json={"message": "hello"})
        assert res2.status_code == 422
        assert "detail" in res2.json()

        # Message over 4000 characters
        res3 = client.post("/chat", json={"session_id": "s1", "message": "a" * 4001})
        assert res3.status_code == 422
        assert "detail" in res3.json()

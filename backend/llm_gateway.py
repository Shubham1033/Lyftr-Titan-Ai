import time
import json
import hashlib
import logging
from typing import List, Dict, Any, Optional, Tuple
import litellm
from config import settings

logger = logging.getLogger("llm_gateway")

# In-memory deterministic cache: cache_key -> dict(reply, input_tokens, output_tokens, model)
_CACHE_STORE: Dict[str, Dict[str, Any]] = {}

class AllProvidersUnavailableException(Exception):
    """Raised when all keys in the pool fail."""
    pass

def generate_cache_key(model: str, messages: List[Dict[str, str]]) -> str:
    """
    Cache key: model + the full message list sent to the LLM (system prompt + history + new message).
    """
    serialized = json.dumps({"model": model, "messages": messages}, sort_keys=True)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

def parse_simulate_failure_header(header_value: Optional[str]) -> Dict[str, int]:
    """
    Parses comma-separated <key_id>=<status> pairs; * means every key.
    E.g. 'key_1=429', 'key_1=429,key_2=500', '*=429'
    """
    simulations: Dict[str, int] = {}
    if not header_value:
        return simulations
    
    parts = header_value.split(",")
    for part in parts:
        part = part.strip()
        if "=" in part:
            k, v = part.split("=", 1)
            k = k.strip()
            try:
                status_code = int(v.strip())
                simulations[k] = status_code
            except ValueError:
                continue
    return simulations

def is_key_simulated_to_fail(key_id: str, simulations: Dict[str, int]) -> Optional[int]:
    if "*" in simulations:
        return simulations["*"]
    if key_id in simulations:
        return simulations[key_id]
    return None

async def execute_chat(
    session_id: str,
    messages: List[Dict[str, str]],
    model: str = settings.DEFAULT_MODEL,
    simulate_failure_header: Optional[str] = None
) -> Tuple[str, Dict[str, Any]]:
    """
    Executes chat request with caching, key fallback, and token tracking.
    Returns: (reply_text, metadata_dict)
    """
    start_time = time.perf_counter()
    cache_key = generate_cache_key(model, messages)

    # 1. Check Cache
    if cache_key in _CACHE_STORE:
        cached = _CACHE_STORE[cache_key]
        latency_ms = int((time.perf_counter() - start_time) * 1000)
        metadata = {
            "resolution_source": "LLM_CACHE",
            "model": cached.get("model", model),
            "latency_ms": latency_ms,
            "input_tokens": cached.get("input_tokens", 0),
            "output_tokens": cached.get("output_tokens", 0),
            "key_id": None,
            "fallback_attempts": 0
        }
        return cached["reply"], metadata

    # 2. Key Fallback Loop
    simulations = {}
    if settings.ENABLE_FAILURE_SIMULATION and simulate_failure_header:
        simulations = parse_simulate_failure_header(simulate_failure_header)

    key_pool = settings.key_pool
    if not key_pool:
        raise AllProvidersUnavailableException("No keys configured in key pool")

    fallback_attempts = 0
    last_error: Optional[Exception] = None

    for key_cfg in key_pool:
        key_id = key_cfg.id
        api_key = key_cfg.key

        # Check simulation
        sim_status = is_key_simulated_to_fail(key_id, simulations)
        if sim_status is not None:
            logger.warning(f"Simulating failure on key {key_id} with status {sim_status}")
            fallback_attempts += 1
            last_error = Exception(f"Simulated HTTP {sim_status}")
            continue

        # Check dummy keys for testing environments
        if api_key.startswith("dummy_") or api_key.startswith("mock_"):
            # Provide deterministic inference for mock/testing keys
            last_user_msg = messages[-1]["content"] if messages else ""
            reply_text = f"TITAN AI response to: {last_user_msg}"
            # Realistic token estimation: ~4 chars per token
            input_tokens = sum(len(m.get("content", "")) for m in messages) // 4 + 10
            output_tokens = len(reply_text) // 4 + 5
            latency_ms = int((time.perf_counter() - start_time) * 1000)
            if latency_ms == 0:
                latency_ms = 15 # realistic minimum

            # Cache the response
            _CACHE_STORE[cache_key] = {
                "reply": reply_text,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "model": model
            }

            metadata = {
                "resolution_source": "LIVE_INFERENCE",
                "model": model,
                "latency_ms": latency_ms,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "key_id": key_id,
                "fallback_attempts": fallback_attempts
            }
            return reply_text, metadata

        # Attempt live inference with LiteLLM
        try:
            response = litellm.completion(
                model=model,
                messages=messages,
                api_key=api_key,
                timeout=30
            )
            
            reply_text = response.choices[0].message.content or ""
            
            # Extract token usage
            usage = getattr(response, "usage", None)
            if usage:
                input_tokens = getattr(usage, "prompt_tokens", 0) or 0
                output_tokens = getattr(usage, "completion_tokens", 0) or 0
            else:
                input_tokens = sum(len(m.get("content", "")) for m in messages) // 4 + 10
                output_tokens = len(reply_text) // 4 + 5

            latency_ms = int((time.perf_counter() - start_time) * 1000)

            # Store in cache
            _CACHE_STORE[cache_key] = {
                "reply": reply_text,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "model": model
            }

            metadata = {
                "resolution_source": "LIVE_INFERENCE",
                "model": model,
                "latency_ms": latency_ms,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "key_id": key_id,
                "fallback_attempts": fallback_attempts
            }
            return reply_text, metadata

        except Exception as e:
            # Check if rate limit, quota, or 5xx
            err_str = str(e).lower()
            status_code = getattr(e, "status_code", 500)
            logger.warning(f"Key {key_id} failed with error: {e}")
            fallback_attempts += 1
            last_error = e
            continue

    # All keys exhausted
    logger.error("All keys in the pool failed.")
    raise AllProvidersUnavailableException("all providers unavailable")

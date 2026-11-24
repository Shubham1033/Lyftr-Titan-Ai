export interface ResponseMetadata {
  resolution_source: 'LIVE_INFERENCE' | 'LLM_CACHE';
  model: string;
  latency_ms: number;
  input_tokens: number;
  output_tokens: number;
  key_id: string | null;
  fallback_attempts: number;
}

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: ResponseMetadata;
  timestamp: string;
}

export interface ChatRequestPayload {
  session_id: string;
  message: string;
  system_prompt?: string;
}

export interface ChatResponsePayload {
  session_id: string;
  reply: string;
  metadata: ResponseMetadata;
}

export interface HealthResponsePayload {
  status: string;
  keys_configured: number;
  cache_enabled: boolean;
}

export interface SessionHistoryResponsePayload {
  session_id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    metadata?: {
      resolution_source: 'LIVE_INFERENCE' | 'LLM_CACHE';
      input_tokens: number;
      output_tokens: number;
    };
  }>;
}

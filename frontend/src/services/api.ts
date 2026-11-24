import {
  type ChatRequestPayload,
  type ChatResponsePayload,
  type HealthResponsePayload,
  type SessionHistoryResponsePayload
} from '../types/chat';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

export async function checkHealth(): Promise<HealthResponsePayload> {
  const res = await fetch(`${API_BASE_URL}/health`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ detail: 'Failed to connect to backend' }));
    throw new ApiError(res.status, data.detail || 'Health check failed');
  }
  return res.json();
}

export async function sendChatMessage(
  payload: ChatRequestPayload,
  simulateFailureHeader?: string
): Promise<ChatResponsePayload> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (simulateFailureHeader && simulateFailureHeader.trim()) {
    headers['X-Simulate-Failure'] = simulateFailureHeader.trim();
  }

  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const errorJson = await res.json();
      if (typeof errorJson.detail === 'string') {
        errorDetail = errorJson.detail;
      } else if (Array.isArray(errorJson.detail)) {
        errorDetail = errorJson.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
      } else if (errorJson.detail) {
        errorDetail = JSON.stringify(errorJson.detail);
      }
    } catch {
      errorDetail = `Server error ${res.status}: ${res.statusText}`;
    }
    throw new ApiError(res.status, errorDetail);
  }

  return res.json();
}

export async function getSessionHistory(sessionId: string): Promise<SessionHistoryResponsePayload> {
  const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/messages`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({ detail: 'Session not found' }));
    throw new ApiError(res.status, errorJson.detail || 'Failed to fetch history');
  }

  return res.json();
}

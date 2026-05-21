import type { HealthInfo, QueueState, Song } from './types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error ?? res.statusText);
  }
  return body as T;
}

export function fetchHealth() {
  return request<HealthInfo>('/api/health');
}

export function fetchSongs(q: string) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  return request<{ songs: Song[] }>(`/api/songs?${params}`);
}

export function fetchQueue() {
  return request<QueueState>('/api/queue');
}

export function submitRequest(songId: string, name: string) {
  return request<{ entry: unknown; queue: QueueState }>('/api/request', {
    method: 'POST',
    body: JSON.stringify({ songId, name }),
  });
}

export function hostAction(
  path: string,
  method: 'POST' | 'DELETE',
  hostPin?: string
) {
  return request<QueueState>(path, {
    method,
    headers: hostPin ? { 'X-Host-Pin': hostPin } : {},
  });
}

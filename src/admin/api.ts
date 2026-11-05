import type { SiteContent } from '../types/content'

export type StorageMode = 'local' | 'github'

export class ApiError extends Error {
  status: number
  details: string[]

  constructor(status: number, message: string, details: string[] = []) {
    super(message)
    this.status = status
    this.details = details
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new ApiError(response.status, body.error ?? `Request failed (${response.status})`, body.details)
  return body as T
}

export const api = {
  session: () => request<{ authenticated: boolean; mode: StorageMode }>('/api/session'),
  login: (password: string) => request<{ authenticated: boolean; mode: StorageMode }>('/api/login', { method: 'POST', body: JSON.stringify({ password }) }),
  logout: () => request('/api/logout', { method: 'POST', body: '{}' }),
  load: () => request<{ content: SiteContent; version: string; mode: StorageMode }>('/api/content'),
  save: (content: SiteContent, baseVersion: string, images: { path: string; data: string }[]) =>
    request<{ version: string; commitUrl?: string; mode: StorageMode }>('/api/content', { method: 'PUT', body: JSON.stringify({ content, baseVersion, images }) }),
}

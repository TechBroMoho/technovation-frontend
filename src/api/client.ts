import type { AgentChatResponse, Coach, Booking, AvailabilityResponse } from '../types'

const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ── Agent ──────────────────────────────────────────────────────────────

export async function sendChatMessage(sessionId: string, message: string): Promise<AgentChatResponse> {
  const params = new URLSearchParams({ session_id: sessionId, message })
  return request<AgentChatResponse>(`/agent/chat?${params}`, { method: 'POST' })
}

export async function deleteSession(sessionId: string) {
  return request(`/agent/sessions/${sessionId}`, { method: 'DELETE' })
}

// ── Coaches ────────────────────────────────────────────────────────────

export async function getCoaches(): Promise<Coach[]> {
  return request<Coach[]>('/coaches')
}

export async function getCoach(id: number): Promise<Coach> {
  return request<Coach>(`/coaches/${id}`)
}

export async function getCoachAvailability(
  id: number,
  startTime?: string,
  endTime?: string,
): Promise<AvailabilityResponse> {
  const params = new URLSearchParams()
  if (startTime) params.set('start_time', startTime)
  if (endTime) params.set('end_time', endTime)
  const qs = params.toString() ? `?${params}` : ''
  return request<AvailabilityResponse>(`/coaches/${id}/availability${qs}`)
}

// ── Bookings ───────────────────────────────────────────────────────────

export async function getBookings(): Promise<Booking[]> {
  return request<Booking[]>('/bookings')
}

export async function cancelBooking(id: number): Promise<Booking> {
  return request<Booking>(`/bookings/${id}/cancel`, { method: 'PATCH' })
}

// ── OAuth URLs (these are backend redirects) ───────────────────────────

export function googleLoginUrl(userType: 'coach' | 'participant', sessionId: string): string {
  return `${BASE_URL}/auth/google/login?user_type=${userType}&session_id=${sessionId}`
}

export function calcomLoginUrl(sessionId: string): string {
  return `${BASE_URL}/auth/calcom/login?session_id=${sessionId}`
}

// ── Health ─────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<{ status: string; agent_available: boolean }> {
  return request('/')
}

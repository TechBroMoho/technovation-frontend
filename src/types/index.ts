export interface ChatMessage {
  id: string
  role: 'user' | 'agent'
  content: string
  timestamp: Date
}

export interface Coach {
  id: number
  name: string
  email: string
  timezone: string
  expertise: string | null
  calcom_username: string | null
  is_active: boolean
  created_at: string
}

export interface Participant {
  id: number
  name: string
  email: string
  timezone: string
  created_at: string
}

export interface Booking {
  id: number
  coach_id: number
  participant_id: number
  start_time: string
  end_time: string
  meeting_link: string | null
  status: string
  notes: string | null
  confirmation_sent: boolean
  created_at: string
}

export interface AgentChatResponse {
  session_id: string
  response: string
  role: 'coach' | 'participant' | 'unknown'
}

export interface AvailabilitySlot {
  start: string
  end: string
  timezone?: string
}

export interface AvailabilityResponse {
  status: string
  source: 'calcom' | 'simulated'
  slots: AvailabilitySlot[] | Record<string, { start: string }[]>
}

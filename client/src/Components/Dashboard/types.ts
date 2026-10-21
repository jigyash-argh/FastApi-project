// Matches serialize_chat(chat) in FastAPI
export interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
}

// Matches serialize_message(message) in FastAPI
export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant' | string
  content: string
  created_at: string
}

// Matches GET /chats/{chat_id} response
export interface ChatDetailResponse {
  chat: ChatSession
  messages: ChatMessage[]
}

// Request payloads matching app.schemas.chat_schema
export interface CreateChatPayload {
  title: string
}

export interface SendMessagePayload {
  content: string
}

export interface RenameChatPayload {
  title: string
}

// User Settings matching UserSettingsUpdate schema
export interface UserSettings {
  theme?: string
  notifications?: boolean
  diet_preference?: string
  [key: string]: unknown
}

// Matches serialize_user(user) in FastAPI
export interface UserProfile {
  id: string
  username: string
  email: string
  settings: UserSettings
}

export interface UserUpdatePayload {
  username?: string
  email?: string
}

export interface UserSettingsUpdatePayload {
  theme?: string
  notifications?: boolean
  diet_preference?: string
  [key: string]: unknown
}
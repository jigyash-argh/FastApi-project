import api from './axios'
import type {
  ChatSession,
  ChatMessage,
  ChatDetailResponse,
  CreateChatPayload,
  SendMessagePayload,
  RenameChatPayload,
} from '../Components/Dashboard/types'

// POST /chats/ -> CreateChatRequest { title }
export async function createChat(payload: CreateChatPayload): Promise<ChatSession> {
  const response = await api.post<ChatSession>('/chats/', payload)
  return response.data
}

// GET /chats/ -> List of serialized chats
export async function getChats(): Promise<ChatSession[]> {
  const response = await api.get<ChatSession[]>('/chats/')
  return response.data
}

// GET /chats/{chat_id} -> { chat, messages }
export async function getChatById(chatId: string): Promise<ChatDetailResponse> {
  const response = await api.get<ChatDetailResponse>(`/chats/${chatId}`)
  return response.data
}

// POST /chats/{chat_id}/messages -> SendMessageRequest { content }
export async function sendMessage(
  chatId: string,
  payload: SendMessagePayload
): Promise<ChatMessage> {
  const response = await api.post<ChatMessage>(`/chats/${chatId}/messages`, payload)
  return response.data
}

// PATCH /chats/{chat_id} -> RenameChatRequest { title }
export async function renameChat(
  chatId: string,
  payload: RenameChatPayload
): Promise<ChatSession> {
  const response = await api.patch<ChatSession>(`/chats/${chatId}`, payload)
  return response.data
}

// DELETE /chats/{chat_id} -> 204 No Content
export async function deleteChat(chatId: string): Promise<void> {
  await api.delete(`/chats/${chatId}`)
}
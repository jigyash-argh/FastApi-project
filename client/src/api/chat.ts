import api from './axios'
import { expireSession } from './session'
import type {
  ChatSession,
  ChatMessage,
  ChatDetailResponse,
  CreateChatPayload,
  SendMessagePayload,
  RenameChatPayload,
} from '../Components/Dashboard/types'

export interface SendMessageResponse {
  chat: ChatSession
  user_message: ChatMessage
  ai_message: ChatMessage
}

export interface StreamMessageHandlers {
  onUserMessage?: (message: ChatMessage) => void
  onToken?: (token: string) => void
  onComplete?: (payload: SendMessageResponse) => void
  onError?: (detail: string) => void
}

export async function createChat(payload: CreateChatPayload): Promise<ChatSession> {
  const response = await api.post<ChatSession>('/chats/', payload)
  return response.data
}

export async function getChats(): Promise<ChatSession[]> {
  const response = await api.get<ChatSession[]>('/chats/')
  return response.data
}

export async function getChatById(chatId: string): Promise<ChatDetailResponse> {
  const response = await api.get<ChatDetailResponse>(`/chats/${chatId}`)
  return response.data
}

export async function sendMessage(
  chatId: string,
  payload: SendMessagePayload
): Promise<SendMessageResponse> {
  const response = await api.post<SendMessageResponse>(
    `/chats/${chatId}/messages`,
    payload
  )
  return response.data
}

export async function streamMessage(
  chatId: string,
  payload: SendMessagePayload,
  handlers: StreamMessageHandlers
): Promise<void> {
  const token = window.localStorage.getItem('access_token')
  const baseUrl = (api.defaults.baseURL || 'http://127.0.0.1:8000').replace(/\/\$/, '')

  const response = await fetch(`${baseUrl}/chats/${chatId}/messages/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })

  if (response.status === 401) {
    expireSession()
  }

  if (!response.ok || !response.body) {
    let errorDetail = `Request failed (${response.status})`
    try {
      const errJson = await response.json()
      if (errJson?.detail) errorDetail = errJson.detail
    } catch {
      // ignore parse error
    }
    throw new Error(errorDetail)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const processEventBlock = (block: string) => {
    const trimmed = block.trim()
    if (!trimmed) return

    const lines = trimmed.split(/\r?\n/)
    let eventName = 'message'
    const dataLines: string[] = []

    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim()
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trim())
      }
    }

    const dataString = dataLines.join('\n')
    if (!dataString) return

    const parsedData = JSON.parse(dataString)

    if (eventName === 'user_message') {
      handlers.onUserMessage?.(parsedData as ChatMessage)
    } else if (eventName === 'token') {
      handlers.onToken?.(typeof parsedData === 'string' ? parsedData : String(parsedData))
    } else if (eventName === 'complete') {
      handlers.onComplete?.(parsedData as SendMessageResponse)
    } else if (eventName === 'error') {
      const detail =
        typeof parsedData === 'object' && parsedData !== null && 'detail' in parsedData
          ? String(parsedData.detail)
          : 'The AI response could not be completed.'
      handlers.onError?.(detail)
    }
  }

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split(/\r?\n\r?\n/)
    buffer = blocks.pop() ?? ''

    for (const block of blocks) {
      processEventBlock(block)
    }
  }

  if (buffer.trim()) {
    processEventBlock(buffer)
  }
}

export async function renameChat(
  chatId: string,
  payload: RenameChatPayload
): Promise<ChatSession> {
  const response = await api.patch<ChatSession>(`/chats/${chatId}`, payload)
  return response.data
}

export async function deleteChat(chatId: string): Promise<void> {
  await api.delete(`/chats/${chatId}`)
}
import { useState, useRef, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import {
  getChats,
  getChatById,
  createChat,
  sendMessage,
  renameChat,
  deleteChat,
} from '../../api/chat'
import type { ChatSession, ChatMessage, UserProfile } from './types'

// Helper to extract user info from the stored JWT payload
function getUserFromJwt(): UserProfile {
  try {
    const token = window.localStorage.getItem('access_token')
    if (!token) return { name: 'Kitchen Chef', email: '' }
    const base64Payload = token.split('.')[1]
    if (!base64Payload) return { name: 'Kitchen Chef', email: '' }
    const decoded = JSON.parse(window.atob(base64Payload))
    const email = decoded.email || decoded.sub || ''
    const name =
      decoded.name ||
      (email.includes('@') ? email.split('@')[0] : 'Kitchen Chef')
    return { name, email }
  } catch {
    return { name: 'Kitchen Chef', email: '' }
  }
}

function formatMessageTime(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const Dashboard = () => {
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [user] = useState<UserProfile>(() => getUserFromJwt())

  const [isLoadingChats, setIsLoadingChats] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [promptInput, setPromptInput] = useState('')
  const [newChatTitleModalOpen, setNewChatTitleModalOpen] = useState(false)
  const [customNewTitle, setCustomNewTitle] = useState('')

  const activeChat = sessions.find((s) => s.id === activeSessionId) ?? null

  // 1. Load all user chats on mount (GET /chats/)
  useEffect(() => {
    const token = window.localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
      return
    }

    async function fetchInitialChats() {
      setIsLoadingChats(true)
      setErrorMessage(null)
      try {
        const chatList = await getChats()
        setSessions(chatList)
        if (chatList.length > 0) {
          setActiveSessionId(chatList[0].id)
        }
      } catch (err: unknown) {
        setErrorMessage(extractApiError(err, 'Could not load your chats.'))
      } finally {
        setIsLoadingChats(false)
      }
    }

    fetchInitialChats()
  }, [navigate])

  // 2. Whenever activeSessionId changes, fetch its messages (GET /chats/{chat_id})
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([])
      return
    }

    let isCancelled = false

    async function loadMessagesForChat(chatId: string) {
      setIsLoadingMessages(true)
      setErrorMessage(null)
      try {
        const detail = await getChatById(chatId)
        if (!isCancelled) {
          setMessages(detail.messages)
          // Keep session metadata fresh
          setSessions((prev) =>
            prev.map((s) => (s.id === detail.chat.id ? detail.chat : s))
          )
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setErrorMessage(extractApiError(err, 'Failed to load messages for this chat.'))
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingMessages(false)
        }
      }
    }

    loadMessagesForChat(activeSessionId)

    return () => {
      isCancelled = true
    }
  }, [activeSessionId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isSending])

  function extractApiError(error: unknown, fallback: string): string {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof error.response === 'object' &&
      error.response !== null &&
      'data' in error.response &&
      typeof error.response.data === 'object' &&
      error.response.data !== null &&
      'detail' in error.response.data &&
      typeof error.response.data.detail === 'string'
    ) {
      return error.response.data.detail
    }
    return fallback
  }

  function handleLogout() {
    window.localStorage.removeItem('access_token')
    navigate('/login')
  }

  // Create an empty chat explicitly via POST /chats/ if user wants to name it first
  async function handleCreateNamedChat(event: FormEvent) {
    event.preventDefault()
    const trimmed = customNewTitle.trim()
    if (!trimmed) return

    setErrorMessage(null)
    try {
      const created = await createChat({ title: trimmed })
      setSessions((prev) => [created, ...prev])
      setActiveSessionId(created.id)
      setMessages([])
      setCustomNewTitle('')
      setNewChatTitleModalOpen(false)
    } catch (err: unknown) {
      setErrorMessage(extractApiError(err, 'Could not create chat.'))
    }
  }

  // 3. Send a message (POST /chats/{chat_id}/messages)
  async function handleSendMessage(event?: FormEvent<HTMLFormElement>, presetContent?: string) {
    if (event) event.preventDefault()
    const content = (presetContent ?? promptInput).trim()
    if (!content || isSending) return

    setPromptInput('')
    setIsSending(true)
    setErrorMessage(null)

    try {
      let targetChatId = activeSessionId

      // If no chat is currently open, create one first via POST /chats/
      if (!targetChatId) {
        const autoTitle = content.length > 36 ? `${content.slice(0, 36)}...` : content
        const newSession = await createChat({ title: autoTitle })
        setSessions((prev) => [newSession, ...prev])
        targetChatId = newSession.id
        setActiveSessionId(newSession.id)
      }

      // Optimistically append the user's message so the UI feels instant
      const optimisticMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        session_id: targetChatId,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimisticMsg])

      // Call POST /chats/{chat_id}/messages
      await sendMessage(targetChatId, { content })

      // Re-fetch GET /chats/{chat_id} so we get the persisted user message AND any AI reply generated by chat_services
      const updatedDetail = await getChatById(targetChatId)
      setMessages(updatedDetail.messages)
      setSessions((prev) =>
        prev.map((s) => (s.id === updatedDetail.chat.id ? updatedDetail.chat : s))
      )
    } catch (err: unknown) {
      setErrorMessage(extractApiError(err, 'Failed to send message.'))
    } finally {
      setIsSending(false)
    }
  }

  // 4. Rename a chat (PATCH /chats/{chat_id})
  async function handleRenameSession(chatId: string, newTitle: string) {
    setErrorMessage(null)
    try {
      const updated = await renameChat(chatId, { title: newTitle })
      setSessions((prev) => prev.map((s) => (s.id === chatId ? updated : s)))
    } catch (err: unknown) {
      setErrorMessage(extractApiError(err, 'Could not rename chat.'))
      throw err
    }
  }

  // 5. Delete a chat (DELETE /chats/{chat_id})
  async function handleDeleteSession(chatId: string) {
    setErrorMessage(null)
    try {
      await deleteChat(chatId)
      const remaining = sessions.filter((s) => s.id !== chatId)
      setSessions(remaining)
      if (activeSessionId === chatId) {
        setActiveSessionId(remaining[0]?.id ?? null)
      }
    } catch (err: unknown) {
      setErrorMessage(extractApiError(err, 'Could not delete chat.'))
    }
  }

  return (
    <div className="dashboard-cursor flex h-dvh w-full overflow-hidden bg-[#fbfaf6] text-[#27392d] selection:bg-[#dcebd2] selection:text-[#2c4131]">
      {/* Separate Sidebar Component */}
      <Sidebar
        activeSessionId={activeSessionId}
        isLoadingChats={isLoadingChats}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        onDeleteSession={handleDeleteSession}
        onLogout={handleLogout}
        onNewChat={() => {
          setActiveSessionId(null)
          setMessages([])
          setPromptInput('')
        }}
        onRenameSession={handleRenameSession}
        onSelectSession={(id) => {
          setActiveSessionId(id)
          if (window.innerWidth < 1024) setIsSidebarOpen(false)
        }}
        sessions={sessions}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Separate Navbar Component */}
        <Navbar
          activeChat={activeChat}
          isSidebarOpen={isSidebarOpen}
          onDeleteActiveChat={async () => {
            if (activeChat) await handleDeleteSession(activeChat.id)
          }}
          onNewChat={() => setNewChatTitleModalOpen(true)}
          onRenameActiveChat={async (newTitle) => {
            if (activeChat) await handleRenameSession(activeChat.id, newTitle)
          }}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* API Error Notification Banner */}
        {errorMessage && (
          <div
            className="mx-auto mt-3 flex w-full max-w-[820px] items-center justify-between rounded-xl border border-[#f1d5cc] bg-[#fff4ef] px-4 py-2.5 text-xs font-medium text-[#a7523d]"
            role="alert"
          >
            <span>{errorMessage}</span>
            <button
              className="font-bold underline"
              onClick={() => setErrorMessage(null)}
              type="button"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Messages or Welcome State */}
        <main className="relative flex-1 overflow-y-auto px-4 pt-6 pb-36 sm:px-8">
          <div className="mx-auto max-w-[820px]">
            {isLoadingMessages ? (
              <div className="space-y-4 py-10">
                <div className="ml-auto h-12 w-2/3 animate-pulse rounded-2xl bg-[#dcebd2]/70" />
                <div className="h-24 w-3/4 animate-pulse rounded-2xl bg-[#eef4e9]" />
                <div className="ml-auto h-12 w-1/2 animate-pulse rounded-2xl bg-[#dcebd2]/70" />
              </div>
            ) : !activeSessionId || messages.length === 0 ? (
              /* Empty State / Start a New Fridge Session */
              <div className="animate-enter py-8 text-center sm:py-14">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7d3] bg-white/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.13em] text-[#66805e]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8db36d]" />
                  {activeChat ? `Chat: ${activeChat.title}` : 'A little more joy in your kitchen'}
                </span>

                <h2 className="mt-4 font-serif text-3xl font-medium tracking-[-0.04em] text-[#2c4131] sm:text-5xl">
                  What&apos;s in your{' '}
                  <span className="text-[#779666]">fridge tonight?</span>
                </h2>
                <p className="mx-auto mt-3 max-w-[490px] text-sm leading-6 text-[#788272] sm:text-base">
                  List the ingredients you have on hand or click a starter idea below.
                  Your conversation is saved automatically to your account.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
                  {[
                    {
                      emoji: '🥑',
                      title: 'Avocado, Spinach & Eggs',
                      prompt:
                        'I have avocado, baby spinach, and 3 eggs in my fridge. What can I cook in 15 minutes?',
                    },
                    {
                      emoji: '🍅',
                      title: 'Tomatoes, Feta & Garlic',
                      prompt:
                        'I have cherry tomatoes, crumbled feta, and garlic. Suggest a one-pan dinner.',
                    },
                    {
                      emoji: '🍋',
                      title: 'Chickpeas, Lemon & Herbs',
                      prompt:
                        'Give me a high-protein meal using cooked chickpeas, fresh lemon, and herbs.',
                    },
                  ].map((item) => (
                    <button
                      className="group flex flex-col justify-between rounded-2xl border border-[#e5e7dd] bg-[#fffefa] p-5 shadow-[0_8px_24px_rgba(74,97,67,0.05)] transition-all duration-200 hover:-translate-y-1 hover:border-[#91aa7e] hover:shadow-[0_16px_32px_rgba(74,97,67,0.12)]"
                      key={item.title}
                      onClick={() => handleSendMessage(undefined, item.prompt)}
                      type="button"
                    >
                      <div>
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7F3DD] text-lg transition-transform duration-200 group-hover:scale-110">
                          {item.emoji}
                        </span>
                        <h3 className="mt-3.5 font-serif text-lg font-medium text-[#2c4131] group-hover:text-[#4B7C48]">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-[#788272]">
                          {item.prompt}
                        </p>
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#597b52]">
                        <span>Ask Kitchen AI →</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Loaded Messages List from GET /chats/{chat_id} */
              <div className="space-y-5">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user'
                  return (
                    <div
                      className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                      key={msg.id}
                    >
                      {!isUser && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#cfe0c2] bg-[#E7F3DD] text-base shadow-2xs">
                          🌿
                        </div>
                      )}

                      <div
                        className={`max-w-[88%] rounded-2xl px-5 py-3.5 text-sm leading-6 sm:max-w-[78%] ${
                          isUser
                            ? 'rounded-tr-xs bg-[#597b52] text-white shadow-[0_8px_20px_rgba(89,123,82,0.18)]'
                            : 'rounded-tl-xs border border-[#e5e7dd] bg-[#fffefa] text-[#334236] shadow-2xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        {msg.created_at && (
                          <p
                            className={`mt-1.5 text-[10px] ${
                              isUser ? 'text-[#dcebd2]' : 'text-[#9aa493]'
                            }`}
                          >
                            {formatMessageTime(msg.created_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}

                {isSending && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#cfe0c2] bg-[#E7F3DD] text-base">
                      🌿
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl border border-[#e5e7dd] bg-[#fffefa] px-4 py-3 text-xs font-semibold text-[#597b52]">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#597b52]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#76A96D] [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#98BD78] [animation-delay:300ms]" />
                      <span className="ml-1">Cooking up a response...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </main>

        {/* Bottom Prompt Bar -> POST /chats/{chat_id}/messages */}
        <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-20 bg-gradient-to-t from-[#fbfaf6] via-[#fbfaf6]/95 to-transparent pt-4 pb-5 lg:left-auto lg:w-[calc(100%-295px)]">
          <div className="pointer-events-auto mx-auto max-w-[820px] px-4 sm:px-8">
            <form
              className="group flex items-center gap-2 rounded-2xl border border-[#d6e1cd] bg-[#fffefa] p-2 shadow-[0_14px_34px_rgba(44,65,49,0.1)] transition-all duration-200 focus-within:border-[#7f9c72] focus-within:ring-4 focus-within:ring-[#9bb68a]/15"
              onSubmit={handleSendMessage}
            >
              <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f2f8ed] text-base sm:flex">
                🥕
              </span>
              <input
                className="h-10 min-w-0 flex-1 bg-transparent px-2 text-sm text-[#2c4131] outline-none placeholder:text-[#9aa493]"
                disabled={isSending}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Tell Kitchen AI what ingredients are in your fridge..."
                type="text"
                value={promptInput}
              />
              <button
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#597b52] px-4 text-xs font-semibold text-white shadow-[0_6px_14px_rgba(75,111,67,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4c6f47] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!promptInput.trim() || isSending}
                type="submit"
              >
                <span>{isSending ? 'Sending...' : 'Send'}</span>
                <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 20 20">
                  <path
                    d="M4 10h12m-5-5 5 5-5 5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Create Named Chat Modal -> POST /chats/ */}
      {newChatTitleModalOpen && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#27392d]/40 p-4 backdrop-blur-xs"
          onClick={() => setNewChatTitleModalOpen(false)}
          role="dialog"
        >
          <div
            className="w-full max-w-[420px] rounded-3xl border border-[#dce7d3] bg-[#fffefa] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-2xl font-medium text-[#2c4131]">
              Start a Named Kitchen Chat
            </h3>
            <p className="mt-1 text-xs text-[#788272]">
              Give this recipe session a custom title (e.g., &ldquo;Sunday Meal Prep&rdquo;).
            </p>

            <form className="mt-4 space-y-4" onSubmit={handleCreateNamedChat}>
              <input
                autoFocus
                className="h-12 w-full rounded-xl border border-[#e5e7dd] bg-white px-4 text-sm text-[#334236] outline-none focus:border-[#91aa7e] focus:ring-4 focus:ring-[#9bb68a]/15"
                onChange={(e) => setCustomNewTitle(e.target.value)}
                placeholder="e.g., Weeknight High-Protein Dinners"
                required
                type="text"
                value={customNewTitle}
              />
              <div className="flex justify-end gap-2">
                <button
                  className="rounded-xl border border-[#e5e7dd] bg-white px-4 py-2.5 text-xs font-semibold text-[#7b8277] hover:text-[#2c4131]"
                  onClick={() => setNewChatTitleModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="rounded-xl bg-[#597b52] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#4c6f47]"
                  type="submit"
                >
                  Create Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
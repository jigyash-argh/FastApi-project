import { useState, useRef, useEffect, type FormEvent } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import {
  getChats,
  getChatById,
  createChat,
  sendMessage,
  streamMessage,
  renameChat,
  deleteChat,
} from '../../api/chat'
import type { ChatSession, ChatMessage } from './types'
import { getFridgeItems } from '../../api/fridge'

function formatMessageTime(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatAssistantMarkdown(content: string): string {
  return content
    .replace(/\s+(#{1,6}\s+)/g, '\n\n$1')
    .replace(/\s+(?=-\s+(?:\*\*|[A-Z]))/g, '\n')
    .replace(/\s+(?=\d+\.\s+\*\*)/g, '\n')
}

const assistantMarkdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-2 mt-5 font-serif text-xl font-semibold text-[#2c4131] first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-5 font-serif text-lg font-semibold text-[#2c4131] first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-4 text-sm font-semibold text-[#2c4131] first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }) => <p className="my-2 leading-6 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1 pl-5 marker:text-[#76A96D]">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5 marker:font-semibold marker:text-[#597b52]">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-[#2c4131]">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-[#91aa7e] pl-3 text-[#657260]">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-[#e5e7dd]" />,
  a: ({ children, href }) => (
    <a
      className="font-medium text-[#4B7C48] underline underline-offset-2"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {children}
    </a>
  ),
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-xl bg-[#f2f4ed] p-3 text-xs leading-5">
      {children}
    </pre>
  ),
  code: ({ children }) => (
    <code className="rounded bg-[#f2f4ed] px-1 py-0.5 font-mono text-[0.9em]">
      {children}
    </code>
  ),
}

const Dashboard = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const skipNextFetchRef = useRef(false)
  const fridgePrompt =
    typeof location.state === 'object' &&
    location.state !== null &&
    'fridgePrompt' in location.state &&
    typeof location.state.fridgePrompt === 'string'
      ? location.state.fridgePrompt
      : null

  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const [isLoadingChats, setIsLoadingChats] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [promptInput, setPromptInput] = useState(fridgePrompt ?? '')
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

    let isMounted = true

    async function fetchInitialChats() {
      setIsLoadingChats(true)
      setErrorMessage(null)
      try {
        const chatList = await getChats()
        if (!isMounted) return
        setSessions(chatList)
        if (chatList.length > 0) {
          setActiveSessionId(chatList[0].id)
        }
      } catch (err: unknown) {
        if (!isMounted) return
        setErrorMessage(extractApiError(err, 'Could not load your chats.'))
      } finally {
        if (isMounted) setIsLoadingChats(false)
      }
    }

    fetchInitialChats()
    return () => {
      isMounted = false
    }
  }, [navigate])

  // 2. Load messages when switching between existing chats in the sidebar
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([])
      return
    }

    // Crucial fix: Do NOT overwrite state with GET /chats/{id} if we just created this chat in handleSendMessage!
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false
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

  // Auto-scroll when messages or streaming tokens update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  function extractApiError(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
      return error.message
    }
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

  async function handleCreateNamedChat(event: FormEvent) {
    event.preventDefault()
    const trimmed = customNewTitle.trim()
    if (!trimmed) return

    setErrorMessage(null)
    try {
      const created = await createChat({ title: trimmed })
      setSessions((prev) => [created, ...prev])
      skipNextFetchRef.current = true
      setActiveSessionId(created.id)
      setMessages([])
      setCustomNewTitle('')
      setNewChatTitleModalOpen(false)
    } catch (err: unknown) {
      setErrorMessage(extractApiError(err, 'Could not create chat.'))
    }
  }

  // 3. Send & Stream Message
  async function handleSendMessage(
    event?: FormEvent<HTMLFormElement>,
    presetContent?: string
  ) {
    if (event) event.preventDefault()
    const content = (presetContent ?? promptInput).trim()
    if (!content || isSending) return

    let requestContent = content
    try {
      const fridgeItems = getFridgeItems()
      if (fridgeItems.length > 0) {
        const ingredientList = fridgeItems
          .map((item) => `${item.quantity} ${item.name}`)
          .join(', ')
        requestContent = `${content}\n\nIngredients currently in my fridge: ${ingredientList}. Prioritize these ingredients when suggesting a dish.`
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not load your saved fridge items.'
      )
      return
    }

    setPromptInput('')
    setIsSending(true)
    setErrorMessage(null)

    const tempUserId = `temp-user-${Date.now()}`
    const tempAiId = `temp-ai-${Date.now()}`

    try {
      let targetChatId = activeSessionId

      // Create chat first if user is on the empty welcome screen
      if (!targetChatId) {
        const autoTitle =
          content.length > 36 ? `${content.slice(0, 36)}...` : content
        const newSession = await createChat({ title: autoTitle })
        setSessions((prev) => [newSession, ...prev])
        targetChatId = newSession.id

        // Prevent useEffect from firing a competing GET /chats/{id}
        skipNextFetchRef.current = true
        setActiveSessionId(newSession.id)
      }

      // Show optimistic user message immediately
      const optimisticUserMsg: ChatMessage = {
        id: tempUserId,
        session_id: targetChatId,
        role: 'user',
        content: requestContent,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimisticUserMsg])

      let streamFailedMessage: string | null = null

      await streamMessage(
        targetChatId,
        { content: requestContent },
        {
          onUserMessage: (savedUserMsg) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === tempUserId ? savedUserMsg : m))
            )
          },
          onToken: (tokenChunk) => {
            setMessages((prev) => {
              const hasStreamingBubble = prev.some((m) => m.id === tempAiId)
              if (!hasStreamingBubble) {
                return [
                  ...prev,
                  {
                    id: tempAiId,
                    session_id: targetChatId!,
                    role: 'assistant',
                    content: tokenChunk,
                    created_at: new Date().toISOString(),
                  },
                ]
              }
              return prev.map((m) =>
                m.id === tempAiId ? { ...m, content: m.content + tokenChunk } : m
              )
            })
          },
          onComplete: ({ chat: updatedChat, user_message, ai_message }) => {
            setMessages((prev) => [
              ...prev.filter(
                (m) =>
                  m.id !== tempUserId &&
                  m.id !== tempAiId &&
                  m.id !== user_message.id &&
                  m.id !== ai_message.id
              ),
              user_message,
              ai_message,
            ])
            setSessions((prev) => [
              updatedChat,
              ...prev.filter((s) => s.id !== updatedChat.id),
            ])
          },
          onError: (detail) => {
            streamFailedMessage = detail
          },
        }
      )

      if (streamFailedMessage) {
        setErrorMessage(streamFailedMessage)
      }
    } catch (err: unknown) {
      // Fallback: if fetch streaming failed, try standard JSON endpoint
      try {
        if (activeSessionId) {
          const { chat: updatedChat, user_message, ai_message } = await sendMessage(
            activeSessionId,
            { content: requestContent }
          )
          setMessages((prev) => [
            ...prev.filter((m) => m.id !== tempUserId && m.id !== tempAiId),
            user_message,
            ai_message,
          ])
          setSessions((prev) => [
            updatedChat,
            ...prev.filter((s) => s.id !== updatedChat.id),
          ])
        } else {
          setErrorMessage(extractApiError(err, 'Failed to send message.'))
        }
      } catch (fallbackErr: unknown) {
        setErrorMessage(extractApiError(fallbackErr, 'Failed to send message.'))
      }
    } finally {
      setIsSending(false)
    }
  }

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
    <div className="flex h-dvh w-full overflow-hidden bg-[#fbfaf6] text-[#27392d] selection:bg-[#dcebd2] selection:text-[#2c4131]">
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
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
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

        <main className="relative flex-1 overflow-y-auto px-4 pt-6 pb-36 sm:px-8">
          <div className="mx-auto max-w-[820px]">
            {isLoadingMessages ? (
              <div className="space-y-4 py-10">
                <div className="ml-auto h-12 w-2/3 animate-pulse rounded-2xl bg-[#dcebd2]/70" />
                <div className="h-24 w-3/4 animate-pulse rounded-2xl bg-[#eef4e9]" />
              </div>
            ) : !activeSessionId || messages.length === 0 ? (
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
                      emoji: '🍆',
                      title: 'Eggplant, Garlic & Onion',
                      prompt:
                        'I have eggplant, garlic, and onion. What can I make under 10 minutes?',
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
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <div className="break-words">
                            <ReactMarkdown components={assistantMarkdownComponents}>
                              {formatAssistantMarkdown(msg.content)}
                            </ReactMarkdown>
                          </div>
                        )}
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

                {isSending && !messages.some((m) => m.id.startsWith('temp-ai-')) && (
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
              Give this recipe session a custom title.
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
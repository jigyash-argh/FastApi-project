import { useState, useEffect, type FormEvent } from 'react'
import type { ChatSession } from './types'

interface NavbarProps {
  activeChat: ChatSession | null
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  onNewChat: () => void
  onRenameActiveChat: (newTitle: string) => Promise<void>
  onDeleteActiveChat: () => Promise<void>
}

function Navbar({
  activeChat,
  isSidebarOpen,
  onToggleSidebar,
  onNewChat,
  onRenameActiveChat,
  onDeleteActiveChat,
}: NavbarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setIsEditingTitle(false)
    setTitleInput(activeChat?.title || '')
  }, [activeChat?.id, activeChat?.title])

  async function handleRenameSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = titleInput.trim()
    if (!trimmed || !activeChat) return

    setIsSubmitting(true)
    try {
      await onRenameActiveChat(trimmed)
      setIsEditingTitle(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[#ecece4] bg-[#fbfaf6]/85 px-4 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e5e7dd] bg-white text-[#455449] shadow-2xs transition-all duration-200 hover:border-[#91aa7e] hover:bg-[#f2f8ed] hover:text-[#2c4131]"
          onClick={onToggleSidebar}
          title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-200 group-hover:scale-105"
            fill="none"
            viewBox="0 0 24 24"
          >
            <rect height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" width="18" x="3" y="4" />
            <path d="M9 4v16" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>

        {/* Active Chat Title + Click-to-Rename */}
        {activeChat && isEditingTitle ? (
          <form className="flex items-center gap-2" onSubmit={handleRenameSubmit}>
            <input
              autoFocus
              className="h-9 rounded-xl border border-[#7f9c72] bg-white px-3 text-sm font-semibold text-[#2c4131] outline-none focus:ring-2 focus:ring-[#9bb68a]/30"
              disabled={isSubmitting}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsEditingTitle(false)
              }}
              type="text"
              value={titleInput}
            />
            <button
              className="rounded-xl bg-[#597b52] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4c6f47]"
              disabled={isSubmitting}
              type="submit"
            >
              Save
            </button>
            <button
              className="rounded-xl border border-[#e5e7dd] bg-white px-2.5 py-1.5 text-xs font-medium text-[#7b8277] hover:text-[#2c4131]"
              onClick={() => setIsEditingTitle(false)}
              type="button"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate font-serif text-lg font-medium tracking-[-0.03em] text-[#2c4131] sm:text-xl">
              {activeChat ? activeChat.title : 'New Fridge Session'}
            </h1>

            {activeChat && (
              <button
                aria-label="Rename conversation"
                className="rounded-lg p-1.5 text-[#829477] transition-colors hover:bg-[#eef4e9] hover:text-[#2c4131]"
                onClick={() => setIsEditingTitle(true)}
                title="Rename chat"
                type="button"
              >
                <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {activeChat && (
          <button
            className="hidden items-center gap-1.5 rounded-xl border border-[#f1d5cc] bg-[#fff4ef] px-3 py-1.5 text-xs font-semibold text-[#a7523d] transition-colors hover:bg-[#fde8df] sm:inline-flex"
            onClick={onDeleteActiveChat}
            type="button"
          >
            <span>Delete Chat</span>
          </button>
        )}

        <button
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#597b52] px-3.5 text-xs font-semibold text-white shadow-[0_6px_14px_rgba(75,111,67,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4c6f47]"
          onClick={onNewChat}
          type="button"
        >
          <span>+ New Chat</span>
        </button>
      </div>
    </header>
  )
}

export default Navbar
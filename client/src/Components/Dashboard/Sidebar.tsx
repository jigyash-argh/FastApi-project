import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ChatSession, UserProfile } from './types'

interface SidebarProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  isOpen: boolean
  user: UserProfile
  onSelectSession: (id: string) => void
  onNewChat: () => void
  onDeleteSession: (id: string) => void
  onTogglePin: (id: string) => void
  onCloseMobile: () => void
  onLogout: () => void
}

function BrandMark() {
  return (
    <svg aria-hidden="true" className="h-8 w-8 shrink-0" fill="none" viewBox="0 0 40 40">
      <rect fill="#dcebd2" height="40" rx="14" width="40" />
      <path
        d="M20 29V17m0 5c-4.2-.3-6.6-2.7-7-7 4.3.2 6.7 2.6 7 7Zm0-3c.3-4.4 2.7-6.8 7-7-.2 4.3-2.6 6.7-7 7Z"
        stroke="#4B7C48"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

function Sidebar({
  sessions,
  activeSessionId,
  isOpen,
  user,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onTogglePin,
  onCloseMobile,
  onLogout,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categories: Array<ChatSession['category']> = [
    'Today',
    'Yesterday',
    'Previous 7 Days',
  ]

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-[#27392d]/30 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        aria-label="Kitchen chat history"
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#d5e3cb] bg-gradient-to-b from-[#eef5e8] via-[#ebf3e4] to-[#e3eedb] text-[#27392d] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:static ${
          isOpen
            ? 'w-[290px] translate-x-0 opacity-100'
            : 'w-0 -translate-x-full overflow-hidden border-r-0 opacity-0 lg:w-0 lg:translate-x-0'
        }`}
      >
        <div className="flex h-full w-[290px] flex-col justify-between p-3.5">
          {/* Top Brand & New Chat CTA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1.5 pt-1">
              <Link
                className="group flex items-center gap-2.5 rounded-xl transition-opacity hover:opacity-85"
                to="/"
              >
                <BrandMark />
                <div>
                  <span className="block text-[15px] font-bold tracking-[-0.04em] text-[#2c4131]">
                    fridge <span className="font-medium text-[#6f8468]">to</span> feast
                  </span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#66805e]">
                    AI Kitchen Studio
                  </span>
                </div>
              </Link>

              <button
                aria-label="Close sidebar"
                className="rounded-lg p-1.5 text-[#5c7256] transition-colors hover:bg-[#dcebd2] hover:text-[#2c4131] lg:hidden"
                onClick={onCloseMobile}
                type="button"
              >
                <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.8"
                  />
                </svg>
              </button>
            </div>

            {/* New Recipe Chat Button */}
            <button
              className="group relative flex h-11 w-full items-center justify-between overflow-hidden rounded-xl bg-[#597b52] px-3.5 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(75,111,67,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4c6f47] hover:shadow-[0_12px_22px_rgba(75,111,67,0.28)] active:translate-y-0"
              onClick={onNewChat}
              type="button"
            >
              <span className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15 transition-transform duration-300 group-hover:rotate-90">
                  <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 20 20">
                    <path
                      d="M10 4v12M4 10h12"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2"
                    />
                  </svg>
                </span>
                <span>New Fridge Session</span>
              </span>
              <kbd className="rounded-md bg-white/15 px-1.5 py-0.5 font-sans text-[10px] font-medium text-[#e4f2d8]">
                ⌘K
              </kbd>
            </button>

            {/* Search Filter Input */}
            <div className="group flex h-9 items-center gap-2 rounded-xl border border-[#d2e1c8] bg-[#f8fbf5]/90 px-3 transition-all duration-200 focus-within:border-[#7f9c72] focus-within:bg-white focus-within:shadow-xs">
              <svg
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0 text-[#829477] transition-colors group-focus-within:text-[#4B7C48]"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                <path d="m20 20-3.5-3.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
              </svg>
              <input
                className="h-full w-full bg-transparent text-xs text-[#2c4131] outline-none placeholder:text-[#8fa086]"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search past feasts..."
                type="text"
                value={searchQuery}
              />
              {searchQuery && (
                <button
                  aria-label="Clear search"
                  className="text-xs text-[#829477] hover:text-[#2c4131]"
                  onClick={() => setSearchQuery('')}
                  type="button"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Previous Chats List */}
          <div className="my-3 flex-1 space-y-4 overflow-y-auto pr-1">
            {categories.map((category) => {
              const items = filteredSessions.filter((s) => s.category === category)
              if (items.length === 0) return null

              return (
                <div key={category}>
                  <p className="mb-1.5 px-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f8468]">
                    {category}
                  </p>
                  <ul className="space-y-1">
                    {items.map((session) => {
                      const isActive = session.id === activeSessionId
                      return (
                        <li key={session.id}>
                          <div
                            className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2.5 text-left transition-all duration-200 ${
                              isActive
                                ? 'bg-[#fffefa] text-[#27392d] shadow-[0_4px_14px_rgba(74,97,67,0.1)] ring-1 ring-[#cfe0c2]'
                                : 'text-[#3d5240] hover: translate-x-0.5 hover:bg-[#e1eed8]/80 hover:text-[#27392d]'
                            }`}
                          >
                            {/* Left Active Accent Bar */}
                            {isActive && (
                              <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-[#597b52]" />
                            )}

                            <button
                              className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                              onClick={() => onSelectSession(session.id)}
                              type="button"
                            >
                              <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm transition-transform duration-200 group-hover:scale-110 ${
                                  isActive ? 'bg-[#E7F3DD]' : 'bg-[#e3f0da]/70'
                                }`}
                              >
                                {session.emoji}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold">
                                  {session.title}
                                </p>
                                <p className="truncate text-[11px] text-[#75866f]">
                                  {session.preview}
                                </p>
                              </div>
                            </button>

                            {/* Hover Quick Actions (Pin & Delete) */}
                            <div className="ml-1 flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                              <button
                                aria-label="Pin chat"
                                className={`rounded-md p-1 transition-colors hover:bg-[#d5e6c9] ${
                                  session.pinned ? 'text-[#597b52] opacity-100' : 'text-[#75866f]'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onTogglePin(session.id)
                                }}
                                title="Bookmark recipe chat"
                                type="button"
                              >
                                <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                  <path
                                    d="M12 17.3 6.2 20l1.1-6.5L2.6 9l6.5-.9L12 2l2.9 6.1 6.5.9-4.7 4.5 1.1 6.5z"
                                    fill={session.pinned ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    strokeLinejoin="round"
                                    strokeWidth="1.7"
                                  />
                                </svg>
                              </button>
                              <button
                                aria-label="Delete chat"
                                className="rounded-md p-1 text-[#75866f] transition-colors hover:bg-[#f6ddd0] hover:text-[#a7523d]"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDeleteSession(session.id)
                                }}
                                title="Delete chat"
                                type="button"
                              >
                                <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                  <path
                                    d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.7"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}

            {filteredSessions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#c9dabf] bg-[#f6faf2]/70 p-4 text-center">
                <p className="text-xs font-medium text-[#5c7256]">No kitchen chats found</p>
                <p className="mt-1 text-[11px] text-[#829477]">
                  Try another ingredient keyword
                </p>
              </div>
            )}
          </div>

          {/* Bottom Sticky User Profile Card & Popover */}
          <div className="relative border-t border-[#d5e3cb] pt-3">
            {profileMenuOpen && (
              <div className="animate-enter absolute right-0 bottom-[calc(100%+10px)] left-0 z-50 rounded-2xl border border-[#cfe0c2] bg-[#fffefa] p-2 shadow-[0_18px_38px_rgba(44,65,49,0.16)]">
                <div className="border-b border-[#ecece4] px-3 py-2.5">
                  <p className="text-xs font-bold text-[#2c4131]">{user.name}</p>
                  <p className="truncate text-[11px] text-[#7b8277]">{user.email}</p>
                  <div className="mt-2 flex items-center gap-2 text-[11px]">
                    <span className="rounded-md bg-[#E7F3DD] px-2 py-0.5 font-semibold text-[#4B7C48]">
                      🧊 {user.fridgeCount} Fridge Items
                    </span>
                    <span className="rounded-md bg-[#ffe8b0]/60 px-2 py-0.5 font-semibold text-[#7a591c]">
                      ⭐ {user.savedRecipes} Saved
                    </span>
                  </div>
                </div>

                <div className="mt-1 space-y-0.5">
                  <Link
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#344a35] transition-colors hover:bg-[#f2f8ed]"
                    to="/"
                  >
                    <span>🥬</span>
                    <span>Manage Fridge Shelf</span>
                  </Link>
                  <button
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#344a35] transition-colors hover:bg-[#f2f8ed]"
                    onClick={() => setProfileMenuOpen(false)}
                    type="button"
                  >
                    <span>⚙️</span>
                    <span>Dietary & Spice Preferences</span>
                  </button>
                  <button
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#a7523d] transition-colors hover:bg-[#fff4ef]"
                    onClick={onLogout}
                    type="button"
                  >
                    <span>🚪</span>
                    <span>Sign out of Kitchen</span>
                  </button>
                </div>
              </div>
            )}

            <button
              aria-expanded={profileMenuOpen}
              className="group flex w-full items-center justify-between rounded-2xl border border-[#cfe0c2] bg-[#fffefa]/90 p-2.5 text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9bb68a] hover:bg-white hover:shadow-md"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              type="button"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#597b52] to-[#76A96D] text-xs font-bold text-white shadow-xs">
                  {user.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                  <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#76A96D]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[#2c4131] group-hover:text-[#4B7C48]">
                    {user.name}
                  </p>
                  <p className="truncate text-[11px] font-medium text-[#6f8468]">
                    {user.badge}
                  </p>
                </div>
              </div>

              <svg
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 text-[#7b8277] transition-transform duration-200 ${
                  profileMenuOpen ? 'rotate-180 text-[#2c4131]' : 'group-hover:text-[#2c4131]'
                }`}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="m7 15 5 5 5-5M7 9l5-5 5 5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
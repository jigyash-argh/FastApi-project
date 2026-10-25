import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { ChatSession, UserProfile } from './types'
import { getCurrentUser, updateCurrentUser, updateUserSettings, deleteUserAccount } from '../../api/user'

const dietPreferenceOptions = ['All Everything', 'Vegetarian', 'Vegan', 'Non-Vegetarian']

interface SidebarProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  isLoadingChats: boolean
  isOpen: boolean
  onSelectSession: (id: string) => void
  onNewChat: () => void
  onRenameSession: (id: string, newTitle: string) => Promise<void>
  onDeleteSession: (id: string) => Promise<void>
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

function getDateBucket(isoDate: string): 'Today' | 'Yesterday' | 'Earlier' {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return 'Today'
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterdayStart = todayStart - 86_400_000
  const itemTime = date.getTime()

  if (itemTime >= todayStart) return 'Today'
  if (itemTime >= yesterdayStart) return 'Yesterday'
  return 'Earlier'
}

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Sidebar({
  sessions,
  activeSessionId,
  isLoadingChats,
  isOpen,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onDeleteSession,
  onCloseMobile,
  onLogout,
}: SidebarProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)

  // Editable Profile Form State
  const [usernameInput, setUsernameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [dietPrefInput, setDietPrefInput] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)

  // Inline rename states
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [isSavingRename, setIsSavingRename] = useState(false)
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null)

  // Fetch real user data from GET /users/me on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await getCurrentUser()
        setUser(data)
        setUsernameInput(data.username)
        setEmailInput(data.email)
        const savedDietPreference = data.settings?.diet_preference
        const legacyDietPreferences: Record<string, string> = {
          none: 'All Everything',
          non_vegetarian: 'Non-Vegetarian',
        }
        const normalizedDietPreference =
          typeof savedDietPreference === 'string'
            ? legacyDietPreferences[savedDietPreference] || savedDietPreference
            : undefined
        setDietPrefInput(
          normalizedDietPreference && dietPreferenceOptions.includes(normalizedDietPreference)
            ? normalizedDietPreference
            : 'All Everything'
        )
      } catch (err) {
        console.error('Failed to fetch current user:', err)
      }
    }
    fetchUser()
  }, [])

  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const buckets: Array<'Today' | 'Yesterday' | 'Earlier'> = ['Today', 'Yesterday', 'Earlier']

  async function handleSaveProfileAndSettings(e: FormEvent) {
    e.preventDefault()
    setIsSavingProfile(true)
    setProfileError(null)
    setProfileSuccess(null)

    try {
      // Update profile (PATCH /users/me)
      const updatedUser = await updateCurrentUser({
        username: usernameInput,
        email: emailInput,
      })

      // Update settings (PATCH /users/me/settings)
      const updatedSettings = await updateUserSettings({
        diet_preference: dietPrefInput,
      })

      setUser({
        ...updatedUser,
        settings: updatedSettings,
      })

      setProfileSuccess('Profile and settings updated successfully!')
      setTimeout(() => {
        setSettingsModalOpen(false)
        setProfileSuccess(null)
      }, 1200)
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err.response as { data?: { detail?: string } })?.data?.detail
          : 'Failed to update profile.'
      setProfileError(typeof msg === 'string' ? msg : 'Failed to update profile.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }
    try {
      await deleteUserAccount()
      onLogout()
    } catch {
      alert('Failed to delete account.')
    }
  }

  return (
    <>
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
            ? 'w-[295px] translate-x-0 opacity-100'
            : 'w-0 -translate-x-full overflow-hidden border-r-0 opacity-0 lg:w-0 lg:translate-x-0'
        }`}
      >
        <div className="flex h-full w-[295px] flex-col justify-between p-3.5">
          {/* Header & New Chat */}
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
                    Kitchen Workspace
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
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                </svg>
              </button>
            </div>

            <button
              className="group relative flex h-11 w-full items-center justify-between overflow-hidden rounded-xl bg-[#597b52] px-3.5 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(75,111,67,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4c6f47]"
              onClick={onNewChat}
              type="button"
            >
              <span className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15 transition-transform duration-300 group-hover:rotate-90">
                  <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 20 20">
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
                  </svg>
                </span>
                <span>New Fridge Chat</span>
              </span>
              <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-medium text-[#e4f2d8]">
                + New
              </span>
            </button>

            {/* Search Filter */}
            <div className="group flex h-9 items-center gap-2 rounded-xl border border-[#d2e1c8] bg-[#f8fbf5]/90 px-3 transition-all duration-200 focus-within:border-[#7f9c72] focus-within:bg-white">
              <svg
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0 text-[#829477] group-focus-within:text-[#4B7C48]"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                <path d="m20 20-3.5-3.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
              </svg>
              <input
                className="h-full w-full bg-transparent text-xs text-[#2c4131] outline-none placeholder:text-[#8fa086]"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chat titles..."
                type="text"
                value={searchQuery}
              />
            </div>
          </div>

          {/* Chat History List */}
          <div className="my-3 flex-1 space-y-4 overflow-y-auto pr-1">
            {isLoadingChats ? (
              <div className="space-y-2 px-1 pt-2">
                {[1, 2, 3].map((n) => (
                  <div className="h-12 w-full animate-pulse rounded-xl bg-[#dcebd2]/70" key={n} />
                ))}
              </div>
            ) : (
              buckets.map((bucket) => {
                const groupChats = filteredSessions.filter(
                  (chat) => getDateBucket(chat.updated_at || chat.created_at) === bucket
                )
                if (groupChats.length === 0) return null

                return (
                  <div key={bucket}>
                    <p className="mb-1.5 px-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f8468]">
                      {bucket}
                    </p>
                    <ul className="space-y-1">
                      {groupChats.map((session) => {
                        const isActive = session.id === activeSessionId
                        const isEditing = editingChatId === session.id

                        return (
                          <li key={session.id}>
                            <div
                              className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2 text-left transition-all duration-200 ${
                                isActive
                                  ? 'bg-[#fffefa] text-[#27392d] shadow-[0_4px_14px_rgba(74,97,67,0.1)] ring-1 ring-[#cfe0c2]'
                                  : 'text-[#3d5240] hover:translate-x-0.5 hover:bg-[#e1eed8]/80 hover:text-[#27392d]'
                              }`}
                            >
                              {isActive && (
                                <span className="absolute top-2.5 bottom-2.5 left-0 w-1 rounded-r-full bg-[#597b52]" />
                              )}

                              {isEditing ? (
                                <form
                                  className="flex w-full items-center gap-1.5"
                                  onSubmit={async (e) => {
                                    e.preventDefault()
                                    if (!editingTitle.trim()) return
                                    setIsSavingRename(true)
                                    try {
                                      await onRenameSession(session.id, editingTitle.trim())
                                      setEditingChatId(null)
                                    } finally {
                                      setIsSavingRename(false)
                                    }
                                  }}
                                >
                                  <input
                                    autoFocus
                                    className="w-full rounded-lg border border-[#7f9c72] bg-white px-2 py-1 text-xs font-semibold text-[#2c4131] outline-none"
                                    disabled={isSavingRename}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    type="text"
                                    value={editingTitle}
                                  />
                                  <button
                                    className="rounded-md bg-[#597b52] p-1 text-white hover:bg-[#4c6f47]"
                                    type="submit"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    className="rounded-md p-1 text-[#75866f]"
                                    onClick={() => setEditingChatId(null)}
                                    type="button"
                                  >
                                    ✕
                                  </button>
                                </form>
                              ) : (
                                <>
                                  <button
                                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                                    onClick={() => onSelectSession(session.id)}
                                    type="button"
                                  >
                                    <span
                                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm ${
                                        isActive ? 'bg-[#E7F3DD]' : 'bg-[#e3f0da]/70'
                                      }`}
                                    >
                                      🥗
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-xs font-semibold">{session.title}</p>
                                      <p className="truncate text-[10px] text-[#75866f]">
                                        {formatRelativeTime(session.updated_at || session.created_at)}
                                      </p>
                                    </div>
                                  </button>

                                  <div className="ml-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button
                                      aria-label="Rename chat"
                                      className="rounded-md p-1 text-[#75866f] hover:text-[#2c4131]"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setEditingChatId(session.id)
                                        setEditingTitle(session.title)
                                      }}
                                      type="button"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      aria-label="Delete chat"
                                      className="rounded-md p-1 text-[#75866f] hover:text-[#a7523d]"
                                      disabled={deletingChatId === session.id}
                                      onClick={async (e) => {
                                        e.stopPropagation()
                                        setDeletingChatId(session.id)
                                        try {
                                          await onDeleteSession(session.id)
                                        } finally {
                                          setDeletingChatId(null)
                                        }
                                      }}
                                      type="button"
                                    >
                                      🗑
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })
            )}
          </div>

          {/* Bottom User Profile Menu */}
          <div className="relative border-t border-[#d5e3cb] pt-3">
            {profileMenuOpen && (
              <div className="animate-enter absolute right-0 bottom-[calc(100%+10px)] left-0 z-50 rounded-2xl border border-[#cfe0c2] bg-[#fffefa] p-2 shadow-2xl">
                <div className="border-b border-[#ecece4] px-3 py-2.5">
                  <p className="text-xs font-bold text-[#2c4131]">{user?.username || 'Chef'}</p>
                  <p className="truncate text-[11px] text-[#7b8277]">{user?.email}</p>
                </div>

                <div className="mt-1 space-y-0.5">
                  <button
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#344a35] hover:bg-[#f2f8ed]"
                    onClick={() => {
                      setProfileMenuOpen(false)
                      setSettingsModalOpen(true)
                    }}
                    type="button"
                  >
                    <span>⚙️</span>
                    <span>Profile & Settings</span>
                  </button>
                  <Link
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#344a35] hover:bg-[#f2f8ed]"
                    to="/"
                  >
                    <span>🏠</span>
                    <span>Back to Fridge Home</span>
                  </Link>
                  <button
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#a7523d] hover:bg-[#fff4ef]"
                    onClick={onLogout}
                    type="button"
                  >
                    <span>🚪</span>
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}

            <button
              aria-expanded={profileMenuOpen}
              className="group flex w-full items-center justify-between rounded-2xl border border-[#cfe0c2] bg-[#fffefa]/90 p-2.5 text-left shadow-xs transition-all hover:bg-white"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              type="button"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#597b52] to-[#76A96D] text-xs font-bold text-white">
                  {(user?.username || 'C').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[#2c4131]">
                    {user?.username || 'Loading...'}
                  </p>
                  <p className="truncate text-[11px] text-[#6f8468]">{user?.email || ''}</p>
                </div>
              </div>
              <span className="text-xs text-[#7b8277]">▲</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Profile & Settings Modal */}
      {settingsModalOpen && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#27392d]/40 p-4 backdrop-blur-xs"
          onClick={() => setSettingsModalOpen(false)}
          role="dialog"
        >
          <div
            className="w-full max-w-[460px] rounded-3xl border border-[#dce7d3] bg-[#fffefa] p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#ecece4] pb-4">
              <h3 className="font-serif text-2xl font-medium text-[#2c4131]">
                Profile & Settings
              </h3>
              <button
                className="text-xs text-[#788272] hover:text-[#2c4131]"
                onClick={() => setSettingsModalOpen(false)}
                type="button"
              >
                ✕ Close
              </button>
            </div>

            {profileError && (
              <p className="mt-4 rounded-xl border border-[#f1d5cc] bg-[#fff4ef] px-4 py-2.5 text-xs text-[#a7523d]">
                {profileError}
              </p>
            )}

            {profileSuccess && (
              <p className="mt-4 rounded-xl border border-[#d7e8cf] bg-[#f2f8ed] px-4 py-2.5 text-xs text-[#4d7548]">
                {profileSuccess}
              </p>
            )}

            <form className="mt-5 space-y-4" onSubmit={handleSaveProfileAndSettings}>
              <div>
                <label className="block text-xs font-semibold text-[#455449]" htmlFor="modal-username">
                  Username
                </label>
                <input
                  className="mt-1 h-11 w-full rounded-xl border border-[#e5e7dd] bg-white px-3 text-sm text-[#334236] outline-none focus:border-[#91aa7e]"
                  id="modal-username"
                  onChange={(e) => setUsernameInput(e.target.value)}
                  required
                  type="text"
                  value={usernameInput}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#455449]" htmlFor="modal-email">
                  Email Address
                </label>
                <input
                  className="mt-1 h-11 w-full rounded-xl border border-[#e5e7dd] bg-white px-3 text-sm text-[#334236] outline-none focus:border-[#91aa7e]"
                  id="modal-email"
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  type="email"
                  value={emailInput}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#455449]" htmlFor="modal-diet">
                  Default Kitchen Diet Preference
                </label>
                <select
                  className="mt-1 h-11 w-full rounded-xl border border-[#e5e7dd] bg-white px-3 text-sm text-[#334236] outline-none focus:border-[#91aa7e]"
                  id="modal-diet"
                  onChange={(e) => setDietPrefInput(e.target.value)}
                  required
                  value={dietPrefInput}
                >
                  {dietPreferenceOptions.map((preference) => (
                    <option key={preference} value={preference}>
                      {preference}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  className="rounded-xl border border-[#f1d5cc] bg-[#fff4ef] px-4 py-2 text-xs font-semibold text-[#a7523d] hover:bg-[#fde8df]"
                  onClick={handleDeleteAccount}
                  type="button"
                >
                  Delete Account
                </button>

                <div className="flex gap-2">
                  <button
                    className="rounded-xl border border-[#e5e7dd] bg-white px-4 py-2 text-xs font-semibold text-[#7b8277]"
                    onClick={() => setSettingsModalOpen(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="rounded-xl bg-[#597b52] px-5 py-2 text-xs font-semibold text-white hover:bg-[#4c6f47]"
                    disabled={isSavingProfile}
                    type="submit"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
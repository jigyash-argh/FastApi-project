import { Link } from 'react-router-dom'

interface NavbarProps {
  activeTitle: string
  isSidebarOpen: boolean
  activeDiet: string
  fridgePantryCount: number
  onToggleSidebar: () => void
  onSelectDiet: (diet: string) => void
  onNewChat: () => void
}

const DIET_MODES = ['All Everything', '15-Min Quick', 'High Protein', 'Plant-Forward']

function Navbar({
  activeTitle,
  isSidebarOpen,
  activeDiet,
  fridgePantryCount,
  onToggleSidebar,
  onSelectDiet,
  onNewChat,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[#ecece4] bg-[#fbfaf6]/85 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Sidebar Toggle & Active Session Title */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="group flex h-9 w-9 items-center justify-center rounded-xl border border-[#e5e7dd] bg-white text-[#455449] shadow-2xs transition-all duration-200 hover:border-[#91aa7e] hover:bg-[#f2f8ed] hover:text-[#2c4131]"
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

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate font-serif text-lg font-medium tracking-[-0.03em] text-[#2c4131] sm:text-xl">
              {activeTitle}
            </h1>
            <span className="hidden items-center gap-1 rounded-full border border-[#dce7d3] bg-[#f2f8ed] px-2.5 py-0.5 text-[11px] font-semibold text-[#4d7548] sm:inline-flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6d9b62]" />
              Chef AI Ready
            </span>
          </div>
        </div>
      </div>

      {/* Center: Dietary Filter Pills */}
      <div className="hidden items-center gap-1.5 rounded-2xl border border-[#e5e7dd] bg-[#f5f6f0] p-1 xl:flex">
        {DIET_MODES.map((diet) => {
          const active = activeDiet === diet
          return (
            <button
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                active
                  ? 'bg-white text-[#2d4031] shadow-2xs'
                  : 'text-[#7b8277] hover:text-[#2d4031]'
              }`}
              key={diet}
              onClick={() => onSelectDiet(diet)}
              type="button"
            >
              {diet}
            </button>
          )
        })}
      </div>

      {/* Right: Fridge Stock Pill & Quick New Chat */}
      <div className="flex items-center gap-2.5">
        <Link
          className="group flex items-center gap-2 rounded-xl border border-[#dce7d3] bg-white px-3 py-2 text-xs font-semibold text-[#344a35] shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#91aa7e] hover:bg-[#f2f8ed]"
          to="/"
        >
          <span className="text-sm transition-transform duration-200 group-hover:rotate-12">
            🥑
          </span>
          <span className="hidden sm:inline">Fridge Stocked:</span>
          <span className="rounded-md bg-[#E7F3DD] px-1.5 py-0.5 text-[11px] font-bold text-[#4B7C48]">
            {fridgePantryCount} items
          </span>
        </Link>

        <button
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#597b52] px-3.5 text-xs font-semibold text-white shadow-[0_6px_14px_rgba(75,111,67,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4c6f47] sm:hidden"
          onClick={onNewChat}
          type="button"
        >
          <span>+ New</span>
        </button>
      </div>
    </header>
  )
}

export default Navbar
import { useState, useRef, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import type { ChatSession, ChatMessage, UserProfile } from './types'

const INITIAL_SESSIONS: ChatSession[] = [
  {
    id: 'chat-avocado-spinach',
    title: 'Creamy Avocado & Spinach Pasta',
    preview: 'Using avocado, baby spinach, garlic & lemon',
    category: 'Today',
    emoji: '🥑',
    pinned: true,
    messages: [
      {
        id: 'm-1',
        role: 'user',
        content:
          'I have 1 ripe avocado, two handfuls of baby spinach, roasted garlic, and a fresh lemon in my fridge. What can I make in 15 minutes?',
        timestamp: '7:15 PM',
      },
      {
        id: 'm-2',
        role: 'assistant',
        content:
          'You have the exact building blocks for a silky, no-cream Green Goddess skillet pasta! Blending the ripe avocado with spinach, lemon juice, and warm pasta water creates a glossy emerald sauce without heavy dairy.',
        timestamp: '7:15 PM',
        recipe: {
          title: '15-Minute Silky Avocado & Spinach Skillet Pasta',
          prepTime: '15 mins',
          calories: '420 kcal',
          matchPercent: 96,
          ingredientsUsed: ['Avocado', 'Baby Spinach', 'Roasted Garlic', 'Fresh Lemon'],
          missingIngredients: ['Pasta or Chickpearotini', 'Olive Oil'],
          steps: [
            'Boil salted water and cook your pasta until al dente, reserving 1/2 cup of starchy cooking water.',
            'Add ripe avocado, half the baby spinach, roasted garlic, lemon juice, and olive oil to a blender; pulse until velvety smooth.',
            'Toss hot pasta with the avocado crema, splash in warm pasta water, and fold in the remaining fresh spinach leaves to wilt.',
          ],
        },
      },
    ],
  },
  {
    id: 'chat-shakshuka-eggs',
    title: 'Rustic Feta & Blistered Tomato Eggs',
    preview: 'One-pan dinner with free-range eggs & feta',
    category: 'Yesterday',
    emoji: '🍳',
    pinned: false,
    messages: [
      {
        id: 'm-3',
        role: 'user',
        content: 'My cherry tomatoes are getting soft and I have 3 eggs + crumbled feta left.',
        timestamp: 'Yesterday',
      },
      {
        id: 'm-4',
        role: 'assistant',
        content:
          'Softening cherry tomatoes are actually ideal for a quick skillet jam! Their natural sugars caramelize in minutes, making a rich base for poached eggs and salty feta.',
        timestamp: 'Yesterday',
        recipe: {
          title: 'Jammy Cherry Tomato & Whipped Feta Skillet Eggs',
          prepTime: '18 mins',
          calories: '350 kcal',
          matchPercent: 100,
          ingredientsUsed: ['Cherry Tomatoes', 'Free-range Eggs', 'Crumbled Feta', 'Garlic'],
          missingIngredients: ['Crusty Bread (optional)'],
          steps: [
            'Sear cherry tomatoes in olive oil over medium-high heat for 5 minutes until blistered and saucy.',
            'Press gently with a wooden spoon, season with black pepper and oregano, and make 3 small wells.',
            'Crack the eggs into the wells, scatter crumbled feta over the top, cover, and simmer 4 minutes until whites are set.',
          ],
        },
      },
    ],
  },
  {
    id: 'chat-crispy-chickpeas',
    title: 'Lemon-Herb Smashed Chickpea Bowls',
    preview: 'Zero-waste lunch prep with garden herbs',
    category: 'Previous 7 Days',
    emoji: '🌿',
    pinned: false,
    messages: [
      {
        id: 'm-5',
        role: 'user',
        content: 'Need a high-protein work lunch using cooked chickpeas, herbs, and cucumber.',
        timestamp: '4 days ago',
      },
      {
        id: 'm-6',
        role: 'assistant',
        content:
          'Here is a crisp, refreshing Mediterranean smashed chickpea bowl that holds up beautifully in the fridge for 3 days without getting soggy.',
        timestamp: '4 days ago',
        recipe: {
          title: 'Crisp Herb & Lemon Smashed Chickpea Jar',
          prepTime: '10 mins',
          calories: '380 kcal',
          matchPercent: 92,
          ingredientsUsed: ['Cooked Chickpeas', 'Garden Herbs', 'Fresh Lemon', 'Cucumber'],
          missingIngredients: ['Tahini or Greek Yogurt'],
          steps: [
            'Lightly smash half the chickpeas with a fork so they absorb the lemon-herb dressing while keeping texture.',
            'Fold in diced cucumber, finely chopped dill and parsley, lemon zest, and a spoonful of tahini.',
            'Season with flaky sea salt and chill until ready to eat.',
          ],
        },
      },
    ],
  },
]

const QUICK_FRIDGE_CHIPS = [
  '🥑 1 Ripe Avocado',
  '🥚 3 Free-range Eggs',
  '🥬 Wilting Spinach',
  '🧀 Crumbled Feta',
  '🍅 Cherry Tomatoes',
  '🍋 Half a Lemon',
]

const STARTER_PROMPTS = [
  {
    emoji: '🥗',
    title: 'Use up wilting greens',
    desc: 'Turn baby spinach & herbs into a 12-minute warm grain bowl',
    prompt: 'I have baby spinach, fresh herbs, and lemon that need to be used tonight. Suggest a warm 12-minute bowl.',
  },
  {
    emoji: '🍳',
    title: 'High-protein skillet',
    desc: 'One-pan dinner with eggs, feta, and blistered tomatoes',
    prompt: 'Give me a high-protein one-pan dinner using eggs, feta cheese, and cherry tomatoes.',
  },
  {
    emoji: '✨',
    title: '3-ingredient magic',
    desc: 'Minimalist comfort food with zero grocery trip needed',
    prompt: 'What is the most delicious dinner I can make with just chickpeas, garlic, and lemon?',
  },
]

const Dashboard = () => {
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const [sessions, setSessions] = useState<ChatSession[]>(INITIAL_SESSIONS)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(INITIAL_SESSIONS[0].id)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeDiet, setActiveDiet] = useState('All Everything')
  const [promptInput, setPromptInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({})

  const [user] = useState<UserProfile>({
    name: 'Jigyash Shukla',
    email: 'jigyash@fridgetofeast.dev',
    badge: 'Zero-Waste Sous Chef',
    fridgeCount: 9,
    savedRecipes: 14,
  })

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeSession?.messages.length, isTyping])

  function handleLogout() {
    window.localStorage.removeItem('access_token')
    navigate('/login')
  }

  function handleNewChat() {
    setActiveSessionId(null)
    setPromptInput('')
  }

  function handleDeleteSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id)
      setActiveSessionId(remaining[0]?.id ?? null)
    }
  }

  function handleTogglePin(id: string) {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
    )
  }

  function handleAddChipToPrompt(chipText: string) {
    const cleanName = chipText.replace(/^[^\w]+/, '').trim()
    setPromptInput((prev) =>
      prev
        ? `${prev}, ${cleanName.toLowerCase()}`
        : `I have ${cleanName.toLowerCase()} in my fridge. What can I cook tonight?`
    )
  }

  function toggleStepCheck(stepKey: string) {
    setCheckedSteps((prev) => ({ ...prev, [stepKey]: !prev[stepKey] }))
  }

  function handleSendMessage(event?: FormEvent<HTMLFormElement>, customText?: string) {
    if (event) event.preventDefault()
    const text = (customText ?? promptInput).trim()
    if (!text || isTyping) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: 'Just now',
    }

    let targetSessionId = activeSessionId

    if (!targetSessionId) {
      const newSession: ChatSession = {
        id: `chat-${Date.now()}`,
        title: text.slice(0, 34) + (text.length > 34 ? '...' : ''),
        preview: `Tailored for ${activeDiet}`,
        category: 'Today',
        emoji: '🥗',
        messages: [userMsg],
      }
      setSessions((prev) => [newSession, ...prev])
      targetSessionId = newSession.id
      setActiveSessionId(newSession.id)
    } else {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId ? { ...s, messages: [...s.messages, userMsg] } : s
        )
      )
    }

    setPromptInput('')
    setIsTyping(true)

    // Simulate AI Chef crafting a customized recipe response
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `Here is a comforting, zero-waste recipe tailored to your **${activeDiet}** preference using what you have chilled right now:`,
        timestamp: 'Just now',
        recipe: {
          title: 'Warm Pan-Roasted Garlic & Herb Harvest Bowl',
          prepTime: '14 mins',
          calories: '390 kcal',
          matchPercent: 95,
          ingredientsUsed: ['Baby Spinach', 'Avocado', 'Roasted Garlic', 'Fresh Lemon'],
          missingIngredients: ['Toasted Seeds (optional)'],
          steps: [
            'Warm a glug of olive oil in a wide skillet with smashed garlic until fragrant and golden.',
            'Toss in your fridge greens and proteins for 2–3 minutes until just tender and glossy with citrus juice.',
            'Plate into warm bowls, crown with sliced avocado and herbs, and finish with cracked black pepper.',
          ],
        },
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId ? { ...s, messages: [...s.messages, aiMsg] } : s
        )
      )
      setIsTyping(false)
    }, 950)
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#fbfaf6] text-[#27392d] selection:bg-[#dcebd2] selection:text-[#2c4131]">
      {/* Separate Greenish Sidebar Component */}
      <Sidebar
        activeSessionId={activeSessionId}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        onDeleteSession={handleDeleteSession}
        onLogout={handleLogout}
        onNewChat={handleNewChat}
        onSelectSession={(id) => {
          setActiveSessionId(id)
          if (window.innerWidth < 1024) setIsSidebarOpen(false)
        }}
        onTogglePin={handleTogglePin}
        sessions={sessions}
        user={user}
      />

      {/* Right Main Column: Separate Navbar + Interactive Chat Workspace */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar
          activeDiet={activeDiet}
          activeTitle={activeSession ? activeSession.title : 'New Kitchen Session'}
          fridgePantryCount={user.fridgeCount}
          isSidebarOpen={isSidebarOpen}
          onNewChat={handleNewChat}
          onSelectDiet={setActiveDiet}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Scrollable Conversation or Empty Welcome Canvas */}
        <main className="relative flex-1 overflow-y-auto px-4 pt-6 pb-36 sm:px-8">
          <div className="mx-auto max-w-[820px]">
            {!activeSession ? (
              /* Empty State / New Session Welcome Screen */
              <div className="animate-enter py-6 text-center sm:py-12">
                <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#dce7d3] bg-white/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.13em] text-[#66805e] shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8db36d]" />
                   Less waste, more taste
                </div>

                <h2 className="mt-4 font-serif text-3xl font-medium tracking-[-0.04em] text-[#2c4131] sm:text-5xl">
                  What&apos;s sitting in your{' '}
                  <span className="text-[#779666]">fridge tonight?</span>
                </h2>
                <p className="mx-auto mt-3 max-w-[490px] text-sm leading-6 text-[#788272] sm:text-base">
                  Tap the ingredients you want to use up or type what you’re craving.
                  Your personal sous-chef will build a step-by-step recipe in seconds.
                </p>

                {/* Quick Clickable Fridge Chips */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  {QUICK_FRIDGE_CHIPS.map((chip) => (
                    <button
                      className="rounded-xl border border-[#dce7d3] bg-[#fffefa] px-3.5 py-2 text-xs font-semibold text-[#344a35] shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#597b52] hover:bg-[#f2f8ed] hover:shadow-sm"
                      key={chip}
                      onClick={() => handleAddChipToPrompt(chip)}
                      type="button"
                    >
                      {chip} <span className="ml-1 text-[#779666]">+</span>
                    </button>
                  ))}
                </div>

                {/* Starter Prompt Cards */}
                <div className="mt-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
                  {STARTER_PROMPTS.map((card) => (
                    <button
                      className="group flex flex-col justify-between rounded-2xl border border-[#e5e7dd] bg-[#fffefa] p-5 shadow-[0_8px_24px_rgba(74,97,67,0.05)] transition-all duration-200 hover:-translate-y-1 hover:border-[#91aa7e] hover:shadow-[0_16px_32px_rgba(74,97,67,0.12)]"
                      key={card.title}
                      onClick={() => handleSendMessage(undefined, card.prompt)}
                      type="button"
                    >
                      <div>
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7F3DD] text-lg transition-transform duration-200 group-hover:scale-110">
                          {card.emoji}
                        </span>
                        <h3 className="mt-3.5 font-serif text-lg font-medium text-[#2c4131] group-hover:text-[#4B7C48]">
                          {card.title}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-[#788272]">
                          {card.desc}
                        </p>
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#597b52]">
                        <span>Ask Chef</span>
                        <svg
                          aria-hidden="true"
                          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            d="M4 10h12m-5-5 5 5-5 5"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                          />
                        </svg>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Active Conversation Thread */
              <div className="space-y-6">
                {activeSession.messages.map((msg) => (
                  <div
                    className={`flex gap-3.5 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                    key={msg.id}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#cfe0c2] bg-[#E7F3DD] text-base shadow-2xs">
                        🌿
                      </div>
                    )}

                    <div
                      className={`max-w-[90%] sm:max-w-[82%] ${
                        msg.role === 'user'
                          ? 'rounded-2xl rounded-tr-xs bg-[#597b52] px-5 py-3.5 text-sm leading-6 text-white shadow-[0_8px_20px_rgba(89,123,82,0.18)]'
                          : 'space-y-4'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <p>{msg.content}</p>
                      ) : (
                        <>
                          <div className="rounded-2xl rounded-tl-xs border border-[#e5e7dd] bg-[#fffefa] px-5 py-4 text-sm leading-6 text-[#334236] shadow-2xs">
                            <p>{msg.content}</p>
                          </div>

                          {/* Embedded Interactive Recipe Card */}
                          {msg.recipe && (
                            <div className="overflow-hidden rounded-3xl border border-[#cfe0c2] bg-[#fffefa] shadow-[0_14px_34px_rgba(74,97,67,0.09)] transition-all">
                              {/* Recipe Card Top Banner */}
                              <div className="border-b border-[#dce7d3] bg-gradient-to-r from-[#E7F3DD] via-[#f2f8ed] to-[#ffe8b0]/35 px-6 py-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="rounded-full bg-[#597b52] px-3 py-1 text-[11px] font-bold text-white">
                                    {msg.recipe.matchPercent}% Fridge Match
                                  </span>
                                  <div className="flex items-center gap-3 text-xs font-semibold text-[#4B7C48]">
                                    <span>⏱ {msg.recipe.prepTime}</span>
                                    <span>•</span>
                                    <span>🔥 {msg.recipe.calories}</span>
                                  </div>
                                </div>
                                <h3 className="mt-2.5 font-serif text-2xl font-medium tracking-[-0.03em] text-[#2c4131]">
                                  {msg.recipe.title}
                                </h3>
                              </div>

                              {/* Ingredients & Checkable Steps */}
                              <div className="space-y-5 p-6">
                                <div>
                                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#66805e]">
                                    From Your Fridge Shelves
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {msg.recipe.ingredientsUsed.map((ing) => (
                                      <span
                                        className="inline-flex items-center gap-1 rounded-lg border border-[#cfe2c2] bg-[#eff7e8] px-2.5 py-1 text-xs font-semibold text-[#3f643b]"
                                        key={ing}
                                      >
                                        ✓ {ing}
                                      </span>
                                    ))}
                                    {msg.recipe.missingIngredients.map((ing) => (
                                      <span
                                        className="inline-flex items-center gap-1 rounded-lg border border-[#ecece4] bg-[#fafaf6] px-2.5 py-1 text-xs font-medium text-[#82907d]"
                                        key={ing}
                                      >
                                        + {ing}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-[#66805e]">
                                    Interactive Cooking Steps (Click to mark done)
                                  </p>
                                  <ol className="space-y-2.5">
                                    {msg.recipe.steps.map((step, idx) => {
                                      const stepKey = `${msg.id}-step-${idx}`
                                      const isDone = Boolean(checkedSteps[stepKey])
                                      return (
                                        <li key={stepKey}>
                                          <button
                                            className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-xs leading-5 transition-all duration-150 sm:text-sm ${
                                              isDone
                                                ? 'border-[#cfe0c2] bg-[#f2f8ed]/70 text-[#7b8277] line-through'
                                                : 'border-[#ecece4] bg-[#fbfaf6] text-[#334236] hover:border-[#b9cba9] hover:bg-white'
                                            }`}
                                            onClick={() => toggleStepCheck(stepKey)}
                                            type="button"
                                          >
                                            <span
                                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                                                isDone
                                                  ? 'bg-[#6d9b62] text-white'
                                                  : 'bg-[#e3eedb] text-[#354a37]'
                                              }`}
                                            >
                                              {isDone ? '✓' : idx + 1}
                                            </span>
                                            <span>{step}</span>
                                          </button>
                                        </li>
                                      )
                                    })}
                                  </ol>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {/* Animated Botanical Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#cfe0c2] bg-[#E7F3DD] text-base">
                      🌿
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl border border-[#e5e7dd] bg-[#fffefa] px-4 py-3 text-xs font-semibold text-[#597b52] shadow-2xs">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#597b52]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#76A96D] [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#98BD78] [animation-delay:300ms]" />
                      <span className="ml-1">Simmering a fresh recipe...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </main>

        {/* Bottom Floating Prompt Input Bar */}
        <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-20 bg-gradient-to-t from-[#fbfaf6] via-[#fbfaf6]/95 to-transparent pt-4 pb-5 lg:left-auto lg:w-[calc(100%-290px)]">
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
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Tell Chef what’s in your fridge (e.g., spinach, 2 eggs, feta, lemon)..."
                type="text"
                value={promptInput}
              />
              <button
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#597b52] px-4 text-xs font-semibold text-white shadow-[0_6px_14px_rgba(75,111,67,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4c6f47] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!promptInput.trim() || isTyping}
                type="submit"
              >
                <span>Cook Idea</span>
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
    </div>
  )
}

export default Dashboard
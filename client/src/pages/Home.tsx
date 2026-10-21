import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface Ingredient {
  id: string
  name: string
  emoji: string
  shelf: 'top' | 'middle' | 'crisper'
}

interface Recipe {
  id: string
  title: string
  subtitle: string
  prepTime: string
  difficulty: 'Easy' | 'Simple' | ' Cozy'
  calories: string
  tag: string
  emoji: string
  accentBg: string
  ingredients: string[]
  steps: string[]
}

const INITIAL_FRIDGE_ITEMS: Ingredient[] = [
  { id: 'avocado', name: 'Avocado', emoji: '🥑', shelf: 'top' },
  { id: 'eggs', name: 'Free-range Eggs', emoji: '🥚', shelf: 'top' },
  { id: 'feta', name: 'Crumbled Feta', emoji: '🧀', shelf: 'top' },
  { id: 'spinach', name: 'Baby Spinach', emoji: '🥬', shelf: 'middle' },
  { id: 'tomatoes', name: 'Cherry Tomatoes', emoji: '🍅', shelf: 'middle' },
  { id: 'chickpeas', name: 'Cooked Chickpeas', emoji: '🫘', shelf: 'middle' },
  { id: 'lemon', name: 'Fresh Lemon', emoji: '🍋', shelf: 'crisper' },
  { id: 'garlic', name: 'Roasted Garlic', emoji: '🧄', shelf: 'crisper' },
  { id: 'herbs', name: 'Garden Herbs', emoji: '🌿', shelf: 'crisper' },
]

const RECIPES: Recipe[] = [
  {
    id: 'green-goddess-bowl',
    title: 'Garden-Fresh Avocado & Herb Grain Bowl',
    subtitle: 'Crisp greens tossed with warm garlic oil, creamy avocado, and bright lemon zest.',
    prepTime: '15 mins',
    difficulty: 'Easy',
    calories: '410 kcal',
    tag: 'Zero Waste Favorite',
    emoji: '🥗',
    accentBg: '#E7F3DD',
    ingredients: ['Avocado', 'Baby Spinach', 'Fresh Lemon', 'Garden Herbs', 'Cooked Chickpeas'],
    steps: [
      'Whisk squeezed fresh lemon juice, finely chopped garden herbs, a pinch of sea salt, and olive oil in a wide ceramic bowl.',
      'Toss baby spinach and warm chickpeas gently in the citrus dressing until glossy.',
      'Top with sliced avocado and a crack of black pepper. Serve immediately.',
    ],
  },
  {
    id: 'skillet-shakshuka',
    title: 'Rustic Tomato & Feta Skillet Eggs',
    subtitle: 'Jammy blistered cherry tomatoes simmered with garlic, topped with wilted spinach and feta.',
    prepTime: '20 mins',
    difficulty: 'Simple',
    calories: '360 kcal',
    tag: 'One-Pan Wonder',
    emoji: '🍳',
    accentBg: '#F6DDD0',
    ingredients: ['Free-range Eggs', 'Cherry Tomatoes', 'Roasted Garlic', 'Baby Spinach', 'Crumbled Feta'],
    steps: [
      'Warm olive oil in a skillet over medium heat. Add cherry tomatoes and roasted garlic, cooking until the tomatoes burst into a rich sauce.',
      'Fold in a handful of baby spinach until just wilted, then make two small wells in the sauce.',
      'Crack the eggs into the wells, scatter crumbled feta around the edges, cover, and simmer for 4–5 minutes until whites are set.',
    ],
  },
  {
    id: 'crispy-chickpea-flatbread',
    title: 'Lemon-Garlic Smashed Chickpea Toast',
    subtitle: 'Golden toasted sourdough piled high withemony smashed chickpeas, herbs, and avocado.',
    prepTime: '10 mins',
    difficulty: 'Easy',
    calories: '330 kcal',
    tag: 'Quick Lunch',
    emoji: '🥙',
    accentBg: '#ffe8b0',
    ingredients: ['Cooked Chickpeas', 'Fresh Lemon', 'Roasted Garlic', 'Avocado', 'Garden Herbs'],
    steps: [
      'Roughly mash cooked chickpeas with roasted garlic, lemon juice, and a drizzle of olive oil using a fork.',
      'Fan thinly sliced avocado over toasted crusty bread and spoon the warm chickpea mash on top.',
      'Garnish generously with torn garden herbs and flaky salt.',
    ],
  },
  {
    id: 'creamy-herb-omelette',
    title: 'Folded Herb & Whipped Feta Omelette',
    subtitle: 'Soft, custardy eggs folded around tangy feta, blistered tomatoes, and tender greens.',
    prepTime: '12 mins',
    difficulty: 'Simple',
    calories: '310 kcal',
    tag: 'High Protein',
    emoji: '🌿',
    accentBg: '#dcebd2',
    ingredients: ['Free-range Eggs', 'Crumbled Feta', 'Garden Herbs', 'Cherry Tomatoes'],
    steps: [
      'Whisk eggs vigorously with finely minced garden herbs and a splash of water until frothy.',
      'Pour into a buttered non-stick skillet over medium-low heat, gently sweeping the curds toward the center.',
      'Scatter crumbled feta and halved cherry tomatoes across one side, fold gently, and slide onto a warm plate.',
    ],
  },
]

function BrandMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-8 w-8"
      fill="none"
      viewBox="0 0 40 40"
    >
      <rect fill="#E4F2D8" height="40" rx="14" width="40" />
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

function Home() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [fridgeItems, setFridgeItems] = useState<Ingredient[]>(INITIAL_FRIDGE_ITEMS)
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([
    'Avocado',
    'Baby Spinach',
    'Fresh Lemon',
    'Free-range Eggs',
    'Cherry Tomatoes',
  ])
  const [customInput, setCustomInput] = useState('')
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null)
  const [filterOnlyMatches, setFilterOnlyMatches] = useState(false)

  useEffect(() => {
    const token = window.localStorage.getItem('access_token')
    setIsAuthenticated(Boolean(token))
  }, [])

  function handleLogout() {
    window.localStorage.removeItem('access_token')
    setIsAuthenticated(false)
    navigate('/login')
  }

  function toggleIngredient(name: string) {
    setSelectedIngredients((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    )
  }

  function handleAddCustomIngredient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = customInput.trim()
    if (!trimmed) return

    const exists = fridgeItems.some(
      (item) => item.name.toLowerCase() === trimmed.toLowerCase()
    )

    if (!exists) {
      const newIngredient: Ingredient = {
        id: `custom-${Date.now()}`,
        name: trimmed,
        emoji: '🥗',
        shelf: 'crisper',
      }
      setFridgeItems((prev) => [...prev, newIngredient])
    }

    if (!selectedIngredients.includes(trimmed)) {
      setSelectedIngredients((prev) => [...prev, trimmed])
    }
    setCustomInput('')
  }

  // Score recipes by how many ingredients match the user's selected fridge items
  const scoredRecipes = RECIPES.map((recipe) => {
    const matched = recipe.ingredients.filter((ing) =>
      selectedIngredients.some((sel) => sel.toLowerCase() === ing.toLowerCase())
    )
    const missing = recipe.ingredients.filter(
      (ing) => !selectedIngredients.some((sel) => sel.toLowerCase() === ing.toLowerCase())
    )
    const matchPercent = Math.round((matched.length / recipe.ingredients.length) * 100)

    return {
      ...recipe,
      matched,
      missing,
      matchPercent,
    }
  }).sort((a, b) => b.matchPercent - a.matchPercent)

  const displayedRecipes = filterOnlyMatches
    ? scoredRecipes.filter((r) => r.matchPercent >= 60)
    : scoredRecipes

  return (
    <div className="min-h-dvh bg-[#fbfaf6] text-[#27392d] selection:bg-[#dcebd2] selection:text-[#2c4131]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-[#ecece4] bg-[#fbfaf6]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between px-6 py-4 sm:px-10 lg:px-14">
          <Link
            aria-label="Fridge to Feast home"
            className="flex items-center gap-3 rounded-full transition-opacity hover:opacity-80"
            to="/"
          >
            <BrandMark />
            <span className="text-[16px] font-bold tracking-[-0.04em] text-[#354a37]">
              fridge <span className="font-medium text-[#81907b]">to</span> feast
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#5d6e5a] md:flex">
            <a className="transition-colors hover:text-[#2c4131]" href="#my-fridge">
              My Fridge
            </a>
            <a className="transition-colors hover:text-[#2c4131]" href="#tonights-recipes">
              Tonight&apos;s Ideas
            </a>
            <a className="transition-colors hover:text-[#2c4131]" href="#how-it-works">
              Zero-Waste Tips
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden items-center gap-2 rounded-full border border-[#dce7d3] bg-[#f2f8ed] px-3.5 py-1.5 text-xs font-semibold text-[#4d7548] sm:inline-flex">
                  <span className="h-2 w-2 rounded-full bg-[#6d9b62]" />
                  Kitchen Synced
                </span>
                <button
                  className="rounded-xl border border-[#e5e7dd] bg-white px-4 py-2.5 text-xs font-semibold text-[#455449] transition-all hover:border-[#c6d2bc] hover:bg-[#f7f8f2]"
                  onClick={handleLogout}
                  type="button"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#455449] transition-colors hover:bg-[#f1f4ec] hover:text-[#2c4131]"
                  to="/login"
                >
                  Sign in
                </Link>
                <Link
                  className="inline-flex items-center gap-2 rounded-xl bg-[#597b52] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(75,111,67,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4c6f47]"
                  to="/signup"
                >
                  <span>Join free</span>
                  <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 20 20">
                    <path
                      d="M4 10h12m-5-5 5 5-5 5"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1380px] px-6 pb-20 pt-8 sm:px-10 lg:px-14 lg:pt-12">
        {/* Hero + Interactive Fridge Section */}
        <section
          className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12"
          id="my-fridge"
        >
          {/* Left Column: Editorial Intro */}
          <div className="lg:col-span-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7d3] bg-white/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.13em] text-[#66805e] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8db36d]" />
              Less waste, more taste
            </span>

            <h1 className="mt-5 font-serif text-[2.75rem] font-medium leading-[1.06] tracking-[-0.055em] text-[#2c4131] sm:text-5xl lg:text-[3.75rem]">
              Cook something wonderful with what&apos;s{' '}
              <span className="text-[#779666]">already chilled.</span>
            </h1>

            <p className="mt-4 max-w-[510px] text-base leading-7 text-[#788272]">
              Tap the ingredients sitting on your shelves right now. We&apos;ll pair them
              with effortless, comforting recipes so nothing good goes to waste.
            </p>

            {/* Add Custom Ingredient Input */}
            <form
              className="mt-7 flex max-w-[460px] flex-col gap-3 sm:flex-row"
              onSubmit={handleAddCustomIngredient}
            >
              <div className="group flex h-[52px] flex-1 items-center gap-3 rounded-xl border border-[#e5e7dd] bg-white px-4 transition-all duration-200 focus-within:border-[#91aa7e] focus-within:ring-4 focus-within:ring-[#9bb68a]/15 hover:border-[#c6d2bc]">
                <svg
                  aria-hidden="true"
                  className="h-[18px] w-[18px] shrink-0 text-[#9aa493] group-focus-within:text-[#728c65]"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 5v14m-7-7h14"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.8"
                  />
                </svg>
                <input
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#334236] outline-none placeholder:text-[#b0b6ab]"
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Add an ingredient (e.g., Mushrooms, Bell Pepper)..."
                  type="text"
                  value={customInput}
                />
              </div>
              <button
                className="h-[52px] shrink-0 rounded-xl bg-[#597b52] px-6 text-sm font-semibold text-white shadow-[0_7px_16px_rgba(75,111,67,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4c6f47]"
                type="submit"
              >
                Stock Shelf
              </button>
            </form>

            {/* Quick Summary Stats */}
            <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-[#ecece4] pt-6">
              <div>
                <p className="font-serif text-2xl font-medium text-[#2c4131]">
                  {selectedIngredients.length} items
                </p>
                <p className="text-xs text-[#82907d]">Selected in your fridge</p>
              </div>
              <div className="h-8 w-px bg-[#ecece4]" />
              <div>
                <p className="font-serif text-2xl font-medium text-[#597b52]">
                  {scoredRecipes.filter((r) => r.matchPercent >= 60).length} recipes
                </p>
                <p className="text-xs text-[#82907d]">Ready to cook tonight</p>
              </div>
              <div className="h-8 w-px bg-[#ecece4]" />
              <div>
                <p className="font-serif text-2xl font-medium text-[#2c4131]">100%</p>
                <p className="text-xs text-[#82907d]">Kitchen-friendly steps</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Mint-Green Fridge Shelf Card */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-[540px] rounded-[28px] border-2 border-[#6F9367]/30 bg-[#F9FFF4] p-5 shadow-[0_24px_45px_rgba(78,103,63,0.11)] sm:p-7">
              {/* Fridge Top Header */}
              <div className="mb-4 flex items-center justify-between border-b border-[#dce7d3] pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E7F3DD] text-base">
                    🧊
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-[#2d4031]">Inside Your Fridge</h2>
                    <p className="text-xs text-[#7b8277]">
                      Click items to toggle what you have on hand
                    </p>
                  </div>
                </div>
                <button
                  className="text-xs font-semibold text-[#597b52] underline-offset-4 hover:underline"
                  onClick={() =>
                    setSelectedIngredients(
                      selectedIngredients.length === fridgeItems.length
                        ? []
                        : fridgeItems.map((i) => i.name)
                    )
                  }
                  type="button"
                >
                  {selectedIngredients.length === fridgeItems.length
                    ? 'Clear all'
                    : 'Select all'}
                </button>
              </div>

              {/* Fridge Interior Shelves */}
              <div className="space-y-4 rounded-2xl bg-[#E7F3DD]/65 p-4">
                {(['top', 'middle', 'crisper'] as const).map((shelfKey) => {
                  const shelfLabel =
                    shelfKey === 'top'
                      ? 'Top Shelf • Dairy & Eggs'
                      : shelfKey === 'middle'
                        ? 'Middle Shelf • Fresh Produce & Proteins'
                        : 'Crisper Drawer • Aromatics & Herbs'

                  const itemsOnShelf = fridgeItems.filter((item) => item.shelf === shelfKey)

                  return (
                    <div
                      className="rounded-xl border border-[#cfe0c2] bg-white/80 p-3.5 shadow-sm"
                      key={shelfKey}
                    >
                      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#66805e]">
                        {shelfLabel}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {itemsOnShelf.map((item) => {
                          const isSelected = selectedIngredients.includes(item.name)
                          return (
                            <button
                              aria-pressed={isSelected}
                              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                                isSelected
                                  ? 'border-[#597b52] bg-[#597b52] text-white shadow-[0_4px_10px_rgba(89,123,82,0.22)]'
                                  : 'border-[#e5e7dd] bg-[#fffefa] text-[#455449] hover:border-[#b8caa9] hover:bg-[#f3f8ee]'
                              }`}
                              key={item.id}
                              onClick={() => toggleIngredient(item.name)}
                              type="button"
                            >
                              <span>{item.emoji}</span>
                              <span>{item.name}</span>
                              {isSelected && (
                                <svg
                                  aria-hidden="true"
                                  className="h-3.5 w-3.5 text-[#E4F2D8]"
                                  fill="none"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    d="m5 10 3.5 3.5L15 7"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                  />
                                </svg>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Fridge Handle Accent Bar */}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-[#D8EBCB]/70 px-4 py-2.5 text-xs text-[#344a35]">
                <span className="font-medium">
                  ✨ Tip: Even 2 or 3 ingredients are enough to spark tonight&apos;s meal.
                </span>
                <span className="font-bold text-[#4B7C48]">38°F Chilled</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recipes Section */}
        <section className="mt-16 lg:mt-24" id="tonights-recipes">
          <div className="flex flex-col justify-between gap-4 border-b border-[#ecece4] pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#829477]">
                TAILORED TO YOUR SHELVES
              </p>
              <h2 className="mt-2 font-serif text-3xl font-medium tracking-[-0.04em] text-[#2d4031] sm:text-4xl">
                Tonight&apos;s freshest matches
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                  !filterOnlyMatches
                    ? 'border-[#597b52] bg-[#597b52] text-white'
                    : 'border-[#e5e7dd] bg-white text-[#455449] hover:border-[#c6d2bc]'
                }`}
                onClick={() => setFilterOnlyMatches(false)}
                type="button"
              >
                All Ideas ({RECIPES.length})
              </button>
              <button
                className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                  filterOnlyMatches
                    ? 'border-[#597b52] bg-[#597b52] text-white'
                    : 'border-[#e5e7dd] bg-white text-[#455449] hover:border-[#c6d2bc]'
                }`}
                onClick={() => setFilterOnlyMatches(true)}
                type="button"
              >
                Best Matches (60%+)
              </button>
            </div>
          </div>

          {/* Recipe Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {displayedRecipes.map((recipe) => (
              <article
                className="group flex flex-col justify-between rounded-2xl border border-[#e5e7dd] bg-[#fffefa] p-6 shadow-[0_10px_28px_rgba(74,97,67,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b9cba9] hover:shadow-[0_16px_34px_rgba(74,97,67,0.1)]"
                key={recipe.id}
              >
                <div>
                  {/* Card Top Metadata */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dce7d3] bg-[#f2f8ed] px-3 py-1 text-xs font-semibold text-[#4d7548]">
                      <span>{recipe.emoji}</span>
                      <span>{recipe.tag}</span>
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        recipe.matchPercent >= 80
                          ? 'bg-[#E4F2D8] text-[#355e32]'
                          : recipe.matchPercent >= 50
                            ? 'bg-[#ffe8b0]/70 text-[#7a591c]'
                            : 'bg-[#f3f3ed] text-[#788272]'
                      }`}
                    >
                      {recipe.matchPercent}% Fridge Match
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-4 font-serif text-2xl font-medium tracking-[-0.03em] text-[#2c4131] group-hover:text-[#4B7C48]">
                    {recipe.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#788272]">{recipe.subtitle}</p>

                  {/* Ingredient Pills */}
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-semibold text-[#455449]">
                      Ingredients ({recipe.matched.length} of {recipe.ingredients.length} in your
                      fridge):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.ingredients.map((ing) => {
                        const hasIt = selectedIngredients.some(
                          (sel) => sel.toLowerCase() === ing.toLowerCase()
                        )
                        return (
                          <span
                            className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                              hasIt
                                ? 'border border-[#cfe2c2] bg-[#eff7e8] text-[#3f643b]'
                                : 'border border-[#ecece4] bg-[#fafaf6] text-[#9aa493]'
                            }`}
                            key={ing}
                          >
                            {hasIt ? '✓ ' : '+ '}
                            {ing}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-6 flex items-center justify-between border-t border-[#ecece4] pt-4">
                  <div className="flex items-center gap-4 text-xs font-medium text-[#7b8277]">
                    <span>⏱ {recipe.prepTime}</span>
                    <span>•</span>
                    <span>🔥 {recipe.calories}</span>
                  </div>

                  <button
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#eff5dd] px-4 py-2 text-xs font-semibold text-[#344a35] transition-colors hover:bg-[#597b52] hover:text-white"
                    onClick={() => setActiveRecipe(recipe)}
                    type="button"
                  >
                    <span>View Steps</span>
                    <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 20 20">
                      <path
                        d="M4 10h12m-5-5 5 5-5 5"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.7"
                      />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* How It Works / Zero Waste Callout Banner */}
        <section
          className="mt-16 rounded-3xl border border-[#dce7d3] bg-gradient-to-br from-[#F2F8ED] via-[#fbfaf6] to-[#ffe8b0]/25 p-8 sm:p-12 lg:mt-24"
          id="how-it-works"
        >
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <span className="text-xs font-semibold uppercase tracking-[0.13em] text-[#66805e]">
                THOUGHTFUL KITCHEN HABITS
              </span>
              <h2 className="mt-2 font-serif text-3xl font-medium tracking-[-0.04em] text-[#2c4131] sm:text-4xl">
                Save your groceries, one dinner at a time.
              </h2>
              <p className="mt-3 max-w-[600px] text-sm leading-6 text-[#6e7869] sm:text-base">
                Create a free account to keep your pantry synced across devices, save your
                favorite weeknight bowls, and get gentle reminders before your greens lose
                their crunch.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              {isAuthenticated ? (
                <a
                  className="inline-flex h-[52px] items-center justify-center rounded-xl bg-[#597b52] px-6 text-sm font-semibold text-white shadow-[0_7px_16px_rgba(75,111,67,0.18)] transition-all hover:bg-[#4c6f47]"
                  href="#my-fridge"
                >
                  Update My Fridge
                </a>
              ) : (
                <>
                  <Link
                    className="inline-flex h-[52px] items-center justify-center rounded-xl bg-[#597b52] px-6 text-sm font-semibold text-white shadow-[0_7px_16px_rgba(75,111,67,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#4c6f47]"
                    to="/signup"
                  >
                    Create Free Account
                  </Link>
                  <Link
                    className="inline-flex h-[52px] items-center justify-center rounded-xl border border-[#d6e1cd] bg-white px-6 text-sm font-semibold text-[#354a37] transition-all hover:bg-[#f4f8f0]"
                    to="/login"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Recipe Step-by-Step Modal */}
      {activeRecipe && (
        <div
          aria-labelledby="recipe-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#27392d]/40 p-4 backdrop-blur-xs"
          onClick={() => setActiveRecipe(null)}
          role="dialog"
        >
          <div
            className="w-full max-w-[560px] rounded-3xl border border-[#dce7d3] bg-[#fffefa] p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#E7F3DD] px-3.5 py-1 text-xs font-semibold text-[#355e32]">
                <span>{activeRecipe.emoji}</span>
                <span>{activeRecipe.prepTime} • {activeRecipe.calories}</span>
              </span>
              <button
                aria-label="Close recipe details"
                className="rounded-lg p-1.5 text-[#82907d] transition-colors hover:bg-[#f2f4ec] hover:text-[#2c4131]"
                onClick={() => setActiveRecipe(null)}
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

            <h3
              className="mt-4 font-serif text-2xl font-medium text-[#2c4131] sm:text-3xl"
              id="recipe-modal-title"
            >
              {activeRecipe.title}
            </h3>
            <p className="mt-2 text-sm text-[#788272]">{activeRecipe.subtitle}</p>

            <div className="mt-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#66805e]">
                Preparation Steps
              </h4>
              <ol className="space-y-3">
                {activeRecipe.steps.map((step, index) => (
                  <li
                    className="flex gap-3.5 rounded-xl border border-[#ecece4] bg-[#fbfaf6] p-3.5 text-sm leading-6 text-[#334236]"
                    key={index}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#597b52] text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-7 flex justify-end">
              <button
                className="rounded-xl bg-[#597b52] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4c6f47]"
                onClick={() => setActiveRecipe(null)}
                type="button"
              >
                Done Cooking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#ecece4] bg-[#fffefa] py-8">
        <div className="mx-auto flex max-w-[1380px] flex-col items-center justify-between gap-4 px-6 text-xs text-[#82907d] sm:flex-row sm:px-10 lg:px-14">
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <span className="font-semibold text-[#354a37]">Fridge to Feast</span>
            <span>— Good food, thoughtfully made.</span>
          </div>
          <p>&copy; 2026 Fridge to Feast. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
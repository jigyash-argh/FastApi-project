import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getFridgeItems, saveFridgeItems, type FridgeItem } from '../../api/fridge'

const categories = [
  { name: 'Produce', icon: '🥬' },
  { name: 'Dairy & eggs', icon: '🥚' },
  { name: 'Pantry', icon: '🥫' },
  { name: 'Protein', icon: '🫘' },
  { name: 'Other', icon: '🧺' },
]

function getInitialFridgeState(): { items: FridgeItem[]; error: string | null } {
  try {
    return { items: getFridgeItems(), error: null }
  } catch (error: unknown) {
    return {
      items: [],
      error:
        error instanceof Error
          ? error.message
          : 'Could not load your saved fridge items.',
    }
  }
}

function createItemId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

function Fridge() {
  const navigate = useNavigate()
  const [initialState] = useState(getInitialFridgeState)
  const [items, setItems] = useState(initialState.items)
  const [storageError, setStorageError] = useState(initialState.error)
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [category, setCategory] = useState(categories[0].name)
  const [search, setSearch] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.trim().toLowerCase())
  )
  const categoryCount = new Set(items.map((item) => item.category)).size

  function handleAddItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    const trimmedQuantity = quantity.trim()
    if (!trimmedName || !trimmedQuantity) {
      setFormError('Add an ingredient and its quantity first.')
      return
    }
    if (
      items.some((item) => item.name.toLowerCase() === trimmedName.toLowerCase())
    ) {
      setFormError(`${trimmedName} is already in your fridge. Remove it before adding it again.`)
      return
    }

    const nextItems = [
      {
        id: createItemId(),
        name: trimmedName,
        quantity: trimmedQuantity,
        category,
      },
      ...items,
    ]

    try {
      saveFridgeItems(nextItems)
      setItems(nextItems)
      setName('')
      setQuantity('1')
      setFormError(null)
      setStorageError(null)
    } catch (error: unknown) {
      setStorageError(
        error instanceof Error
          ? error.message
          : 'Could not save your ingredient in this browser.'
      )
    }
  }

  function handleRemoveItem(itemId: string) {
    const nextItems = items.filter((item) => item.id !== itemId)
    try {
      saveFridgeItems(nextItems)
      setItems(nextItems)
      setStorageError(null)
    } catch (error: unknown) {
      setStorageError(
        error instanceof Error
          ? error.message
          : 'Could not update your saved fridge.'
      )
    }
  }

  function handleCookWithFridge() {
    navigate('/dashboard', {
      state: { fridgePrompt: 'What can I cook with the ingredients in my fridge?' },
    })
  }

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#f6f7f0] text-[#27392d]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-36 right-[-7rem] h-[26rem] w-[26rem] rounded-full bg-[#e4efd9]/70 blur-3xl" />
        <div className="absolute top-[42%] left-[-12rem] h-[24rem] w-[24rem] rounded-full bg-[#f4ead4]/55 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-7 sm:py-8 lg:px-10">
        <header className="animate-enter flex items-center justify-between gap-4">
          <Link className="group inline-flex items-center gap-3" to="/dashboard">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#dce8d4] bg-white text-xl shadow-sm transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-105">
              🌿
            </span>
            <span>
              <span className="block font-serif text-lg font-semibold tracking-tight text-[#2c4131]">
                Fridge to Feast
              </span>
              <span className="block text-[11px] font-medium tracking-wide text-[#819078]">
                YOUR LITTLE CORNER OF FRESH
              </span>
            </span>
          </Link>
          <Link
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#dce5d4] bg-white/85 px-3.5 text-xs font-semibold text-[#466143] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#a9c19a] hover:bg-white sm:px-4"
            to="/dashboard"
          >
            <span aria-hidden="true">←</span>
            <span>Back to kitchen</span>
          </Link>
        </header>

        <section className="animate-enter animate-enter-late relative mt-7 overflow-hidden rounded-[2rem] border border-[#e2e9db] bg-[#fffefa] shadow-[0_18px_55px_rgba(54,77,51,0.08)] sm:mt-10">
          <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-gradient-to-l from-[#eff5e9] to-transparent md:block" />
          <div className="relative grid gap-8 px-6 py-8 sm:px-9 sm:py-10 md:grid-cols-[1.2fr_0.8fr] md:items-center md:px-12 md:py-12">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e2ebda] bg-[#f4f8ef] px-3 py-1.5 text-[11px] font-semibold tracking-wide text-[#65805c]">
                <span aria-hidden="true">✨</span>
                YOUR INGREDIENTS, AT A GLANCE
              </span>
              <h1 className="mt-5 max-w-xl font-serif text-4xl font-medium leading-[1.08] tracking-[-0.045em] text-[#2c4131] sm:text-5xl">
                A little love for
                <br className="hidden sm:block" /> what&apos;s in your <span className="text-[#739365]">fridge.</span>
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-[#788272] sm:text-[15px]">
                Keep track of the good things you have. We&apos;ll help turn them into
                something delicious and make less go to waste.
              </p>
              <button
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#597b52] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(75,111,67,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4c6f47] hover:shadow-[0_12px_24px_rgba(75,111,67,0.25)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={items.length === 0}
                onClick={handleCookWithFridge}
                type="button"
              >
                <span>Cook with my fridge</span>
                <span aria-hidden="true">↗</span>
              </button>
            </div>

            <div className="relative mx-auto flex h-44 w-full max-w-xs items-center justify-center md:h-56">
              <div className="absolute h-40 w-40 rounded-full bg-[#e2efd8] md:h-48 md:w-48" />
              <div className="absolute h-32 w-32 rounded-full border border-white/80 md:h-40 md:w-40" />
              <div className="animate-float-soft relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/90 bg-white/80 text-6xl shadow-[0_20px_45px_rgba(73,101,63,0.16)] backdrop-blur-sm transition-transform duration-300 hover:rotate-3 hover:scale-105">
                🥑
                <span className="absolute -top-2 -right-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white bg-[#fffefa] text-2xl shadow-md">
                  🍋
                </span>
                <span className="absolute -bottom-2 -left-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white bg-[#fffefa] text-xl shadow-md">
                  🥕
                </span>
              </div>
              <span className="absolute top-2 right-[18%] text-xl text-[#9bb68a]">✳</span>
              <span className="absolute bottom-4 left-[16%] text-sm text-[#d9b967]">✦</span>
            </div>
          </div>
        </section>

        <section className="animate-enter mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#e4e9de] bg-white/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#899384]">In your fridge</p>
            <p className="mt-2 font-serif text-3xl text-[#36523a]">{items.length}</p>
            <p className="mt-1 text-xs text-[#899384]">ingredients ready to go</p>
          </div>
          <div className="rounded-2xl border border-[#e4e9de] bg-white/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#899384]">Pantry variety</p>
            <p className="mt-2 font-serif text-3xl text-[#36523a]">{categoryCount}</p>
            <p className="mt-1 text-xs text-[#899384]">different food groups</p>
          </div>
          <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-[#e4e9de] bg-[#f1f6eb]/80 p-4 sm:p-5 md:col-span-1">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">🌱</span>
            <p className="text-xs leading-5 text-[#6d7d66]">
              A quick inventory makes it easier to find a delicious use for what you already have.
            </p>
          </div>
        </section>

        <section className="animate-enter mt-8 grid items-start gap-6 pb-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-8">
          <div className="rounded-[1.75rem] border border-[#e2e9db] bg-[#fffefa] p-5 shadow-[0_12px_36px_rgba(54,77,51,0.06)] sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef5e8] text-xl">🧺</span>
              <div>
                <h2 className="font-serif text-xl font-semibold text-[#2c4131]">Add to your fridge</h2>
                <p className="mt-1 text-xs leading-5 text-[#879080]">
                  A few details help keep your kitchen list useful.
                </p>
              </div>
            </div>

            {storageError && (
              <div className="mt-5 rounded-xl border border-[#f0d5ca] bg-[#fff4ef] px-3.5 py-3 text-xs leading-5 text-[#a7523d]" role="alert">
                {storageError}
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleAddItem}>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#53634f]">Ingredient name</span>
                <input
                  autoComplete="off"
                  className="h-11 w-full rounded-xl border border-[#dce5d4] bg-[#fff] px-3.5 text-sm text-[#2c4131] outline-none transition-shadow placeholder:text-[#a1a99a] focus:border-[#8eaa80] focus:ring-4 focus:ring-[#8eaa80]/15"
                  maxLength={60}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Baby spinach"
                  required
                  value={name}
                />
              </label>

              <div className="grid grid-cols-[0.78fr_1.22fr] gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-[#53634f]">Quantity</span>
                  <input
                    className="h-11 w-full rounded-xl border border-[#dce5d4] bg-white px-3 text-sm text-[#2c4131] outline-none transition-shadow focus:border-[#8eaa80] focus:ring-4 focus:ring-[#8eaa80]/15"
                    maxLength={24}
                    onChange={(event) => setQuantity(event.target.value)}
                    placeholder="e.g. 2 bunches"
                    required
                    value={quantity}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-[#53634f]">Food group</span>
                  <select
                    className="h-11 w-full rounded-xl border border-[#dce5d4] bg-white px-3 text-sm text-[#2c4131] outline-none transition-shadow focus:border-[#8eaa80] focus:ring-4 focus:ring-[#8eaa80]/15"
                    onChange={(event) => setCategory(event.target.value)}
                    value={category}
                  >
                    {categories.map((itemCategory) => (
                      <option key={itemCategory.name} value={itemCategory.name}>
                        {itemCategory.icon} {itemCategory.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {formError && (
                <p className="text-xs leading-5 text-[#a7523d]" role="alert">{formError}</p>
              )}

              <button
                className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#597b52] px-4 text-sm font-semibold text-white shadow-[0_7px_16px_rgba(75,111,67,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4c6f47] hover:shadow-[0_11px_22px_rgba(75,111,67,0.22)] active:translate-y-0"
                type="submit"
              >
                <span className="transition-transform group-hover:rotate-90">＋</span>
                Add ingredient
              </button>
            </form>
          </div>

          <div className="min-w-0 rounded-[1.75rem] border border-[#e2e9db] bg-[#fffefa] p-5 shadow-[0_12px_36px_rgba(54,77,51,0.06)] sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#829477]">Your kitchen inventory</span>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-[#2c4131]">On the shelf</h2>
              </div>
              {items.length > 0 && (
                <label className="relative block w-full sm:max-w-[210px]">
                  <span className="sr-only">Search ingredients</span>
                  <span aria-hidden="true" className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-[#92a08a]">⌕</span>
                  <input
                    className="h-10 w-full rounded-xl border border-[#e1e8dc] bg-white pl-9 pr-3 text-xs outline-none transition-shadow placeholder:text-[#a1a99a] focus:border-[#8eaa80] focus:ring-4 focus:ring-[#8eaa80]/15"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Find an ingredient..."
                    type="search"
                    value={search}
                  />
                </label>
              )}
            </div>

            {items.length === 0 ? (
              <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#dce5d4] bg-[#f9faf6] px-6 py-10 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-[#edf4e7] text-3xl">🥬</span>
                <h3 className="mt-4 font-serif text-lg font-semibold text-[#38503a]">A fresh start</h3>
                <p className="mt-1 max-w-xs text-xs leading-5 text-[#879080]">
                  Add your first ingredient and start building a little inspiration for your next meal.
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-[#f8f9f4] px-5 py-10 text-center text-sm text-[#879080]">
                No ingredients match “{search}”.
              </div>
            ) : (
              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {filteredItems.map((item) => {
                  const itemCategory = categories.find((entry) => entry.name === item.category)
                  return (
                    <li
                      className="group flex min-w-0 items-center gap-3 rounded-2xl border border-[#e8ece3] bg-white p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cad9c1] hover:bg-[#fbfdf8] hover:shadow-[0_8px_22px_rgba(54,77,51,0.08)]"
                      key={item.id}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f0f5eb] text-xl transition-transform duration-200 group-hover:scale-105">
                        {itemCategory?.icon ?? '🧺'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#344a35]">{item.name}</p>
                        <p className="mt-0.5 truncate text-[11px] text-[#879080]">
                          {item.quantity} <span aria-hidden="true">·</span> {item.category}
                        </p>
                      </div>
                      <button
                        aria-label={`Remove ${item.name}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9aa493] transition-colors hover:bg-[#fff1ec] hover:text-[#aa5944] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#597b52]"
                        onClick={() => handleRemoveItem(item.id)}
                        type="button"
                      >
                        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 20 20">
                          <path d="M4 6h12M8 6V4h4v2m3 0-.7 10H5.7L5 6m3 3v4m4-4v4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                        </svg>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            <p className="mt-5 text-[11px] leading-5 text-[#929a8d]">
              Your fridge list is saved in this browser for your account. It will be included as context when you ask Kitchen AI for recipe ideas.
            </p>
          </div>
        </section>

        <footer className="border-t border-[#e3e9de] py-5 text-center text-[11px] text-[#929a8d]">
          Keep it fresh. Make it delicious. Waste a little less. <span aria-hidden="true">🌱</span>
        </footer>
      </div>
    </main>
  )
}

export default Fridge
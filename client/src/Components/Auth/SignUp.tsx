import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../../api/auth'

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

function KitchenBasketIllustration() {
  return (
    <div className="fridge-scene relative mx-auto flex h-[clamp(220px,42vh,370px)] w-full max-w-[420px] items-center justify-center">
      <div className="scene-sun absolute right-[12%] top-[10%] h-24 w-24 rounded-full bg-[#ffe8b0] sm:h-32 sm:w-32" />
      <div className="scene-blob absolute bottom-[8%] right-[6%] h-32 w-44 rounded-[48%] bg-[#dcebd2] sm:h-40 sm:w-56" />

      <svg
        aria-label="A warm kitchen counter with fresh garden produce and recipe cards"
        className="fridge-drawing relative z-10 h-full w-auto drop-shadow-[0_24px_30px_rgba(78,103,63,0.14)]"
        fill="none"
        role="img"
        viewBox="0 0 300 350"
      >
        {/* Recipe Board */}
        <rect fill="#F9FFF4" height="270" rx="26" stroke="#6F9367" strokeWidth="3" width="224" x="38" y="42" />
        <rect fill="#E7F3DD" height="115" rx="18" width="196" x="52" y="58" />

        {/* Botanicals / Herbs in Jar */}
        <path d="M102 152c-6-18 1-32 15-38 9 11 8 23-3 38" fill="#76A96D" />
        <path d="M116 150c1-21 10-33 26-34 5 14-2 27-20 36" fill="#98BD78" />
        <path d="M135 151c4-16 14-24 29-22 2 14-7 23-26 26" fill="#5F965A" />

        {/* Citrus & Tomatoes */}
        <circle cx="195" cy="138" r="16" fill="#F2A65A" />
        <path d="M195 122c2-6 5-9 11-9" stroke="#6D9B62" strokeLinecap="round" strokeWidth="3" />
        <circle cx="172" cy="146" r="12" fill="#E98972" />

        {/* Wooden Cutting Board & Bowl */}
        <rect fill="#D8EBCB" height="98" rx="16" width="196" x="52" y="192" />
        <path d="M74 226h152M74 256h110" stroke="#7C9A72" strokeLinecap="round" strokeWidth="4" />
        <rect fill="#fffdf5" height="28" rx="9" width="68" x="72" y="202" />
        <rect fill="#F6DDD0" height="28" rx="9" width="68" x="158" y="202" />
        <path d="M88 216h36M174 216h36" stroke="#C7917F" strokeLinecap="round" strokeWidth="2.5" />
      </svg>

      <div className="float-card float-card-left absolute bottom-[16%] left-0 z-20 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-[0_12px_35px_rgba(74,97,67,0.12)] backdrop-blur sm:left-[-3%]">
        <p className="text-xs font-medium text-[#82917a]">Zero-waste pantry</p>
        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#344a35]">
          <span aria-hidden="true">🌿</span> Save every fresh leaf
        </p>
      </div>
      <div className="float-card float-card-right absolute right-0 top-[15%] z-20 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-[0_12px_35px_rgba(74,97,67,0.12)] backdrop-blur sm:right-[-2%]">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#344a35]">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff5dd] text-base">🍋</span>
           personalized recipes
        </p>
      </div>
    </div>
  )
}

function SignUp() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [hasError, setHasError] = useState(false)
  const navigate = useNavigate()
  // Calculate 4-step password strength
  const passwordStrength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const strengthLabels = ['Add 8+ chars', 'Getting warmer', 'Fresh & sturdy', 'Chef-grade strong']

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    setHasError(false)

    try {
      await signup({ username, email, password })
      setMessage('Your account is ready! You can sign in now.')
      navigate('/login')
    } catch (error: unknown) {
      const responseMessage =
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
          ? error.response.data.detail
          : 'We couldn’t create your account right now. Please try again.'

      setHasError(true)
      setMessage(responseMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-dvh bg-[#fbfaf6] text-[#27392d] lg:h-dvh lg:overflow-hidden">
      <div className="mx-auto grid h-full min-h-0 max-w-[1600px] grid-cols-1 lg:grid-cols-2">
        <section className="login-hero relative flex min-h-0 flex-col overflow-hidden px-6 pb-6 pt-5 sm:px-10 lg:px-14 lg:pb-10 lg:pt-9 xl:px-20">
          <div className="hero-grain pointer-events-none absolute inset-0" />
          <Link
            aria-label="Fridge to Feast home"
            className="relative z-10 flex w-fit items-center gap-3 rounded-full transition-opacity hover:opacity-80"
            to="/"
          >
            <BrandMark />
            <span className="text-[15px] font-bold tracking-[-0.04em] text-[#354a37]">
              fridge <span className="font-medium text-[#81907b]">to</span> feast
            </span>
          </Link>

          <div className="login-intro relative z-10 mx-auto mt-6 w-full max-w-[570px] flex-1 lg:mt-10 lg:flex lg:flex-col lg:justify-center">
            <div className="login-intro-content animate-enter text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7d3] bg-white/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#66805e] shadow-sm sm:text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8db36d]" />
                Start your zero-waste kitchen
              </span>
              <h1 className="mx-auto mt-5 max-w-[530px] font-serif text-[2.65rem] font-medium leading-[1.08] tracking-[-0.055em] text-[#2c4131] sm:text-5xl lg:mx-0 lg:mt-6 lg:text-[3.65rem]">
                Every ingredient deserves a{' '}
                <span className="text-[#779666]">great recipe.</span>
              </h1>
              <p className="mx-auto mt-3 max-w-[440px] text-sm leading-6 text-[#788272] sm:text-base sm:leading-7 lg:mx-0">
                Keep track of what’s chilled, discover weeknight dinners in seconds,
                and make the most of every grocery trip.
              </p>
            </div>
            <div className="hidden lg:block">
              <KitchenBasketIllustration />
            </div>
          </div>

          <p className="relative z-10 mt-2 hidden text-xs text-[#82907d] lg:block">
            Good food, thoughtfully made. &copy; 2026 Fridge to Feast
          </p>
        </section>

        <section className="flex min-h-0 items-start justify-center overflow-y-auto bg-[#fffefa] px-6 py-8 sm:px-10 lg:px-12">
          <div className="animate-enter animate-enter-late w-full max-w-[410px]">
            {/* Segmented Auth Mode Toggle */}
            <div className="mb-6 grid grid-cols-2 rounded-2xl border border-[#e5e7dd] bg-[#f5f6f0] p-1">
              <Link
                className="flex h-10 items-center justify-center rounded-xl text-xs font-semibold text-[#7b8277] transition-colors hover:text-[#2d4031]"
                to="/login"
              >
                Sign in
              </Link>
              <Link
                aria-current="page"
                className="flex h-10 items-center justify-center rounded-xl bg-white text-xs font-semibold text-[#2d4031] shadow-xs transition-all"
                to="/signup"
              >
                Create account
              </Link>
            </div>

            <div className="login-heading mb-6">
              <p className="mb-2 text-xs font-semibold tracking-wider text-[#829477] uppercase">
                JOIN THE TABLE
              </p>
              <h2 className="font-serif text-[2.35rem] font-medium leading-tight tracking-[-0.05em] text-[#2d4031] sm:text-[2.75rem]">
                Set up your kitchen.
              </h2>
              <p className="mt-2 text-[15px] leading-6 text-[#7b8277]">
                Create a free account to save your fridge items and favorite meals.
              </p>
            </div>

            <form className="login-form space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  className="mb-1.5 block text-sm font-semibold text-[#455449]"
                  htmlFor="username"
                >
                  Your name
                </label>
                <div className="input-wrap group flex h-[52px] items-center gap-3 rounded-xl border border-[#e5e7dd] bg-white px-4 transition-all duration-200 focus-within:border-[#91aa7e] focus-within:ring-4 focus-within:ring-[#9bb68a]/15 hover:border-[#c6d2bc]">
                  <svg
                    aria-hidden="true"
                    className="h-[18px] w-[18px] shrink-0 text-[#9aa493] transition-colors group-focus-within:text-[#728c65]"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M5 20c1.5-3.5 4.2-5 7-5s5.5 1.5 7 5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
                  </svg>
                  <input
                    autoComplete="name"
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#334236] outline-none placeholder:text-[#b0b6ab]"
                    id="username"
                    minLength={3}
                    name="username"
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Chef Alex"
                    required
                    type="text"
                    value={username}
                  />
                </div>
              </div>

              <div>
                <label
                  className="mb-1.5 block text-sm font-semibold text-[#455449]"
                  htmlFor="signup-email"
                >
                  Email address
                </label>
                <div className="input-wrap group flex h-[52px] items-center gap-3 rounded-xl border border-[#e5e7dd] bg-white px-4 transition-all duration-200 focus-within:border-[#91aa7e] focus-within:ring-4 focus-within:ring-[#9bb68a]/15 hover:border-[#c6d2bc]">
                  <svg
                    aria-hidden="true"
                    className="h-[18px] w-[18px] shrink-0 text-[#9aa493] transition-colors group-focus-within:text-[#728c65]"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <rect height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" width="18" x="3" y="5" />
                    <path d="m4 7 8 6 8-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                  </svg>
                  <input
                    autoComplete="email"
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#334236] outline-none placeholder:text-[#b0b6ab]"
                    id="signup-email"
                    name="email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    className="block text-sm font-semibold text-[#455449]"
                    htmlFor="signup-password"
                  >
                    Password
                  </label>
                  {password.length > 0 && (
                    <span className="text-xs font-medium text-[#66805e]">
                      {strengthLabels[Math.max(0, passwordStrength - 1)]}
                    </span>
                  )}
                </div>
                <div className="input-wrap group flex h-[52px] items-center gap-3 rounded-xl border border-[#e5e7dd] bg-white px-4 transition-all duration-200 focus-within:border-[#91aa7e] focus-within:ring-4 focus-within:ring-[#9bb68a]/15 hover:border-[#c6d2bc]">
                  <svg
                    aria-hidden="true"
                    className="h-[18px] w-[18px] shrink-0 text-[#9aa493] transition-colors group-focus-within:text-[#728c65]"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <rect height="10" rx="2" stroke="currentColor" strokeWidth="1.7" width="16" x="4" y="11" />
                    <path d="M8 11V8a4 4 0 1 1 8 0v3m-4 4v2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
                  </svg>
                  <input
                    autoComplete="new-password"
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#334236] outline-none placeholder:text-[#b0b6ab]"
                    id="signup-password"
                    minLength={8}
                    name="password"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                  />
                  <button
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="rounded-md p-1 text-[#9aa493] transition-colors hover:text-[#536d4f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#718d64]"
                    onClick={() => setShowPassword((visible) => !visible)}
                    type="button"
                  >
                    {showPassword ? (
                      <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
                        <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
                        <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5.2 0 8.5 4.3 9.5 6-.4.7-1.3 2-2.7 3.2M6.2 6.2C4.2 7.5 2.9 9.5 2.5 11c1 1.7 4.3 6 9.5 6 1 0 1.9-.2 2.7-.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                      </svg>
                    ) : (
                      <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
                        <path d="M2.5 12S5.8 6 12 6s9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
                        <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.7" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* 4-Bar Password Freshness Meter */}
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      className={`h-1.5 rounded-full transition-colors duration-200 ${
                        password.length > 0 && passwordStrength >= level
                          ? 'bg-[#6d9b62]'
                          : 'bg-[#ecece4]'
                      }`}
                      key={level}
                    />
                  ))}
                </div>
              </div>

              {message && (
                <p
                  aria-live="polite"
                  className={`rounded-xl px-4 py-3 text-sm ${
                    hasError
                      ? 'border border-[#f1d5cc] bg-[#fff4ef] text-[#a7523d]'
                      : 'border border-[#d7e8cf] bg-[#f2f8ed] text-[#4d7548]'
                  }`}
                  role={hasError ? 'alert' : 'status'}
                >
                  {message}
                </p>
              )}

              <button
                className="sign-in-button group relative mt-2 flex h-[54px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#597b52] px-5 text-sm font-semibold tracking-[0.01em] text-white shadow-[0_7px_16px_rgba(75,111,67,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4c6f47] hover:shadow-[0_11px_22px_rgba(75,111,67,0.24)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#6d915f] disabled:cursor-wait disabled:opacity-75"
                disabled={isSubmitting}
                type="submit"
              >
                <span className="relative z-10">
                  {isSubmitting ? 'Setting up your kitchen...' : 'Create account'}
                </span>
                {!isSubmitting && (
                  <svg
                    aria-hidden="true"
                    className="relative z-10 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                  </svg>
                )}
              </button>
            </form>

            <div className="login-extra my-5 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#ecece4]" />
              <span className="text-xs text-[#a0a398]">less waste, more taste</span>
              <div className="h-px flex-1 bg-[#ecece4]" />
            </div>

            <p className="text-center text-sm text-[#7b8277]">
              Already have a kitchen with us?{' '}
              <Link
                className="font-semibold text-[#597b52] underline-offset-4 hover:underline"
                to="/login"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default SignUp
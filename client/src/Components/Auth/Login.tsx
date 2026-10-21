import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../api/auth'

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

function FridgeIllustration() {
  return (
    <div className="fridge-scene relative mx-auto flex h-[clamp(220px,42vh,370px)] w-full max-w-[420px] items-center justify-center">
      <div className="scene-sun absolute left-[13%] top-[8%] h-24 w-24 rounded-full bg-[#ffe8b0] sm:h-32 sm:w-32" />
      <div className="scene-blob absolute bottom-[8%] left-[5%] h-32 w-44 rounded-[48%] bg-[#dcebd2] sm:h-40 sm:w-56" />

      <svg
        aria-label="A mint-green fridge stocked with fresh ingredients"
        className="fridge-drawing relative z-10 h-full w-auto drop-shadow-[0_24px_30px_rgba(78,103,63,0.14)]"
        fill="none"
        role="img"
        viewBox="0 0 300 350"
      >
        <rect fill="#F9FFF4" height="302" rx="25" stroke="#6F9367" strokeWidth="3" width="220" x="40" y="26" />
        <path d="M43 219h214" stroke="#6F9367" strokeWidth="3" />
        <path d="M229 86v89M229 244v42" stroke="#7C9A72" strokeLinecap="round" strokeWidth="7" />
        <rect fill="#E7F3DD" height="168" rx="19" width="210" x="45" y="31" />
        <path d="M49 202h202" stroke="#8AAA7D" strokeWidth="2" />
        <path d="M71 123h158M71 174h158" stroke="#A7BE9A" strokeLinecap="round" strokeWidth="4" />
        <path d="M84 119c-5-15 0-26 12-31 8 9 7 19-2 30" fill="#76A96D" />
        <path d="M94 117c0-18 8-28 22-29 4 12-2 23-17 31" fill="#98BD78" />
        <path d="M111 118c3-14 12-21 25-19 1 12-7 20-23 23" fill="#5F965A" />
        <path d="M161 119c-4-16 2-27 15-31 7 10 5 20-6 30" fill="#7EAA67" />
        <path d="M177 118c2-17 11-26 25-24 2 12-5 21-21 28" fill="#A7C47D" />
        <path d="M100 168c-9-7-11-17-5-27 11 3 16 12 12 25" fill="#F2A65A" />
        <path d="M105 170c-2-13 4-21 16-23 5 10 1 19-11 25" fill="#F6BE70" />
        <path d="M148 169c-8-9-7-19 2-27 10 5 12 15 4 27" fill="#E98972" />
        <path d="M155 168c1-13 9-20 21-19 2 12-5 20-19 22" fill="#F0AA87" />
        <circle cx="198" cy="157" r="11" fill="#F2C965" />
        <path d="M198 146c1-5 4-8 9-8" stroke="#6D9B62" strokeLinecap="round" strokeWidth="3" />
        <rect fill="#D8EBCB" height="76" rx="13" width="190" x="55" y="225" />
        <path d="M64 259h172" stroke="#AAC39B" strokeWidth="2" />
        <rect fill="#fffdf5" height="24" rx="8" width="55" x="73" y="238" />
        <rect fill="#F6DDD0" height="24" rx="8" width="55" x="166" y="238" />
        <path d="M88 244h25m-25 6h17M181 244h25m-25 6h17" stroke="#C7917F" strokeLinecap="round" strokeWidth="2" />
        <circle cx="86" cy="74" r="5" fill="#A6C697" />
        <path d="M192 66h20" stroke="#A6C697" strokeLinecap="round" strokeWidth="4" />
      </svg>

      <div className="float-card float-card-left absolute bottom-[17%] left-0 z-20 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-[0_12px_35px_rgba(74,97,67,0.12)] backdrop-blur sm:left-[-3%]">
        <p className="text-xs font-medium text-[#82917a]">Tonight&apos;s idea</p>
        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#344a35]">
          <span aria-hidden="true">🥑</span> Garden-fresh bowls
        </p>
      </div>
      <div className="float-card float-card-right absolute right-0 top-[17%] z-20 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-[0_12px_35px_rgba(74,97,67,0.12)] backdrop-blur sm:right-[-2%]">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#344a35]">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff5dd] text-base">✨</span>
          Less waste, more taste
        </p>
      </div>
    </div>
  )
}

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [hasError, setHasError] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    setHasError(false)

    try {
      const result = await login(email, password)
      window.localStorage.setItem('access_token', result.access_token)
      setMessage('You’re signed in! Let’s make something delicious.')
      setTimeout(() => {
        navigate('/dashboard')
      }, 600)
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
          : 'We couldn’t sign you in. Check your details and try again.'

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
                A little more joy in your kitchen
              </span>
              <h1 className="mx-auto mt-5 max-w-[530px] font-serif text-[2.65rem] font-medium leading-[1.08] tracking-[-0.055em] text-[#2c4131] sm:text-5xl lg:mx-0 lg:mt-6 lg:text-[3.65rem]">
                Your fridge is full of{' '}
                <span className="text-[#779666]">possibilities.</span>
              </h1>
              <p className="mx-auto mt-3 max-w-[440px] text-sm leading-6 text-[#788272] sm:text-base sm:leading-7 lg:mx-0">
                Turn what you already have into something wonderful. Your next
                favorite meal starts right here.
              </p>
            </div>
            <div className="hidden lg:block">
              <FridgeIllustration />
            </div>
          </div>

          <p className="relative z-10 mt-2 hidden text-xs text-[#82907d] lg:block">
            Good food, thoughtfully made. &copy; 2026 Fridge to Feast
          </p>
        </section>

        <section className="flex min-h-0 items-start justify-center overflow-y-auto bg-[#fffefa] px-6 py-8 sm:px-10 lg:px-12">
          <div className="animate-enter animate-enter-late w-full max-w-[410px]">
            {/* Segmented Auth Mode Toggle */}
            <div className="mb-7 grid grid-cols-2 rounded-2xl border border-[#e5e7dd] bg-[#f5f6f0] p-1">
              <Link
                aria-current="page"
                className="flex h-10 items-center justify-center rounded-xl bg-white text-xs font-semibold text-[#2d4031] shadow-xs transition-all"
                to="/login"
              >
                Sign in
              </Link>
              <Link
                className="flex h-10 items-center justify-center rounded-xl text-xs font-semibold text-[#7b8277] transition-colors hover:text-[#2d4031]"
                to="/signup"
              >
                Create account
              </Link>
            </div>

            <div className="login-heading mb-7 lg:mb-8">
              <p className="mb-2.5 text-xs font-semibold tracking-wider text-[#829477] uppercase">
                WELCOME BACK
              </p>
              <h2 className="font-serif text-[2.55rem] font-medium leading-tight tracking-[-0.05em] text-[#2d4031] sm:text-5xl">
                Come on in.
              </h2>
              <p className="mt-2.5 text-[15px] leading-6 text-[#7b8277]">
                Sign in to find a little inspiration in your fridge.
              </p>
            </div>

            <form className="login-form space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-[#455449]"
                  htmlFor="email"
                >
                  Email address
                </label>
                <div className="input-wrap group flex h-[54px] items-center gap-3 rounded-xl border border-[#e5e7dd] bg-white px-4 transition-all duration-200 focus-within:border-[#91aa7e] focus-within:ring-4 focus-within:ring-[#9bb68a]/15 hover:border-[#c6d2bc]">
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
                    id="email"
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
                <div className="mb-2 flex items-center justify-between">
                  <label
                    className="block text-sm font-semibold text-[#455449]"
                    htmlFor="password"
                  >
                    Password
                  </label>
                </div>
                <div className="input-wrap group flex h-[54px] items-center gap-3 rounded-xl border border-[#e5e7dd] bg-white px-4 transition-all duration-200 focus-within:border-[#91aa7e] focus-within:ring-4 focus-within:ring-[#9bb68a]/15 hover:border-[#c6d2bc]">
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
                    autoComplete="current-password"
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#334236] outline-none placeholder:text-[#b0b6ab]"
                    id="password"
                    minLength={8}
                    name="password"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
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
                className="sign-in-button group relative mt-1 flex h-[54px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#597b52] px-5 text-sm font-semibold tracking-[0.01em] text-white shadow-[0_7px_16px_rgba(75,111,67,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4c6f47] hover:shadow-[0_11px_22px_rgba(75,111,67,0.24)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#6d915f] disabled:cursor-wait disabled:opacity-75"
                disabled={isSubmitting}
                type="submit"
              >
                <span className="relative z-10">
                  {isSubmitting ? 'Finding your way in...' : 'Sign in'}
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

            <div className="login-extra my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#ecece4]" />
              <span className="text-xs text-[#a0a398]">a fresh start, every day</span>
              <div className="h-px flex-1 bg-[#ecece4]" />
            </div>

            <p className="text-center text-sm text-[#7b8277]">
              New to Fridge to Feast?{' '}
              <Link
                className="font-semibold text-[#597b52] underline-offset-4 hover:underline"
                to="/signup"
              >
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Login
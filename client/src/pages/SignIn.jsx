import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice'
import OAuth from '../components/OAuth'
import {
  FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaSignInAlt, FaExclamationCircle, FaSpinner, FaHome,
} from 'react-icons/fa'

export default function SignIn() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const { loading, error } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const inputCls = 'w-full border border-slate-200 bg-slate-50 rounded-xl py-3 pl-11 pr-4 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition'

  const handleChange = (e) => {
    setFormError('')
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.email || !formData.password) {
      return setFormError('Please fill in both email and password.')
    }
    if (!isValidEmail(formData.email)) {
      return setFormError('Please enter a valid email address.')
    }

    try {
      dispatch(signInStart())
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success === false) {
        dispatch(signInFailure(data.message))
        return
      }
      dispatch(signInSuccess(data))
      navigate('/')
    } catch (err) {
      dispatch(signInFailure(err.message || 'Something went wrong. Please try again.'))
    }
  }

  const canSubmit = formData.email && formData.password && !loading

  return (
    <main className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-green-900 bg-[url('/images/bg1.jpg')] bg-cover bg-center bg-fixed">

      {/* Dark overlay so the card and text stay readable over the photo */}
      <div className="absolute inset-0 bg-green-950/55" />

      <div className="relative z-10 w-full max-w-md">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-green-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg mb-3">
            <FaHome className="text-xl" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">Welcome back</h1>
          <p className="text-green-100 mt-1 text-base">Sign in to continue to Nestora</p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${inputCls} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-semibold text-base shadow-sm hover:shadow-md transition"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  <FaSignInAlt /> Sign In
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <OAuth />
          </form>

          {/* Error */}
          {(formError || error) && (
            <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
              <FaExclamationCircle className="mt-0.5 shrink-0 text-red-400" />
              <span>{formError || error}</span>
            </div>
          )}
        </div>

        {/* Footer link */}
        <div className="flex justify-center gap-2 mt-6 text-base">
          <p className="text-green-100">Don't have an account?</p>
          <Link to="/sign-up" className="text-white font-semibold hover:text-green-200 transition underline underline-offset-2">
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  )
}
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import OAuth from '../components/OAuth'
import {
  FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaUserPlus, FaExclamationCircle, FaSpinner, FaHome, FaCheckCircle,
} from 'react-icons/fa'

export default function SignUp() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const inputCls = 'w-full border border-slate-200 bg-slate-50 rounded-xl py-3 pl-11 pr-4 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition'

  const handleChange = (e) => {
    setFormError('')
    setError(null)
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setError(null)

    if (!formData.username || !formData.email || !formData.password) {
      return setFormError('Please fill in all fields.')
    }
    if (formData.username.trim().length < 3) {
      return setFormError('Username must be at least 3 characters.')
    }
    if (!isValidEmail(formData.email)) {
      return setFormError('Please enter a valid email address.')
    }
    if (formData.password.length < 6) {
      return setFormError('Password must be at least 6 characters.')
    }

    try {
      setLoading(true)
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success === false) {
        setError(data.message)
        setLoading(false)
        return
      }
      setLoading(false)
      setError(null)
      navigate('/sign-in')
    } catch (err) {
      setLoading(false)
      setError(err.message || 'Something went wrong. Please try again.')
    }
  }

  const canSubmit = formData.username && formData.email && formData.password && !loading

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-green-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-md mb-3">
            <FaHome className="text-xl" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Create your account</h1>
          <p className="text-slate-500 mt-1 text-base">Join Nestora to buy, sell, or rent</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  id="username"
                  placeholder="JohnDoe10"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </div>

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
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
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
                  <FaSpinner className="animate-spin" /> Creating account…
                </>
              ) : (
                <>
                  <FaUserPlus /> Sign Up
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
          <p className="text-slate-500">Already have an account?</p>
          <Link to="/sign-in" className="text-green-600 font-semibold hover:text-green-700 transition">
            Sign In
          </Link>
        </div>
      </div>
    </main>
  )
}
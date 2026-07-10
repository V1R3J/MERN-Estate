import { useSelector, useDispatch } from 'react-redux'
import { useRef, useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  FaPen, FaSignOutAlt, FaTrash, FaUpload, FaEye, FaEyeSlash,
  FaPlus, FaList, FaExclamationTriangle,
} from 'react-icons/fa'
import { storage } from '../appwrite'
import { ID } from 'appwrite'
import {
  updateUserStart, updateUserSuccess, updateUserFailure,
  deleteUserFailure, deleteUserStart, deleteUserSuccess,
  signOutUserStart, signOutUserSuccess, signOutUserFailure
} from '../redux/user/userSlice'
//    — never import backend controllers into frontend components

export default function Profile() {
  const fileRef = useRef(null)
  const { currentUser, loading, error } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [file, setFile] = useState(undefined)
  const [filePerc, setFilePerc] = useState(0)
  const [fileUploadError, setFileUploadError] = useState(false)
  const [formData, setFormData] = useState({
    username: currentUser.username,
    email: currentUser.email,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  const isAdmin = !!currentUser?.isAdmin

  useEffect(() => {
    if (file) {
      handleFileUpload(file)
    }
  }, [file])

  const handleFileUpload = async (file) => {
    setFileUploadError(false)
    setFilePerc(0)
    try {
      const fileName = new Date().getTime() + '_' + file.name
      const bucketId = import.meta.env.VITE_APPWRITE_BUCKET_ID

      setFilePerc(30)
      const response = await storage.createFile(
        bucketId,
        ID.unique(),
        new File([file], fileName, { type: file.type })
      )
      setFilePerc(80)
      const fileUrl = storage.getFileView(bucketId, response.$id)
      setFilePerc(100)
      setFormData(prev => ({ ...prev, avatar: fileUrl }))
    } catch (error) {
      console.error('Upload error:', error.message)
      setFileUploadError(true)
      setFilePerc(0)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdateSuccess(false)
    setUpdating(true)
    try {
      dispatch(updateUserStart())
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success === false) {
        dispatch(updateUserFailure(data.message))
        setUpdating(false)
        return
      }
      setTimeout(() => {
        dispatch(updateUserSuccess(data))
        setUpdating(false)
        setUpdateSuccess(true)
        setTimeout(() => setUpdateSuccess(false), 3000)
      }, 1500)
    } catch (error) {
      dispatch(updateUserFailure(error.message))
      setUpdating(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!window.confirm('Permanently delete your account? This cannot be undone.')) return
    try {
      dispatch(deleteUserStart())
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message))
        return
      }
      setDeleteSuccess(true)
      setTimeout(() => {
        dispatch(deleteUserSuccess(data))
        navigate('/sign-in')
      }, 2000)
    } catch (error) {
      dispatch(deleteUserFailure(error.message))
    }
  }

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart())
      const res = await fetch('/api/auth/signout')
      const data = await res.json()
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message))
        return
      }
      dispatch(signOutUserSuccess())
      navigate('/sign-in')
    } catch (error) {
      dispatch(signOutUserFailure(error.message))
    }
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-green-900 bg-[url('/images/bg1.jpg')] bg-cover bg-center bg-fixed">

      {/* Dark overlay so the card stays readable over the photo */}
      <div className="absolute inset-0 bg-green-950/55" />

      <div className="relative z-10 w-full max-w-xl">
        <div className="bg-white/95 backdrop-blur-sm p-8 sm:p-10 rounded-2xl shadow-xl border border-white/50">

          <h1 className="text-3xl font-bold text-center text-slate-800 tracking-tight mb-7">Profile</h1>

          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">

            {/* Avatar */}
            <div className="relative self-center mt-2 w-20 h-20 group">
              <img
                onClick={() => fileRef.current.click()}
                src={formData.avatar || currentUser?.avatar}
                alt={currentUser?.username}
                referrerPolicy="no-referrer"
                className="rounded-full h-20 w-20 object-cover cursor-pointer border-2 border-green-100"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none">
                <FaPen size={20} className="text-white" />
              </div>
              <input
                onChange={(e) => setFile(e.target.files[0])}
                type="file"
                ref={fileRef}
                accept="image/*"
                hidden
              />
            </div>

            {/* Upload status */}
            <p className="text-sm">
              {fileUploadError ? (
                <span className="text-red-500">Image upload failed. Please try again.</span>
              ) : filePerc > 0 && filePerc < 100 ? (
                <span className="text-slate-700">Uploading {filePerc}%...</span>
              ) : filePerc === 100 ? (
                <span className="text-green-600">Image uploaded successfully!</span>
              ) : null}
            </p>

            {/* Welcome message */}
            <h2 className="text-xl font-semibold text-green-700 flex items-center gap-2">
              Welcome !
              {isAdmin && (
                <span className="text-xs font-bold uppercase tracking-wider bg-green-600 text-white px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </h2>

            {/* Username */}
            <input
              type="text"
              placeholder="username"
              id="username"
              defaultValue={currentUser.username}
              className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition p-3 rounded-xl w-full"
              onChange={handleChange}
            />

            {/* Email */}
            <input
              type="email"
              placeholder="email"
              id="email"
              defaultValue={currentUser.email}
              className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition p-3 rounded-xl w-full"
              onChange={handleChange}
            />

            {/* Password with eye toggle */}
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="password"
                id="password"
                className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition p-3 rounded-xl w-full pr-11"
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            {/* Updating loader */}
            {updating && (
              <div className="flex items-center gap-2 text-green-600 font-medium mt-1">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Updating profile...
              </div>
            )}

            {/* Update success message */}
            {updateSuccess && (
              <p className="text-green-600 font-medium mt-1">
                PROFILE UPDATED SUCCESSFULLY!
              </p>
            )}

            {/* Delete success message */}
            {deleteSuccess && (
              <p className="text-red-500 font-medium mt-1">
                Account deleted. Redirecting to login...
              </p>
            )}

            {/* Error message */}
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}

            {/* ── Primary + secondary actions ─────────────────────────────── */}
            <div className="flex gap-3 flex-wrap justify-center w-full mt-5">
              <button
                type="submit"
                disabled={updating}
                className="flex-1 min-w-[160px] flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <FaUpload />
                {updating ? 'Updating...' : 'Update Profile'}
              </button>

              {/* Create Listing / My Listings only make sense for regular
                  users — an admin manages everything from /admin instead
                  of owning listings themselves. */}
              {!isAdmin && (
                <>
                  <Link
                    to="/create-listing"
                    className="flex-1 min-w-[160px] flex items-center justify-center gap-2 bg-white hover:bg-green-50 border-2 border-green-200 text-green-700 font-semibold py-3 px-4 rounded-xl transition"
                  >
                    <FaPlus /> Create Listing
                  </Link>
                  <Link
                    to="/my-listings"
                    className="flex-1 min-w-[160px] flex items-center justify-center gap-2 bg-white hover:bg-green-50 border-2 border-green-200 text-green-700 font-semibold py-3 px-4 rounded-xl transition"
                  >
                    <FaList /> Show My Listings
                  </Link>
                </>
              )}

              <button
                onClick={handleSignOut}
                type="button"
                className="flex-1 min-w-[160px] flex items-center justify-center gap-2 bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-600 font-semibold py-3 px-4 rounded-xl transition"
              >
                <FaSignOutAlt /> Sign Out
              </button>
            </div>

            {/* ── Danger zone — kept visually separate so it's never a
                 stray click away from routine actions ─────────────────── */}
            {!isAdmin && (
              <div className="w-full mt-6 pt-5 border-t border-slate-200">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-500 mb-3">
                  <FaExclamationTriangle /> Danger Zone
                </p>
                <button
                  onClick={handleDeleteUser}
                  type="button"
                  className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-600 font-semibold py-3 px-4 rounded-xl transition"
                >
                  <FaTrash /> Delete Account
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  )
}
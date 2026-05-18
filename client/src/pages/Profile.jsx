import { useSelector, useDispatch } from 'react-redux'
import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPen, FaSignOutAlt, FaTrash, FaUpload, FaEye, FaEyeSlash } from 'react-icons/fa'
import { storage } from '../appwrite'
import { ID } from 'appwrite'
import { updateUserStart, updateUserSuccess, updateUserFailure, deleteUserFailure, deleteUserStart, deleteUserSuccess } from '../redux/user/userSlice'

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
      // Wait 2 seconds to show message, then clear user and redirect
      setTimeout(() => {
        dispatch(deleteUserSuccess(data))
        navigate('/sign-in')
      }, 2000)
    } catch (error) {
      dispatch(deleteUserFailure(error.message))
    }
  }

  return (
    <div className='p-10 max-w-xl mx-auto border-2 border-green-300 rounded-lg mt-10'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col items-center gap-3'>

        {/* Avatar */}
        <div className='relative self-center mt-2 w-20 h-20 group'>
          <img
            onClick={() => fileRef.current.click()}
            src={formData.avatar || currentUser?.avatar}
            alt={currentUser?.username}
            referrerPolicy="no-referrer"
            className='rounded-full h-20 w-20 object-cover cursor-pointer'
          />
          <div className='absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none'>
            <FaPen size={20} className='text-white' />
          </div>
          <input
            onChange={(e) => setFile(e.target.files[0])}
            type="file"
            ref={fileRef}
            accept='image/*'
            hidden
          />
        </div>

        {/* Upload status */}
        <p className='text-sm'>
          {fileUploadError ? (
            <span className='text-red-500'>Image upload failed. Please try again.</span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className='text-slate-700'>Uploading {filePerc}%...</span>
          ) : filePerc === 100 ? (
            <span className='text-green-600'>Image uploaded successfully!</span>
          ) : null}
        </p>

        {/* Welcome message */}
        <h2 className='text-xl font-semibold text-green-700'>
          Welcome, <span className='capitalize'>{currentUser?.username}</span>!
        </h2>

        {/* Username */}
        <input
          type='text'
          placeholder='username'
          id='username'
          defaultValue={currentUser.username}
          className='border p-3 rounded-lg w-full'
          onChange={handleChange}
        />

        {/* Email */}
        <input
          type='email'
          placeholder='email'
          id='email'
          defaultValue={currentUser.email}
          className='border p-3 rounded-lg w-full'
          onChange={handleChange}
        />

        {/* Password with eye toggle */}
        <div className='relative w-full'>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder='password'
            id='password'
            className='border p-3 rounded-lg w-full pr-10'
            onChange={handleChange}
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        </div>

        {/* Updating loader */}
        {updating && (
          <div className='flex items-center gap-2 text-green-600 font-medium mt-1'>
            <svg className='animate-spin h-5 w-5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
            </svg>
            Updating profile...
          </div>
        )}

        {/* Update success message */}
        {updateSuccess && (
          <p className='text-green-600 font-medium mt-1'>
            ✅ Profile updated successfully!
          </p>
        )}

        {/* Delete success message */}
        {deleteSuccess && (
          <p className='text-red-500 font-large mt-1'>
             Account deleted. Redirecting to login...
          </p>
        )}

        {/* Error message */}
        <p className='text-red-700 mt-1'>{error ? error : ''}</p>

        {/* Buttons */}
        <span className='flex gap-3 flex-wrap justify-center'>
          <button
            disabled={updating}
            className='bg-green-600 self-start flex gap-2 items-center text-white p-3 rounded-lg mt-5 hover:bg-green-700 transition disabled:opacity-70'
          >
            <FaUpload />
            {updating ? 'Updating...' : 'Update Profile'}
          </button>
          <button
            type='button'
            className='bg-red-500 self-start flex gap-2 items-center text-white p-3 rounded-lg mt-5 hover:bg-red-700 transition'
          >
            <FaSignOutAlt /> Sign Out
          </button>
          <button
            onClick={handleDeleteUser}
            type='button'
            className='bg-red-600 self-start flex gap-2 items-center text-white p-3 rounded-lg mt-5 hover:bg-red-700 transition'
          >
            <FaTrash /> Delete Account
          </button>
        </span>

      </form>
    </div>
  )
}
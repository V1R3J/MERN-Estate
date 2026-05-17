import { useSelector } from 'react-redux'
import { useRef, useState, useEffect } from 'react'
import { FaPen, FaSignOutAlt, FaTrash, FaUpload } from 'react-icons/fa'
import { storage } from '../appwrite' // adjust path as needed
import { ID } from 'appwrite'

export default function Profile() {
  const fileRef = useRef(null)
  const { currentUser } = useSelector(state => state.user)

  const [file, setFile] = useState(undefined)
  const [filePerc, setFilePerc] = useState(0)
  const [fileUploadError, setFileUploadError] = useState(false)
  const [formData, setFormData] = useState({})

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
      console.error('Upload error:', error.message) // <-- check browser console
      console.error('Full error:', error)           // <-- full details
      setFileUploadError(true)
      setFilePerc(0)
    }
  }

  return (
    <div className='p-10 max-w-xl mx-auto border-2 border-green-300 rounded-lg mt-10'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form className='flex flex-col items-center gap-3'>

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

        <h2 className='text-xl font-medium'>{currentUser?.username.slice(0, -4)}</h2>
        <input type='text' placeholder='username' id='username' className='border p-3 rounded-lg w-full' />
        <input type='email' placeholder='email' id='email' className='border p-3 rounded-lg w-full' />
        <input type='password' placeholder='password' id='password' className='border p-3 rounded-lg w-full' />

        <span className='flex gap-3'>
          <button className='bg-green-600 self-start flex gap-2 items-center text-white p-3 rounded-lg mt-5 hover:bg-green-700 transition'>
            <FaUpload /> Update Profile
          </button>
          <button className='bg-red-500 self-start flex gap-2 items-center text-white p-3 rounded-lg mt-5 hover:bg-red-700 transition'>
            <FaSignOutAlt /> Sign Out
          </button>
          <button className='bg-red-600 self-start flex gap-2 items-center text-white p-3 rounded-lg mt-5 hover:bg-red-700 transition'>
            <FaTrash /> Delete Account
          </button>
        </span>
      </form>
    </div>
  )
}
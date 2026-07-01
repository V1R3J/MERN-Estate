import { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FaHome, FaMapMarkerAlt, FaAlignLeft, FaBed, FaBath,
  FaCar, FaCouch, FaTag, FaDollarSign, FaPercent,
  FaCloudUploadAlt, FaCheckSquare, FaStar, FaTrash,
  FaExclamationCircle, FaCheckCircle, FaRulerCombined, FaUtensils,
  FaDoorOpen, FaSwimmingPool, FaChild, FaUserFriends, FaUser,
  FaTree, FaDumbbell, FaShieldAlt, FaWifi, FaBolt, FaEdit,
  FaSave, FaUserTie, FaPhone, FaEnvelope, FaFileAlt, FaFilePdf,
  FaCity, FaChevronDown, FaSearch, FaLock,
} from 'react-icons/fa'
import { storage } from '../appwrite'
import { ID } from 'appwrite'
import { INDIAN_STATES, getCitiesForState } from '../data/indianLocations'

const MAX_IMAGES  = 6
const MAX_SIZE_MB = 4
const MAX_SIZE_B  = MAX_SIZE_MB * 1024 * 1024
const BUCKET_ID   = import.meta.env.VITE_APPWRITE_BUCKET_ID

// ── Rupee helpers ──────────────────────────────────────────────────────────────
const formatINR = (n) =>
  n ? new Intl.NumberFormat('en-IN').format(n) : ''

const toWords = (n) => {
  if (!n || n <= 0) return ''
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
    'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen',
    'Seventeen','Eighteen','Nineteen']
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']
  const chunk = (num) => {
    if (num < 20)  return ones[num]
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '')
    return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + chunk(num % 100) : '')
  }
  if (n >= 10_000_000) return chunk(Math.floor(n / 10_000_000)) + ' Crore' + (n % 10_000_000 ? ' ' + toWords(n % 10_000_000) : '')
  if (n >= 100_000)    return chunk(Math.floor(n / 100_000))    + ' Lakh'  + (n % 100_000    ? ' ' + toWords(n % 100_000)    : '')
  if (n >= 1_000)      return chunk(Math.floor(n / 1_000))      + ' Thousand' + (n % 1_000   ? ' ' + toWords(n % 1_000)      : '')
  return chunk(n)
}

const PriceDisplay = ({ value, color = 'text-green-600' }) => {
  const num = Number(value)
  if (!num) return null
  return (
    <p className={`mt-2 text-sm font-medium ${color}`}>
      ₹{formatINR(num)}
      <span className="text-slate-400 font-normal"> — {toWords(num)} Rupees</span>
    </p>
  )
}

// ── City autocomplete — same component used in CreateListing ──────────────────
function CityAutocomplete({ state, value, onChange, disabled }) {
  const [query, setQuery]   = useState(value || '')
  const [open, setOpen]     = useState(false)
  const [highlight, setHighlight] = useState(0)

  const cities = state ? getCitiesForState(state) : []
  const filtered = query
    ? cities.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : cities

  useEffect(() => { setQuery(value || '') }, [value])

  const selectCity = (city) => {
    onChange(city)
    setQuery(city)
    setOpen(false)
  }

  const handleKeyDown = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)) }
    if (e.key === 'Enter')     { e.preventDefault(); if (filtered[highlight]) selectCity(filtered[highlight]) }
    if (e.key === 'Escape')    setOpen(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input
          type="text"
          disabled={disabled}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); setHighlight(0); if (e.target.value === '') onChange('') }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Select a state first' : 'Type to search city…'}
          className="w-full border border-slate-200 bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed rounded-xl py-3 pl-11 pr-4 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition"
        />
        {value && (
          <FaCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
        )}
      </div>

      {open && !disabled && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1.5 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg py-1.5">
          {filtered.map((city, i) => (
            <li
              key={city}
              onMouseDown={() => selectCity(city)}
              onMouseEnter={() => setHighlight(i)}
              className={`px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2.5
                ${i === highlight ? 'bg-green-50 text-green-700' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              <FaCity className={i === highlight ? 'text-green-500' : 'text-slate-300'} />
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function UpdateListing() {
  const navigate    = useNavigate()
  const params      = useParams()
  const { currentUser } = useSelector(state => state.user)

  // ── fetch state ────────────────────────────────────────────────────────────
  const [fetchLoading, setFetchLoading] = useState(true)
  const [fetchError,   setFetchError]   = useState('')
  // true once we've confirmed the logged-in user owns this listing
  const [authorized,   setAuthorized]   = useState(false)

  // ── existing images (already in DB as URLs) ────────────────────────────────
  const [existingUrls, setExistingUrls] = useState([])
  const [coverIndex,   setCoverIndex]   = useState(0)

  // ── new images (dropped by user, not yet uploaded) ─────────────────────────
  const [newImages,       setNewImages]       = useState([])
  const [uploadProgress,  setUploadProgress]  = useState({})
  const [newUploadedUrls, setNewUploadedUrls] = useState([])
  const [uploading,       setUploading]       = useState(false)
  const [uploadMsg,       setUploadMsg]       = useState({ type: '', text: '' })

  // ── floor plan state ───────────────────────────────────────────────────────
  const [floorPlanFile,      setFloorPlanFile]      = useState(null)
  const [floorPlanPreview,   setFloorPlanPreview]   = useState('')
  const [floorPlanUploading, setFloorPlanUploading] = useState(false)
  const [floorPlanMsg,       setFloorPlanMsg]       = useState({ type: '', text: '' })

  // ── form / submit ──────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: '', description: '', address: '',
    // location
    state: '', city: '',
    type: '', parking: false, furnished: false, offer: false,
    bedrooms: 1, bathrooms: 1, regularPrice: 0, discountPrice: 0, imageUrls: [],
    squareFootage: '', halls: '', kitchen: '',
    swimmingPool: false, playArea: false, gym: false,
    garden: false, security: false, wifi: false, powerBackup: false,
    suitableFor: '',
    contactName: '', contactEmail: '', contactPhone: '',
    floorPlan: '',
  })
  const [loading,     setLoading]     = useState(false)
  const [submitError, setSubmitError] = useState('')

  // ── derived ────────────────────────────────────────────────────────────────
  const isRent   = formData.type === 'rent'
  const hasOffer = formData.offer

  const discountPct = (() => {
    const reg  = Number(formData.regularPrice)
    const disc = Number(formData.discountPrice)
    if (!hasOffer || reg <= 0 || disc <= 0 || disc >= reg) return 0
    return Math.round(((reg - disc) / reg) * 100)
  })()

  const allNewUploaded = newImages.length === 0 || newUploadedUrls.length === newImages.length
  const mergedUrls     = [...existingUrls, ...newUploadedUrls]

  const floorPlanUploaded = !!formData.floorPlan
  const floorPlanIsImage  = floorPlanFile && floorPlanFile.type.startsWith('image/')
  const floorPlanIsPDF    = floorPlanFile && floorPlanFile.type === 'application/pdf'

  // ── fetch listing on mount + OWNERSHIP CHECK ───────────────────────────────
  // GET /api/listing/get/:listingId  →  listing.controller.js → getListing
  //
  // This is a page-level guard: the backend's updateListing controller already
  // rejects saves from non-owners (req.user.id !== listing.userRef), but without
  // this check a non-owner could still open the page and see/edit the form
  // before hitting that wall on submit. We check ownership as soon as the
  // listing loads and block the page entirely if it doesn't match.
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setFetchLoading(true)
        const res  = await fetch(`/api/listing/get/${params.listingId}`)
        const data = await res.json()
        if (data.success === false) {
          setFetchError(data.message || 'Failed to load listing.')
          return
        }

        // ── Ownership check ──
        if (!currentUser || currentUser._id !== data.userRef) {
          setFetchError('You do not have permission to edit this listing.')
          setAuthorized(false)
          return
        }
        setAuthorized(true)

        setFormData({
          name:          data.name          ?? '',
          description:   data.description   ?? '',
          address:       data.address       ?? '',
          state:         data.state         ?? '',
          city:          data.city          ?? '',
          type:          data.type          ?? '',
          parking:       data.parking       ?? false,
          furnished:     data.furnished     ?? false,
          offer:         data.offer         ?? false,
          bedrooms:      data.bedrooms      ?? 1,
          bathrooms:     data.bathrooms     ?? 1,
          regularPrice:  data.regularPrice  ?? 0,
          discountPrice: data.discountPrice ?? 0,
          imageUrls:     data.imageUrls     ?? [],
          squareFootage: data.squareFootage ?? '',
          halls:         data.halls         ?? '',
          kitchen:       data.kitchen       ?? '',
          swimmingPool:  data.swimmingPool  ?? false,
          playArea:      data.playArea      ?? false,
          gym:           data.gym           ?? false,
          garden:        data.garden        ?? false,
          security:      data.security      ?? false,
          wifi:          data.wifi          ?? false,
          powerBackup:   data.powerBackup   ?? false,
          suitableFor:   data.suitableFor   ?? '',
          contactName:   data.contactName   ?? '',
          contactEmail:  data.contactEmail  ?? '',
          contactPhone:  data.contactPhone  ?? '',
          floorPlan:     data.floorPlan     ?? '',
        })
        setExistingUrls(data.imageUrls ?? [])
      } catch (err) {
        setFetchError('Could not reach the server. Please try again.')
      } finally {
        setFetchLoading(false)
      }
    }
    fetchListing()
  }, [params.listingId, currentUser])

  // ── handlers ───────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { id, type, value, checked } = e.target
    const val = type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    setFormData(p => ({ ...p, [id]: val }))
  }

  const setType = (type) => setFormData(p => ({ ...p, type }))

  // ── Location handlers ──────────────────────────────────────────────────────
  const handleStateChange = (e) => {
    const newState = e.target.value
    setFormData(p => ({ ...p, state: newState, city: '' }))
  }

  const handleCityChange = (city) => {
    setFormData(p => ({ ...p, city }))
  }

  const handleRemoveExisting = (idx) => {
    setExistingUrls(p => p.filter((_, i) => i !== idx))
    if (coverIndex > 0 && coverIndex >= idx) setCoverIndex(c => c - 1)
  }

  const handleRemoveNew = (idx) => {
    setUploadMsg({ type: '', text: '' })
    URL.revokeObjectURL(newImages[idx].preview)
    setNewImages(p => p.filter((_, i) => i !== idx))
    setUploadProgress(p => { const n = { ...p }; delete n[idx]; return n })
    setNewUploadedUrls(p => p.filter((_, i) => i !== idx))
    const globalIdx = existingUrls.length + idx
    if (coverIndex > 0 && coverIndex >= globalIdx) setCoverIndex(c => c - 1)
  }

  // ── Dropzone ───────────────────────────────────────────────────────────────
  const onDrop = useCallback((accepted) => {
    setUploadMsg({ type: '', text: '' })
    const oversized = accepted.filter(f => f.size > MAX_SIZE_B)
    if (oversized.length)
      return setUploadMsg({ type: 'error', text: `${oversized.map(f => f.name).join(', ')} exceed${oversized.length === 1 ? 's' : ''} the ${MAX_SIZE_MB} MB limit.` })
    const totalAfter = existingUrls.length + newImages.length + accepted.length
    if (totalAfter > MAX_IMAGES)
      return setUploadMsg({ type: 'error', text: `Maximum ${MAX_IMAGES} images allowed. You already have ${existingUrls.length + newImages.length}.` })
    setNewImages(p => [...p, ...accepted.map(f => Object.assign(f, { preview: URL.createObjectURL(f) }))])
  }, [existingUrls, newImages])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, multiple: true,
  })

  // ── Upload listing images ──────────────────────────────────────────────────
  const storeImage = (img, idx) => new Promise(async (resolve, reject) => {
    try {
      const tick = setInterval(() =>
        setUploadProgress(p => ({ ...p, [idx]: Math.min((p[idx] || 0) + 10, 90) })), 150)
      const res = await storage.createFile(BUCKET_ID, ID.unique(), img)
      clearInterval(tick)
      setUploadProgress(p => ({ ...p, [idx]: 100 }))
      const url = storage.getFileView(BUCKET_ID, res.$id)
      if (!url) throw new Error(`No URL returned for file ${res.$id}`)
      resolve(url)
    } catch (err) { reject(err) }
  })

  const handleImageSubmit = async () => {
    setUploadMsg({ type: '', text: '' })
    if (!newImages.length)
      return setUploadMsg({ type: 'error', text: 'No new images selected. Drop images above first.' })
    setUploading(true)
    setUploadProgress(newImages.reduce((a, _, i) => ({ ...a, [i]: 0 }), {}))
    try {
      const urls = await Promise.all(newImages.map((img, i) => storeImage(img, i)))
      setNewUploadedUrls(urls)
      setUploadMsg({ type: 'success', text: `${urls.length} image${urls.length > 1 ? 's' : ''} uploaded successfully!` })
    } catch (err) {
      setUploadMsg({ type: 'error', text: 'Upload failed: ' + (err.message || 'Please try again.') })
    } finally {
      setUploading(false)
    }
  }

  // ── Floor plan handlers ────────────────────────────────────────────────────
  const handleFloorPlanChange = (e) => {
    setFloorPlanMsg({ type: '', text: '' })
    const file = e.target.files[0]
    if (!file) return
    const isImage = file.type.startsWith('image/')
    const isPDF   = file.type === 'application/pdf'
    if (!isImage && !isPDF)
      return setFloorPlanMsg({ type: 'error', text: 'Only image or PDF files are accepted.' })
    if (file.size > 10 * 1024 * 1024)
      return setFloorPlanMsg({ type: 'error', text: 'Floor plan must be under 10 MB.' })
    setFloorPlanFile(file)
    setFloorPlanPreview(isImage ? URL.createObjectURL(file) : '')
    setFormData(p => ({ ...p, floorPlan: '' }))
  }

  const handleFloorPlanUpload = async () => {
    if (!floorPlanFile) return
    setFloorPlanUploading(true)
    setFloorPlanMsg({ type: '', text: '' })
    try {
      const res = await storage.createFile(BUCKET_ID, ID.unique(), floorPlanFile)
      const url = storage.getFileView(BUCKET_ID, res.$id)
      if (!url) throw new Error('No URL returned.')
      setFormData(p => ({ ...p, floorPlan: url.toString() }))
      setFloorPlanMsg({ type: 'success', text: 'Floor plan uploaded successfully!' })
    } catch (err) {
      setFloorPlanMsg({ type: 'error', text: 'Upload failed: ' + (err.message || 'Please try again.') })
    } finally {
      setFloorPlanUploading(false)
    }
  }

  const handleRemoveFloorPlan = () => {
    if (floorPlanPreview) URL.revokeObjectURL(floorPlanPreview)
    setFloorPlanFile(null)
    setFloorPlanPreview('')
    setFloorPlanMsg({ type: '', text: '' })
    setFormData(p => ({ ...p, floorPlan: '' }))
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  // POST /api/listing/update/:listingId  →  listing.controller.js → updateListing
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    if (!formData.type)
      return setSubmitError('Please select whether the property is For Sale or For Rent.')
    if (!formData.state)
      return setSubmitError('Please select a state.')
    if (!formData.city)
      return setSubmitError('Please select a city from the list.')
    if (mergedUrls.length === 0)
      return setSubmitError('Please keep or upload at least one image.')
    if (newImages.length > 0 && !allNewUploaded)
      return setSubmitError('You have unuploaded images. Click "Upload Images" before saving.')
    if (hasOffer && Number(formData.discountPrice) >= Number(formData.regularPrice))
      return setSubmitError('Discounted price must be lower than the regular price.')

    const orderedUrls = [
      mergedUrls[coverIndex],
      ...mergedUrls.filter((_, i) => i !== coverIndex),
    ]

    try {
      setLoading(true)
      const res  = await fetch(`/api/listing/update/${params.listingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, imageUrls: orderedUrls, userRef: currentUser._id }),
      })
      const data = await res.json()
      if (data.success === false) return setSubmitError(data.message)
      navigate(`/listing/${data._id}`)
    } catch (err) {
      setSubmitError('Failed to update listing: ' + (err.message || 'Unknown error.'))
    } finally {
      setLoading(false)
    }
  }

  // ── Shared classes ─────────────────────────────────────────────────────────
  const inputCls   = 'w-full border border-slate-200 bg-slate-50 rounded-xl py-3 px-4 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition'
  const sectionCls = 'bg-white rounded-2xl shadow-sm border border-slate-200 p-6'
  const h2Cls      = 'text-sm font-semibold text-green-600 uppercase tracking-widest mb-5 flex items-center gap-2'
  const labelCls   = 'block text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1.5'

  const amenities = [
    { id: 'parking',      Icon: FaCar,          label: 'Parking'       },
    { id: 'furnished',    Icon: FaCouch,        label: 'Furnished'     },
    { id: 'swimmingPool', Icon: FaSwimmingPool, label: 'Swimming Pool' },
    { id: 'gym',          Icon: FaDumbbell,     label: 'Gym'           },
    { id: 'playArea',     Icon: FaChild,        label: 'Play Area'     },
    { id: 'garden',       Icon: FaTree,         label: 'Garden'        },
    { id: 'security',     Icon: FaShieldAlt,    label: '24/7 Security' },
    { id: 'wifi',         Icon: FaWifi,         label: 'Wi-Fi Ready'   },
    { id: 'powerBackup',  Icon: FaBolt,         label: 'Power Backup'  },
    { id: 'offer',        Icon: FaPercent,      label: 'Special Offer' },
  ]

  const suitableOptions = [
    { value: 'any',      Icon: FaUserFriends, label: 'Anyone'   },
    { value: 'family',   Icon: FaHome,        label: 'Family'   },
    { value: 'couple',   Icon: FaUserFriends, label: 'Couple'   },
    { value: 'bachelor', Icon: FaUser,        label: 'Bachelor' },
  ]

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (fetchLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-base font-medium">Loading listing…</p>
        </div>
      </main>
    )
  }

  // ── Error / unauthorized screen ─────────────────────────────────────────────
  // Covers both "listing not found" and "you don't own this listing" —
  // same UI either way so we don't leak which case it was.
  if (fetchError || !authorized) {
    const isPermissionIssue = !authorized && !fetchError.includes('not found')
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            {isPermissionIssue
              ? <FaLock className="text-red-400 text-2xl" />
              : <FaExclamationCircle className="text-red-400 text-2xl" />}
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            {isPermissionIssue ? "You can't edit this listing" : "Couldn't load listing"}
          </h2>
          <p className="text-slate-500 text-sm mb-5">
            {fetchError || 'You do not have permission to edit this listing.'}
          </p>
          <button onClick={() => navigate(-1)}
            className="bg-green-600 hover:bg-green-700 text-white py-2.5 px-6 rounded-xl font-semibold text-sm transition">
            Go Back
          </button>
        </div>
      </main>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-base">

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-green-600 text-white w-11 h-11 rounded-xl flex items-center justify-center shadow-md">
            <FaEdit className="text-lg" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
            {loading ? 'Saving Changes…' : 'Edit Listing'}
          </h1>
        </div>
        <p className="text-slate-500 pl-1 text-base mt-1">Update the details below and save to publish your changes.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Basic Info */}
          <section className={sectionCls}>
            <h2 className={h2Cls}><FaHome className="text-green-400" /> Basic Information</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>Property Name</label>
                <input onChange={handleChange} value={formData.name} type="text" id="name"
                  placeholder="e.g. Cozy Downtown Studio" maxLength="62" minLength="10" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}><FaAlignLeft className="mr-1.5 text-slate-400 inline" /> Description</label>
                <textarea onChange={handleChange} value={formData.description} id="description" required
                  placeholder="Describe the property — layout, neighbourhood, nearby landmarks…"
                  className={`${inputCls} resize-none min-h-[110px]`} />
              </div>
              <div>
                <label className={labelCls}><FaMapMarkerAlt className="mr-1.5 text-slate-400 inline" /> Address</label>
                <input onChange={handleChange} value={formData.address} type="text" id="address" required
                  placeholder="123 Main Street, Locality" className={inputCls} />
              </div>
            </div>
          </section>

          {/* ── Location ───────────────────────────────────────────────────── */}
          <section className={sectionCls}>
            <h2 className={h2Cls}><FaMapMarkerAlt className="text-green-400" /> Location</h2>
            <p className="text-sm text-slate-400 mb-4">
              Pick the state and city from the list — this keeps location names
              consistent across the platform and powers search filters.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="state" className={labelCls}>State</label>
                <div className="relative">
                  <select
                    id="state"
                    value={formData.state}
                    onChange={handleStateChange}
                    required
                    className={`${inputCls} appearance-none pr-10 cursor-pointer`}
                  >
                    <option value="" disabled>Select a state…</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="city" className={labelCls}>City</label>
                <CityAutocomplete
                  state={formData.state}
                  value={formData.city}
                  onChange={handleCityChange}
                  disabled={!formData.state}
                />
              </div>
            </div>

            {formData.state && formData.city && (
              <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 text-sm text-green-700 font-medium">
                <FaCheckCircle className="text-green-500" />
                Listing will show as located in {formData.city}, {formData.state}
              </div>
            )}
          </section>

          {/* Listing Options */}
          <section className={sectionCls}>
            <h2 className={h2Cls}><FaCheckSquare className="text-green-400" /> Listing Options</h2>
            <p className={labelCls}>Property Type</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { value: 'sale', Icon: FaTag,  label: 'For Sale', sub: 'One-time purchase' },
                { value: 'rent', Icon: FaHome, label: 'For Rent',  sub: 'Monthly rental'   },
              ].map(({ value, Icon, label, sub }) => (
                <button key={value} type="button" onClick={() => setType(value)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition text-left
                    ${formData.type === value
                      ? 'border-green-500 bg-green-50 shadow-sm'
                      : 'border-slate-100 bg-slate-50 hover:border-green-300 hover:bg-green-50'}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                    ${formData.type === value ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    <Icon />
                  </div>
                  <div>
                    <p className={`text-base font-semibold ${formData.type === value ? 'text-green-700' : 'text-slate-700'}`}>{label}</p>
                    <p className="text-sm text-slate-400">{sub}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Suitable For */}
            <p className={`${labelCls} mb-3`}>Suitable For</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {suitableOptions.map(({ value, Icon, label }) => (
                <button key={value} type="button" onClick={() => setFormData(p => ({ ...p, suitableFor: value }))}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition
                    ${formData.suitableFor === value
                      ? 'border-green-500 bg-green-50 shadow-sm'
                      : 'border-slate-100 bg-slate-50 hover:border-green-300 hover:bg-green-50'}`}>
                  <Icon className={formData.suitableFor === value ? 'text-green-600' : 'text-slate-400'} />
                  <span className={`text-sm font-semibold ${formData.suitableFor === value ? 'text-green-700' : 'text-slate-600'}`}>{label}</span>
                </button>
              ))}
            </div>

            {/* Amenities */}
            <p className={`${labelCls} mb-3`}>Amenities & Offer</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {amenities.map(({ id, Icon, label }) => (
                <label key={id} htmlFor={id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition group
                    ${formData[id] ? 'border-green-500 bg-green-50' : 'border-slate-100 bg-slate-50 hover:border-green-300 hover:bg-green-50'}`}>
                  <input onChange={handleChange} checked={!!formData[id]} type="checkbox" id={id} className="accent-green-600 w-4 h-4 rounded" />
                  <Icon className={`transition ${formData[id] ? 'text-green-600' : 'text-green-400 group-hover:text-green-500'}`} />
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Room Details */}
          <section className={sectionCls}>
            <h2 className={h2Cls}><FaBed className="text-green-400" /> Room Details</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { id: 'bedrooms',  Icon: FaBed,  label: 'Bedrooms',  color: 'text-green-400'  },
                { id: 'bathrooms', Icon: FaBath, label: 'Bathrooms', color: 'text-violet-400' },
              ].map(({ id, Icon, label, color }) => (
                <div key={id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    <Icon className={color} /> {label}
                  </label>
                  <input onChange={handleChange} value={formData[id]} type="number" id={id} min="1" max="20" required
                    className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
                </div>
              ))}
            </div>

            <p className={`${labelCls} mt-2 mb-3`}>Space Details <span className="text-slate-400 normal-case font-normal">(optional)</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'squareFootage', Icon: FaRulerCombined, label: 'Sq. Footage', placeholder: 'e.g. 1200', suffix: 'sq ft' },
                { id: 'halls',         Icon: FaDoorOpen,      label: 'Halls',        placeholder: 'e.g. 2',    suffix: null     },
                { id: 'kitchen',       Icon: FaUtensils,      label: 'Kitchens',     placeholder: 'e.g. 1',    suffix: null     },
              ].map(({ id, Icon, label, placeholder, suffix }) => (
                <div key={id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    <Icon className="text-green-400" /> {label}
                  </label>
                  <div className="relative">
                    <input onChange={handleChange} value={formData[id]} type="number" id={id} min="0"
                      placeholder={placeholder}
                      className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition pr-14" />
                    {suffix && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">{suffix}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section className={sectionCls}>
            <h2 className={h2Cls}><FaDollarSign className="text-green-400" /> Pricing (₹)</h2>
            {formData.type ? (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4">
                <label htmlFor="regularPrice" className="block text-sm font-semibold text-green-600 uppercase tracking-wider mb-1">Regular Price</label>
                <p className="text-sm text-slate-400 mb-3">{isRent ? '₹ / month' : '₹ (one-time)'}</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-green-400">₹</span>
                  <input onChange={handleChange} value={formData.regularPrice || ''} type="number" id="regularPrice" min="1" required placeholder="0"
                    className="w-full bg-white border border-green-200 rounded-lg py-2.5 pl-7 pr-3 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
                </div>
                <PriceDisplay value={formData.regularPrice} color="text-green-600" />
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">Select a property type above to set pricing.</p>
            )}

            {hasOffer && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="discountPrice" className="text-sm font-semibold text-rose-500 uppercase tracking-wider">Discounted Price</label>
                  {discountPct > 0 && (
                    <span className="text-xs font-bold text-white bg-rose-500 px-2 py-0.5 rounded-full">{discountPct}% OFF</span>
                  )}
                </div>
                <p className="text-sm text-slate-400 mb-3">{isRent ? '₹ / month' : '₹ (one-time)'}</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-rose-400">₹</span>
                  <input onChange={handleChange} value={formData.discountPrice || ''} type="number" id="discountPrice" min="1" required placeholder="0"
                    className="w-full bg-white border border-rose-200 rounded-lg py-2.5 pl-7 pr-3 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 transition" />
                </div>
                <PriceDisplay value={formData.discountPrice} color="text-rose-500" />
              </div>
            )}
          </section>

          {/* ── Contact Details ───────────────────────────────────────────── */}
          <section className={sectionCls}>
            <h2 className={h2Cls}>
              <FaUserTie className="text-green-400" /> Contact Details
              <span className="ml-auto text-xs font-normal text-slate-400 normal-case tracking-normal">Optional</span>
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              These details will be shown to buyers or renters on your listing page.
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="contactName" className={labelCls}>
                  <FaUserTie className="inline mr-1.5 text-slate-400" /> Contact Name
                </label>
                <input
                  onChange={handleChange}
                  value={formData.contactName}
                  type="text"
                  id="contactName"
                  placeholder="e.g. Rajesh Sharma"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="contactPhone" className={labelCls}>
                  <FaPhone className="inline mr-1.5 text-slate-400" /> Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">+91</span>
                  <input
                    onChange={handleChange}
                    value={formData.contactPhone}
                    type="tel"
                    id="contactPhone"
                    placeholder="98765 43210"
                    maxLength={10}
                    className={`${inputCls} pl-12`}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contactEmail" className={labelCls}>
                  <FaEnvelope className="inline mr-1.5 text-slate-400" /> Email Address
                </label>
                <input
                  onChange={handleChange}
                  value={formData.contactEmail}
                  type="email"
                  id="contactEmail"
                  placeholder="e.g. rajesh@example.com"
                  className={inputCls}
                />
              </div>
            </div>
          </section>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-6">

          {/* Photos */}
          <section className={sectionCls}>
            <h2 className={h2Cls}><FaCloudUploadAlt className="text-green-400" /> Photos</h2>
            <p className="text-sm text-slate-400 mb-4">
              Max {MAX_IMAGES} total · Max {MAX_SIZE_MB} MB each · Click any thumbnail to set as cover
            </p>

            {/* Existing images from DB */}
            {existingUrls.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Current Photos</p>
                <div className="grid grid-cols-3 gap-2">
                  {existingUrls.map((url, i) => {
                    const globalIdx = i
                    const isCover   = coverIndex === globalIdx
                    return (
                      <div key={url} onClick={() => setCoverIndex(globalIdx)}
                        className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition
                          ${isCover ? 'border-green-500 shadow-md col-span-3 h-40' : 'border-slate-200 hover:border-green-300 h-20'}`}>
                        <img src={url} alt={`existing-${i}`} className="w-full h-full object-cover" />
                        {isCover && (
                          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <FaStar className="text-yellow-300 text-[10px]" /> Cover
                          </span>
                        )}
                        {!isCover && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition text-white text-sm font-semibold">
                            Set Cover
                          </span>
                        )}
                        <button type="button" onClick={e => { e.stopPropagation(); handleRemoveExisting(i) }}
                          className="absolute top-1.5 right-1.5 bg-white/80 hover:bg-red-500 hover:text-white text-slate-600 rounded-full w-6 h-6 flex items-center justify-center shadow transition">
                          <FaTrash className="text-[10px]" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Dropzone for new images */}
            {mergedUrls.length < MAX_IMAGES && (
              <>
                <div {...getRootProps()} className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition
                  ${isDragActive ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-green-400 hover:bg-green-50'}`}>
                  <input {...getInputProps()} />
                  <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center">
                    <FaCloudUploadAlt className="text-green-500 text-xl" />
                  </div>
                  <p className="text-base font-semibold text-slate-700">{isDragActive ? 'Drop here!' : 'Add more photos'}</p>
                  <p className="text-sm text-slate-400">PNG, JPG, WEBP · {mergedUrls.length}/{MAX_IMAGES} used</p>
                </div>

                {newImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">New Photos</p>
                    <div className="grid grid-cols-3 gap-2">
                      {newImages.map((img, i) => {
                        const globalIdx = existingUrls.length + i
                        const isCover   = coverIndex === globalIdx
                        return (
                          <div key={i} onClick={() => setCoverIndex(globalIdx)}
                            className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition
                              ${isCover ? 'border-green-500 shadow-md col-span-3 h-40' : 'border-slate-200 hover:border-green-300 h-20'}`}>
                            <img src={img.preview} alt={`new-${i}`} className="w-full h-full object-cover" />
                            {isCover && (
                              <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <FaStar className="text-yellow-300 text-[10px]" /> Cover
                              </span>
                            )}
                            {!isCover && (
                              <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition text-white text-sm font-semibold">
                                Set Cover
                              </span>
                            )}
                            {uploadProgress[i] !== undefined && uploadProgress[i] < 100 && uploading && (
                              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
                                <div className="h-full bg-green-400 transition-all duration-200" style={{ width: `${uploadProgress[i]}%` }} />
                              </div>
                            )}
                            {uploadProgress[i] === 100 && (
                              <span className="absolute bottom-1.5 right-1.5 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                <FaCheckCircle className="text-[10px]" />
                              </span>
                            )}
                            <button type="button" onClick={e => { e.stopPropagation(); handleRemoveNew(i) }}
                              disabled={uploading}
                              className="absolute top-1.5 right-1.5 bg-white/80 hover:bg-red-500 hover:text-white text-slate-600 rounded-full w-6 h-6 flex items-center justify-center shadow transition disabled:opacity-50">
                              <FaTrash className="text-[10px]" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {newImages.length > 0 && (
                  <div className="mt-4">
                    {uploading && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-slate-500 mb-1">
                          <span>Uploading {newImages.length} image{newImages.length > 1 ? 's' : ''}…</span>
                          <span>{Math.round(Object.values(uploadProgress).reduce((a, b) => a + b, 0) / newImages.length)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full transition-all duration-300"
                            style={{ width: `${Math.round(Object.values(uploadProgress).reduce((a, b) => a + b, 0) / newImages.length)}%` }} />
                        </div>
                      </div>
                    )}
                    <button type="button" onClick={handleImageSubmit}
                      disabled={uploading || allNewUploaded}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-semibold text-base shadow-sm hover:shadow-md transition">
                      <FaCloudUploadAlt />
                      {uploading ? 'Uploading…' : allNewUploaded ? 'All Uploaded ✓' : `Upload ${newImages.length} New Image${newImages.length > 1 ? 's' : ''}`}
                    </button>
                  </div>
                )}
              </>
            )}

            {mergedUrls.length >= MAX_IMAGES && (
              <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                Maximum {MAX_IMAGES} images reached. Remove one above to add more.
              </p>
            )}

            {uploadMsg.text && (
              <div className={`mt-3 flex items-start gap-2 text-sm rounded-xl p-3 border
                ${uploadMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                {uploadMsg.type === 'success'
                  ? <FaCheckCircle className="mt-0.5 shrink-0 text-green-500" />
                  : <FaExclamationCircle className="mt-0.5 shrink-0 text-red-400" />}
                <span>{uploadMsg.text}</span>
              </div>
            )}
          </section>

          {/* ── Floor Plan ─────────────────────────────────────────────────── */}
          <section className={sectionCls}>
            <h2 className={h2Cls}>
              <FaFileAlt className="text-green-400" /> Floor Plan
              <span className="ml-auto text-xs font-normal text-slate-400 normal-case tracking-normal">Optional</span>
            </h2>
            <p className="text-sm text-slate-400 mb-4">Upload an image or PDF of the floor plan. Max 10 MB.</p>

            {formData.floorPlan && !floorPlanFile && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Current Floor Plan</p>
                {formData.floorPlan.toLowerCase().includes('.pdf') ? (
                  <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 bg-slate-50">
                    <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                      <FaFilePdf className="text-red-500 text-lg" />
                    </div>
                    <p className="text-slate-600 text-sm flex-1 truncate font-medium">Floor Plan PDF</p>
                    <a href={formData.floorPlan} target="_blank" rel="noreferrer"
                      className="text-emerald-600 text-xs font-semibold hover:underline">View</a>
                  </div>
                ) : (
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <img src={formData.floorPlan} alt="Current floor plan" className="w-full max-h-40 object-contain bg-slate-50" />
                  </div>
                )}
                <button type="button" onClick={handleRemoveFloorPlan}
                  className="mt-2 w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-red-400 hover:bg-red-50 text-slate-500 hover:text-red-500 py-2 rounded-xl text-sm font-semibold transition">
                  <FaTrash className="text-xs" /> Remove Floor Plan
                </button>
              </div>
            )}

            {!formData.floorPlan && !floorPlanFile && (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition hover:border-green-400 hover:bg-green-50 border-slate-200">
                <input type="file" accept="image/*,application/pdf" onChange={handleFloorPlanChange} className="hidden" />
                <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center">
                  <FaFileAlt className="text-green-500 text-xl" />
                </div>
                <p className="text-base font-semibold text-slate-700">Click to choose file</p>
                <p className="text-sm text-slate-400">Image (PNG, JPG) or PDF</p>
              </label>
            )}

            {formData.floorPlan && !floorPlanFile && (
              <label className="flex items-center justify-center gap-2 border border-slate-200 hover:border-green-400 hover:bg-green-50 text-slate-600 hover:text-green-700 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition mt-2">
                <input type="file" accept="image/*,application/pdf" onChange={handleFloorPlanChange} className="hidden" />
                Replace Floor Plan
              </label>
            )}

            {floorPlanFile && floorPlanIsImage && floorPlanPreview && !floorPlanUploaded && (
              <div className="rounded-xl overflow-hidden border border-slate-200 mb-3">
                <img src={floorPlanPreview} alt="Floor plan preview" className="w-full max-h-48 object-contain bg-slate-50" />
              </div>
            )}

            {floorPlanFile && floorPlanIsPDF && !floorPlanUploaded && (
              <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 mb-3 bg-slate-50">
                <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                  <FaFilePdf className="text-red-500 text-lg" />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-700 font-semibold text-sm truncate">{floorPlanFile.name}</p>
                  <p className="text-slate-400 text-xs">{(floorPlanFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            )}

            {floorPlanFile && !floorPlanUploaded && (
              <div className="flex gap-2">
                <button type="button" onClick={handleFloorPlanUpload} disabled={floorPlanUploading}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-semibold text-sm transition">
                  <FaCloudUploadAlt />
                  {floorPlanUploading ? 'Uploading…' : 'Upload Floor Plan'}
                </button>
                <button type="button" onClick={handleRemoveFloorPlan}
                  className="w-10 h-10 flex items-center justify-center border border-slate-200 hover:border-red-400 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-xl transition"
                  aria-label="Remove floor plan">
                  <FaTrash className="text-sm" />
                </button>
              </div>
            )}

            {floorPlanMsg.text && (
              <div className={`mt-3 flex items-start gap-2 text-sm rounded-xl p-3 border
                ${floorPlanMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                {floorPlanMsg.type === 'success'
                  ? <FaCheckCircle className="mt-0.5 shrink-0 text-green-500" />
                  : <FaExclamationCircle className="mt-0.5 shrink-0 text-red-400" />}
                <span>{floorPlanMsg.text}</span>
              </div>
            )}
          </section>

          {/* Submit */}
          <section className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-lg p-6 text-white">
            <h2 className="font-bold text-xl mb-1">Save changes?</h2>
            <p className="text-green-200 text-base mb-5">
              {newImages.length > 0 && !allNewUploaded
                ? 'Upload your new photos first, then save.'
                : 'All set — update the listing when ready.'}
            </p>
            <button type="submit"
              disabled={loading || uploading || (newImages.length > 0 && !allNewUploaded)}
              className="w-full flex items-center justify-center gap-2 bg-white text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed py-3 px-4 rounded-xl font-bold text-base shadow hover:shadow-md transition">
              <FaSave />
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
            {submitError && (
              <div className="mt-4 flex items-start gap-2 bg-white/10 border border-white/20 text-white text-sm rounded-xl p-3">
                <FaExclamationCircle className="mt-0.5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
          </section>

          {/* Tips */}
          <section className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-3">💡 Tips</h3>
            <ul className="text-sm text-amber-700 space-y-2 list-disc list-inside leading-relaxed">
              <li>Remove outdated photos and add fresh ones for better responses.</li>
              <li>Update the description if the property condition has changed.</li>
              <li>Adjust pricing to stay competitive with similar listings.</li>
              <li>A floor plan helps buyers understand the layout before visiting.</li>
            </ul>
          </section>

        </div>
      </form>
    </main>
  )
}
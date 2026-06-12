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
  FaSave,
} from 'react-icons/fa'
import { storage } from '../appwrite'
import { ID } from 'appwrite'

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

export default function UpdateListing() {
  const navigate    = useNavigate()
  const params      = useParams()
  const { currentUser } = useSelector(state => state.user)

  // ── fetch state ───────────────────────────────────────────────────────────────
  const [fetchLoading, setFetchLoading] = useState(true)
  const [fetchError,   setFetchError]   = useState('')

  // ── existing images (already in DB as URLs) ───────────────────────────────────
  // These are the URLs already stored in the listing. User can remove them.
  const [existingUrls, setExistingUrls] = useState([])   // string[]
  const [coverIndex,   setCoverIndex]   = useState(0)    // index over the FINAL merged array

  // ── new images (dropped by user, not yet uploaded) ────────────────────────────
  const [newImages,        setNewImages]        = useState([])   // File[]
  const [uploadProgress,   setUploadProgress]   = useState({})   // { [idx]: 0–100 }
  const [newUploadedUrls,  setNewUploadedUrls]  = useState([])   // URLs from Appwrite after upload
  const [uploading,        setUploading]        = useState(false)
  const [uploadMsg,        setUploadMsg]        = useState({ type: '', text: '' })

  // ── form / submit ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: '', description: '', address: '',
    type: '', parking: false, furnished: false, offer: false,
    bedrooms: 1, bathrooms: 1, regularPrice: 0, discountPrice: 0, imageUrls: [],
    squareFootage: '', halls: '', kitchen: '',
    swimmingPool: false, playArea: false, gym: false,
    garden: false, security: false, wifi: false, powerBackup: false,
    suitableFor: '',
  })
  const [loading,      setLoading]      = useState(false)
  const [submitError,  setSubmitError]  = useState('')

  // ── derived ───────────────────────────────────────────────────────────────────
  const isRent   = formData.type === 'rent'
  const hasOffer = formData.offer

  const discountPct = (() => {
    const reg  = Number(formData.regularPrice)
    const disc = Number(formData.discountPrice)
    if (!hasOffer || reg <= 0 || disc <= 0 || disc >= reg) return 0
    return Math.round(((reg - disc) / reg) * 100)
  })()

  // New images are "all uploaded" when every dropped file has a returned URL
  const allNewUploaded = newImages.length === 0 || newUploadedUrls.length === newImages.length

  // Final merged URL list shown to user and sent on submit:
  // existing (minus removed) + newly uploaded
  const mergedUrls = [...existingUrls, ...newUploadedUrls]

  // ── fetch listing on mount ────────────────────────────────────────────────────
  // GET /api/listing/get/:listingId  →  listing.controller.js → getListing
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
        // Populate form with existing data
        setFormData({
          name:          data.name          ?? '',
          description:   data.description   ?? '',
          address:       data.address       ?? '',
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
        })
        setExistingUrls(data.imageUrls ?? [])
      } catch (err) {
        setFetchError('Could not reach the server. Please try again.')
      } finally {
        setFetchLoading(false)
      }
    }
    fetchListing()
  }, [params.listingId])

  // ── handlers ──────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { id, type, value, checked } = e.target
    const val = type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    setFormData(p => ({ ...p, [id]: val }))
  }

  const setType = (type) => setFormData(p => ({ ...p, type }))

  // Remove an existing (already-saved) image URL
  const handleRemoveExisting = (idx) => {
    setExistingUrls(p => p.filter((_, i) => i !== idx))
    // Adjust coverIndex if needed
    if (coverIndex > 0 && coverIndex >= idx) setCoverIndex(c => c - 1)
  }

  // Remove a newly dropped (not-yet / already uploaded) image
  const handleRemoveNew = (idx) => {
    setUploadMsg({ type: '', text: '' })
    URL.revokeObjectURL(newImages[idx].preview)
    setNewImages(p => p.filter((_, i) => i !== idx))
    setUploadProgress(p => { const n = { ...p }; delete n[idx]; return n })
    // Also remove the corresponding uploaded URL if it exists
    setNewUploadedUrls(p => p.filter((_, i) => i !== idx))
    // Adjust coverIndex: cover is over mergedUrls so offset by existingUrls.length
    const globalIdx = existingUrls.length + idx
    if (coverIndex > 0 && coverIndex >= globalIdx) setCoverIndex(c => c - 1)
  }

  // ── Dropzone ──────────────────────────────────────────────────────────────────
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
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  })

  // ── Upload new images ─────────────────────────────────────────────────────────
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

  // ── Submit ────────────────────────────────────────────────────────────────────
  // POST /api/listing/update/:listingId  →  listing.controller.js → updateListing
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (!formData.type)
      return setSubmitError('Please select whether the property is For Sale or For Rent.')
    if (mergedUrls.length === 0)
      return setSubmitError('Please keep or upload at least one image.')
    if (newImages.length > 0 && !allNewUploaded)
      return setSubmitError('You have unuploaded images. Click "Upload Images" before saving.')
    if (hasOffer && Number(formData.discountPrice) >= Number(formData.regularPrice))
      return setSubmitError('Discounted price must be lower than the regular price.')

    // Reorder so cover is first
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

  // ── shared classes (identical to CreateListing) ───────────────────────────────
  const inputCls   = 'w-full border border-slate-200 bg-slate-50 rounded-xl py-3 px-4 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition'
  const sectionCls = 'bg-white rounded-2xl shadow-sm border border-slate-200 p-6'
  const h2Cls      = 'text-sm font-semibold text-green-600 uppercase tracking-widest mb-5 flex items-center gap-2'
  const labelCls   = 'block text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1.5'

  // ── Amenity + suitable data (identical to CreateListing) ─────────────────────
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

  // ── Loading / error screen ────────────────────────────────────────────────────
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

  if (fetchError) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 max-w-md w-full text-center">
          <FaExclamationCircle className="text-red-400 text-4xl mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-2">Couldn't load listing</h2>
          <p className="text-slate-500 text-sm mb-5">{fetchError}</p>
          <button onClick={() => navigate(-1)}
            className="bg-green-600 hover:bg-green-700 text-white py-2.5 px-6 rounded-xl font-semibold text-sm transition">
            Go Back
          </button>
        </div>
      </main>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────────
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
                  placeholder="123 Main Street, City, State" className={inputCls} />
              </div>
            </div>
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

            {/* Optional space fields */}
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
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-6">

          {/* Photos */}
          <section className={sectionCls}>
            <h2 className={h2Cls}><FaCloudUploadAlt className="text-green-400" /> Photos</h2>
            <p className="text-sm text-slate-400 mb-4">
              Max {MAX_IMAGES} total · Max {MAX_SIZE_MB} MB each · Click any thumbnail to set as cover
            </p>

            {/* ── Existing images from DB ── */}
            {existingUrls.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Current Photos</p>
                <div className="grid grid-cols-3 gap-2">
                  {existingUrls.map((url, i) => {
                    const globalIdx = i   // existing come first in mergedUrls
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

            {/* ── Dropzone for new images ── */}
            {mergedUrls.length < MAX_IMAGES && (
              <>
                <div {...getRootProps()} className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition
                  ${isDragActive ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-green-400 hover:bg-green-50'}`}>
                  <input {...getInputProps()} />
                  <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center">
                    <FaCloudUploadAlt className="text-green-500 text-xl" />
                  </div>
                  <p className="text-base font-semibold text-slate-700">{isDragActive ? 'Drop here!' : 'Add more photos'}</p>
                  <p className="text-sm text-slate-400">
                    PNG, JPG, WEBP · {mergedUrls.length}/{MAX_IMAGES} used
                  </p>
                </div>

                {/* New image thumbnails */}
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
                            {/* Per-image progress bar */}
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

                {/* Upload new images button */}
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

            {/* Max reached notice */}
            {mergedUrls.length >= MAX_IMAGES && (
              <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                Maximum {MAX_IMAGES} images reached. Remove one above to add more.
              </p>
            )}

            {/* Upload message */}
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
            </ul>
          </section>

        </div>
      </form>
    </main>
  )
}






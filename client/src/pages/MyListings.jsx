import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
  FaBed, FaBath, FaCar, FaCouch, FaTag, FaPercent, FaMapMarkerAlt,
  FaPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaHome,
  FaList, FaSwimmingPool, FaDumbbell, FaChild, FaTree, FaShieldAlt,
  FaWifi, FaBolt, FaRulerCombined, FaUserFriends, FaUser,
} from 'react-icons/fa'

// ── Rupee formatter (matches CreateListing) ───────────────────────────────────
const formatINR = (n) => n ? `₹${new Intl.NumberFormat('en-IN').format(n)}` : '₹0'

// ── Shared API calls (frontend mirror of listing.controller.js) ───────────────
const apiDeleteListing = (id) =>
  fetch(`/api/listing/delete/${id}`, { method: 'DELETE', credentials: 'include' }).then(r => r.json())

const apiUpdateListing = (id, body) =>
  fetch(`/api/listing/update/${id}`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => r.json())

// ── Small reusable components ─────────────────────────────────────────────────
const Badge = ({ on, label, Icon }) => on ? (
  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-green-50 border-green-200 text-green-700">
    {Icon && <Icon className="text-green-500" />} {label}
  </span>
) : null

const SuitableBadge = ({ value }) => {
  const map = {
    family:   { Icon: FaHome,        label: 'Family Friendly',   cls: 'bg-blue-50 border-blue-200 text-blue-700'     },
    couple:   { Icon: FaUserFriends, label: 'Couple Friendly',   cls: 'bg-pink-50 border-pink-200 text-pink-700'     },
    bachelor: { Icon: FaUser,        label: 'Bachelor Friendly', cls: 'bg-amber-50 border-amber-200 text-amber-700'  },
    any:      { Icon: FaUserFriends, label: 'Open to All',       cls: 'bg-slate-50 border-slate-200 text-slate-600'  },
  }
  const m = map[value] || map.any
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${m.cls}`}>
      <m.Icon /> {m.label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function MyListings() {
  const { currentUser } = useSelector(state => state.user)
  const navigate        = useNavigate()

  const [listings,  setListings]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [activeImg, setActiveImg] = useState({})
  const [deleting,  setDeleting]  = useState(null)

  useEffect(() => {
    fetch(`/api/user/listings/${currentUser._id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => data.success === false ? setError(data.message) : setListings(data))
      .catch(() => setError('Failed to load listings.'))
      .finally(() => setLoading(false))
  }, [currentUser._id])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return
    setDeleting(id); setError('')
    const data = await apiDeleteListing(id).catch(() => ({ success: false, message: 'Failed to delete.' }))
    if (data.success === false) setError(data.message)
    else setListings(prev => prev.filter(l => l._id !== id))
    setDeleting(null)
  }

  const handleEdit = (id) => navigate(`/update-listing/${id}`)

  const imgIdx  = (id)      => activeImg[id] ?? 0
  const setImg  = (id, i)   => setActiveImg(p => ({ ...p, [id]: i }))

  // FIX: prevImg/nextImg now receive validUrls length instead of raw listing.imageUrls
  const prevImg = (e, id, len) => { e.preventDefault(); setImg(id, imgIdx(id) === 0 ? len - 1 : imgIdx(id) - 1) }
  const nextImg = (e, id, len) => { e.preventDefault(); setImg(id, imgIdx(id) === len - 1 ? 0 : imgIdx(id) + 1) }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-10 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-md">
            <FaList className="text-xl" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight">My Listings</h1>
            <p className="text-slate-500 text-sm mt-0.5">{listings.length} propert{listings.length === 1 ? 'y' : 'ies'} listed</p>
          </div>
        </div>
        <Link to="/create-listing"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition">
          <FaPlus /> New Listing
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-4 py-20 text-slate-400">
          <svg className="animate-spin h-10 w-10 text-green-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-lg font-medium">Loading your listings…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-5xl mx-auto bg-red-50 border border-red-200 text-red-600 rounded-2xl p-5 mb-6">{error}</div>
      )}

      {/* Empty state */}
      {!loading && !error && listings.length === 0 && (
        <div className="max-w-5xl mx-auto flex flex-col items-center py-24 text-center gap-5">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <FaHome className="text-4xl text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-700">No listings yet</h2>
          <p className="text-slate-400 max-w-xs">You haven't created any property listings. Start by adding your first one.</p>
          <Link to="/create-listing"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow transition">
            <FaPlus /> Create your first listing
          </Link>
        </div>
      )}

      {/* Cards */}
      {!loading && listings.length > 0 && (
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          {listings.map(listing => {
            // FIX 1: strip null/undefined/empty entries so broken Appwrite URLs
            //        never reach <img src> or affect gallery length counts
            const validUrls = (listing.imageUrls || []).filter(Boolean)

            const idx      = imgIdx(listing._id)
            const hasOffer = listing.offer && listing.discountPrice < listing.regularPrice
            const savings  = hasOffer ? listing.regularPrice - listing.discountPrice : 0
            const isRent   = listing.type === 'rent'
            const price    = hasOffer ? listing.discountPrice : listing.regularPrice

            return (
              <article key={listing._id}
                className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">

                {/* Image gallery */}
                <div className="relative w-full h-72 sm:h-96 bg-slate-100 overflow-hidden group">
                  {/* FIX 2: gate on validUrls, not listing.imageUrls */}
                  {validUrls.length > 0 ? (
                    <>
                      <img
                        src={validUrls[idx] || validUrls[0]}
                        alt={`${listing.name} photo ${idx + 1}`}
                        className="w-full h-full object-cover transition-all duration-500"
                        // FIX 3: null-guard + remove handler after first fire to prevent infinite loop
                        onError={e => {
                          e.currentTarget.onerror = null
                          if (validUrls[0]) e.currentTarget.src = validUrls[0]
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {/* FIX 4: pass listing._id + validUrls.length to prevImg/nextImg instead of raw listing */}
                      {validUrls.length > 1 && <>
                        <button onClick={e => prevImg(e, listing._id, validUrls.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition opacity-0 group-hover:opacity-100">
                          <FaChevronLeft className="text-slate-700" />
                        </button>
                        <button onClick={e => nextImg(e, listing._id, validUrls.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition opacity-0 group-hover:opacity-100">
                          <FaChevronRight className="text-slate-700" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {/* FIX 5: map over validUrls for dots, not listing.imageUrls */}
                          {validUrls.map((_, i) => (
                            <button key={i} onClick={e => { e.preventDefault(); setImg(listing._id, i) }}
                              className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-white w-5' : 'bg-white/50'}`} />
                          ))}
                        </div>
                      </>}

                      {/* FIX 6: counter uses validUrls.length */}
                      <span className="absolute top-4 right-4 bg-black/50 text-white text-sm font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                        {idx + 1} / {validUrls.length}
                      </span>
                      <span className={`absolute top-4 left-4 flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full shadow
                        ${isRent ? 'bg-violet-600 text-white' : 'bg-green-600 text-white'}`}>
                        <FaTag className="text-xs" /> {isRent ? 'For Rent' : 'For Sale'}
                      </span>
                      {hasOffer && (
                        <span className="absolute bottom-10 left-4 bg-rose-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
                          🏷 Save {formatINR(savings)}
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <FaHome className="text-6xl" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8">

                  {/* Title + address */}
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-snug mb-1">{listing.name}</h2>
                  <p className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
                    <FaMapMarkerAlt className="text-green-500 shrink-0" /> {listing.address}
                  </p>

                  {/* Description */}
                  <p className="text-slate-600 leading-relaxed mb-5 line-clamp-2">{listing.description}</p>

                  {/* Pricing */}
                  <div className="flex items-end gap-4 mb-5 flex-wrap">
                    <div>
                      {hasOffer && (
                        <p className="text-slate-400 text-sm line-through">{formatINR(listing.regularPrice)}{isRent ? '/mo' : ''}</p>
                      )}
                      <p className="text-3xl font-extrabold text-green-600">
                        {formatINR(price)}
                        <span className="text-base font-semibold text-slate-400 ml-1">{isRent ? '/ mo' : ''}</span>
                      </p>
                    </div>
                    {hasOffer && (
                      <span className="mb-1 text-xs font-bold text-white bg-rose-500 px-3 py-1 rounded-full">
                        {Math.round(savings / listing.regularPrice * 100)}% OFF
                      </span>
                    )}
                  </div>

                  {/* Room + space stats */}
                  <div className="flex flex-wrap gap-4 mb-5 text-sm font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5"><FaBed  className="text-green-500" /> {listing.bedrooms} Bed{listing.bedrooms !== 1 ? 's' : ''}</span>
                    <span className="flex items-center gap-1.5"><FaBath className="text-violet-400" /> {listing.bathrooms} Bath{listing.bathrooms !== 1 ? 's' : ''}</span>
                    {listing.squareFootage > 0 && (
                      <span className="flex items-center gap-1.5"><FaRulerCombined className="text-slate-400" /> {listing.squareFootage.toLocaleString('en-IN')} sq ft</span>
                    )}
                  </div>

                  {/* Amenity badges — only truthy ones render */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <Badge on={listing.parking}     label="Parking"       Icon={FaCar}          />
                    <Badge on={listing.furnished}    label="Furnished"     Icon={FaCouch}        />
                    <Badge on={listing.swimmingPool} label="Pool"          Icon={FaSwimmingPool} />
                    <Badge on={listing.gym}          label="Gym"           Icon={FaDumbbell}     />
                    <Badge on={listing.playArea}     label="Play Area"     Icon={FaChild}        />
                    <Badge on={listing.garden}       label="Garden"        Icon={FaTree}         />
                    <Badge on={listing.security}     label="24/7 Security" Icon={FaShieldAlt}    />
                    <Badge on={listing.wifi}         label="Wi-Fi"         Icon={FaWifi}         />
                    <Badge on={listing.powerBackup}  label="Power Backup"  Icon={FaBolt}         />
                    <Badge on={listing.offer}        label="Special Offer" Icon={FaPercent}      />
                    {listing.suitableFor && <SuitableBadge value={listing.suitableFor} />}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 flex-wrap border-t border-slate-100 pt-5">
                    <button type="button" onClick={() => handleEdit(listing._id)}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition">
                      <FaEdit /> Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(listing._id)} disabled={deleting === listing._id}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition">
                      <FaTrash /> {deleting === listing._id ? 'Deleting…' : 'Delete'}
                    </button>
                    <Link to={`/listing/${listing._id}`}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition ml-auto">
                      View Listing →
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  FaHome, FaClipboardCheck, FaCommentDots, FaCheckCircle, FaTimesCircle,
  FaTrash, FaMapMarkerAlt, FaBed, FaBath, FaStar, FaExclamationCircle,
  FaSpinner, FaInbox, FaShieldAlt, FaGlobe, FaHourglassHalf,
  FaArrowLeft, FaCity, FaFlag, FaExternalLinkAlt,
} from 'react-icons/fa'

// ── Rupee short-format, same convention as Home.jsx ────────────────────────
const toShortINR = (n) => {
  if (!n) return '—'
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)}L`
  if (n >= 1_000)      return `₹${(n / 1_000).toFixed(0)}K`
  return `₹${n}`
}

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5 text-amber-400 text-sm">
      {[...Array(5)].map((_, i) => (
        <FaStar key={i} className={i < rating ? '' : 'text-slate-200'} />
      ))}
    </div>
  )
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="text-center py-16 text-slate-400">
      <Icon className="text-5xl mb-4 block mx-auto text-slate-200" />
      <p className="text-base font-medium">{text}</p>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse h-40" />
  )
}

// ── Listing card — mode: 'pending' shows approve/reject/delete,
//    mode: 'live' shows only delete ───────────────────────────────────────
function AdminListingCard({ listing, mode, onApprove, onReject, onDelete, busyId }) {
  const busy = busyId === listing._id
  const isRent = listing.type === 'rent'
  const cover = listing.imageUrls?.[0]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col sm:flex-row">
      <div className="sm:w-52 h-44 sm:h-auto shrink-0 bg-slate-100 relative">
        {cover ? (
          <img src={cover} alt={listing.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaHome className="text-slate-300 text-3xl" />
          </div>
        )}
        <span className={`absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${isRent ? 'bg-green-900 text-white' : 'bg-green-600 text-white'}`}>
          {isRent ? 'For Rent' : 'For Sale'}
        </span>
        {mode === 'live' && (
          <span className="absolute top-2 right-2 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm bg-white/90 text-green-700 flex items-center gap-1">
            <FaGlobe className="text-[10px]" /> Live
          </span>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-bold text-slate-900 text-lg leading-snug">{listing.name}</h3>
        </div>

        <p className="flex items-center gap-1.5 text-slate-500 text-sm mb-2.5 truncate">
          <FaMapMarkerAlt className="text-green-600 shrink-0" />
          {listing.address}
        </p>

        <div className="flex items-center gap-2 mb-3.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full">
            <FaCity className="text-[11px]" /> {listing.city || 'No city'}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
            <FaFlag className="text-[11px]" /> {listing.state || 'No state'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
          <span className="flex items-center gap-1.5"><FaBed className="text-green-600" /> {listing.bedrooms}</span>
          <span className="flex items-center gap-1.5"><FaBath className="text-green-600" /> {listing.bathrooms}</span>
          <span className="font-bold text-green-700">
            {toShortINR(listing.offer ? listing.discountPrice : listing.regularPrice)}
            {isRent ? '/mo' : ''}
          </span>
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          <Link
            to={`/listing/${listing._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            <FaExternalLinkAlt className="text-xs" /> Go to Listing
          </Link>
          {mode === 'pending' && (
            <>
              <button
                onClick={() => onApprove(listing._id)}
                disabled={busy}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
              >
                {busy ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Approve
              </button>
              <button
                onClick={() => onReject(listing._id)}
                disabled={busy}
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-700 border border-amber-200 text-sm font-semibold px-4 py-2 rounded-lg transition"
              >
                <FaTimesCircle /> Reject
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(listing._id)}
            disabled={busy}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 border border-red-200 text-sm font-semibold px-4 py-2 rounded-lg transition ml-auto"
          >
            {busy ? <FaSpinner className="animate-spin" /> : <FaTrash />} {mode === 'live' ? 'Remove' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Review card — mode: 'pending' shows approve/delete,
//    mode: 'live' shows only delete ───────────────────────────────────────
function AdminReviewCard({ review, mode, onApprove, onDelete, busyId }) {
  const busy = busyId === review._id

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <StarRow rating={review.rating} />
        <div className="flex items-center gap-2">
          {mode === 'live' && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 flex items-center gap-1">
              <FaGlobe className="text-[10px]" /> Live
            </span>
          )}
          <span className="text-xs text-slate-400 font-medium">
            {review.isAnonymous ? 'Anonymous' : review.name || 'User'}
          </span>
        </div>
      </div>

      <p className="text-slate-700 text-base leading-relaxed mb-4 flex-1">"{review.quote}"</p>

      {review.role && (
        <p className="text-sm text-slate-400 mb-4">{review.role}</p>
      )}

      <div className="flex gap-2 mt-auto pt-3 border-t border-slate-100">
        {mode === 'pending' && (
          <button
            onClick={() => onApprove(review._id)}
            disabled={busy}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            {busy ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Approve
          </button>
        )}
        <button
          onClick={() => onDelete(review._id)}
          disabled={busy}
          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 border border-red-200 text-sm font-semibold px-4 py-2 rounded-lg transition ml-auto"
        >
          {busy ? <FaSpinner className="animate-spin" /> : <FaTrash />} {mode === 'live' ? 'Remove' : 'Trash'}
        </button>
      </div>
    </div>
  )
}

// ── Main dashboard ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState('listings')       // 'listings' | 'reviews'
  const [listingsView, setListingsView] = useState('pending') // 'pending' | 'live'
  const [reviewsView, setReviewsView]   = useState('pending') // 'pending' | 'live'

  const [pendingListings, setPendingListings] = useState([])
  const [liveListings, setLiveListings]       = useState([])
  const [pendingLoading, setPendingLoading]   = useState(true)
  const [liveLoading, setLiveLoading]         = useState(true)

  const [pendingReviews, setPendingReviews] = useState([])
  const [liveReviews, setLiveReviews]       = useState([])
  const [pendingRevLoading, setPendingRevLoading] = useState(true)
  const [liveRevLoading, setLiveRevLoading]       = useState(true)

  const [busyId, setBusyId] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  const fetchPendingListings = useCallback(async () => {
    setPendingLoading(true)
    try {
      const res = await fetch('/api/admin/listings/pending', { credentials: 'include' })
      const data = await res.json()
      setPendingListings(Array.isArray(data) ? data : [])
    } catch {
      setMessage({ type: 'error', text: 'Could not load pending listings.' })
    } finally {
      setPendingLoading(false)
    }
  }, [])

  const fetchLiveListings = useCallback(async () => {
    setLiveLoading(true)
    try {
      const res = await fetch('/api/admin/listings/approved', { credentials: 'include' })
      const data = await res.json()
      setLiveListings(Array.isArray(data) ? data : [])
    } catch {
      setMessage({ type: 'error', text: 'Could not load live listings.' })
    } finally {
      setLiveLoading(false)
    }
  }, [])

  const fetchPendingReviews = useCallback(async () => {
    setPendingRevLoading(true)
    try {
      const res = await fetch('/api/admin/reviews/pending', { credentials: 'include' })
      const data = await res.json()
      setPendingReviews(Array.isArray(data) ? data : [])
    } catch {
      setMessage({ type: 'error', text: 'Could not load pending reviews.' })
    } finally {
      setPendingRevLoading(false)
    }
  }, [])

  const fetchLiveReviews = useCallback(async () => {
    setLiveRevLoading(true)
    try {
      const res = await fetch('/api/admin/reviews/approved', { credentials: 'include' })
      const data = await res.json()
      setLiveReviews(Array.isArray(data) ? data : [])
    } catch {
      setMessage({ type: 'error', text: 'Could not load live reviews.' })
    } finally {
      setLiveRevLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPendingListings()
    fetchLiveListings()
    fetchPendingReviews()
    fetchLiveReviews()
  }, [fetchPendingListings, fetchLiveListings, fetchPendingReviews, fetchLiveReviews])

  // ── Listing actions ────────────────────────────────────────────────────
  const handleApproveListing = async (id) => {
    setBusyId(id)
    setMessage({ type: '', text: '' })
    try {
      const res = await fetch(`/api/admin/listings/${id}/approve`, { method: 'PATCH', credentials: 'include' })
      if (!res.ok) throw new Error()
      setPendingListings(prev => prev.filter(l => l._id !== id))
      fetchLiveListings()
      setMessage({ type: 'success', text: 'Listing approved and is now live.' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to approve listing.' })
    } finally {
      setBusyId(null)
    }
  }

  const handleRejectListing = async (id) => {
    setBusyId(id)
    setMessage({ type: '', text: '' })
    try {
      const res = await fetch(`/api/admin/listings/${id}/reject`, { method: 'PATCH', credentials: 'include' })
      if (!res.ok) throw new Error()
      setPendingListings(prev => prev.filter(l => l._id !== id))
      setMessage({ type: 'success', text: 'Listing rejected.' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to reject listing.' })
    } finally {
      setBusyId(null)
    }
  }

  const handleDeleteListing = async (id, fromLive) => {
    if (!window.confirm('Permanently delete this listing? This cannot be undone.')) return
    setBusyId(id)
    setMessage({ type: '', text: '' })
    try {
      const res = await fetch(`/api/admin/listings/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error()
      if (fromLive) setLiveListings(prev => prev.filter(l => l._id !== id))
      else setPendingListings(prev => prev.filter(l => l._id !== id))
      setMessage({ type: 'success', text: 'Listing removed.' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete listing.' })
    } finally {
      setBusyId(null)
    }
  }

  // ── Review actions ─────────────────────────────────────────────────────
  const handleApproveReview = async (id) => {
    setBusyId(id)
    setMessage({ type: '', text: '' })
    try {
      const res = await fetch(`/api/admin/reviews/${id}/approve`, { method: 'PATCH', credentials: 'include' })
      if (!res.ok) throw new Error()
      setPendingReviews(prev => prev.filter(r => r._id !== id))
      fetchLiveReviews()
      setMessage({ type: 'success', text: 'Review approved and is now live.' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to approve review.' })
    } finally {
      setBusyId(null)
    }
  }

  const handleDeleteReview = async (id, fromLive) => {
    if (!window.confirm('Permanently delete this review?')) return
    setBusyId(id)
    setMessage({ type: '', text: '' })
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error()
      if (fromLive) setLiveReviews(prev => prev.filter(r => r._id !== id))
      else setPendingReviews(prev => prev.filter(r => r._id !== id))
      setMessage({ type: 'success', text: 'Review removed.' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete review.' })
    } finally {
      setBusyId(null)
    }
  }

  const mainTabs = [
    { id: 'listings', label: 'Listings', Icon: FaClipboardCheck },
    { id: 'reviews',  label: 'Reviews',  Icon: FaCommentDots    },
  ]

  const SubTabs = ({ view, setView, pendingCount, liveCount, pendingLoad, liveLoad }) => (
    <div className="flex gap-2 mb-5">
      {[
        { id: 'pending', label: 'Pending', Icon: FaHourglassHalf, count: pendingCount, loading: pendingLoad },
        { id: 'live',    label: 'Live',    Icon: FaGlobe,         count: liveCount,    loading: liveLoad    },
      ].map(({ id, label, Icon, count, loading }) => (
        <button
          key={id}
          onClick={() => setView(id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition
            ${view === id ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-green-300'}`}
        >
          <Icon className="text-xs" />
          {label}
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${view === id ? 'bg-white/20' : 'bg-slate-100'}`}>
            {loading ? '…' : count}
          </span>
        </button>
      ))}
    </div>
  )

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Back to site */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-green-700 transition mb-6"
        >
          <FaArrowLeft className="text-xs" /> Back to Nestora
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-green-600 text-white w-11 h-11 rounded-xl flex items-center justify-center shadow-md">
            <FaShieldAlt className="text-lg" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Admin Dashboard</h1>
        </div>
        <p className="text-slate-500 pl-1 text-base mt-1 mb-8">
          Review new submissions and manage everything already published.
        </p>

        {/* Main tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {mainTabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition
                ${tab === id ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Icon /> {label}
            </button>
          ))}
        </div>

        {/* Message banner */}
        {message.text && (
          <div className={`mb-6 flex items-start gap-2 text-sm rounded-xl p-3 border
            ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
            {message.type === 'success' ? <FaCheckCircle className="mt-0.5 shrink-0" /> : <FaExclamationCircle className="mt-0.5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Listings tab */}
        {tab === 'listings' && (
          <>
            <SubTabs
              view={listingsView}
              setView={setListingsView}
              pendingCount={pendingListings.length}
              liveCount={liveListings.length}
              pendingLoad={pendingLoading}
              liveLoad={liveLoading}
            />

            <div className="flex flex-col gap-4">
              {listingsView === 'pending' && (
                <>
                  {pendingLoading && <><CardSkeleton /><CardSkeleton /></>}
                  {!pendingLoading && pendingListings.length === 0 && (
                    <EmptyState icon={FaInbox} text="No listings waiting for approval." />
                  )}
                  {!pendingLoading && pendingListings.map(listing => (
                    <AdminListingCard
                      key={listing._id}
                      listing={listing}
                      mode="pending"
                      onApprove={handleApproveListing}
                      onReject={handleRejectListing}
                      onDelete={(id) => handleDeleteListing(id, false)}
                      busyId={busyId}
                    />
                  ))}
                </>
              )}

              {listingsView === 'live' && (
                <>
                  {liveLoading && <><CardSkeleton /><CardSkeleton /></>}
                  {!liveLoading && liveListings.length === 0 && (
                    <EmptyState icon={FaGlobe} text="No live listings yet." />
                  )}
                  {!liveLoading && liveListings.map(listing => (
                    <AdminListingCard
                      key={listing._id}
                      listing={listing}
                      mode="live"
                      onDelete={(id) => handleDeleteListing(id, true)}
                      busyId={busyId}
                    />
                  ))}
                </>
              )}
            </div>
          </>
        )}

        {/* Reviews tab */}
        {tab === 'reviews' && (
          <>
            <SubTabs
              view={reviewsView}
              setView={setReviewsView}
              pendingCount={pendingReviews.length}
              liveCount={liveReviews.length}
              pendingLoad={pendingRevLoading}
              liveLoad={liveRevLoading}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviewsView === 'pending' && (
                <>
                  {pendingRevLoading && <><CardSkeleton /><CardSkeleton /></>}
                  {!pendingRevLoading && pendingReviews.length === 0 && (
                    <div className="sm:col-span-2"><EmptyState icon={FaInbox} text="No reviews waiting for approval." /></div>
                  )}
                  {!pendingRevLoading && pendingReviews.map(review => (
                    <AdminReviewCard
                      key={review._id}
                      review={review}
                      mode="pending"
                      onApprove={handleApproveReview}
                      onDelete={(id) => handleDeleteReview(id, false)}
                      busyId={busyId}
                    />
                  ))}
                </>
              )}

              {reviewsView === 'live' && (
                <>
                  {liveRevLoading && <><CardSkeleton /><CardSkeleton /></>}
                  {!liveRevLoading && liveReviews.length === 0 && (
                    <div className="sm:col-span-2"><EmptyState icon={FaGlobe} text="No live reviews yet." /></div>
                  )}
                  {!liveRevLoading && liveReviews.map(review => (
                    <AdminReviewCard
                      key={review._id}
                      review={review}
                      mode="live"
                      onDelete={(id) => handleDeleteReview(id, true)}
                      busyId={busyId}
                    />
                  ))}
                </>
              )}
            </div>
          </>
        )}

      </div>
    </main>
  )
}
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Font Awesome — add this to your index.html <head> if not already there:
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function FadeUp({ children, delay = 0 }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(22px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Rupee formatter ──────────────────────────────────────────────────────────
const toShortINR = (n) => {
  if (!n) return "—";
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000)      return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n}`;
};

// ─── Eyebrow label (reused across sections) ───────────────────────────────────
function Eyebrow({ children }) {
  return (
    <div className="inline-flex items-center gap-2 text-green-800 text-sm font-bold uppercase tracking-widest mb-3">
      <span className="w-4 h-0.5 bg-green-700 rounded inline-block" />
      {children}
    </div>
  );
}

// ─── Star rating display (read-only) ─────────────────────────────────────────
function StarRow({ rating }) {
  return (
    <div className="flex gap-1 text-amber-400 text-sm mb-5">
      {[...Array(5)].map((_, i) => (
        <i key={i} className={`fa-solid fa-star ${i < rating ? "" : "text-slate-200"}`} />
      ))}
    </div>
  );
}

// ─── Listing card — mirrors Search.jsx ListingCard exactly ───────────────────
function ListingCard({ listing }) {
  const [imgIdx, setImgIdx] = useState(0);
  const images = listing.imageUrls || [];
  const isRent = listing.type === "rent";

  return (
    <Link
      to={`/listing/${listing._id}`}
      className="group block bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-green-400 transition-all duration-200 overflow-hidden"
    >
      <div className="relative h-52 overflow-hidden bg-slate-100">
        {images.length > 0 ? (
          <img
            src={images[imgIdx]}
            alt={listing.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="fa-solid fa-house text-slate-300 text-4xl" />
          </div>
        )}

        <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
          <span className={`text-sm font-bold px-3 py-1 rounded-full shadow-sm ${isRent ? "bg-green-900 text-white" : "bg-green-600 text-white"}`}>
            {isRent ? "For Rent" : "For Sale"}
          </span>
          {listing.offer && (
            <span className="text-sm font-bold px-3 py-1 rounded-full bg-amber-500 text-white shadow-sm">
              <i className="fa-solid fa-percent text-xs mr-1" />Offer
            </span>
          )}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={e => { e.preventDefault(); setImgIdx(i => (i - 1 + images.length) % images.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <i className="fa-solid fa-chevron-left text-sm" />
            </button>
            <button
              onClick={e => { e.preventDefault(); setImgIdx(i => (i + 1) % images.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <i className="fa-solid fa-chevron-right text-sm" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full transition ${i === imgIdx ? "bg-white" : "bg-white/40"}`} />
              ))}
            </div>
          </>
        )}

        <div className="absolute bottom-3 right-3 bg-green-600 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
          <i className="fa-solid fa-arrow-right text-sm" />
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-slate-900 text-lg leading-snug mb-1.5 truncate group-hover:text-green-800 transition-colors">
          {listing.name}
        </h3>
        <p className="flex items-center gap-1.5 text-slate-500 text-sm mb-3 truncate">
          <i className="fa-solid fa-location-dot text-green-600 shrink-0" />
          {listing.address}
        </p>

        {/* City / State pills — same treatment as AdminListingCard */}
        <div className="flex items-center gap-2 mb-3.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full">
            <i className="fa-solid fa-city text-[11px]" />
            {listing.city || "No city"}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
            <i className="fa-solid fa-flag text-[11px]" />
            {listing.state || "No state"}
          </span>
        </div>

        <div className="flex items-center gap-4 text-base text-slate-700 mb-3.5">
          <span className="flex items-center gap-1.5">
            <i className="fa-solid fa-bed text-green-600" />
            {listing.bedrooms} {listing.bedrooms === 1 ? "Bed" : "Beds"}
          </span>
          <span className="flex items-center gap-1.5">
            <i className="fa-solid fa-bath text-green-600" />
            {listing.bathrooms} {listing.bathrooms === 1 ? "Bath" : "Baths"}
          </span>
          {listing.squareFootage && (
            <span className="flex items-center gap-1.5 text-slate-500 text-sm">
              <i className="fa-solid fa-expand text-slate-400" />
              {listing.squareFootage} sq ft
            </span>
          )}
        </div>

        <div className="flex items-end justify-between pt-3.5 border-t border-slate-100">
          <div>
            {listing.offer && listing.discountPrice ? (
              <>
                <p className="text-sm text-slate-400 line-through">{toShortINR(listing.regularPrice)}</p>
                <p className="text-xl font-bold text-green-700">
                  {toShortINR(listing.discountPrice)}
                  <span className="text-sm font-normal text-slate-500 ml-1">{isRent ? "/mo" : ""}</span>
                </p>
              </>
            ) : (
              <p className="text-xl font-bold text-green-700">
                {toShortINR(listing.regularPrice)}
                <span className="text-sm font-normal text-slate-500 ml-1">{isRent ? "/mo" : ""}</span>
              </p>
            )}
          </div>
          <span className="text-sm text-green-700 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            View <i className="fa-solid fa-arrow-right text-xs" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Card skeleton for loading state ─────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-52 bg-slate-100" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-5 bg-slate-100 rounded w-3/4" />
        <div className="h-4 bg-slate-100 rounded w-1/2" />
        <div className="flex gap-3">
          <div className="h-4 bg-slate-100 rounded w-16" />
          <div className="h-4 bg-slate-100 rounded w-16" />
        </div>
        <div className="h-6 bg-slate-100 rounded w-1/3 mt-1" />
      </div>
    </div>
  );
}

// ─── Star rating input — used inside the review dialog ──────────────────────
function StarRatingInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl transition-transform hover:scale-110"
        >
          <i className={`fa-solid fa-star ${(hover || value) >= n ? "text-amber-400" : "text-slate-200"}`} />
        </button>
      ))}
    </div>
  );
}

// ─── Review dialog — tied to the logged-in account, opens in place ──────────
function ReviewDialog({ onClose, onSubmitted }) {
  const { currentUser } = useSelector(state => state.user);
  const navigate = useNavigate();

  const [role, setRole]             = useState("");
  const [rating, setRating]         = useState(0);
  const [quote, setQuote]           = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  // Not logged in — redirect to sign-in instead of showing the form.
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center" onClick={e => e.stopPropagation()}>
          <i className="fa-solid fa-lock text-3xl text-green-600 mb-4" />
          <h3 className="font-bold text-slate-900 text-xl mb-2">Sign in to leave a review</h3>
          <p className="text-slate-500 text-sm mb-6">You need an account to share your experience.</p>
          <button
            onClick={() => { onClose(); navigate("/sign-in"); }}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!quote.trim()) return setError("Please write a short review.");
    if (rating === 0)  return setError("Please choose a star rating.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/review/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating, quote: quote.trim(), role: role.trim(), isAnonymous }),
      });
      if (!res.ok) throw new Error("Review submission failed");
      onSubmitted?.();
      onClose();
    } catch {
      setError("Couldn't submit your review right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition" aria-label="Close">
          <i className="fa-solid fa-xmark text-xl" />
        </button>

        <h3 className="font-bold text-slate-900 text-2xl mb-1.5">Share your experience</h3>
        <p className="text-slate-500 text-base mb-6">Tell other buyers, sellers, and tenants how Nestora worked for you.</p>

        {/* Reviewer identity preview */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <img
            src={isAnonymous ? "https://i.pinimg.com/originals/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg?nii=t" : currentUser.avatar}
            alt=""
            className="w-10 h-10 rounded-full object-cover border border-slate-200"
          />
          <div className="text-sm">
            <p className="font-bold text-slate-800">{isAnonymous ? "Anonymous User" : currentUser.username}</p>
            <p className="text-slate-400">{isAnonymous ? "Your identity will be hidden" : "Posting as yourself"}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role &amp; city <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g. Homebuyer · Mumbai"
              className="w-full h-12 px-4 border border-slate-200 rounded-xl text-base text-slate-800 bg-slate-50 placeholder-slate-400 outline-none focus:border-green-500 focus:bg-white transition"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your rating</label>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your review</label>
            <textarea
              value={quote}
              onChange={e => setQuote(e.target.value)}
              placeholder="What was your experience like?"
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-base text-slate-800 bg-slate-50 placeholder-slate-400 outline-none focus:border-green-500 focus:bg-white transition resize-none"
              maxLength={500}
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={e => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 accent-green-600 cursor-pointer"
            />
            <span className="text-sm text-slate-600">Post this review anonymously</span>
          </label>

          {error && (
            <p className="text-sm text-rose-600 font-medium flex items-center gap-1.5">
              <i className="fa-solid fa-circle-exclamation" /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            {submitting ? <><i className="fa-solid fa-circle-notch fa-spin" /> Submitting…</> : "Submit review"}
          </button>
          <p className="text-center text-sm text-slate-400">Reviews are checked before they appear publicly.</p>
        </form>
      </div>
    </div>
  );
}

// ─── Visit tracking ───────────────────────────────────────────────────────────
async function registerVisit() {
  const res = await fetch("/api/listing/visit", { method: "POST", credentials: "include" });
  if (!res.ok) throw new Error("Visit tracking failed");
  return res.json();
}

// ─── Home page ────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [propType,   setPropType]   = useState("");
  const [budget,     setBudget]     = useState("");

  const [featured,        setFeatured]        = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const [insights, setInsights] = useState({
    totalListings: 0, forSale: 0, forRent: 0, ownerContacts: 0, newThisWeek: 0,
  });
  const [insightsLoading, setInsightsLoading] = useState(true);

  const [visitorCount, setVisitorCount] = useState(null);

  const [reviews,         setReviews]         = useState([]);
  const [reviewsLoading,  setReviewsLoading]  = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [justSubmitted,   setJustSubmitted]    = useState(false);

  useEffect(() => {
    fetch("/api/listing/get?limit=3&sort=createdAt&order=desc")
      .then(r => r.json())
      .then(data => setFeatured(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(err => console.error("Featured fetch error:", err))
      .finally(() => setFeaturedLoading(false));

    fetch("/api/listing/insights", { credentials: "include" })
      .then(r => r.json())
      .then(setInsights)
      .catch(err => console.error("Insights fetch error:", err))
      .finally(() => setInsightsLoading(false));

    registerVisit()
      .then(data => setVisitorCount(data.visitorCount))
      .catch(err => console.error("Visit tracking error:", err));

    fetch("/api/review/approved?limit=3")
      .then(r => r.json())
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(err => console.error("Reviews fetch error:", err))
      .finally(() => setReviewsLoading(false));
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim())    params.set("searchTerm", searchTerm.trim());
    if (searchType !== "all") params.set("type", searchType);
    if (propType)              params.set("propertyType", propType);
    if (budget)                 params.set("maxPrice", budget);
    params.set("sort", "createdAt");
    params.set("order", "desc");
    navigate(`/search?${params.toString()}`);
  };

  const INSIGHT_CARDS = [
    { icon: "fa-layer-group",   label: "Total Listings", value: insights.totalListings },
    { icon: "fa-tag",           label: "For Sale",       value: insights.forSale       },
    { icon: "fa-key",           label: "For Rent",       value: insights.forRent       },
    { icon: "fa-phone-volume",  label: "Owner Contacts", value: insights.ownerContacts },
    { icon: "fa-calendar-plus", label: "New This Week",  value: insights.newThisWeek   },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
          Decorative rings give the panel some depth instead of flat green.
          Logo sits on a dark badge so the white mark stays visible.
      ═══════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex items-center bg-green-50 relative overflow-hidden">

        {/* Decorative rings */}
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full border-[3px] border-green-300/40 pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-[320px] h-[320px] rounded-full border-[3px] border-green-400/30 pointer-events-none" />
        <div className="absolute -bottom-40 -left-24 w-[420px] h-[420px] rounded-full border-[3px] border-green-300/30 pointer-events-none" />

        <div className="relative z-10 max-w-[1440px] mx-auto w-full px-6 md:px-16 py-20">

          {/* Brand row — dark badge behind the logo so a white mark stays visible */}
          <div className="flex items-center gap-3 mb-14">
            <div className="w-11 h-11 rounded-xl bg-green-800 flex items-center justify-center shadow-md shadow-green-900/20">
              <img
                src="/images/logo.png"
                alt=""
                className="w-7 h-7 object-contain"
                onError={e => { e.target.style.display = "none"; }}
              />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-green-800">Nestora</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            <div>
              <h1 className="text-5xl md:text-[64px] font-extrabold leading-[1.08] tracking-tight text-slate-900 mb-6">
                Find Your Next<br />
                <span className="text-green-700">Property</span> With<br />
                Confidence
              </h1>

              <p className="text-slate-600 text-xl leading-relaxed mb-10 max-w-lg">
                Discover verified properties for sale and rent, or list your own
                and connect directly with serious buyers and tenants.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 h-14 px-7 rounded-xl bg-green-600 hover:bg-green-700 text-white text-base font-bold transition-all duration-200 hover:-translate-y-0.5 shadow-md shadow-green-200"
                >
                  <i className="fa-solid fa-magnifying-glass" /> Explore Properties
                </Link>
                <Link
                  to="/create-listing"
                  className="inline-flex items-center gap-2 h-14 px-7 rounded-xl bg-white hover:bg-green-50 border-2 border-green-200 text-slate-800 text-base font-bold transition-all duration-200 hover:-translate-y-0.5"
                >
                  <i className="fa-solid fa-plus text-green-700" /> List Your Property
                </Link>
              </div>
            </div>

            <div>
              <form
                onSubmit={handleHeroSearch}
                className="bg-white rounded-2xl p-8 shadow-xl shadow-green-900/10 border border-green-100"
              >
                <p className="text-sm font-bold text-green-800 uppercase tracking-widest mb-6">
                  Search Properties
                </p>

                <div className="relative mb-4">
                  <i className="fa-solid fa-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-green-600 text-base pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Enter city, area or locality…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full h-14 pl-11 pr-4 border border-slate-200 rounded-xl text-base text-slate-800 bg-slate-50 placeholder-slate-400 outline-none focus:border-green-500 focus:bg-white transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <select
                    value={searchType}
                    onChange={e => setSearchType(e.target.value)}
                    className="h-14 px-3 border border-slate-200 rounded-xl text-base text-slate-700 bg-slate-50 outline-none focus:border-green-500 cursor-pointer"
                  >
                    <option value="all">Buy or Rent</option>
                    <option value="sale">Buy</option>
                    <option value="rent">Rent</option>
                  </select>
                  <select
                    value={propType}
                    onChange={e => setPropType(e.target.value)}
                    className="h-14 px-3 border border-slate-200 rounded-xl text-base text-slate-700 bg-slate-50 outline-none focus:border-green-500 cursor-pointer"
                  >
                    <option value="">All Types</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="commercial">Commercial</option>
                    <option value="land">Land</option>
                  </select>
                </div>

                <div className="mb-6">
                  <select
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    className="w-full h-14 px-3 border border-slate-200 rounded-xl text-base text-slate-700 bg-slate-50 outline-none focus:border-green-500 cursor-pointer"
                  >
                    <option value="">Any Budget</option>
                    <option value="5000000">Under ₹50 L</option>
                    <option value="10000000">Under ₹1 Cr</option>
                    <option value="30000000">Under ₹3 Cr</option>
                    <option value="99999999">Above ₹3 Cr</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-base rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-md shadow-green-200 flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-magnifying-glass" /> Search Properties
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          SERVICES SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex items-center bg-slate-50">
        <div className="max-w-[1440px] mx-auto w-full px-6 md:px-16 py-24">

          <FadeUp>
            <div className="text-center max-w-xl mx-auto mb-14">
              <Eyebrow>What Would You Like To Do?</Eyebrow>
              <h2 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-5">
                Everything Real Estate<br />In One Place
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Whether you're searching for your dream home, renting, or listing
                a property — we've made it straightforward.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "fa-house",             title: "Buy Property",  desc: "Browse verified homes, apartments, villas, and commercial spaces across India.", to: "/search?type=sale" },
              { icon: "fa-key",               title: "Rent Property", desc: "Discover rental properties that match your lifestyle and budget.", to: "/search?type=rent" },
              { icon: "fa-indian-rupee-sign", title: "Sell Property", desc: "Reach qualified buyers and maximise your property's market visibility.", to: "/create-listing" },
              { icon: "fa-building",          title: "List For Rent", desc: "Connect with reliable tenants and manage enquiries effortlessly.", to: "/create-listing" },
            ].map((c, i) => (
              <FadeUp key={c.title} delay={i * 80}>
                <Link
                  to={c.to}
                  className="group bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100 hover:shadow-md hover:border-green-300 hover:-translate-y-1.5 transition-all duration-200 block h-full"
                >
                  <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center text-2xl mx-auto mb-6 group-hover:bg-green-600 group-hover:text-white transition-all duration-200">
                    <i className={`fa-solid ${c.icon}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2.5">{c.title}</h3>
                  <p className="text-base text-slate-600 leading-relaxed">{c.desc}</p>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          FEATURED LISTINGS SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex items-center bg-white">
        <div className="max-w-[1440px] mx-auto w-full px-6 md:px-16 py-24">

          <FadeUp>
            <div className="text-center max-w-lg mx-auto mb-14">
              <Eyebrow>Trending Properties</Eyebrow>
              <h2 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-5">
                Handpicked Opportunities
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                The most recently added listings across top cities.
              </p>
            </div>
          </FadeUp>

          {featuredLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CardSkeleton /><CardSkeleton /><CardSkeleton />
            </div>
          )}

          {!featuredLoading && featured.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((listing, i) => (
                <FadeUp key={listing._id} delay={i * 90}>
                  <ListingCard listing={listing} />
                </FadeUp>
              ))}
            </div>
          )}

          {!featuredLoading && featured.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <i className="fa-solid fa-house-circle-xmark text-5xl mb-4 block text-slate-200" />
              <p className="text-base font-medium">No listings yet — be the first to post one.</p>
            </div>
          )}

          <FadeUp delay={240}>
            <div className="flex justify-center mt-12">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 h-14 px-8 rounded-xl bg-green-600 hover:bg-green-700 text-white text-base font-bold transition-all duration-200 hover:-translate-y-0.5 shadow-md shadow-green-200"
              >
                View All Listings <i className="fa-solid fa-arrow-right" />
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          CATEGORIES SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex items-center bg-slate-50">
        <div className="max-w-[1440px] mx-auto w-full px-6 md:px-16 py-24">

          <FadeUp>
            <div className="text-center max-w-md mx-auto mb-14">
              <Eyebrow>Property Types</Eyebrow>
              <h2 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-5">
                Browse By Category
              </h2>
              <p className="text-slate-600 text-lg">Find exactly what you're looking for.</p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-3 gap-8 items-center">

            <div className="flex flex-col gap-5">
              {[
                { label: "House",     icon: "fa-house",    to: "/search?type=sale" },
                { label: "Apartment", icon: "fa-building", to: "/search?type=sale" },
                { label: "Villa",     icon: "fa-tree",     to: "/search?type=sale" },
              ].map((c, i) => (
                <FadeUp key={c.label} delay={i * 70}>
                  <Link
                    to={c.to}
                    className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-green-300 hover:bg-green-50 hover:translate-x-1 transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center text-xl flex-shrink-0">
                      <i className={`fa-solid ${c.icon}`} />
                    </div>
                    <div className="text-lg font-bold text-slate-900">{c.label}</div>
                  </Link>
                </FadeUp>
              ))}
            </div>

            <FadeUp delay={100}>
              <div className="rounded-3xl overflow-hidden shadow-xl aspect-[3/4] bg-slate-200">
                <img
                  src="/images/image6.jpg"
                  alt="Browse property categories"
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = "none"; }}
                />
              </div>
            </FadeUp>

            <div className="flex flex-col gap-5">
              {[
                { label: "Commercial",    icon: "fa-store",          to: "/search?type=sale" },
                { label: "Land",          icon: "fa-map",            to: "/search?type=sale" },
                { label: "Vacation Home", icon: "fa-umbrella-beach", to: "/search?type=rent" },
              ].map((c, i) => (
                <FadeUp key={c.label} delay={i * 70}>
                  <Link
                    to={c.to}
                    className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-green-300 hover:bg-green-50 hover:-translate-x-1 transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center text-xl flex-shrink-0">
                      <i className={`fa-solid ${c.icon}`} />
                    </div>
                    <div className="text-lg font-bold text-slate-900">{c.label}</div>
                  </Link>
                </FadeUp>
              ))}
            </div>

          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          WHY CHOOSE US SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex items-center bg-white">
        <div className="max-w-[1440px] mx-auto w-full px-6 md:px-16 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            <FadeUp>
              <div>
                <Eyebrow>Why Us</Eyebrow>
                <h2 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-5">
                  Why Thousands<br />Choose Nestora
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed mb-9">
                  We make real estate transactions simpler, safer, and faster —
                  backed by technology that puts you in control.
                </p>
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { icon: "fa-shield-halved",             title: "Verified Listings",    desc: "Every property undergoes verification to improve trust and transparency." },
                    { icon: "fa-comments",                  title: "Direct Communication", desc: "Connect directly with property owners and interested buyers." },
                    { icon: "fa-magnifying-glass-location", title: "Smart Discovery",      desc: "Advanced filters help users find the right property quickly." },
                    { icon: "fa-lock",                      title: "Secure Experience",    desc: "Built with privacy and reliability at the core." },
                  ].map(f => (
                    <div
                      key={f.title}
                      className="bg-slate-50 hover:bg-green-50 rounded-2xl p-6 transition-colors duration-200 border border-slate-100 hover:border-green-200"
                    >
                      <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center text-lg mb-4">
                        <i className={`fa-solid ${f.icon}`} />
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mb-1.5">{f.title}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={130}>
              <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-100 bg-slate-50">
                <img
                  src="/images/image7.jpg"
                  alt="Platform dashboard"
                  className="w-full object-cover"
                  style={{ minHeight: 460 }}
                  onError={e => { e.target.style.minHeight = "460px"; }}
                />
              </div>
            </FadeUp>

          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex items-center bg-slate-50">
        <div className="max-w-[1440px] mx-auto w-full px-6 md:px-16 py-24">

          <FadeUp>
            <div className="text-center max-w-md mx-auto mb-20">
              <Eyebrow>Process</Eyebrow>
              <h2 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-5">
                Get Started In Minutes
              </h2>
              <p className="text-slate-600 text-lg">
                From account creation to closing a deal — four simple steps.
              </p>
            </div>
          </FadeUp>

          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="hidden md:block absolute top-16 left-[12%] right-[12%] h-0.5 bg-green-600 z-0" />

            {[
              { icon: "fa-user-plus",    label: "Create Your Account",            num: "01" },
              { icon: "fa-list-ul",      label: "Browse or List a Property",      num: "02" },
              { icon: "fa-comment-dots", label: "Connect with Buyers or Tenants", num: "03" },
              { icon: "fa-handshake",    label: "Close the Deal",                 num: "04" },
            ].map((s, i) => (
              <FadeUp key={s.label} delay={i * 90}>
                <div className="text-center relative z-10">
                  <p className="text-xl font-bold text-green-700 uppercase tracking-widest mb-3">{s.num}</p>
                  <div className="w-[68px] h-[68px] rounded-2xl bg-white border-2 border-green-400 shadow-sm flex items-center justify-center mx-auto mb-5 text-green-700 text-2xl">
                    <i className={`fa-solid ${s.icon}`} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">{s.label}</h4>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          NESTORA INSIGHTS SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex items-center relative overflow-hidden bg-green-900">
        <div className="relative z-10 max-w-[1440px] mx-auto w-full px-6 md:px-16 py-24 text-center">

          <FadeUp>
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-5 py-2 text-sm font-semibold text-green-100 uppercase tracking-widest mb-6">
              <i className="fa-solid fa-chart-line" /> Live Marketplace Data
            </div>
            <h2 className="text-5xl font-extrabold tracking-tight text-white mb-5">
              Nestora Insights
            </h2>
            <p className="text-green-100 text-lg max-w-md mx-auto">
              Numbers pulled directly from the platform — updated in real time.
            </p>
          </FadeUp>

          <FadeUp delay={40}>
            <div className="inline-flex items-center gap-4 bg-white/10 border border-white/20 rounded-2xl px-8 py-5 mt-12 mb-4">
              <i className="fa-solid fa-users text-3xl text-green-200" />
              <div className="text-left">
                <div className={`text-4xl font-extrabold text-white ${visitorCount === null ? "opacity-30 animate-pulse" : ""}`}>
                  {visitorCount === null ? "—" : visitorCount.toLocaleString("en-IN")}
                </div>
                <div className="text-sm text-green-100 font-medium">Site Visitors</div>
              </div>
            </div>
          </FadeUp>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mt-6">
            {INSIGHT_CARDS.map((c, i) => (
              <FadeUp key={c.label} delay={i * 60}>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-7 text-center hover:bg-white/15 hover:-translate-y-1 transition-all duration-200">
                  <i className={`fa-solid ${c.icon} text-3xl text-green-200 mb-4 block`} />
                  <div className={`text-4xl font-extrabold text-white mb-2 ${insightsLoading ? "opacity-30 animate-pulse" : ""}`}>
                    {insightsLoading ? "—" : c.value.toLocaleString("en-IN")}
                  </div>
                  <div className="text-sm text-green-100 font-semibold">{c.label}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          TESTIMONIALS SECTION
          Avatar + username + quoted review + star rating, mirroring
          the listing-card treatment used elsewhere on this page.
      ═══════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex items-center bg-slate-50">
        <div className="max-w-[1440px] mx-auto w-full px-6 md:px-16 py-24">

          <FadeUp>
            <div className="text-center max-w-lg mx-auto mb-12">
              <Eyebrow>Testimonials</Eyebrow>
              <h2 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
                Trusted By Buyers,<br />Sellers &amp; Tenants
              </h2>
              <button
                onClick={() => setReviewDialogOpen(true)}
                className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-green-600 hover:bg-green-700 text-white text-base font-bold transition-all duration-200 hover:-translate-y-0.5 shadow-md shadow-green-200"
              >
                <i className="fa-solid fa-pen" /> Write a Review
              </button>
              {justSubmitted && (
                <p className="text-green-700 text-sm font-semibold mt-3 flex items-center justify-center gap-1.5">
                  <i className="fa-solid fa-circle-check" /> Thanks! Your review is awaiting approval.
                </p>
              )}
            </div>
          </FadeUp>

          {reviewsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0, 1, 2].map(i => (
                <div key={i} className="bg-white rounded-2xl p-7 border border-slate-100 animate-pulse h-56" />
              ))}
            </div>
          )}

          {!reviewsLoading && reviews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.slice(0, 3).map((t, i) => (
                <FadeUp key={t._id} delay={i * 80}>
                  <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 h-full">
                    <StarRow rating={t.rating} />
                    <p className="text-base text-slate-700 leading-relaxed mb-7">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="text-base font-bold text-slate-900">{t.name}</div>
                        {t.role && <div className="text-sm text-slate-500">{t.role}</div>}
                      </div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          )}

          {!reviewsLoading && reviews.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <i className="fa-solid fa-comment-slash text-5xl mb-4 block text-slate-200" />
              <p className="text-base font-medium">No reviews yet — be the first to share your experience.</p>
            </div>
          )}
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA SECTION — lightened background, trimmed markup
      ═══════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex items-center bg-green-50">
        <div className="max-w-[1440px] mx-auto w-full px-6 md:px-16 py-24 text-center">
          <FadeUp>
            <h2 className="text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
              Ready To Make<br />Your Next Move?
            </h2>
            <p className="text-slate-600 text-xl max-w-lg mx-auto mb-11">
              Whether you're buying, renting, selling, or listing — your next
              opportunity starts right here.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 h-14 px-9 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-base transition-all duration-200 hover:-translate-y-0.5 shadow-md shadow-green-200"
              >
                Explore Properties
              </Link>
              <Link
                to="/create-listing"
                className="inline-flex items-center gap-2 h-14 px-9 rounded-xl bg-white border-2 border-green-200 text-slate-800 font-bold text-base hover:bg-green-100 transition-all duration-200 hover:-translate-y-0.5"
              >
                Post a Listing
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {reviewDialogOpen && (
        <ReviewDialog
          onClose={() => setReviewDialogOpen(false)}
          onSubmitted={() => {
            setJustSubmitted(true);
            setTimeout(() => setJustSubmitted(false), 5000);
          }}
        />
      )}

    </div>
  );
}
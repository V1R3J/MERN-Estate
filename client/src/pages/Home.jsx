import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

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
    <div className="inline-flex items-center gap-2 text-green-700 text-xs font-bold uppercase tracking-widest mb-3">
      <span className="w-4 h-0.5 bg-green-600 rounded inline-block" />
      {children}
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
      className="group block bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-green-300 transition-all duration-200 overflow-hidden"
    >
      {/* ── Image area ── */}
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

        {/* Type + offer badges */}
        <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${isRent ? "bg-violet-600 text-white" : "bg-green-600 text-white"}`}>
            {isRent ? "For Rent" : "For Sale"}
          </span>
          {listing.offer && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500 text-white shadow-sm">
              <i className="fa-solid fa-percent text-[9px] mr-1" />Offer
            </span>
          )}
        </div>

        {/* Prev / Next image buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={e => { e.preventDefault(); setImgIdx(i => (i - 1 + images.length) % images.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <i className="fa-solid fa-chevron-left text-xs" />
            </button>
            <button
              onClick={e => { e.preventDefault(); setImgIdx(i => (i + 1) % images.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <i className="fa-solid fa-chevron-right text-xs" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full transition ${i === imgIdx ? "bg-white" : "bg-white/40"}`} />
              ))}
            </div>
          </>
        )}

        {/* Hover arrow */}
        <div className="absolute bottom-3 right-3 bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
          <i className="fa-solid fa-arrow-right text-xs" />
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-base leading-snug mb-1 truncate group-hover:text-green-700 transition-colors">
          {listing.name}
        </h3>
        <p className="flex items-center gap-1.5 text-slate-400 text-xs mb-3 truncate">
          <i className="fa-solid fa-location-dot text-green-400 shrink-0" />
          {listing.address}
        </p>

        {/* Beds / baths / sqft */}
        <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
          <span className="flex items-center gap-1.5">
            <i className="fa-solid fa-bed text-green-400" />
            {listing.bedrooms} {listing.bedrooms === 1 ? "Bed" : "Beds"}
          </span>
          <span className="flex items-center gap-1.5">
            <i className="fa-solid fa-bath text-violet-400" />
            {listing.bathrooms} {listing.bathrooms === 1 ? "Bath" : "Baths"}
          </span>
          {listing.squareFootage && (
            <span className="flex items-center gap-1.5 text-slate-400 text-xs">
              <i className="fa-solid fa-expand text-slate-300" />
              {listing.squareFootage} sq ft
            </span>
          )}
        </div>

        {/* Price row */}
        <div className="flex items-end justify-between pt-3 border-t border-slate-100">
          <div>
            {listing.offer && listing.discountPrice ? (
              <>
                <p className="text-xs text-slate-400 line-through">{toShortINR(listing.regularPrice)}</p>
                <p className="text-lg font-bold text-green-600">
                  {toShortINR(listing.discountPrice)}
                  <span className="text-xs font-normal text-slate-400 ml-1">{isRent ? "/mo" : ""}</span>
                </p>
              </>
            ) : (
              <p className="text-lg font-bold text-green-600">
                {toShortINR(listing.regularPrice)}
                <span className="text-xs font-normal text-slate-400 ml-1">{isRent ? "/mo" : ""}</span>
              </p>
            )}
          </div>
          <span className="text-xs text-green-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            View <i className="fa-solid fa-arrow-right text-[10px]" />
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
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="flex gap-3">
          <div className="h-3 bg-slate-100 rounded w-16" />
          <div className="h-3 bg-slate-100 rounded w-16" />
        </div>
        <div className="h-5 bg-slate-100 rounded w-1/3 mt-1" />
      </div>
    </div>
  );
}

// ─── Home page ────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();

  // ── Hero search state — mirrors Search.jsx sidebardata shape ──
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("all");  // "all" | "sale" | "rent"
  const [propType,   setPropType]   = useState("");
  const [budget,     setBudget]     = useState("");

  // ── Featured listings (3 newest from MongoDB) ──
  const [featured,        setFeatured]        = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  // ── Live insights from /api/listing/insights ──
  const [insights,        setInsights]        = useState({
    totalListings: 0, forSale: 0, forRent: 0,
    dealsCompleted: 0, ownerContacts: 0, newThisWeek: 0,
  });
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    // ── Fetch 3 newest listings ──
    // getListings controller uses startIndex + limit from query params
    fetch("/api/listing/get?limit=3&sort=createdAt&order=desc")
      .then(r => r.json())
      .then(data => {
        // your getListings returns an array directly
        setFeatured(Array.isArray(data) ? data.slice(0, 3) : []);
      })
      .catch(err => console.error("Featured fetch error:", err))
      .finally(() => setFeaturedLoading(false));

    // ── Fetch insights — route is GET /api/listing/insights ──
    fetch("/api/listing/insights", { credentials: "include" })
      .then(r => r.json())
      .then(data => setInsights(data))
      .catch(err => console.error("Insights fetch error:", err))
      .finally(() => setInsightsLoading(false));
  }, []);

  // ── Hero search submit — builds same URLSearchParams that Search.jsx reads ──
  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim())      params.set("searchTerm", searchTerm.trim());
    if (searchType !== "all")   params.set("type", searchType);
    if (propType)               params.set("propertyType", propType);
    if (budget)                 params.set("maxPrice", budget);
    params.set("sort", "createdAt");
    params.set("order", "desc");
    navigate(`/search?${params.toString()}`);
  };

  const INSIGHT_CARDS = [
    { icon: "fa-layer-group",   label: "Total Listings",  value: insights.totalListings  },
    { icon: "fa-tag",           label: "For Sale",        value: insights.forSale        },
    { icon: "fa-key",           label: "For Rent",        value: insights.forRent        },
    { icon: "fa-handshake",     label: "Deals Completed", value: insights.dealsCompleted },
    { icon: "fa-phone-volume",  label: "Owner Contacts",  value: insights.ownerContacts  },
    { icon: "fa-calendar-plus", label: "New This Week",   value: insights.newThisWeek    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
          Light background — slate-50 left panel, white search card
          Subtle green accents only, no heavy gradient background
      ═══════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex items-center bg-gradient-to-br from-slate-50 via-green-50/40 to-emerald-50/30 relative overflow-hidden">

        {/* Very subtle decorative circles */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-100/30 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-100/20 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 max-w-[1440px] mx-auto w-full px-6 md:px-16 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center min-h-screen">

            {/* Left — headline */}
            <div>
              {/* Trust pill */}
              <div className="inline-flex items-center gap-2 bg-green-100 border border-green-200 rounded-full px-4 py-1.5 text-xs font-semibold text-green-700 uppercase tracking-widest mb-7">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Trusted Real Estate Marketplace
              </div>

              <h1 className="text-5xl md:text-[68px] font-extrabold leading-[1.05] tracking-tight text-slate-900 mb-5">
                Find Your Next<br />
                <span className="text-green-600">Property</span> With<br />
                Confidence
              </h1>

              <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-lg">
                Discover verified properties for sale and rent, or list your own
                and connect directly with serious buyers and tenants.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 mb-14">
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-md shadow-green-200"
                >
                  <i className="fa-solid fa-magnifying-glass" /> Explore Properties
                </Link>
                <Link
                  to="/create-listing"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                >
                  <i className="fa-solid fa-plus text-green-600" /> List Your Property
                </Link>
              </div>

              {/* Stats row */}
              <div className="border-t border-slate-200 pt-8 flex flex-wrap gap-8">
                {[
                  { val: "10,000+", lbl: "Active Listings" },
                  { val: "5,000+",  lbl: "Verified Users"  },
                  { val: "100+",    lbl: "Cities"          },
                ].map(s => (
                  <div key={s.lbl}>
                    <div className="text-2xl font-extrabold text-slate-900">{s.val}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — search card (white, clean) */}
            <div>
              <form
                onSubmit={handleHeroSearch}
                className="bg-white rounded-2xl p-7 shadow-xl shadow-slate-200/80 border border-slate-100"
              >
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
                  Search Properties
                </p>

                {/* Location input */}
                <div className="relative mb-3">
                  <i className="fa-solid fa-location-dot absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Enter city, area or locality…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 placeholder-slate-400 outline-none focus:border-green-500 focus:bg-white transition"
                  />
                </div>

                {/* Buy / Rent + Property Type */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <select
                    value={searchType}
                    onChange={e => setSearchType(e.target.value)}
                    className="h-12 px-3 border border-slate-200 rounded-xl text-sm text-slate-700 bg-slate-50 outline-none focus:border-green-500 cursor-pointer"
                  >
                    <option value="all">Buy or Rent</option>
                    <option value="sale">Buy</option>
                    <option value="rent">Rent</option>
                  </select>
                  <select
                    value={propType}
                    onChange={e => setPropType(e.target.value)}
                    className="h-12 px-3 border border-slate-200 rounded-xl text-sm text-slate-700 bg-slate-50 outline-none focus:border-green-500 cursor-pointer"
                  >
                    <option value="">All Types</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="commercial">Commercial</option>
                    <option value="land">Land</option>
                  </select>
                </div>

                {/* Budget */}
                <div className="mb-4">
                  <select
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    className="w-full h-12 px-3 border border-slate-200 rounded-xl text-sm text-slate-700 bg-slate-50 outline-none focus:border-green-500 cursor-pointer"
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
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-md shadow-green-200 flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-magnifying-glass" /> Search Properties
                </button>
                <p className="text-center text-xs text-slate-400 mt-3">
                  Over 10,000 verified listings across India
                </p>
              </form>
            </div>

          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          SERVICES SECTION
          4 action cards — Buy, Rent, Sell, List — on a soft gray bg
      ═══════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex items-center bg-slate-200">
        <div className="max-w-[1440px] mx-auto w-full px-6 md:px-16 py-24">

          <FadeUp>
            <div className="text-center max-w-xl mx-auto mb-12">
              <Eyebrow>What Would You Like To Do?</Eyebrow>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                Everything Real Estate<br />In One Place
              </h2>
              <p className="text-slate-500 text-base leading-relaxed">
                Whether you're searching for your dream home, renting, or listing
                a property — we've made it straightforward.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: "fa-house",             title: "Buy Property",  desc: "Browse verified homes, apartments, villas, and commercial spaces across India.", to: "/search?type=sale" },
              { icon: "fa-key",               title: "Rent Property", desc: "Discover rental properties that match your lifestyle and budget.", to: "/search?type=rent" },
              { icon: "fa-indian-rupee-sign", title: "Sell Property", desc: "Reach qualified buyers and maximise your property's market visibility.", to: "/create-listing" },
              { icon: "fa-building",          title: "List For Rent", desc: "Connect with reliable tenants and manage enquiries effortlessly.", to: "/create-listing" },
            ].map((c, i) => (
              <FadeUp key={c.title} delay={i * 80}>
                <Link
                  to={c.to}
                  className="group bg-white rounded-2xl p-7 text-center shadow-sm border border-slate-100 hover:shadow-md hover:border-green-200 hover:-translate-y-1.5 transition-all duration-200 block h-full"
                >
                  <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-xl mx-auto mb-5 group-hover:bg-green-600 group-hover:text-white transition-all duration-200">
                    <i className={`fa-solid ${c.icon}`} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">{c.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{c.desc}</p>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          FEATURED LISTINGS SECTION
          3 real cards fetched from MongoDB via GET /api/listing/get
          Uses the same ListingCard as Search.jsx
      ═══════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex items-center bg-white">
        <div className="max-w-[1440px] mx-auto w-full px-6 md:px-16 py-24">

          <FadeUp>
            <div className="text-center max-w-lg mx-auto mb-12">
              <Eyebrow>Trending Properties</Eyebrow>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                Handpicked Opportunities
              </h2>
              <p className="text-slate-500 text-base leading-relaxed">
                The most recently added listings across top cities.
              </p>
            </div>
          </FadeUp>

          {/* Loading skeletons */}
          {featuredLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CardSkeleton /><CardSkeleton /><CardSkeleton />
            </div>
          )}

          {/* Real listing cards from DB */}
          {!featuredLoading && featured.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((listing, i) => (
                <FadeUp key={listing._id} delay={i * 90}>
                  <ListingCard listing={listing} />
                </FadeUp>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!featuredLoading && featured.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <i className="fa-solid fa-house-circle-xmark text-5xl mb-4 block text-slate-200" />
              <p className="text-sm font-medium">No listings yet — be the first to post one.</p>
            </div>
          )}

          <FadeUp delay={240}>
            <div className="flex justify-center mt-10">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-md shadow-green-200"
              >
                View All Listings <i className="fa-solid fa-arrow-right" />
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          CATEGORIES SECTION
          6 property types flanking a center portrait image
      ═══════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex items-center bg-slate-200">
        <div className="max-w-[1440px] mx-auto w-full px-6 md:px-16 py-24">

          <FadeUp>
            <div className="text-center max-w-md mx-auto mb-12">
              <Eyebrow>Property Types</Eyebrow>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                Browse By Category
              </h2>
              <p className="text-slate-500 text-base">Find exactly what you're looking for.</p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-3 gap-8 items-center">

            {/* Left column */}
            <div className="flex flex-col gap-4">
              {[
                { label: "House",     icon: "fa-house",    count: "2,400+", to: "/search?type=sale"   },
                { label: "Apartment", icon: "fa-building", count: "5,100+", to: "/search?type=sale"   },
                { label: "Villa",     icon: "fa-tree",     count: "830+",   to: "/search?type=sale"   },
              ].map((c, i) => (
                <FadeUp key={c.label} delay={i * 70}>
                  <Link
                    to={c.to}
                    className="flex items-center gap-3.5 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-green-200 hover:bg-green-50/40 hover:translate-x-1 transition-all duration-200"
                  >
                    <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-lg flex-shrink-0">
                      <i className={`fa-solid ${c.icon}`} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{c.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{c.count} properties</div>
                    </div>
                  </Link>
                </FadeUp>
              ))}
            </div>

            {/* Center portrait image */}
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

            {/* Right column */}
            <div className="flex flex-col gap-4">
              {[
                { label: "Commercial",    icon: "fa-store",          count: "420+", to: "/search?type=sale" },
                { label: "Land",          icon: "fa-map",            count: "960+", to: "/search?type=sale" },
                { label: "Vacation Home", icon: "fa-umbrella-beach", count: "310+", to: "/search?type=rent" },
              ].map((c, i) => (
                <FadeUp key={c.label} delay={i * 70}>
                  <Link
                    to={c.to}
                    className="flex items-center gap-3.5 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-green-200 hover:bg-green-50/40 hover:-translate-x-1 transition-all duration-200"
                  >
                    <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-lg flex-shrink-0">
                      <i className={`fa-solid ${c.icon}`} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{c.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{c.count} properties</div>
                    </div>
                  </Link>
                </FadeUp>
              ))}
            </div>

          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          WHY CHOOSE US SECTION
          4 feature mini-cards on left, dashboard image on right
      ═══════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex items-center bg-white">
        <div className="max-w-[1440px] mx-auto w-full px-6 md:px-16 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Left — text + feature grid */}
            <FadeUp>
              <div>
                <Eyebrow>Why Us</Eyebrow>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                  Why Thousands<br />Choose Our Platform
                </h2>
                <p className="text-slate-500 text-base leading-relaxed mb-8">
                  We make real estate transactions simpler, safer, and faster —
                  backed by technology that puts you in control.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: "fa-shield-halved",             title: "Verified Listings",    desc: "Every property undergoes verification to improve trust and transparency." },
                    { icon: "fa-comments",                  title: "Direct Communication", desc: "Connect directly with property owners and interested buyers." },
                    { icon: "fa-magnifying-glass-location", title: "Smart Discovery",      desc: "Advanced filters help users find the right property quickly." },
                    { icon: "fa-lock",                      title: "Secure Experience",    desc: "Built with privacy and reliability at the core." },
                  ].map(f => (
                    <div
                      key={f.title}
                      className="bg-slate-50 hover:bg-green-50/60 rounded-2xl p-5 transition-colors duration-200 border border-slate-100 hover:border-green-100"
                    >
                      <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center text-base mb-3">
                        <i className={`fa-solid ${f.icon}`} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">{f.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* Right — image */}
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
          4-step horizontal timeline with connector line
      ═══════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex items-center bg-slate-50">
        <div className="max-w-[1440px] mx-auto w-full px-6 md:px-16 py-24">

          <FadeUp>
            <div className="text-center max-w-md mx-auto mb-16">
              <Eyebrow>Process</Eyebrow>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                Get Started In Minutes
              </h2>
              <p className="text-slate-500 text-base">
                From account creation to closing a deal — four simple steps.
              </p>
            </div>
          </FadeUp>

          {/* Steps with connector line */}
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Connector line — sits behind the icon boxes */}
            <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-green-500 to-green-200 z-0" />

            {[
              { icon: "fa-user-plus",    label: "Create Your Account",            num: "01" },
              { icon: "fa-list-ul",      label: "Browse or List a Property",      num: "02" },
              { icon: "fa-comment-dots", label: "Connect with Buyers or Tenants", num: "03" },
              { icon: "fa-handshake",    label: "Close the Deal",                 num: "04" },
            ].map((s, i) => (
              <FadeUp key={s.label} delay={i * 90}>
                <div className="text-center relative z-10">
                  <p className="text-xs font-extrabold text-green-600 uppercase tracking-widest mb-2">{s.num}</p>
                  <div className="w-16 h-16 rounded-2xl bg-white border-2 border-green-100 shadow-sm flex items-center justify-center mx-auto mb-4 text-green-600 text-xl">
                    <i className={`fa-solid ${s.icon}`} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{s.label}</h4>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          REAL INSIGHTS SECTION
          Live numbers from GET /api/listing/insights (MongoDB aggregations)
          Dark green background to contrast the light sections above
      ═══════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex items-center relative overflow-hidden bg-gradient-to-br from-green-900 to-green-700">

        {/* Subtle background image overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url('/images/image9.jpg')" }}
        />

        <div className="relative z-10 max-w-[1440px] mx-auto w-full px-6 md:px-16 py-24 text-center">

          <FadeUp>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-xs font-semibold text-green-200 uppercase tracking-widest mb-5">
              <i className="fa-solid fa-chart-line" /> Live Marketplace Data
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              Real Estate Insights
            </h2>
            <p className="text-white/50 text-base max-w-md mx-auto">
              Numbers pulled directly from the platform — updated in real time.
            </p>
          </FadeUp>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-14">
            {INSIGHT_CARDS.map((c, i) => (
              <FadeUp key={c.label} delay={i * 60}>
                <div className="bg-white/8 backdrop-blur border border-white/10 rounded-2xl p-8 text-center hover:bg-white/12 hover:-translate-y-1 transition-all duration-200">
                  <i className={`fa-solid ${c.icon} text-2xl text-green-300 mb-4 block`} />
                  <div className={`text-4xl font-extrabold text-white mb-1.5 ${insightsLoading ? "opacity-20 animate-pulse" : ""}`}>
                    {insightsLoading ? "—" : c.value.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-white/45 font-medium">{c.label}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          TESTIMONIALS SECTION
          3 cards with 5-star ratings and user avatars
      ═══════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex items-center bg-slate-50">
        <div className="max-w-[1440px] mx-auto w-full px-6 md:px-16 py-24">

          <FadeUp>
            <div className="text-center max-w-md mx-auto mb-12">
              <Eyebrow>Testimonials</Eyebrow>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                Trusted By Buyers,<br />Sellers & Tenants
              </h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                quote: "Found my apartment within days. The search experience was incredibly smooth and the listings felt genuinely curated.",
                name: "Aditi Sharma", role: "Homebuyer · Mumbai",       img: "/images/image10.png",
              },
              {
                quote: "Listing my property took less than ten minutes and generated multiple serious enquiries the same week.",
                name: "Rajiv Menon",  role: "Property Owner · Bengaluru", img: "/images/image11.png",
              },
              {
                quote: "The platform feels modern, secure, and easy to use. I've recommended it to everyone in my housing society.",
                name: "Priya Nair",   role: "Tenant · Pune",             img: "/images/image12.png",
              },
            ].map((t, i) => (
              <FadeUp key={t.name} delay={i * 80}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 h-full">
                  {/* Stars */}
                  <div className="flex gap-0.5 text-amber-400 text-xs mb-4">
                    {[...Array(5)].map((_, j) => <i key={j} className="fa-solid fa-star" />)}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed italic mb-6">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={t.img}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-green-100 bg-green-50 flex-shrink-0"
                      onError={e => { e.target.style.background = "#dcfce7"; }}
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900">{t.name}</div>
                      <div className="text-xs text-slate-400">{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA SECTION
          Dark green, two action buttons, verified badge
          No footer — page ends here
      ═══════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen flex items-center relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-600">

        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url('/images/image14.jpg')" }}
        />

        <div className="relative z-10 max-w-[1440px] mx-auto w-full px-6 md:px-16 py-24 text-center">
          <FadeUp>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-xs font-semibold text-green-200 uppercase tracking-widest mb-6">
              Get Started
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-5">
              Ready To Make<br />Your Next Move?
            </h2>
            <p className="text-white/60 text-lg max-w-lg mx-auto mb-10">
              Whether you're buying, renting, selling, or listing — your next
              opportunity starts right here.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-10">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-white text-green-800 font-bold text-sm hover:bg-green-50 transition-all duration-200 hover:-translate-y-0.5 shadow-lg"
              >
                Explore Properties
              </Link>
              <Link
                to="/create-listing"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-transparent border border-white/30 text-white font-bold text-sm hover:bg-white/10 transition-all duration-200 hover:-translate-y-0.5"
              >
                Post a Listing
              </Link>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-5 py-2 text-xs font-semibold text-green-200 uppercase tracking-widest">
              <i className="fa-solid fa-circle-check" /> Verified Marketplace
            </div>
          </FadeUp>
        </div>
      </section>

    </div>
  );
}
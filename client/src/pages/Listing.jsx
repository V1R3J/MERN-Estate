import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import "swiper/css/bundle";
import {
  FaBed, FaBath, FaParking, FaCouch, FaSwimmingPool, FaDumbbell,
  FaChild, FaLeaf, FaShieldAlt, FaWifi, FaBolt, FaRulerCombined,
  FaDoorOpen, FaUtensils, FaMapMarkerAlt, FaTag, FaUsers, FaShareAlt,
  FaTimes, FaHome, FaLink, FaWhatsapp, FaFacebookF, FaTwitter,
  FaPercentage, FaStar, FaBuilding, FaKey, FaPhone, FaEnvelope,
  FaUserTie, FaFileAlt, FaExternalLinkAlt, FaExpand, FaLock,
} from "react-icons/fa";
import { MdOutlineBedroomParent, MdOutlineBathtub, MdOutlineKitchen } from "react-icons/md";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatINR(amount) {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} Cr`;
  if (amount >= 100_000)    return `₹${(amount / 100_000).toFixed(2)} L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

const SUITABILITY_LABEL = {
  any: "Open to All", family: "Families", couple: "Couples", bachelor: "Bachelors",
};

// ── AmenityBadge ─────────────────────────────────────────────────────────────
function AmenityBadge({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
        <Icon className="text-emerald-600 text-sm" />
      </div>
      <span className="text-slate-700 text-sm font-medium">{label}</span>
    </div>
  );
}

// ── Share Modal ───────────────────────────────────────────────────────────────
function ShareModal({ url, name, onClose }) {
  const [copied, setCopied] = useState(false);
  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const encodedUrl  = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`Check out this property: ${name}`);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition"
          aria-label="Close"
        >
          <FaTimes className="text-lg" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <FaShareAlt className="text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Share this listing</h3>
            <p className="text-slate-400 text-xs">Let others know about this property</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <a href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`}
            target="_blank" rel="noreferrer"
            className="flex flex-col items-center gap-1.5 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl py-3 transition">
            <FaWhatsapp className="text-green-600 text-xl" />
            <span className="text-green-700 text-xs font-medium">WhatsApp</span>
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank" rel="noreferrer"
            className="flex flex-col items-center gap-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl py-3 transition">
            <FaFacebookF className="text-blue-600 text-xl" />
            <span className="text-blue-700 text-xs font-medium">Facebook</span>
          </a>
          <a href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
            target="_blank" rel="noreferrer"
            className="flex flex-col items-center gap-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl py-3 transition">
            <FaTwitter className="text-sky-500 text-xl" />
            <span className="text-sky-700 text-xs font-medium">Twitter</span>
          </a>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
          <FaLink className="text-slate-400 shrink-0" />
          <p className="text-slate-500 text-xs truncate flex-1">{url}</p>
          <button
            onClick={copyLink}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
              copied ? "bg-emerald-100 text-emerald-700" : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Full-screen Slider (with thumbnail strip — replaces the old plain swiper) ─
function FullscreenSlider({ imageUrls, name, startIdx, onClose }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <span className="text-white font-semibold text-sm truncate">{name} — All Photos</span>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition shrink-0"
          aria-label="Close"
        >
          <FaTimes />
        </button>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center px-2">
        <Swiper
          modules={[Navigation, Thumbs]}
          navigation
          thumbs={{ swiper: thumbsSwiper }}
          loop={imageUrls.length > 1}
          initialSlide={startIdx}
          className="w-full h-full max-h-[78vh]"
        >
          {imageUrls.map((url, idx) => (
            <SwiperSlide key={idx} className="flex items-center justify-center">
              <img
                src={url}
                alt={`${name} — photo ${idx + 1}`}
                className="max-h-[78vh] max-w-full object-contain rounded-xl"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {imageUrls.length > 1 && (
        <div className="px-4 py-3 shrink-0">
          <Swiper
            modules={[Thumbs]}
            onSwiper={setThumbsSwiper}
            slidesPerView="auto"
            spaceBetween={8}
            watchSlidesProgress
            className="thumb-strip"
          >
            {imageUrls.map((url, idx) => (
              <SwiperSlide key={idx} style={{ width: 76 }}>
                <img
                  src={url}
                  alt=""
                  className="w-[76px] h-[52px] object-cover rounded-lg cursor-pointer opacity-50 hover:opacity-100 transition [.swiper-slide-thumb-active_&]:opacity-100 [.swiper-slide-thumb-active_&]:ring-2 [.swiper-slide-thumb-active_&]:ring-emerald-400"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
}

// ── Dynamic Photo Collage ─────────────────────────────────────────────────────
// Layout adapts to how many photos actually exist instead of forcing a fixed
// 4-cell grid that looks empty/broken with 1-3 photos.
function PhotoCollage({ imageUrls, name }) {
  const [sliderOpen, setSliderOpen] = useState(false);
  const [startIdx, setStartIdx]   = useState(0);

  const open = (idx) => { setStartIdx(idx); setSliderOpen(true); };

  if (!imageUrls?.length) {
    return (
      <div className="h-[340px] md:h-[420px] rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400">
        <FaHome className="text-3xl mb-2" />
        <p className="text-sm font-medium">No photos uploaded yet</p>
      </div>
    );
  }

  const Tile = ({ idx, className = "" }) => (
    <div
      className={`relative cursor-pointer group overflow-hidden ${className}`}
      onClick={() => open(idx)}
    >
      <img
        src={imageUrls[idx]}
        alt={`${name} — photo ${idx + 1}`}
        className="w-full h-full object-cover group-hover:brightness-90 transition duration-300"
      />
    </div>
  );

  const count = imageUrls.length;
  const remaining = count - 4;

  return (
    <>
      {/* 1 photo — single full-width hero */}
      {count === 1 && (
        <div className="h-[340px] md:h-[420px] rounded-2xl overflow-hidden">
          <Tile idx={0} className="w-full h-full" />
        </div>
      )}

      {/* 2 photos — even side-by-side split */}
      {count === 2 && (
        <div className="grid grid-cols-2 gap-2 h-[340px] md:h-[420px] rounded-2xl overflow-hidden">
          <Tile idx={0} />
          <Tile idx={1} />
        </div>
      )}

      {/* 3 photos — big hero + two stacked */}
      {count === 3 && (
        <div className="grid grid-cols-3 gap-2 h-[340px] md:h-[420px] rounded-2xl overflow-hidden">
          <Tile idx={0} className="col-span-2" />
          <div className="grid grid-rows-2 gap-2">
            <Tile idx={1} />
            <Tile idx={2} />
          </div>
        </div>
      )}

      {/* 4+ photos — big hero + 2x small grid, last tile shows overflow count */}
      {count >= 4 && (
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[340px] md:h-[420px] rounded-2xl overflow-hidden">
          <div className="col-span-2 row-span-2 relative cursor-pointer group" onClick={() => open(0)}>
            <Tile idx={0} className="w-full h-full" />
          </div>
          <Tile idx={1} className="col-span-2 row-span-1" />
          <div className="col-span-2 row-span-1 relative">
            <Tile idx={3} className="w-full h-full" />
            {remaining > 0 && (
              <div
                className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center cursor-pointer"
                onClick={() => open(3)}
              >
                <span className="text-white text-2xl font-bold">+{remaining}</span>
                <span className="text-white/80 text-xs mt-0.5">more photos</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* "View all" pill, shown for any multi-photo listing */}
      {count > 1 && (
        <button
          onClick={() => open(0)}
          className="mt-2 inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-emerald-400 text-slate-600 hover:text-emerald-600 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition"
        >
          <FaExpand className="text-[10px]" /> View all {count} photos
        </button>
      )}

      {sliderOpen && (
        <FullscreenSlider
          imageUrls={imageUrls}
          name={name}
          startIdx={startIdx}
          onClose={() => setSliderOpen(false)}
        />
      )}
    </>
  );
}

// ── Map ───────────────────────────────────────────────────────────────────────
function PropertyMap({ address }) {
  const encodedAddress = encodeURIComponent(address);
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <iframe
        title="Property location"
        src={`https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
        width="100%" height="260"
        style={{ border: 0 }}
        allowFullScreen loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block"
      />
      <div className="bg-white px-4 py-3 flex items-center gap-2 border-t border-slate-100">
        <FaMapMarkerAlt className="text-emerald-500 shrink-0" />
        <p className="text-slate-600 text-sm flex-1 truncate">{address}</p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
          target="_blank" rel="noreferrer"
          className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold whitespace-nowrap flex items-center gap-1"
        >
          Open in Maps <FaExternalLinkAlt className="text-[10px]" />
        </a>
      </div>
    </div>
  );
}

// ── Contact Card — gated behind "Contact Owner" click ────────────────────────
function ContactCard({ listingId, contactName, contactEmail, contactPhone }) {
  const [revealed, setRevealed] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const hasContact = contactName || contactEmail || contactPhone;

  const handleReveal = async () => {
    setRevealed(true);
    setLoading(true);
    try {
      // fire-and-forget counter increment — UI doesn't wait on this
      // PATCH /api/listing/contact/:id  →  insights.controller.js → incrementContactClick
      await fetch(`/api/listing/contact/${listingId}`, { method: "PATCH" });
    } catch {
      // silently ignore — reveal already happened, click tracking is non-critical
    } finally {
      setLoading(false);
    }
  };

  if (!hasContact) return null;

  if (!revealed) {
    return (
      <button
        onClick={handleReveal}
        className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition text-white font-bold py-3.5 rounded-xl shadow-sm text-sm flex items-center justify-center gap-2"
      >
        <FaUserTie /> Contact Owner
      </button>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <FaUserTie className="text-emerald-500" />
        <h2 className="font-bold text-slate-800 text-base">Contact Details</h2>
        {loading && (
          <span className="ml-auto w-3.5 h-3.5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
        )}
      </div>
      <div className="space-y-3">
        {contactName && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <FaUserTie className="text-emerald-600 text-sm" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider">Name</p>
              <p className="text-slate-700 font-semibold text-sm">{contactName}</p>
            </div>
          </div>
        )}
        {contactPhone && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <FaPhone className="text-emerald-600 text-sm" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider">Phone</p>
              <a href={`tel:${contactPhone}`} className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm">
                {contactPhone}
              </a>
            </div>
          </div>
        )}
        {contactEmail && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <FaEnvelope className="text-emerald-600 text-sm" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider">Email</p>
              <a href={`mailto:${contactEmail}`} className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm break-all">
                {contactEmail}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Listing() {
  const [listing,       setListing]       = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(false);
  const [shareOpen,     setShareOpen]     = useState(false);
  const [floorPlanOpen, setFloorPlanOpen] = useState(false);
  const params = useParams();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        // GET /api/listing/get/:listingId  →  listing.controller.js → getListing
        const res  = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (data.success === false) { setError(true); setLoading(false); return; }
        setListing(data);
        setLoading(false);
        setError(false);
      } catch {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading listing…</p>
      </div>
    </main>
  );

  if (error) return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <FaHome className="text-5xl text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-lg font-medium">Could not load this listing.</p>
        <p className="text-slate-400 text-sm mt-1">Please try again later.</p>
      </div>
    </main>
  );

  if (!listing) return null;

  const {
    _id, name, description, address, type,
    regularPrice, discountPrice, offer,
    bedrooms, bathrooms, imageUrls,
    parking, furnished, swimmingPool, gym,
    playArea, garden, security, wifi, powerBackup,
    squareFootage, halls, kitchen, suitableFor,
    contactName, contactEmail, contactPhone,
    floorPlan,
  } = listing;

  const effectivePrice = offer && discountPrice ? discountPrice : regularPrice;
  const savedAmount    = offer && discountPrice ? regularPrice - discountPrice : 0;
  const pageUrl        = window.location.href;

  const amenities = [
    { icon: FaParking,      label: "Parking",       active: parking      },
    { icon: FaCouch,        label: "Furnished",      active: furnished    },
    { icon: FaSwimmingPool, label: "Swimming Pool",  active: swimmingPool },
    { icon: FaDumbbell,     label: "Gym",            active: gym          },
    { icon: FaChild,        label: "Play Area",      active: playArea     },
    { icon: FaLeaf,         label: "Garden",         active: garden       },
    { icon: FaShieldAlt,    label: "24/7 Security",  active: security     },
    { icon: FaWifi,         label: "Wi-Fi Ready",    active: wifi         },
    { icon: FaBolt,         label: "Power Backup",   active: powerBackup  },
  ].filter((a) => a.active);

  const isFloorPlanPDF = floorPlan && floorPlan.toLowerCase().includes(".pdf");

  return (
    <main className="bg-slate-50 min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-4 pt-8 space-y-7">

        {/* ── Page title row ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                type === "rent" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
              }`}>
                {type === "rent" ? "For Rent" : "For Sale"}
              </span>
              {suitableFor && suitableFor !== "any" && (
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <FaUsers className="text-slate-400" /> {SUITABILITY_LABEL[suitableFor]}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 leading-tight">{name}</h1>
            <p className="flex items-center gap-1.5 text-slate-500 mt-1.5 text-sm">
              <FaMapMarkerAlt className="text-emerald-500 shrink-0" />
              {address}
            </p>
          </div>
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-emerald-400 text-slate-700 hover:text-emerald-600 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition shrink-0"
          >
            <FaShareAlt />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        {/* ── Dynamic Photo Collage ── */}
        <PhotoCollage imageUrls={imageUrls} name={name} />

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Property Details Box ── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <FaBuilding className="text-emerald-500" />
                <h2 className="font-bold text-slate-800 text-lg">Property Details</h2>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="flex flex-col items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-xl py-4">
                  <MdOutlineBedroomParent className="text-emerald-600 text-2xl" />
                  <span className="text-slate-800 font-extrabold text-xl">{bedrooms}</span>
                  <span className="text-slate-500 text-xs uppercase tracking-wide">Bedrooms</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-xl py-4">
                  <MdOutlineBathtub className="text-blue-600 text-2xl" />
                  <span className="text-slate-800 font-extrabold text-xl">{bathrooms}</span>
                  <span className="text-slate-500 text-xs uppercase tracking-wide">Bathrooms</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl py-4">
                  <FaRulerCombined className="text-amber-600 text-2xl" />
                  <span className="text-slate-800 font-extrabold text-xl">
                    {squareFootage ?? "—"}
                  </span>
                  <span className="text-slate-500 text-xs uppercase tracking-wide">Sq. Ft.</span>
                </div>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {halls != null && (
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="flex items-center gap-2 text-slate-500 text-sm">
                      <FaDoorOpen className="text-slate-400" /> Halls
                    </span>
                    <span className="font-semibold text-slate-700 text-sm">{halls}</span>
                  </div>
                )}
                {kitchen != null && (
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="flex items-center gap-2 text-slate-500 text-sm">
                      <MdOutlineKitchen className="text-slate-400" /> Kitchen
                    </span>
                    <span className="font-semibold text-slate-700 text-sm">{kitchen}</span>
                  </div>
                )}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="flex items-center gap-2 text-slate-500 text-sm">
                    <FaKey className="text-slate-400" /> Listing Type
                  </span>
                  <span className="font-semibold text-slate-700 text-sm capitalize">{type}</span>
                </div>
                {suitableFor && (
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="flex items-center gap-2 text-slate-500 text-sm">
                      <FaUsers className="text-slate-400" /> Suitable For
                    </span>
                    <span className="font-semibold text-slate-700 text-sm">
                      {SUITABILITY_LABEL[suitableFor] || "All"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Description ── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <FaFileAlt className="text-emerald-500" />
                <h2 className="font-bold text-slate-800 text-lg">About this property</h2>
              </div>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm">{description}</p>
            </div>

            {/* ── Amenities ── */}
            {amenities.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FaStar className="text-emerald-500" />
                  <h2 className="font-bold text-slate-800 text-lg">Amenities &amp; Features</h2>
                  <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {amenities.length} included
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {amenities.map(({ icon, label }) => (
                    <AmenityBadge key={label} icon={icon} label={label} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Floor Plan ── */}
            {floorPlan && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FaFileAlt className="text-emerald-500" />
                  <h2 className="font-bold text-slate-800 text-lg">Floor Plan</h2>
                </div>

                {isFloorPlanPDF ? (
                  <a
                    href={floorPlan}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 border border-slate-200 rounded-xl px-5 py-4 hover:border-emerald-400 hover:bg-emerald-50 transition group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                      <FaFileAlt className="text-red-500 text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-700 text-sm group-hover:text-emerald-700 transition">
                        View Floor Plan PDF
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5 truncate">{floorPlan}</p>
                    </div>
                    <FaExternalLinkAlt className="text-slate-400 group-hover:text-emerald-500 transition shrink-0" />
                  </a>
                ) : (
                  <>
                    <div
                      className="relative cursor-pointer group rounded-xl overflow-hidden border border-slate-200"
                      onClick={() => setFloorPlanOpen(true)}
                    >
                      <img
                        src={floorPlan}
                        alt="Floor Plan"
                        className="w-full max-h-64 object-contain bg-slate-50 group-hover:opacity-90 transition"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/20">
                        <span className="bg-white text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow">
                          <FaExpand className="text-[10px]" /> Click to enlarge
                        </span>
                      </div>
                    </div>

                    {floorPlanOpen && (
                      <div
                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                        onClick={() => setFloorPlanOpen(false)}
                      >
                        <button
                          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
                          aria-label="Close"
                        >
                          <FaTimes />
                        </button>
                        <img
                          src={floorPlan}
                          alt="Floor Plan full"
                          className="max-h-[90vh] max-w-full object-contain rounded-xl"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── Map ── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FaMapMarkerAlt className="text-emerald-500" />
                <h2 className="font-bold text-slate-800 text-lg">Location</h2>
              </div>
              <PropertyMap address={address} />
            </div>
          </div>

          {/* ── Right column (sticky) ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">

              {/* ── Price box ── */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-1">
                  {type === "rent" ? "Monthly Rent" : "Sale Price"}
                </p>
                <p className="text-3xl font-extrabold text-slate-800 leading-tight">
                  {formatINR(effectivePrice)}
                  {type === "rent" && (
                    <span className="text-base font-medium text-slate-400 ml-1">/ mo</span>
                  )}
                </p>

                {offer && savedAmount > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-slate-400 line-through text-sm">{formatINR(regularPrice)}</span>
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FaPercentage className="text-[10px]" /> Save {formatINR(savedAmount)}
                    </span>
                  </div>
                )}

                <hr className="my-4 border-slate-100" />

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-500"><FaBed className="text-slate-400" /> Bedrooms</span>
                    <span className="font-semibold text-slate-700">{bedrooms}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-500"><FaBath className="text-slate-400" /> Bathrooms</span>
                    <span className="font-semibold text-slate-700">{bathrooms}</span>
                  </div>
                  {squareFootage && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-500"><FaRulerCombined className="text-slate-400" /> Area</span>
                      <span className="font-semibold text-slate-700">{squareFootage} sq.ft</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-500"><FaKey className="text-slate-400" /> Type</span>
                    <span className="font-semibold text-slate-700 capitalize">{type}</span>
                  </div>
                </div>

                <hr className="my-4 border-slate-100" />

                {/* ── Contact Owner button → reveals contact details inline on click ── */}
                <ContactCard
                  listingId={_id}
                  contactName={contactName}
                  contactEmail={contactEmail}
                  contactPhone={contactPhone}
                />

                <button
                  onClick={() => setShareOpen(true)}
                  className="w-full mt-2 flex items-center justify-center gap-2 border border-slate-200 hover:border-emerald-400 text-slate-700 hover:text-emerald-600 font-semibold py-3 rounded-xl transition text-sm"
                >
                  <FaShareAlt /> Share Listing
                </button>
              </div>

              {/* ── Offer banner ── */}
              {offer && savedAmount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                  <FaTag className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">Special Offer</p>
                    <p className="text-amber-600 text-xs mt-0.5">
                      Save {formatINR(savedAmount)} — limited time offer.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Share modal */}
      {shareOpen && <ShareModal url={pageUrl} name={name} onClose={() => setShareOpen(false)} />}
    </main>
  );
}
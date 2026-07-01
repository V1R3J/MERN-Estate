import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  FaSearch, FaBed, FaBath, FaCar, FaCouch, FaPercent,
  FaSwimmingPool, FaDumbbell, FaChild, FaTree, FaShieldAlt,
  FaWifi, FaBolt, FaSlidersH, FaTimes, FaArrowRight,
  FaHome, FaSortAmountDown, FaMapMarkerAlt,
  FaUserFriends, FaUser, FaChevronDown, FaFilter,
  FaChevronLeft, FaChevronRight, FaExpand, FaCity,
} from 'react-icons/fa';
import { INDIAN_STATES, getCitiesForState } from '../data/indianLocations';

// ── Rupee helpers ──────────────────────────────────────────────────────────────
const toShortINR = (n) => {
  if (!n) return '—';
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000)      return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n}`;
};

// ── Amenity map ────────────────────────────────────────────────────────────────
const AMENITY_ICONS = {
  parking:      { Icon: FaCar,          label: 'Parking'       },
  furnished:    { Icon: FaCouch,        label: 'Furnished'     },
  swimmingPool: { Icon: FaSwimmingPool, label: 'Pool'          },
  gym:          { Icon: FaDumbbell,     label: 'Gym'           },
  playArea:     { Icon: FaChild,        label: 'Play Area'     },
  garden:       { Icon: FaTree,         label: 'Garden'        },
  security:     { Icon: FaShieldAlt,    label: 'Security'      },
  wifi:         { Icon: FaWifi,         label: 'Wi-Fi'         },
  powerBackup:  { Icon: FaBolt,         label: 'Power Backup'  },
};

const SUITABLE_OPTIONS = [
  { value: 'all',      Icon: FaUserFriends, label: 'Anyone'   },
  { value: 'family',   Icon: FaHome,        label: 'Family'   },
  { value: 'couple',   Icon: FaUserFriends, label: 'Couple'   },
  { value: 'bachelor', Icon: FaUser,        label: 'Bachelor' },
];

// All boolean toggle filters — driving defaults, URL parsing, and the change
// handler from one list instead of repeating each field three times.
const BOOLEAN_FIELDS = [
  'parking', 'furnished', 'offer', 'swimmingPool', 'gym',
  'playArea', 'garden', 'security', 'wifi', 'powerBackup',
];

const DEFAULT_SIDEBAR = {
  searchTerm: '', type: 'all', sort: 'createdAt', order: 'desc',
  suitableFor: 'all', minPrice: '', maxPrice: '', bedrooms: '',
  state: '', city: '',
  ...Object.fromEntries(BOOLEAN_FIELDS.map(f => [f, false])),
};

// ── Image gallery inside card ─────────────────────────────────────────────────
function ImageGallery({ images, title }) {
  const [idx, setIdx] = useState(0);
  if (!images?.length) {
    return (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
        <FaHome className="text-slate-300 text-4xl" />
      </div>
    );
  }
  return (
    <div className="relative w-full h-full group">
      <img src={images[idx]} alt={title} className="w-full h-full object-cover" />
      {images.length > 1 && (
        <>
          <button onClick={e => { e.preventDefault(); setIdx(i => (i - 1 + images.length) % images.length); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <FaChevronLeft className="text-xs" />
          </button>
          <button onClick={e => { e.preventDefault(); setIdx(i => (i + 1) % images.length); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <FaChevronRight className="text-xs" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full transition ${i === idx ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Listing card — city/state shown as pills, matching AdminListingCard ──────
function ListingCard({ listing }) {
  const amenityKeys = Object.keys(AMENITY_ICONS).filter(k => listing[k]);
  const isRent = listing.type === 'rent';

  return (
    <Link to={`/listing/${listing._id}`}
      className="group block bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-green-300 transition-all duration-200 overflow-hidden">
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <ImageGallery images={listing.imageUrls} title={listing.name} />
        <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${isRent ? 'bg-violet-600 text-white' : 'bg-green-600 text-white'}`}>
            {isRent ? 'For Rent' : 'For Sale'}
          </span>
          {listing.offer && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500 text-white shadow-sm flex items-center gap-1">
              <FaPercent className="text-[9px]" /> Offer
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3 bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
          <FaArrowRight className="text-xs" />
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-base leading-snug mb-1 truncate group-hover:text-green-700 transition-colors">
          {listing.name}
        </h3>
        <p className="flex items-center gap-1.5 text-slate-400 text-xs mb-2.5 truncate">
          <FaMapMarkerAlt className="text-green-400 shrink-0" />
          {listing.address}
        </p>

        {/* City / State pills */}
        {(listing.city || listing.state) && (
          <div className="flex items-center gap-2 mb-3">
            {listing.city && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full">
                <FaCity className="text-[10px]" /> {listing.city}
              </span>
            )}
            {listing.state && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                <FaMapMarkerAlt className="text-[10px]" /> {listing.state}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
          <span className="flex items-center gap-1.5">
            <FaBed className="text-green-400" /> {listing.bedrooms} {listing.bedrooms === 1 ? 'Bed' : 'Beds'}
          </span>
          <span className="flex items-center gap-1.5">
            <FaBath className="text-violet-400" /> {listing.bathrooms} {listing.bathrooms === 1 ? 'Bath' : 'Baths'}
          </span>
          {listing.squareFootage && (
            <span className="flex items-center gap-1.5 text-slate-400 text-xs">
              <FaExpand className="text-slate-300" /> {listing.squareFootage} sq ft
            </span>
          )}
        </div>

        {/* Amenity chips */}
        {amenityKeys.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {amenityKeys.slice(0, 4).map(key => {
              const { Icon, label } = AMENITY_ICONS[key];
              return (
                <span key={key} className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
                  <Icon className="text-green-500 text-[10px]" /> {label}
                </span>
              );
            })}
            {amenityKeys.length > 4 && (
              <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                +{amenityKeys.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-end justify-between pt-3 border-t border-slate-100">
          <div>
            {listing.offer && listing.discountPrice ? (
              <>
                <p className="text-xs text-slate-400 line-through">{toShortINR(listing.regularPrice)}</p>
                <p className="text-lg font-bold text-green-600">
                  {toShortINR(listing.discountPrice)}
                  <span className="text-xs font-normal text-slate-400 ml-1">{isRent ? '/mo' : ''}</span>
                </p>
              </>
            ) : (
              <p className="text-lg font-bold text-green-600">
                {toShortINR(listing.regularPrice)}
                <span className="text-xs font-normal text-slate-400 ml-1">{isRent ? '/mo' : ''}</span>
              </p>
            )}
          </div>
          <span className="text-xs text-green-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            View <FaArrowRight className="text-[10px]" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Filter panel (shared by sidebar + mobile drawer) ─────────────────────────
function FilterPanel({ data, onChange, onSubmit, onReset }) {
  const inputCls = 'w-full border border-slate-200 bg-slate-50 rounded-xl py-2.5 px-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition';

  const amenityList = [
    { id: 'offer',        Icon: FaPercent,      label: 'Special Offer' },
    { id: 'parking',      Icon: FaCar,          label: 'Parking'       },
    { id: 'furnished',    Icon: FaCouch,        label: 'Furnished'     },
    { id: 'swimmingPool', Icon: FaSwimmingPool, label: 'Pool'          },
    { id: 'gym',          Icon: FaDumbbell,     label: 'Gym'           },
    { id: 'playArea',     Icon: FaChild,        label: 'Play Area'     },
    { id: 'garden',       Icon: FaTree,         label: 'Garden'        },
    { id: 'security',     Icon: FaShieldAlt,    label: '24/7 Security' },
    { id: 'wifi',         Icon: FaWifi,         label: 'Wi-Fi'         },
    { id: 'powerBackup',  Icon: FaBolt,         label: 'Power Backup'  },
  ];

  const availableCities = data.state ? getCitiesForState(data.state) : [];

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">

      {/* Location — State + City */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Location</p>
        <div className="flex flex-col gap-2">
          <div className="relative">
            <select id="state" value={data.state} onChange={onChange} className={`${inputCls} appearance-none pr-8 cursor-pointer`}>
              <option value="">All States</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
          </div>
          <div className="relative">
            <select id="city" value={data.city} onChange={onChange} disabled={!data.state}
              className={`${inputCls} appearance-none pr-8 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed`}>
              <option value="">{data.state ? 'All Cities' : 'Select a state first'}</option>
              {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Type */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Property Type</p>
        <div className="grid grid-cols-3 gap-2">
          {[{ id: 'all', label: 'All' }, { id: 'rent', label: 'Rent' }, { id: 'sale', label: 'Sale' }].map(({ id, label }) => (
            <button key={id} type="button" onClick={() => onChange({ target: { id } })}
              className={`py-2 rounded-xl text-sm font-semibold border-2 transition
                ${data.type === id ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-green-300'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Suitable For */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Suitable For</p>
        <div className="grid grid-cols-2 gap-2">
          {SUITABLE_OPTIONS.map(({ value, Icon, label }) => (
            <button key={value} type="button" onClick={() => onChange({ target: { id: 'suitableFor', value } })}
              className={`flex items-center gap-2 py-2 px-3 rounded-xl text-sm font-semibold border-2 transition
                ${data.suitableFor === value ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-green-300'}`}>
              <Icon className={data.suitableFor === value ? 'text-green-500' : 'text-slate-400'} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Price Range (₹)</p>
        <div className="flex gap-2 items-center">
          <input type="number" id="minPrice" placeholder="Min" value={data.minPrice} onChange={onChange} className={inputCls} />
          <span className="text-slate-300 font-bold">—</span>
          <input type="number" id="maxPrice" placeholder="Max" value={data.maxPrice} onChange={onChange} className={inputCls} />
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Min Bedrooms</p>
        <div className="flex gap-2">
          {[{ label: 'Any', val: '' }, { label: '1', val: '1' }, { label: '2', val: '2' }, { label: '3', val: '3' }, { label: '4+', val: '4' }].map(({ label, val }) => (
            <button key={label} type="button" onClick={() => onChange({ target: { id: 'bedrooms', value: val } })}
              className={`flex-1 py-1.5 rounded-xl text-sm font-semibold border-2 transition
                ${data.bedrooms === val ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-green-300'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Amenities & Offer</p>
        <div className="grid grid-cols-2 gap-2">
          {amenityList.map(({ id, Icon, label }) => (
            <label key={id} htmlFor={id}
              className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition text-sm font-medium
                ${data[id] ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-green-300'}`}>
              <input type="checkbox" id={id} checked={!!data[id]} onChange={onChange} className="hidden" />
              <Icon className={`text-sm ${data[id] ? 'text-green-500' : 'text-slate-400'}`} />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Sort By</p>
        <div className="relative">
          <select id="sort_order" value={`${data.sort}_${data.order}`} onChange={onChange} className={`${inputCls} appearance-none pr-8`}>
            <option value="createdAt_desc">Newest First</option>
            <option value="createdAt_asc">Oldest First</option>
            <option value="regularPrice_asc">Price: Low to High</option>
            <option value="regularPrice_desc">Price: High to Low</option>
          </select>
          <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onReset} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 text-sm font-semibold hover:border-slate-400 transition">
          Reset
        </button>
        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition shadow-sm">
          Apply
        </button>
      </div>
    </form>
  );
}

// ── Main Search component ──────────────────────────────────────────────────────
export default function Search() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [sidebardata, setSidebardata] = useState(DEFAULT_SIDEBAR);
  const [drawerData, setDrawerData]   = useState(DEFAULT_SIDEBAR);

  const [loading, setLoading]     = useState(false);
  const [listings, setListings]   = useState([]);
  const [showMore, setShowMore]   = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeFilterCount = Object.entries(sidebardata).filter(([k, v]) => {
    if (['searchTerm', 'sort', 'order'].includes(k)) return false;
    if (k === 'type' && v === 'all') return false;
    if (k === 'suitableFor' && v === 'all') return false;
    if (['minPrice', 'maxPrice', 'bedrooms', 'state', 'city'].includes(k)) return v !== '';
    return v === true;
  }).length;

  // ── Parse the URL into sidebar state, then fetch matching listings ────────
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);

    const parsed = {
      searchTerm:  urlParams.get('searchTerm')  || '',
      type:        urlParams.get('type')        || 'all',
      sort:        urlParams.get('sort')        || 'createdAt',
      order:       urlParams.get('order')       || 'desc',
      suitableFor: urlParams.get('suitableFor') || 'all',
      minPrice:    urlParams.get('minPrice')    || '',
      maxPrice:    urlParams.get('maxPrice')    || '',
      bedrooms:    urlParams.get('bedrooms')    || '',
      state:       urlParams.get('state')       || '',
      city:        urlParams.get('city')        || '',
      ...Object.fromEntries(BOOLEAN_FIELDS.map(f => [f, urlParams.get(f) === 'true'])),
    };

    setSidebardata(parsed);
    setDrawerData(parsed);

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      const res  = await fetch(`/api/listing/get?${urlParams.toString()}`);
      const data = await res.json();
      setShowMore(data.length > 8);
      setListings(data);
      setLoading(false);
    };

    fetchListings();
  }, [location.search]);

  const handleChange = (e, target = sidebardata, setter = setSidebardata) => {
    const { id, value, checked } = e.target;

    if (['all', 'rent', 'sale'].includes(id)) return setter(p => ({ ...p, type: id }));
    if (id === 'state')       return setter(p => ({ ...p, state: value, city: '' })); // reset city when state changes
    if (id === 'suitableFor') return setter(p => ({ ...p, suitableFor: value }));
    if (BOOLEAN_FIELDS.includes(id)) return setter(p => ({ ...p, [id]: checked }));
    if (id === 'sort_order') {
      const [sort, order] = value.split('_');
      return setter(p => ({ ...p, sort: sort || 'createdAt', order: order || 'desc' }));
    }
    // searchTerm, minPrice, maxPrice, bedrooms, city — all simple value fields
    setter(p => ({ ...p, [id]: value }));
  };

  const handleDrawerChange = (e) => handleChange(e, drawerData, setDrawerData);

  const buildParams = (data) => {
    const p = new URLSearchParams();
    Object.entries(data).forEach(([k, v]) => { if (v !== '' && v !== false) p.set(k, v); });
    return p.toString();
  };

  const handleSubmit = (e) => { e.preventDefault(); navigate(`/search?${buildParams(sidebardata)}`); };

  const handleDrawerApply = (e) => {
    e.preventDefault();
    setSidebardata(drawerData);
    setDrawerOpen(false);
    navigate(`/search?${buildParams(drawerData)}`);
  };

  const handleReset = () => { setSidebardata(DEFAULT_SIDEBAR); navigate('/search'); };
  const handleDrawerReset = () => setDrawerData(DEFAULT_SIDEBAR);

  const removeFilter = (key, resetVal = false) => {
    const updated = { ...sidebardata, [key]: resetVal };
    if (key === 'state') updated.city = ''; // clearing state also clears city
    setSidebardata(updated);
    navigate(`/search?${buildParams(updated)}`);
  };

  const onShowMoreClick = async () => {
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', listings.length);
    const res  = await fetch(`/api/listing/get?${urlParams.toString()}`);
    const data = await res.json();
    if (data.length < 9) setShowMore(false);
    setListings(prev => [...prev, ...data]);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Sticky top search bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2.5 border border-slate-200 focus-within:border-green-400 focus-within:bg-white transition">
            <FaSearch className="text-slate-400 shrink-0" />
            <input type="text" id="searchTerm" placeholder="Search by name, location…" value={sidebardata.searchTerm} onChange={handleChange}
              className="flex-1 bg-transparent focus:outline-none text-slate-800 text-sm placeholder-slate-400" />
            {sidebardata.searchTerm && (
              <button type="button" onClick={() => setSidebardata(p => ({ ...p, searchTerm: '' }))} className="text-slate-400 hover:text-slate-600 transition">
                <FaTimes className="text-xs" />
              </button>
            )}
          </form>

          <button type="button" onClick={() => { setDrawerData(sidebardata); setDrawerOpen(true); }}
            className="lg:hidden flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm relative">
            <FaFilter /> Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">

        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-20">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-800 flex items-center gap-2"><FaSlidersH className="text-green-500" /> Filters</h2>
              {activeFilterCount > 0 && <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">{activeFilterCount} active</span>}
            </div>
            <FilterPanel data={sidebardata} onChange={handleChange} onSubmit={handleSubmit} onReset={handleReset} />
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1 min-w-0">

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              {loading ? 'Searching…' : (
                <>
                  <span className="font-bold text-slate-800">{listings.length}</span>
                  {showMore ? '+' : ''} {listings.length === 1 ? 'property' : 'properties'} found
                  {sidebardata.searchTerm && <span> for "<span className="text-green-600">{sidebardata.searchTerm}</span>"</span>}
                  {sidebardata.city && <span> in <span className="text-green-600">{sidebardata.city}</span></span>}
                </>
              )}
            </p>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
              <FaSortAmountDown className="text-slate-300" />
              {sidebardata.sort === 'createdAt' ? 'Newest' : 'Price'} · {sidebardata.order === 'desc' ? '↓' : '↑'}
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {sidebardata.state && (
                <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  <FaMapMarkerAlt className="text-[10px]" /> {sidebardata.state}
                  <button type="button" onClick={() => removeFilter('state', '')}><FaTimes className="text-[10px]" /></button>
                </span>
              )}
              {sidebardata.city && (
                <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  <FaCity className="text-[10px]" /> {sidebardata.city}
                  <button type="button" onClick={() => removeFilter('city', '')}><FaTimes className="text-[10px]" /></button>
                </span>
              )}
              {sidebardata.type !== 'all' && (
                <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {sidebardata.type === 'rent' ? 'For Rent' : 'For Sale'}
                  <button type="button" onClick={() => removeFilter('type', 'all')}><FaTimes className="text-[10px]" /></button>
                </span>
              )}
              {sidebardata.suitableFor !== 'all' && (
                <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {SUITABLE_OPTIONS.find(s => s.value === sidebardata.suitableFor)?.label}
                  <button type="button" onClick={() => removeFilter('suitableFor', 'all')}><FaTimes className="text-[10px]" /></button>
                </span>
              )}
              {sidebardata.bedrooms && (
                <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {sidebardata.bedrooms}+ Beds
                  <button type="button" onClick={() => removeFilter('bedrooms', '')}><FaTimes className="text-[10px]" /></button>
                </span>
              )}
              {(sidebardata.minPrice || sidebardata.maxPrice) && (
                <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {sidebardata.minPrice ? toShortINR(sidebardata.minPrice) : '₹0'} – {sidebardata.maxPrice ? toShortINR(sidebardata.maxPrice) : '∞'}
                  <button type="button" onClick={() => { removeFilter('minPrice', ''); removeFilter('maxPrice', ''); }}><FaTimes className="text-[10px]" /></button>
                </span>
              )}
              {Object.keys(AMENITY_ICONS).filter(k => sidebardata[k]).map(k => (
                <span key={k} className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {AMENITY_ICONS[k].label}
                  <button type="button" onClick={() => removeFilter(k, false)}><FaTimes className="text-[10px]" /></button>
                </span>
              ))}
              {sidebardata.offer && (
                <span className="flex items-center gap-1.5 bg-rose-100 text-rose-600 text-xs font-semibold px-3 py-1 rounded-full">
                  Special Offer
                  <button type="button" onClick={() => removeFilter('offer', false)}><FaTimes className="text-[10px]" /></button>
                </span>
              )}
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                  <div className="h-52 bg-slate-200" />
                  <div className="p-4 flex flex-col gap-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="flex gap-3"><div className="h-3 bg-slate-100 rounded w-16" /><div className="h-3 bg-slate-100 rounded w-16" /></div>
                    <div className="h-5 bg-slate-200 rounded w-1/3 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && listings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {listings.map(l => <ListingCard key={l._id} listing={l} />)}
            </div>
          )}

          {!loading && listings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <FaHome className="text-green-300 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No properties found</h3>
              <p className="text-slate-400 text-sm max-w-xs mb-6">Try adjusting your filters or search term.</p>
              <button onClick={handleReset} className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 transition">
                Clear all filters
              </button>
            </div>
          )}

          {!loading && showMore && (
            <div className="flex justify-center mt-8">
              <button onClick={onShowMoreClick} className="flex items-center gap-2 bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 px-8 py-3 rounded-xl font-semibold text-sm transition shadow-sm">
                Show more <FaChevronDown />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile drawer */}
      <div onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} />

      <div className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <FaSlidersH className="text-green-500" /> Filters
            {activeFilterCount > 0 && <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full ml-1">{activeFilterCount}</span>}
          </h2>
          <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 transition"><FaTimes /></button>
        </div>
        <div className="overflow-y-auto max-h-[75vh] px-5 py-4">
          <FilterPanel data={drawerData} onChange={handleDrawerChange} onSubmit={handleDrawerApply} onReset={handleDrawerReset} />
        </div>
      </div>
    </div>
  );
}
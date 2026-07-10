import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

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

// ─── Eyebrow label
function Eyebrow({ children, dark }) {
  return (
    <div className={`inline-flex items-center gap-2 text-sm md:text-base font-bold uppercase tracking-widest mb-3 ${dark ? "text-green-200" : "text-green-800"}`}>
      <span className={`w-4 h-0.5 rounded inline-block ${dark ? "bg-green-300" : "bg-green-700"}`} />
      {children}
    </div>
  );
}

// ─── Shared section heading
function SectionHeading({ eyebrow, title, subtitle, dark, wide, className = "" }) {
  return (
    <div className={`text-center ${wide ? "max-w-2xl" : "max-w-xl"} mx-auto mb-14 ${className}`}>
      <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
      <h2 className={`text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 leading-[1.1] ${dark ? "text-white" : "text-slate-900"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg md:text-xl leading-relaxed ${dark ? "text-green-100" : "text-slate-600"}`}>{subtitle}</p>
      )}
    </div>
  );
}

function GeoShapes({ variant = "light" }) {
  const ring = variant === "dark" ? "border-white/20" : "border-green-300/40";
  return (
    <>
      <div className={`absolute -top-32 -right-32 w-[420px] h-[420px] md:w-[480px] md:h-[480px] rounded-full border-[3px] ${ring} pointer-events-none`} />
      <div className={`absolute -bottom-24 -left-20 w-[280px] h-[280px] md:w-[360px] md:h-[360px] rounded-full border-[3px] ${ring} pointer-events-none`} />
      <div className={`absolute top-1/3 left-[8%] w-16 h-16 rotate-45 border-2 ${ring} pointer-events-none hidden md:block`} />
    </>
  );
}

// ─── Static content config ───────────────────────────────────────────────────
const STATS = [
  { icon: "fa-layer-group",  value: "1,000+", label: "Verified Listings" },
  { icon: "fa-city",         value: "50+",    label: "Cities Covered" },
  { icon: "fa-users",        value: "10K+",   label: "Happy Users" },
  { icon: "fa-handshake",    value: "500+",   label: "Deals Closed" },
];

const VALUES = [
  { icon: "fa-shield-halved",     title: "Trust First",       desc: "Every listing and every owner is verified before anything goes live. No fakes, no guesswork." },
  { icon: "fa-comments",          title: "Direct Connection", desc: "We cut out unnecessary middlemen so buyers, tenants, and owners can talk to each other directly." },
  { icon: "fa-magnifying-glass-location", title: "Smart Discovery", desc: "Powerful filters and location tools help people find exactly the property that fits their life." },
  { icon: "fa-scale-balanced",    title: "Fairness",          desc: "Transparent pricing and honest listings — what you see is what's actually being offered." },
];

const STORY_POINTS = [
  { icon: "fa-lightbulb",   title: "The Idea",     desc: "Nestora started as a simple frustration: property hunting in India felt cluttered, unverified, and slow. We set out to fix that." },
  { icon: "fa-code-branch", title: "Building It",  desc: "A small team focused on one thing — a platform where every listing is checked, and every conversation happens directly between real people." },
  { icon: "fa-arrow-trend-up", title: "Growing",   desc: "Today, Nestora connects homebuyers, tenants, sellers, and landlords across the country, with trust built into every step." },
];

const TEAM = [
  { name: "Viraj Bhatia", role: "Founder & Developer", icon: "fa-user-gear" },
];

// ─── About page ───────────────────────────────────────────────────────────────
export default function About() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* HERO */}
      <section className="min-h-[70vh] flex items-center bg-green-50 relative overflow-hidden">
        <GeoShapes />
        <div className="relative z-10 max-w-[1200px] mx-auto w-full px-6 md:px-16 py-20 text-center">
          <FadeUp>
            <Eyebrow>About Nestora</Eyebrow>
            <h1 className="text-5xl sm:text-6xl md:text-[64px] font-extrabold leading-[1.08] tracking-tight text-slate-900 mb-6">
              Real Estate, Built On<br />
              <span className="text-green-700">Trust &amp; Transparency</span>
            </h1>
            <p className="text-slate-600 text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto">
              Nestora is a full-stack real estate platform connecting buyers, tenants,
              sellers, and landlords — with verification built into every listing.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* MISSION */}
      <section className="min-h-screen flex items-center bg-white relative overflow-hidden">
        <div className="relative z-10 max-w-[1200px] mx-auto w-full px-6 md:px-16 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <FadeUp>
              <div>
                <Eyebrow>Our Mission</Eyebrow>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-5 leading-[1.1]">
                  Making Property<br />Search Honest Again
                </h2>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-6">
                  Finding a home shouldn't mean sorting through duplicate listings,
                  unverified owners, and inflated prices. Nestora exists to make
                  property discovery straightforward — every listing checked, every
                  owner confirmed, every price transparent.
                </p>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                  Whether you're buying your first home, renting an apartment, or
                  listing a property to sell, we want the process to feel simple
                  and trustworthy from the first search to the final handshake.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={100}>
              <div className="grid grid-cols-2 gap-5">
                {STATS.map(s => (
                  <div key={s.label} className="bg-green-50 border border-green-100 rounded-2xl p-7 text-center">
                    <i className={`fa-solid ${s.icon} text-3xl text-green-700 mb-3 block`} />
                    <div className="text-3xl font-extrabold text-slate-900 mb-1">{s.value}</div>
                    <div className="text-sm md:text-base text-slate-600 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="min-h-screen flex items-center bg-slate-50">
        <div className="max-w-[1200px] mx-auto w-full px-6 md:px-16 py-24">
          <FadeUp>
            <SectionHeading
              eyebrow="What We Stand For"
              title="Our Core Values"
              subtitle="The principles behind every feature we build."
            />
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((v, i) => (
              <FadeUp key={v.title} delay={i * 80}>
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:border-green-300 transition-all duration-200 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center text-2xl mb-5">
                    <i className={`fa-solid ${v.icon}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2.5">{v.title}</h3>
                  <p className="text-base text-slate-600 leading-relaxed">{v.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="min-h-screen flex items-center bg-white relative overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full border-[3px] border-green-200 pointer-events-none hidden lg:block" />
        <div className="relative z-10 max-w-[1200px] mx-auto w-full px-6 md:px-16 py-24">
          <FadeUp>
            <SectionHeading eyebrow="Our Story" title="How Nestora Came To Be" />
          </FadeUp>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-green-200 z-0" />
            {STORY_POINTS.map((s, i) => (
              <FadeUp key={s.title} delay={i * 100}>
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white border-2 border-green-400 shadow-sm flex items-center justify-center mx-auto mb-5 text-green-700 text-2xl">
                    <i className={`fa-solid ${s.icon}`} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h4>
                  <p className="text-base text-slate-600 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="min-h-[70vh] flex items-center bg-slate-50">
        <div className="max-w-[1200px] mx-auto w-full px-6 md:px-16 py-24">
          <FadeUp>
            <SectionHeading eyebrow="Behind Nestora" title="Meet The Team" />
          </FadeUp>

          <div className="flex flex-wrap justify-center gap-6">
            {TEAM.map((m, i) => (
              <FadeUp key={m.name} delay={i * 80}>
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center w-64">
                  <div className="w-20 h-20 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-3xl mx-auto mb-5">
                    <i className={`fa-solid ${m.icon}`} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">{m.name}</h4>
                  <p className="text-sm text-slate-500">{m.role}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="min-h-[60vh] flex items-center bg-green-50 relative overflow-hidden">
        <GeoShapes />
        <div className="relative z-10 max-w-[1200px] mx-auto w-full px-6 md:px-16 py-20 text-center">
          <FadeUp>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Ready To Get Started?
            </h2>
            <p className="text-slate-600 text-xl md:text-2xl max-w-lg mx-auto mb-10">
              Join Nestora today and experience real estate the way it should be.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/search" className="inline-flex items-center gap-2 h-14 px-9 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-lg transition-all duration-200 hover:-translate-y-0.5 shadow-md shadow-green-200">
                Explore Properties
              </Link>
              <Link to="/create-listing" className="inline-flex items-center gap-2 h-14 px-9 rounded-xl bg-white border-2 border-green-200 text-slate-800 font-bold text-lg hover:bg-green-100 transition-all duration-200 hover:-translate-y-0.5">
                List Your Property
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
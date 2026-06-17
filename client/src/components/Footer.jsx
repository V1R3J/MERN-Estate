import { FaWhatsapp, FaLinkedinIn, FaInstagram, FaBuildingColumns, FaLocationDot, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa6';

const Footer = () => {
  return (
    <footer className="bg-green-600 text-emerald-100 pt-12">
      <div className="max-w-6xl mx-auto px-6">

        {/* Social Connect Banner */}
        <div className="bg-emerald-900 border border-emerald-700/30 rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
          <div>
            <p className="text-white text-sm font-medium">Connect with Nestora</p>
            <p className="text-white text-xs mt-0.5">Follow us for listings, market insights & property tips</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-[#25d366] border border-white/20 hover:border-[#25d366] text-white text-xs font-medium px-4 py-2 rounded-full transition-all duration-200"
            >
              <FaWhatsapp className="text-sm" />
              WhatsApp
            </a>
            <a
              href="https://linkedin.com/company/nestora"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-[#0a66c2] border border-white/20 hover:border-[#0a66c2] text-white text-xs font-medium px-4 py-2 rounded-full transition-all duration-200"
            >
              <FaLinkedinIn className="text-sm" />
              LinkedIn
            </a>
            <a
              href="https://instagram.com/nestora"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-[#e1306c] border border-white/20 hover:border-[#e1306c] text-white text-xs font-medium px-4 py-2 rounded-full transition-all duration-200"
            >
              <FaInstagram className="text-sm" />
              Instagram
            </a>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 pb-10 border-b border-emerald-800/40">

          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                {/* Replace with <img src="/logo.png" alt="Nestora" className="w-9 h-9 rounded-lg object-contain" /> */}
                <FaBuildingColumns className="text-white text-base" />
              </div>
              <span className="text-white text-lg font-semibold tracking-wide">Nestora</span>
            </div>

            <p className="text-white text-sm leading-relaxed mb-5 max-w-[220px]">
              Your trusted partner in finding the perfect home across India's finest properties.
            </p>

            {/* Social Icons */}
            <div className="flex gap-2">
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 hover:bg-emerald-500/30 hover:border-emerald-400/40 flex items-center justify-center text-white transition-all duration-200"
              >
                <FaWhatsapp className="text-sm" />
              </a>
              <a
                href="https://linkedin.com/company/nestora"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 hover:bg-emerald-500/30 hover:border-emerald-400/40 flex items-center justify-center text-white transition-all duration-200"
              >
                <FaLinkedinIn className="text-sm" />
              </a>
              <a
                href="https://instagram.com/nestora"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 hover:bg-emerald-500/30 hover:border-emerald-400/40 flex items-center justify-center text-white transition-all duration-200"
              >
                <FaInstagram className="text-sm" />
              </a>
            </div>
          </div>

          {/* Properties */}
          <div>
            <p className="text-white text-sm font-semibold uppercase tracking-widest mb-4">Properties</p>
            <ul className="space-y-2.5">
              {['Buy a home', 'Rent a property', 'New projects', 'Commercial spaces', 'Luxury listings'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-white hover:text-blue-300 text-sm transition-colors duration-150">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-white text-sm font-semibold uppercase tracking-widest mb-4">Company</p>
            <ul className="space-y-2.5">
              {['About Nestora', 'Our agents', 'Careers', 'Blog', 'Press'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-white hover:text-blue-300 text-sm transition-colors duration-150">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Contact</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <FaLocationDot className="text-white text-sm mt-0.5 flex-shrink-0" />
                <span className="text-white text-sm leading-relaxed">
                  123 SG Highway,<br />Ahmedabad, Gujarat 380060
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <FaPhone className="text-white text-sm flex-shrink-0" />
                <span className="text-white text-sm">+91 99999 99999</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FaEnvelope className="text-white text-sm flex-shrink-0" />
                <span className="text-white text-sm">hello@nestora.in</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FaClock className="text-white text-sm flex-shrink-0" />
                <span className="text-white text-sm">Mon – Sat, 9am – 7pm</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-emerald-950/80 border-t border-emerald-800/40 mt-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-emerald-400 text-xs">© 2025 Nestora. All rights reserved.</p>
          <div className="flex gap-5">
            {['Privacy policy', 'Terms of use', 'Sitemap'].map((item) => (
              <a key={item} href="#" className="text-emerald-400 hover:text-white text-xs transition-colors duration-150">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
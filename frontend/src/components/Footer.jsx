import { Link } from 'react-router-dom';
import { Mail, MapPin, Heart } from 'lucide-react';

const Instagram = ({ size = 16, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);


const Footer = () => {
  return (
    <footer className="bg-charcoal text-white/95 border-t border-gold-artistic/20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* About Column */}
        <div className="flex flex-col space-y-4">
          <Link to="/" className="flex flex-col">
            <span className="font-serif text-3xl font-bold tracking-wider text-gold-artistic">
              Kalaakar
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold-rose">
              Turning Memories Into Art
            </span>
          </Link>
          <p className="text-white/70 text-sm font-light leading-relaxed">
            A boutique studio transforming your treasured moments, photos, and milestones into luxury handmade art, custom portraits, and bespoke gift boxes.
          </p>
        </div>

        {/* Links Column */}
        <div>
          <h3 className="font-serif text-lg text-gold-artistic mb-4">Studio Menu</h3>
          <ul className="space-y-2.5 text-sm font-light text-white/70">
            <li>
              <Link to="/" className="hover:text-gold-rose transition-colors">Home Studio</Link>
            </li>
            <li>
              <Link to="/gallery" className="hover:text-gold-rose transition-colors">Handmade Gallery</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-gold-rose transition-colors">Our Creative Story</Link>
            </li>
            <li>
              <Link to="/custom-order" className="hover:text-gold-rose transition-colors">Commission Custom Art</Link>
            </li>
            <li>
              <Link to="/track" className="hover:text-gold-rose transition-colors">Track Order Status</Link>
            </li>
          </ul>
        </div>

        {/* Categories Column */}
        <div>
          <h3 className="font-serif text-lg text-gold-artistic mb-4">Gifting Specialties</h3>
          <ul className="space-y-2.5 text-sm font-light text-white/70">
            <li>Custom Sketch Portraits</li>
            <li>Engagement Ring Holders</li>
            <li>Cotton Craft Decorations</li>
            <li>Paper Craft Explosion Boxes</li>
            <li>Anniversary & Wedding Gifts</li>
          </ul>
        </div>

        {/* Contact Column */}
        <div className="flex flex-col space-y-4">
          <h3 className="font-serif text-lg text-gold-artistic mb-4">Connect With Artist</h3>
          <div className="flex items-center space-x-3 text-sm font-light text-white/70">
            <Mail size={16} className="text-gold-rose" />
            <a href="mailto:mahekthakor023@gmail.com" className="hover:text-gold-rose transition-colors">mahekthakor023@gmail.com</a>
          </div>
          <div className="flex items-center space-x-3 text-sm font-light text-white/70">
            <MapPin size={16} className="text-gold-rose" />
            <span>Bharuch, Gujarat, India</span>
          </div>
          <div className="flex items-center space-x-3 text-sm font-light text-white/70">
            <Instagram size={16} className="text-gold-rose" />
            <a href="https://www.instagram.com/___kalaakar____?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="hover:text-gold-rose transition-colors">___kalaakar____</a>
          </div>
          
          <div className="pt-2">
            <Link 
              to="/admin/login" 
              className="text-xs uppercase tracking-wider text-white/40 hover:text-gold-artistic transition-colors"
            >
              Artist Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Underline Copyright */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/50 font-light">
        <p>© 2026 Kalaakar Art Studio. All rights reserved.</p>
        <p className="flex items-center gap-1 mt-2 md:mt-0">
          Crafted with <Heart size={12} className="text-gold-rose fill-gold-rose" /> for luxury handmade memories.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

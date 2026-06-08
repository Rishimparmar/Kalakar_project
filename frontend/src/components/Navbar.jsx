import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Gift, Brush, HelpCircle, PhoneCall, Compass, UserCheck } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isAdmin = localStorage.getItem('kalaakar_token') !== null;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on navigate
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Art Gallery', path: '/gallery' },
    { name: 'Our Story', path: '/about' },
    { name: 'FAQs', path: '/faq' },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-canvas/90 backdrop-blur-md shadow-premium border-b border-cream-dark/50 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Brand Logo */}
        <Link to="/" className="flex flex-col group">
          <span className="font-serif text-2xl md:text-3xl font-black tracking-widest text-charcoal flex items-baseline gap-1 transition-all duration-300 group-hover:text-gold-rose">
            काला
            <span className="font-script text-base md:text-lg font-bold text-gold-artistic tracking-normal ml-0.5 lowercase">
              by Mahek
            </span>
          </span>
          <span className="text-[9px] uppercase tracking-[0.22em] text-charcoal-light/60 font-semibold mt-0.5 group-hover:text-gold-rose/80 transition-colors">
            Turning Memories Into Art
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm tracking-wide font-medium transition-colors hover:text-gold-soft ${
                location.pathname === link.path ? 'text-gold-artistic' : 'text-charcoal-light'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          <Link
            to="/track"
            className="text-xs uppercase tracking-wider text-gold-rose font-semibold border border-gold-rose/30 hover:border-gold-rose px-3 py-1.5 rounded transition-all hover:bg-gold-rose/5"
          >
            Track Order
          </Link>

          {!isAdmin ? (
            <Link
              to="/admin/login"
              className="text-xs uppercase tracking-wider text-charcoal-light hover:text-gold-artistic hover:border-gold-artistic/60 px-3 py-1.5 border border-cream-dark/60 rounded transition-all font-semibold"
            >
              Login
            </Link>
          ) : (
            <Link
              to="/admin/dashboard"
              className="text-xs uppercase tracking-wider text-gold-soft font-semibold border border-gold-soft/30 hover:border-gold-soft px-3 py-1.5 rounded flex items-center gap-1 transition-all hover:bg-gold-soft/5"
            >
              <UserCheck size={14} /> Dashboard
            </Link>
          )}

          <Link
            to="/custom-order"
            className="bg-gradient-to-r from-gold-rose to-gold-soft text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-premium hover:shadow-gold hover:scale-[1.02] transition-all border border-white/20 dark:border-gold-soft/50 dark:shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          >
            Book Custom Art
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="lg:hidden flex items-center space-x-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-charcoal hover:text-gold-rose transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-[60px] bg-canvas z-50 px-6 py-8 border-t border-cream-dark/40 flex flex-col justify-between">
          <div className="flex flex-col space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-xl font-serif tracking-wide border-b border-cream-dark/30 pb-2 ${
                  location.pathname === link.path ? 'text-gold-artistic font-bold' : 'text-charcoal'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <Link
              to="/track"
              className="text-lg font-serif border-b border-cream-dark/30 pb-2 text-gold-rose"
            >
              Track Custom Order
            </Link>

            {!isAdmin ? (
              <Link
                to="/admin/login"
                className="text-lg font-serif border-b border-cream-dark/30 pb-2 text-charcoal"
              >
                Artist Login
              </Link>
            ) : (
              <Link
                to="/admin/dashboard"
                className="text-lg font-serif border-b border-cream-dark/30 pb-2 text-gold-soft"
              >
                Admin Dashboard
              </Link>
            )}
          </div>

          <div className="mt-8">
            <Link
              to="/custom-order"
              className="w-full text-center block bg-gradient-to-r from-gold-rose to-gold-soft text-white font-medium py-3 rounded-full shadow-premium border border-white/20 dark:border-gold-soft/50 dark:shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            >
              Book Custom Art / Gift
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

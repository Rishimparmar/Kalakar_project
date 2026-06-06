import { useState } from 'react';
import { api } from '../services/api';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

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


const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Mock Instagram Grid posts to sync with the portfolio
  const instagramPosts = [
    { id: 1, url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300', likes: '124' },
    { id: 2, url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300', likes: '312' },
    { id: 3, url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300', likes: '98' },
    { id: 4, url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=300', likes: '185' },
    { id: 5, url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300', likes: '240' },
    { id: 6, url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', likes: '420' }
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg('Name, email, and message are required.');
      setLoading(false);
      return;
    }

    try {
      await api.submitContact(formData);
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error sending message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-6 md:px-12">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-rose font-bold">Contact Studio</span>
        <h1 className="text-3xl md:text-5xl font-bold text-charcoal mt-1 mb-4">Let's Connect</h1>
        <p className="text-sm text-charcoal-light font-light leading-relaxed">
          Send us a message regarding custom sizing, event collaborations, or specific flower preservation request details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
        
        {/* Contact info cards left */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-premium border border-cream-dark/20 flex items-start space-x-4">
            <div className="bg-gold-rose/10 p-3 rounded-xl text-gold-rose">
              <Mail size={20} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-charcoal">Email Studio</h4>
              <p className="text-xs text-charcoal-light font-light mt-1">Submit inquiries or reference folders.</p>
              <a href="mailto:hello@kalaakar.com" className="text-xs text-gold-soft font-semibold block mt-1.5 hover:underline">hello@kalaakar.com</a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-premium border border-cream-dark/20 flex items-start space-x-4">
            <div className="bg-gold-soft/10 p-3 rounded-xl text-gold-soft">
              <Phone size={20} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-charcoal">WhatsApp consultation</h4>
              <p className="text-xs text-charcoal-light font-light mt-1">Consult with our artist directly.</p>
              <a href="https://wa.me/916355303793" target="_blank" rel="noopener noreferrer" className="text-xs text-gold-rose font-semibold block mt-1.5 hover:underline">+91 63553 03793</a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-premium border border-cream-dark/20 flex items-start space-x-4">
            <div className="bg-charcoal/5 p-3 rounded-xl text-charcoal">
              <MapPin size={20} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-charcoal">Location</h4>
              <p className="text-xs text-charcoal-light font-light mt-1">Based in Mumbai, Maharashtra, India. Shipments delivered nationwide.</p>
            </div>
          </div>
        </div>

        {/* Contact form right */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl shadow-premium border border-cream-dark/30">
          {success ? (
            <div className="text-center py-10 flex flex-col items-center">
              <CheckCircle size={56} className="text-gold-rose mb-4" />
              <h3 className="font-serif text-xl font-bold text-charcoal mb-2">Message Dispatched</h3>
              <p className="text-xs text-charcoal-light font-light max-w-sm leading-relaxed mb-6">
                Your inquiry has been successfully sent. We will review your requests and email you back soon.
              </p>
              <button
                onClick={() => { setSuccess(false); setFormData({ name: '', email: '', phone: '', message: '' }); }}
                className="bg-cream-dark/50 text-charcoal hover:bg-cream-dark px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3.5 rounded-lg text-xs font-light">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-[10px] text-charcoal-light font-medium uppercase tracking-wider mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] text-charcoal-light font-medium uppercase tracking-wider mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. name@email.com"
                    className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-charcoal-light font-medium uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 63553 03793"
                    className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-charcoal-light font-medium uppercase tracking-wider mb-2">Message *</label>
                <textarea
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us what you want to inquire..."
                  className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gold-rose to-gold-soft text-white font-medium py-3.5 rounded-xl shadow-premium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                {loading ? 'Sending Message...' : <><Send size={14} /> Dispatch Message</>}
              </button>
            </form>
          )}
        </div>

      </div>

      {/* SIMULATED INSTAGRAM FEED */}
      <section className="border-t border-cream-dark/50 pt-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold-rose font-bold">Instagram Grid Sync</span>
            <h2 className="font-serif text-2xl font-bold text-charcoal mt-0.5">Follow @kalaakar.art</h2>
          </div>
          <a
            href="https://instagram.com/kalaakar.art"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold uppercase tracking-wider text-gold-rose hover:text-gold-soft underline flex items-center gap-1.5 mt-2 md:mt-0"
          >
            <Instagram size={14} /> Open Instagram Profile
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {instagramPosts.map((post) => (
            <div key={post.id} className="relative aspect-square rounded-xl overflow-hidden group border border-cream-dark/20 bg-cream">
              <img src={post.url} alt="Instagram Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-charcoal/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-bold font-sans">❤ {post.likes}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Contact;

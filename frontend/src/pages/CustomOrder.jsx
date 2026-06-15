import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { Calendar, Upload, FileText, CheckCircle, Calculator, Info } from 'lucide-react';

const CustomOrder = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('commission'); // commission, quote
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null); // stores order_number or quote_id
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    artwork_type: 'Black & White Sketch (Monochrome Magic)',
    size_selection: 'A4',
    color_preference: 'Gold Accent Highlights',
    faces_count: '1',
    message: '',
    delivery_date: '',
    budget: '',
    additional_instructions: '',
    address: '',
    delivery_zone: 'Local',
    description: '' // For Quotations
  });

  // Helper to evaluate base price dynamically
  const getBasePrice = (artworkType, sizeSelection) => {
    if (artworkType.includes('Colour Sketch Art')) {
      return sizeSelection === 'A3' ? 2999 : 1999;
    }
    if (artworkType.includes('Black & White Sketch')) {
      return sizeSelection === 'A3' ? 1999 : 999;
    }
    // All other hand decors start at 1000
    return sizeSelection === 'A3' ? 2000 : 1000;
  };

  // Dynamic Price Estimator State
  const [estimatedPrice, setEstimatedPrice] = useState(999);

  // Set tab from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'quote') {
      setActiveTab('quote');
    }
  }, [location]);

  // Calculate pricing whenever variables change
  useEffect(() => {
    const type = formData.artwork_type.toLowerCase();
    let price = getBasePrice(formData.artwork_type, formData.size_selection);
    
    if (type.includes('sketch') || type.includes('portrait')) {
      const faces = parseInt(formData.faces_count) || 1;
      if (faces > 1) {
        price += (faces - 1) * 500;
      }
    }
    if (formData.color_preference.includes('Gold')) {
      price += 300;
    }
    if (formData.delivery_zone === 'Long Distance') {
      price += 250;
    }

    setEstimatedPrice(price);
  }, [formData.artwork_type, formData.size_selection, formData.faces_count, formData.color_preference, formData.delivery_zone]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Submit Commission Order
  const handleCommissionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    if (!formData.name || !formData.email || !formData.phone || !formData.delivery_date) {
      setErrorMsg('Please fill in all required contact and delivery details.');
      setSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9\s\-()]{9,20}$/;

    if (!emailRegex.test(formData.email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      setSubmitting(false);
      return;
    }
    if (!phoneRegex.test(formData.phone.trim())) {
      setErrorMsg('Please enter a valid phone number.');
      setSubmitting(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('artwork_type', formData.artwork_type);
      data.append('size_selection', formData.size_selection);
      data.append('color_preference', formData.color_preference);
      data.append('message', formData.message);
      data.append('delivery_date', formData.delivery_date);
      data.append('budget', estimatedPrice.toString());
      data.append('additional_instructions', formData.additional_instructions);
      data.append('address', formData.address);
      data.append('delivery_zone', formData.delivery_zone);
      data.append('calculated_price', estimatedPrice.toString());
      if (photoFile) {
        data.append('photo', photoFile);
      }

      const res = await api.createOrder(data);
      setSubmitSuccess({ type: 'order', number: res.order_number, price: res.estimated_price });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error booking commission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Quotation request
  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    if (!formData.name || !formData.email || !formData.phone || !formData.description) {
      setErrorMsg('Please enter your contact details and describe your custom gift requirement.');
      setSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9\s\-()]{9,20}$/;

    if (!emailRegex.test(formData.email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      setSubmitting(false);
      return;
    }
    if (!phoneRegex.test(formData.phone.trim())) {
      setErrorMsg('Please enter a valid phone number.');
      setSubmitting(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('description', formData.description);
      if (photoFile) {
        data.append('photo', photoFile);
      }

      const res = await api.createQuote(data);
      setSubmitSuccess({ type: 'quote', number: res.quote_id });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error submitting quotation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitSuccess(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      artwork_type: 'Black & White Sketch (Monochrome Magic)',
      size_selection: 'A4',
      color_preference: 'Gold Accent Highlights',
      faces_count: '1',
      message: '',
      delivery_date: '',
      budget: '',
      additional_instructions: '',
      address: '',
      delivery_zone: 'Local',
      description: ''
    });
  };

  // Rendering Success State
  if (submitSuccess) {
    return (
      <div className="pt-32 pb-24 max-w-xl mx-auto px-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-premium border border-cream-dark/40 flex flex-col items-center">
          <CheckCircle size={64} className="text-gold-rose mb-6" />
          
          {submitSuccess.type === 'order' ? (
            <>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal mb-4">Commission Booked!</h2>
              <p className="text-sm text-charcoal-light font-light leading-relaxed mb-6">
                Thank you, <strong>{formData.name}</strong>. Your custom commission has been recorded. Please complete your payment using the QR code below.
              </p>
              
              <div className="bg-canvas border border-cream-dark/60 p-5 rounded-2xl w-full mb-6 text-center space-y-4">
                <h3 className="font-serif text-lg font-bold text-charcoal">Payment Scan</h3>
                <img src="/payment_qr.jpg" alt="Payment QR Code" className="w-48 h-48 mx-auto rounded-xl shadow-sm border border-cream-dark/40 object-cover" />
                <p className="text-xs text-charcoal-light">Scan to pay via UPI</p>
              </div>

              <div className="bg-canvas border border-cream-dark/60 p-5 rounded-2xl w-full mb-8 text-left space-y-3">
                <p className="text-xs text-charcoal-light">
                  <strong>Order Tracking ID:</strong> <span className="font-mono text-sm font-bold text-gold-rose select-all">{submitSuccess.number}</span>
                </p>
                <p className="text-xs text-charcoal-light">
                  <strong>Estimated Price Quote:</strong> <span className="font-serif text-sm font-bold text-charcoal">₹{submitSuccess.price}</span>
                </p>
                <p className="text-[10px] text-charcoal-light/75 leading-relaxed">
                  *A confirmation mail was sent to {formData.email}. Save the Tracking ID to check status logs.
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal mb-4">Quotation Request Filed</h2>
              <p className="text-sm text-charcoal-light font-light leading-relaxed mb-6">
                We have received your custom design specifications. Our artist will review the description and reference attachments to send you a proposal.
              </p>
              
              <div className="bg-canvas border border-cream-dark/60 p-5 rounded-2xl w-full mb-8 text-left">
                <p className="text-xs text-charcoal-light">
                  <strong>Reference ID:</strong> <span className="font-mono text-sm font-bold text-gold-rose">{submitSuccess.number}</span>
                </p>
                <p className="text-[10px] text-charcoal-light/75 leading-relaxed mt-2">
                  *We will email you the suggested quote price and details to finalize.
                </p>
              </div>
            </>
          )}

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={resetForm}
              className="bg-gradient-to-r from-gold-rose to-gold-soft text-white font-medium py-3.5 rounded-full shadow-premium hover:opacity-90"
            >
              Order Another Artwork
            </button>
            <a
              href={`https://wa.me/916355303793?text=Hello%20Kalaakar!%20I%20just%20placed%20order%20${submitSuccess.number}.%20Can%20we%20discuss%20design%20details?`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-cream-dark/80 text-charcoal hover:bg-canvas/50 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all"
            >
              Discuss on WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-6xl mx-auto px-6 md:px-12">
      
      {/* Header Copy */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-rose font-bold">Commission Studio</span>
        <h1 className="text-3xl md:text-5xl font-bold text-charcoal mt-1 mb-4">Create Custom Art</h1>
        <p className="text-sm text-charcoal-light font-light leading-relaxed">
          Order a portrait or request pricing quotes for custom crafts. Choose your booking type below.
        </p>

        {/* Tab Selector */}
        <div className="flex justify-center space-x-4 mt-8 border-b border-cream-dark/50 pb-4">
          <button
            onClick={() => { setActiveTab('commission'); setErrorMsg(''); }}
            className={`pb-2 text-sm uppercase tracking-wider font-semibold transition-all relative ${
              activeTab === 'commission' ? 'text-gold-rose border-b-2 border-gold-rose' : 'text-charcoal-light hover:text-charcoal'
            }`}
          >
            Commission
          </button>
          <button
            onClick={() => { setActiveTab('quote'); setErrorMsg(''); }}
            className={`pb-2 text-sm uppercase tracking-wider font-semibold transition-all relative ${
              activeTab === 'quote' ? 'text-gold-rose border-b-2 border-gold-rose' : 'text-charcoal-light hover:text-charcoal'
            }`}
          >
            Request Custom Quotation
          </button>
        </div>
      </div>

      {/* Main Grid: Form Left, Estimator/FAQ Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl shadow-premium border border-cream-dark/30">
          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-xs mb-6 font-light">
              {errorMsg}
            </div>
          )}

          {activeTab === 'commission' ? (
            <form onSubmit={handleCommissionSubmit} className="space-y-6">
              <h2 className="font-serif text-lg font-bold text-charcoal mb-4 flex items-center gap-1.5 border-b border-cream-dark pb-2">
                <FileText size={18} className="text-gold-rose" /> 1. Project Parameters
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="artwork_type" className="block text-xs text-charcoal-light font-medium uppercase tracking-wider mb-2">Artwork Type *</label>
                  <select
                    id="artwork_type"
                    name="artwork_type"
                    value={formData.artwork_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose"
                  >
                    <option value="Black & White Sketch (Monochrome Magic)">Black & White Sketch (Monochrome Magic)</option>
                    <option value="Colour Sketch Art (Memories in Colors)">Colour Sketch Art (Memories in Colors)</option>
                    <option value="Vibrant Paper Lotus Decor (Hand Decor)">Vibrant Paper Lotus Decor (Hand Decor)</option>
                    <option value="Personalized Glass Frame Decor (Hand Decor)">Personalized Glass Frame Decor (Hand Decor)</option>
                    <option value="Bespoke Paper Roses Bouquet (Hand Decor)">Bespoke Paper Roses Bouquet (Hand Decor)</option>
                    <option value="Blooming Memories Photo Bouquet (Hand Decor)">Blooming Memories Photo Bouquet (Hand Decor)</option>
                    <option value="Handcrafted Multi-Layer Explosion Box (Hand Decor)">Handcrafted Multi-Layer Explosion Box (Hand Decor)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="size_selection" className="block text-xs text-charcoal-light font-medium uppercase tracking-wider mb-2">Size Selection *</label>
                  <select
                    id="size_selection"
                    name="size_selection"
                    value={formData.size_selection}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose"
                  >
                    <option value="A4">A4 Size (Standard)</option>
                    <option value="A3">A3 Size (Larger/Detailed)</option>
                    <option value="Standard Wood base">Standard Base (Gifts)</option>
                    <option value="Custom Box size">Custom Box dimensions</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="color_preference" className="block text-xs text-charcoal-light font-medium uppercase tracking-wider mb-2">Color Preference *</label>
                  <select
                    id="color_preference"
                    name="color_preference"
                    value={formData.color_preference}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose"
                  >
                    <option value="Gold Accent Highlights">Golden Highlights (Acrylic accents)</option>
                    <option value="Multi-color Detailing">Vibrant Multi-color Detailing</option>
                    <option value="Acrylics on Board/Canvas">Acrylics on Board/Canvas</option>
                    <option value="Dried Flowers Resin">Resin embedded flowers</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="faces_count" className="block text-xs text-charcoal-light font-medium uppercase tracking-wider mb-2">
                    Number of Faces (For Sketches)
                    <span className="text-[10px] text-gold-artistic ml-2 lowercase font-normal">(+₹500 for each additional face)</span>
                  </label>
                  <select
                    id="faces_count"
                    name="faces_count"
                    value={formData.faces_count}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose"
                  >
                    <option value="1">1 Face</option>
                    <option value="2">2 Faces</option>
                    <option value="3">3 Faces</option>
                    <option value="4">4 Faces</option>
                  </select>
                </div>
              </div>

              {/* Upload reference photo */}
              <div>
                <label className="block text-xs text-charcoal-light font-medium uppercase tracking-wider mb-2">Upload Reference Photo (Max 5MB)</label>
                <div className="border-2 border-dashed border-cream-dark rounded-2xl p-6 flex flex-col items-center justify-center bg-canvas hover:bg-cream/10 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload size={24} className="text-gold-rose mb-2" />
                  <span className="text-xs text-charcoal font-medium">Select photo from files</span>
                  <span className="text-[10px] text-charcoal-light mt-1">PNG, JPG, JPEG formats</span>
                </div>
                {photoPreview && (
                  <div className="mt-4 flex items-center gap-4 border border-cream-dark/50 p-2.5 rounded-xl bg-cream/10">
                    <img src={photoPreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                    <span className="text-xs text-charcoal-light truncate max-w-xs">{photoFile.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="msg-inscribe" className="block text-xs text-charcoal-light font-medium uppercase tracking-wider mb-2">Message or Inscription to include</label>
                <input
                  id="msg-inscribe"
                  type="text"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="e.g. 'Happy 25th Anniversary' or name initials"
                  className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose"
                />
              </div>

              <h2 className="font-serif text-lg font-bold text-charcoal mt-8 mb-4 border-b border-cream-dark pb-2 flex items-center gap-1.5">
                <Calendar size={18} className="text-gold-rose" /> 2. Personal Details & Delivery
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="comm-name" className="block text-xs text-charcoal-light font-medium uppercase tracking-wider mb-2">Name *</label>
                  <input
                    id="comm-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose"
                  />
                </div>
                <div>
                  <label htmlFor="comm-phone" className="block text-xs text-charcoal-light font-medium uppercase tracking-wider mb-2">Phone Number *</label>
                  <input
                    id="comm-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 63553 03793"
                    className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="comm-email" className="block text-xs text-charcoal-light font-medium uppercase tracking-wider mb-2">Email Address *</label>
                  <input
                    id="comm-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. client@email.com"
                    className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose"
                  />
                </div>
                <div>
                  <label htmlFor="comm-date" className="block text-xs text-charcoal-light font-medium uppercase tracking-wider mb-2">Target Delivery Date *</label>
                  <input
                    id="comm-date"
                    type="date"
                    name="delivery_date"
                    value={formData.delivery_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose text-charcoal-light"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="comm-address" className="block text-xs text-charcoal-light font-medium uppercase tracking-wider mb-2">Delivery Address *</label>
                <textarea
                  id="comm-address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full delivery address including city and pincode..."
                  className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="comm-delivery-zone" className="block text-xs text-charcoal-light font-medium uppercase tracking-wider mb-2">Delivery Zone *</label>
                  <select
                    id="comm-delivery-zone"
                    name="delivery_zone"
                    value={formData.delivery_zone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose text-charcoal-light"
                  >
                    <option value="Local">Local Delivery</option>
                    <option value="Long Distance">Long Distance / Out of State (+₹250)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="comm-inst" className="block text-xs text-charcoal-light font-medium uppercase tracking-wider mb-2">Additional Instructions</label>
                <textarea
                  id="comm-inst"
                  name="additional_instructions"
                  rows={4}
                  value={formData.additional_instructions}
                  onChange={handleInputChange}
                  placeholder="Describe framing requests, color themes, or formatting requests here..."
                  className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-gold-rose to-gold-soft text-white font-medium py-4 rounded-xl shadow-premium hover:opacity-90 transition-opacity"
              >
                {submitting ? 'Booking Commission...' : `Book Commission (Est. ₹${estimatedPrice})`}
              </button>
            </form>
          ) : (
            <form onSubmit={handleQuoteSubmit} className="space-y-6">
              <h2 className="font-serif text-lg font-bold text-charcoal mb-4 flex items-center gap-1.5 border-b border-cream-dark pb-2">
                <FileText size={18} className="text-gold-rose" /> Quotation Details
              </h2>

              <div>
                <label htmlFor="quote-name" className="block text-xs text-charcoal-light font-medium uppercase tracking-wider mb-2">Name *</label>
                <input
                  id="quote-name"
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
                  <label htmlFor="quote-email" className="block text-xs text-charcoal-light font-medium uppercase tracking-wider mb-2">Email Address *</label>
                  <input
                    id="quote-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. client@email.com"
                    className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose"
                  />
                </div>
                <div>
                  <label htmlFor="quote-phone" className="block text-xs text-charcoal-light font-medium uppercase tracking-wider mb-2">Phone Number *</label>
                  <input
                    id="quote-phone"
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
                <label htmlFor="quote-desc" className="block text-xs text-charcoal-light font-medium uppercase tracking-wider mb-2">Describe Your Gifting/Art Project Idea *</label>
                <textarea
                  id="quote-desc"
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell us what you want to create. Examples: Custom wedding gifts for 50 guests, double-framed cotton crafts, custom quilling art, etc. Detail sizes and color requirements."
                  className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose"
                />
              </div>

              <div>
                <label className="block text-xs text-charcoal-light font-medium uppercase tracking-wider mb-2">Upload Sketch or Reference Idea (Optional)</label>
                <div className="border-2 border-dashed border-cream-dark rounded-2xl p-6 flex flex-col items-center justify-center bg-canvas hover:bg-cream/10 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload size={24} className="text-gold-rose mb-2" />
                  <span className="text-xs text-charcoal font-medium">Select photo from files</span>
                  <span className="text-[10px] text-charcoal-light mt-1">PNG, JPG, JPEG formats</span>
                </div>
                {photoPreview && (
                  <div className="mt-4 flex items-center gap-4 border border-cream-dark/50 p-2.5 rounded-xl bg-cream/10">
                    <img src={photoPreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                    <span className="text-xs text-charcoal-light truncate max-w-xs">{photoFile.name}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-gold-rose to-gold-soft text-white font-medium py-4 rounded-xl shadow-premium hover:opacity-90 transition-opacity"
              >
                {submitting ? 'Submitting request...' : 'Submit Quotation Request'}
              </button>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: ESTIMATOR DISPLAY & INFO */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Real-time Pricing Preview Card */}
          {activeTab === 'commission' && (
            <div className="bg-gradient-to-br from-charcoal to-charcoal-light text-white p-8 rounded-3xl shadow-gold relative overflow-hidden border border-gold-artistic/25">
              <div className="absolute top-0 right-0 w-28 h-28 bg-gold-artistic/10 rounded-full blur-2xl"></div>
              
              <div className="flex items-center space-x-2 text-gold-artistic mb-4">
                <Calculator size={18} />
                <span className="text-xs font-semibold uppercase tracking-wider">Dynamic Commission Calculator</span>
              </div>
              
              <span className="text-xs text-white/50 block uppercase tracking-wider">Estimated Price Quote</span>
              <span className="text-3xl md:text-4xl font-serif font-bold mt-1 block text-gold-artistic">
                ₹{estimatedPrice}
              </span>

              <div className="border-t border-white/10 pt-6 mt-6 space-y-3 text-xs text-white/70">
                <div className="flex justify-between">
                  <span>Base Pricing ({formData.size_selection} Canvas)</span>
                  <span>₹{getBasePrice(formData.artwork_type, formData.size_selection)}</span>
                </div>
                {(formData.artwork_type.toLowerCase().includes('sketch') || formData.artwork_type.toLowerCase().includes('portrait')) && parseInt(formData.faces_count) > 1 && (
                  <div className="flex justify-between text-white/80">
                    <span>Faces Count ({formData.faces_count} faces)</span>
                    <span>+₹{(parseInt(formData.faces_count) - 1) * 500}</span>
                  </div>
                )}
                {formData.color_preference.includes('Gold') && (
                  <div className="flex justify-between text-white/80">
                    <span>Acrylic Gold Detailing</span>
                    <span>+₹300</span>
                  </div>
                )}
                {formData.delivery_zone === 'Long Distance' && (
                  <div className="flex justify-between text-white/80">
                    <span>Long Distance Delivery Fee</span>
                    <span>+₹250</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-white border-t border-dashed border-white/10 pt-3 text-sm">
                  <span>Total Est. Commission</span>
                  <span className="text-gold-artistic">₹{estimatedPrice}</span>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl mt-6 border border-white/10 flex items-start space-x-2.5">
                <Info size={16} className="text-gold-artistic flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-white/60 leading-relaxed">
                  *This estimation represents our standard handcraft rates. Final pricing will be confirmed by the artist upon reviewing custom photos.
                </p>
              </div>
            </div>
          )}

          {/* Artist Guarantee Card */}
          <div className="bg-cream/40 p-6 md:p-8 rounded-3xl border border-cream-dark/40 space-y-4">
            <h3 className="font-serif text-lg font-bold text-charcoal">The Kalaakar Guarantee</h3>
            <ul className="space-y-3 text-xs text-charcoal-light font-light leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-gold-rose mt-0.5">✔</span>
                <span><strong>100% Handcrafted:</strong> We strictly design, sketch, and assemble by hand. No print templates or machinery.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-rose mt-0.5">✔</span>
                <span><strong>Preview Approvals:</strong> We email you photos of completed works. You approve the art before it is sealed or framed.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-rose mt-0.5">✔</span>
                <span><strong>Gift Packaging:</strong> Custom commissions ship in luxury canvas wrapping with optional greeting tags.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};

export default CustomOrder;

import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Gift, Award, ShieldCheck, Phone } from 'lucide-react';
import SEO from '../components/SEO';
import Sketchbook from '../components/3d/Sketchbook';
import GiftShowcase from '../components/3d/GiftShowcase';
import CraftShowcase from '../components/3d/CraftShowcase';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

const Home = () => {
  // Fetch approved testimonials
  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials'],
    queryFn: api.getTestimonials
  });

  const steps = [
    {
      num: '01',
      title: 'Submit Commission Details',
      desc: 'Fill out our custom order form with dimensions, reference photos, and personal instructions.'
    },
    {
      num: '02',
      title: 'Design Consultation',
      desc: 'Our artist reviews the project, estimates the dynamic pricing, and aligns on custom choices.'
    },
    {
      num: '03',
      title: 'Handcrafting Phase',
      desc: 'We sketch, pour resin, or sculpt paper with complete dedication, turning memories into handmade art.'
    },
    {
      num: '04',
      title: 'Artwork Preview',
      desc: 'Receive a high-definition photo preview of the finished piece to request adjustments before framing.'
    },
    {
      num: '05',
      title: 'Premium Delivery',
      desc: 'Securely packed in shockproof casing and delivered directly to your doorstep with tracked shipping.'
    }
  ];

  return (
    <div className="pt-20">
      <SEO 
        title="Kalaakar | Turning Memories Into Art" 
        description="Luxury handcrafted gifting brand specializing in custom sketch portraits, couple sketches, resin ring holders, and personalized decor."
        url="https://kalaakar.online"
      />
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          
          {/* Left Hero Copy */}
          <div className="lg:col-span-6 flex flex-col space-y-6 text-left">
            <div className="flex flex-col space-y-1">
              <span className="font-script text-3xl text-gold-rose-dark">Luxury Handmade Studio</span>
              <span className="text-[10px] tracking-[0.25em] text-gold-artistic-dark uppercase font-semibold">Turning Memories Into Art</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-charcoal leading-tight">
              Bespoke Handcrafted <br />
              <span className="gold-gradient-text">Gifting & Fine Art</span>
            </h1>
            
            <p className="text-base md:text-lg text-charcoal-light font-light leading-relaxed max-w-xl">
              We design and paint customized treasures. Capture your moments with vibrant mandala drawings and personalized glass frame decor.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/custom-order"
                className="bg-gradient-to-r from-gold-rose to-gold-artistic text-white font-medium px-8 py-3.5 rounded-full shadow-premium hover:shadow-gold hover:scale-[1.02] transition-all flex items-center justify-center gap-2 border border-white/20 dark:border-gold-soft/50 dark:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                Book Custom Art <ArrowRight size={16} />
              </Link>
              <Link
                to="/gallery"
                className="border border-charcoal/20 text-charcoal font-medium px-8 py-3.5 rounded-full hover:bg-cream/45 transition-all flex items-center justify-center"
              >
                Browse Gallery
              </Link>
            </div>

            {/* Quick trust highlights */}
            <div className="grid grid-cols-3 gap-4 border-t border-cream-dark/50 pt-8 mt-4 text-center">
              <div>
                <span className="block font-serif text-3xl font-bold text-gold-artistic">100%</span>
                <span className="text-[10px] uppercase tracking-wider text-charcoal-light font-bold">Handcrafted</span>
              </div>
              <div>
                <span className="block font-serif text-3xl font-bold text-gold-artistic">500+</span>
                <span className="text-[10px] uppercase tracking-wider text-charcoal-light font-bold">Memories Saved</span>
              </div>
              <div>
                <span className="block font-serif text-3xl font-bold text-gold-artistic">4.9 ★</span>
                <span className="text-[10px] uppercase tracking-wider text-charcoal-light font-bold">Client Rating</span>
              </div>
            </div>
          </div>

          {/* Right Hero Sketchbook Model */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <Sketchbook />
          </div>

        </div>
      </section>

      {/* SIGNATURE ATELIER MASTERPIECES */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-rose/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-gold-artistic/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center max-w-3xl mx-auto mb-20 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-gold-rose/10 text-gold-rose px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            <Sparkles size={12} className="animate-pulse" /> Signature Collection
          </div>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-charcoal tracking-tight leading-tight">
            Featured Atelier Masterpieces
          </h2>
          <p className="text-sm md:text-base text-charcoal-light font-light mt-4 max-w-xl mx-auto leading-relaxed">
            Discover our newly added, hand-curated custom commissions. Meticulously detailed and made with raw artistic passion.
          </p>
        </div>

        {/* Extraordinary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {[
            {
              title: "Black And White Portrait Sketch",
              category: "Monochrome Magic",
              tagline: "Timeless hand-drawn black & white portrait.",
              image: "/couple_sketch.jpg",
              medium: "Graphite & Charcoal",
              price: "₹1,499"
            },
            {
              title: "Colourful Portrait Sketch",
              category: "Colour Sketch Art",
              tagline: "Vibrant colourful portrait with stunning detail.",
              image: "/two_women_maroon_sarees.jpg",
              medium: "Coloured Pencil & Pastel",
              price: "₹2,999"
            },
            {
              title: "Black And White Portrait Sketch",
              category: "Monochrome Magic",
              tagline: "Elegant black & white portrait sketch.",
              image: "/boy_portrait_sketch.jpg",
              medium: "Graphite on Paper",
              price: "₹999"
            },
            {
              title: "Colourful Portrait Sketch",
              category: "Colour Sketch Art",
              tagline: "Stunning colour sketch capturing every detail.",
              image: "/woman_red_saree_sketch.jpg",
              medium: "Coloured Pencil & Ink",
              price: "₹1,999"
            }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="group relative bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden border border-cream-dark/30 shadow-premium hover:shadow-gold-rose/20 hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col justify-between"
            >
              {/* Image Container with extraordinary overlay zoom */}
              <Link to={`/gallery?search=${encodeURIComponent(item.category)}`} className="block h-80 w-full overflow-hidden bg-cream-light relative cursor-pointer">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out"
                />
                
                {/* Modern subtle border gradient accent inside image */}
                <div className="absolute inset-0 border-[8px] border-transparent group-hover:border-white/10 transition-all duration-500 rounded-3xl pointer-events-none"></div>

                {/* Glassmorphic category floating tag */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-gold-rose-dark font-bold text-[9px] uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md border border-white/20">
                  {item.category}
                </div>
                
                {/* Soft gradient bottom overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                  <span className="text-[10px] text-gold-rose font-bold uppercase tracking-wider block mb-1">Medium & Details</span>
                  <p className="text-xs text-white/90 font-light">{item.medium} • {item.price}</p>
                </div>
              </Link>

              {/* Card Details */}
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-charcoal group-hover:text-gold-rose-dark transition-colors duration-300 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-charcoal-light font-light italic mt-2 leading-relaxed">
                    "{item.tagline}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-cream-dark/40 flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-charcoal-light/60 font-semibold">Limited Commission</span>
                  <Link 
                    to={`/gallery?search=${encodeURIComponent(item.category)}`}
                    className="text-[10px] text-gold-soft-dark hover:text-gold-rose-dark font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
                  >
                    View Gallery <ArrowRight size={10} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DYNAMIC SHOWCASE SECTION */}
      <section className="bg-cream/35 py-24 border-y border-cream-dark/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-script text-3xl text-gold-rose">The Studio Catalog</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal mt-1">Specialty Portrait Sketches</h2>
            <p className="text-xs md:text-sm text-charcoal-light font-light mt-3">
              Explore our custom hand-sketched portraits. We draw detailed black & white graphite portraits and vibrant colourful sketches to preserve your favorite memories forever.
            </p>
          </div>
          <GiftShowcase />
          
          <div className="text-center max-w-2xl mx-auto mb-16 mt-32">
            <span className="font-script text-3xl text-gold-rose">Premium Memorials</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal mt-1">Customize Gifts</h2>
            <p className="text-xs md:text-sm text-charcoal-light font-light mt-3">
              Discover our signature 3D explosion boxes and everlasting photo bouquets. Custom-crafted using premium cardstock and your most cherished personal photographs.
            </p>
          </div>
          <CraftShowcase />
        </div>
      </section>

      {/* THE CUSTOMIZATION PIPELINE PROCESS */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="font-script text-3xl text-gold-rose font-bold">Crafting Details</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal mt-1">Atelier Commission Journey</h2>
          <p className="text-xs md:text-sm text-charcoal-light font-light mt-3">
            Every creation tells a story. Here is how we align with your design preferences step-by-step.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-start bg-white p-6 rounded-2xl shadow-premium border border-cream-dark/20 relative group hover:border-gold-artistic/40 transition-colors">
              <span className="font-serif text-4xl font-bold text-gold-artistic/10 group-hover:text-gold-artistic/35 transition-colors">{step.num}</span>
              <h3 className="font-serif text-base font-bold text-charcoal mt-3 mb-2">{step.title}</h3>
              <p className="text-xs text-charcoal-light font-light leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link
            to="/custom-order"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold-rose hover:text-gold-artistic underline uppercase tracking-wider transition-colors"
          >
            Start Your Custom Order Commission <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* GET A FREE QUOTE PROMPT */}
      <section className="bg-charcoal text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#FFF_1px,transparent_1px)] bg-[size:16px_16px]"></div>
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <span className="font-script text-3xl text-gold-rose block mb-2">Bespoke Design Requests</span>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6">Have a Unique Craft Concept?</h2>
          <p className="text-sm md:text-base text-white/70 max-w-xl mx-auto font-light leading-relaxed mb-8">
            Upload custom reference pictures and describe your project. We design and estimate unique wedding favors, paper sculptures, or cotton event decor for you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/custom-order?tab=quote"
              className="bg-gradient-to-r from-gold-artistic to-gold-rose text-white font-semibold px-8 py-3.5 rounded-full shadow-lg hover:scale-[1.02] transition-all"
            >
              Request Custom Quote
            </Link>
            <a
              href="https://wa.me/916355303793"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 text-white hover:bg-white/5 font-medium px-8 py-3.5 rounded-full flex items-center justify-center gap-2 transition-all"
            >
              <Phone size={16} /> Consult on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ARTIST SPOTLIGHT */}
      <section className="bg-cream/15 py-24 border-t border-cream-dark/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Image Container */}
          <div className="lg:col-span-5 relative group">
            <div className="w-full h-[400px] bg-white p-3 pb-8 shadow-polaroid border border-cream-dark/40 rounded-2xl overflow-hidden hover:rotate-1 hover:scale-[1.01] transition-all duration-500 bg-white">
              <img 
                src="/couple_sketch.jpg" 
                alt="Mahek Thakor pencil sketch" 
                loading="lazy"
                className="w-full h-[88%] object-cover rounded-lg"
              />
              <div className="text-center pt-3 font-script text-xl text-gold-rose-dark font-bold">
                Hand-drawn Sketch by Mahek Thakor
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-charcoal text-white px-4 py-2 rounded-lg text-[10px] uppercase tracking-wider font-semibold shadow-lg">
              Artist Signed Commission
            </div>
          </div>

          {/* Right: Narrative Story */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-gold-rose/10 text-gold-rose-dark px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase">
              <Heart size={12} className="fill-gold-rose-dark text-gold-rose-dark" /> Father & Daughter Legacy
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-charcoal tracking-tight leading-tight">
              The Soul Behind the Art: <br/>
              <span className="gold-gradient-text">Mahek Thakor</span>
            </h2>
            <p className="text-sm md:text-base text-charcoal-light font-light leading-relaxed">
              Kalaakar is more than an art studio; it is a testament to sheer dedication, independent strength, and a father's belief. Founded by **Mahek Thakor**, a young artist who poured her heart and hard work into sketching her own destiny, the studio was built on a foundation of independent dreams.
            </p>
            <p className="text-sm md:text-base text-charcoal-light font-light leading-relaxed">
              Empowered by her father—her biggest support and guide—Mahek turned her raw passion into a thriving creative enterprise. His encouragement allowed her to carve her own path, build her own life, and start this business on her own strength. This beautiful legacy of love, support, and tireless artistry is woven into every custom piece she touches.
            </p>
            <div className="pt-2">
              <Link 
                to="/about"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gold-soft-dark hover:text-gold-rose-dark transition-colors"
              >
                Read Our Story <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-script text-3xl text-gold-rose-dark">Customer Stories</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal mt-1">Emotional Resonance</h2>
          <p className="text-xs md:text-sm text-charcoal-light font-light mt-3">
            Read comments from families who turned memories into physical handmade art.
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center text-charcoal-light font-light text-sm italic">
            Connecting testimonials database...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testi) => (
              <div key={testi.id} className="bg-white p-8 rounded-2xl shadow-premium border border-cream-dark/30 flex flex-col justify-between">
                <div>
                  <div className="flex space-x-1 mb-4 text-gold-artistic-dark">
                    {Array.from({ length: testi.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-xs md:text-sm text-charcoal-light italic leading-relaxed font-light">
                    "{testi.review}"
                  </p>
                </div>
                <div className="flex items-center space-x-4 mt-6 pt-6 border-t border-cream-dark/40">
                  <img src={testi.avatar_url} alt={testi.name} loading="lazy" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-serif font-bold text-sm text-charcoal">{testi.name}</h4>
                    <span className="text-[10px] uppercase tracking-wider text-gold-rose-dark font-medium">Verified Commission</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
    </div>
  );
};

export default Home;

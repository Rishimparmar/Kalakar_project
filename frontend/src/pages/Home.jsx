import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Gift, Award, ShieldCheck, Phone } from 'lucide-react';
import Sketchbook from '../components/3d/Sketchbook';
import GiftShowcase from '../components/3d/GiftShowcase';
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
      
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          
          {/* Left Hero Copy */}
          <div className="lg:col-span-6 flex flex-col space-y-6 text-left">
            <div className="flex flex-col space-y-1">
              <span className="font-script text-3xl text-gold-rose">Luxury Handmade Studio</span>
              <span className="text-[10px] tracking-[0.25em] text-gold-artistic uppercase font-semibold">Turning Memories Into Art</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-charcoal leading-tight">
              Bespoke Handcrafted <br />
              <span className="gold-gradient-text">Gifts & Sketch Art</span>
            </h1>
            
            <p className="text-base md:text-lg text-charcoal-light font-light leading-relaxed max-w-xl">
              We mold, sketch, and assemble customized treasures. Capture your moments with pencil sketch portraits, floral resin engagement ring holders, cotton event decor, and paper craft boxes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/custom-order"
                className="bg-gradient-to-r from-gold-rose to-gold-artistic text-white font-medium px-8 py-3.5 rounded-full shadow-premium hover:shadow-gold hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
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

      {/* DYNAMIC SHOWCASE SECTION */}
      <section className="bg-cream/35 py-24 border-y border-cream-dark/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-script text-3xl text-gold-rose">The Studio Catalog</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal mt-1">Specialty Handmade Gifts</h2>
            <p className="text-xs md:text-sm text-charcoal-light font-light mt-3">
              Explore our boutique offerings. We preserve real flowers, fold detailed explode boxes, and frame botanical collages to mirror your milestones.
            </p>
          </div>
          <GiftShowcase />
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
              href="https://wa.me/+919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 text-white hover:bg-white/5 font-medium px-8 py-3.5 rounded-full flex items-center justify-center gap-2 transition-all"
            >
              <Phone size={16} /> Consult on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-script text-3xl text-gold-rose">Customer Stories</span>
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
                  <div className="flex space-x-1 mb-4 text-gold-artistic">
                    {Array.from({ length: testi.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-xs md:text-sm text-charcoal-light italic leading-relaxed font-light">
                    "{testi.review}"
                  </p>
                </div>
                <div className="flex items-center space-x-4 mt-6 pt-6 border-t border-cream-dark/40">
                  <img src={testi.avatar_url} alt={testi.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-serif font-bold text-sm text-charcoal">{testi.name}</h4>
                    <span className="text-[10px] uppercase tracking-wider text-gold-rose font-medium">Verified Commission</span>
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

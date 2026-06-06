import { Sparkles, Calendar, Heart, Shield } from 'lucide-react';

const About = () => {
  const milestones = [
    { year: '2022', title: 'The First Sketch', desc: 'Started with simple graphite sketch commissions from a small desk at home.' },
    { year: '2023', title: 'Resin & Florals', desc: 'Introduced botanical preservation and customized wooden ring holders for weddings.' },
    { year: '2024', title: 'Kalaakar is Born', desc: 'Officially branded as Kalaakar - Turning Memories Into Art, serving customers globally.' },
    { year: '2025', title: 'Creative Collective', desc: 'Expanded into event decorations, paper craft installations, and cotton crafts.' }
  ];

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-6 md:px-12">
      {/* Intro Header */}
      <div className="max-w-3xl mb-16">
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-rose font-bold">Our Journey</span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-charcoal mt-1 mb-6">
          The Story of <span className="gold-gradient-text">Kalaakar</span>
        </h1>
        <p className="text-base md:text-lg text-charcoal-light font-light leading-relaxed">
          Kalaakar was founded on a simple belief: that the most meaningful gifts are those that tell a story. In an era of digital frames and mass-manufactured templates, we return to the touch of the human hand.
        </p>
      </div>

      {/* Grid: Artist & Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
        <div className="lg:col-span-5 relative">
          <div className="w-full h-[450px] bg-cream-dark rounded-2xl overflow-hidden shadow-premium relative">
            {/* High-quality Unsplash image illustrating an artist handcrafting/sketching */}
            <img 
              src="/mandala_rabbit.png" 
              alt="Handmade sketching process" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent"></div>
          </div>
          <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-premium border border-cream border-l-4 border-l-gold-artistic max-w-xs hidden md:block">
            <p className="text-xs text-charcoal-light italic">
              "We don't print. We don't automate. Every pencil stroke is a commitment to your memory."
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-6">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal">
            Every Detail, Handcrafted
          </h2>
          <p className="text-sm md:text-base text-charcoal-light font-light leading-relaxed">
            Our name, <strong>Kalaakar</strong> (meaning "Artist"), reflects our core philosophy. We specialize in looking at your digital photographs—blurry, old, or brand new—and reimagining them on canvas, inside wooden blocks, or within glass boxes.
          </p>
          <p className="text-sm md:text-base text-charcoal-light font-light leading-relaxed">
            Whether it is capturing the fine lines of a parent's face, preserving wedding roses in a resin engagement ring holder, or weaving macrame wall hangings for home decor, we treat every commission as a museum exhibition.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="flex items-start space-x-3">
              <div className="bg-gold-rose/10 p-2 rounded-lg text-gold-rose">
                <Heart size={18} />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm">Emotional Resonance</h4>
                <p className="text-xs text-charcoal-light font-light mt-1">We frame feelings, not just images. We capture smiles, bonds, and promises.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-gold-soft/10 p-2 rounded-lg text-gold-soft">
                <Shield size={18} />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm">Museum-Grade Materials</h4>
                <p className="text-xs text-charcoal-light font-light mt-1">Archival paper, premium wood, crystal-clear casting resin that won't yellow.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Roadmap */}
      <section className="bg-cream/20 p-8 md:p-12 rounded-3xl border border-cream-dark/40">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal text-center mb-12">
          Our Creative Milestones
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {milestones.map((ms, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-premium border border-cream relative">
              <div className="inline-flex items-center space-x-2 bg-gold-soft/10 text-gold-soft px-3 py-1 rounded-full text-xs font-bold font-serif mb-4">
                <Calendar size={12} />
                <span>{ms.year}</span>
              </div>
              <h3 className="font-serif text-base font-bold text-charcoal mb-2">{ms.title}</h3>
              <p className="text-xs text-charcoal-light font-light leading-relaxed">{ms.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default About;

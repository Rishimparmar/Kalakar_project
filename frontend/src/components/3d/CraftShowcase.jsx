import { useState } from 'react';
import { Gift, Heart } from 'lucide-react';

const craftItems = [
  {
    id: 'explosion-box',
    name: 'Handcrafted Multi-Layer Explosion Box',
    image: '/explosion_box.jpg',
    tagline: 'Treasures of Memories inside every fold.',
    desc: 'An intricate, multi-layered explosion box handcrafted with premium cardstock. Filled with personalized photos, hidden messages, and interactive cascading pull-outs to surprise your loved ones.',
    materials: ['Premium Cardstock', 'Satin Ribbons', 'Glossy Photo Prints'],
    dimensions: 'Custom Box Size (Typically 8" x 8")',
    estCommission: '₹1,200'
  },
  {
    id: 'photo-bouquet',
    name: 'Cherished Moments Photo Bouquet',
    image: '/photo_bouquet.jpg',
    tagline: 'Where photographs blossom into unforgettable gifts.',
    desc: 'A beautifully arranged bouquet replacing traditional flowers with your most cherished memories. Each photo is delicately mounted and wrapped in luxurious floral paper with elegant ribbon bows.',
    materials: ['Custom Photos', 'Floral Wrapping Paper', 'Decorative Accents'],
    dimensions: 'Standard Bouquet Size',
    estCommission: '₹1,000'
  }
];

export default function CraftShowcase() {
  const [activeId, setActiveId] = useState('explosion-box');

  const activeCraft = craftItems.find(c => c.id === activeId);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white p-8 rounded-3xl shadow-premium border border-cream-dark/30 mt-8">
      
      {/* PHOTO DISPLAY (LEFT COLUMN) */}
      <div className="lg:col-span-7 relative h-[420px] rounded-2xl overflow-hidden border border-cream-dark/40 shadow-inner group bg-cream-light/30 flex items-center justify-center">
        <img 
          src={activeCraft.image} 
          alt={activeCraft.name} 
          className="w-full h-full object-contain p-4 transition-transform duration-1000 ease-out group-hover:scale-[1.02]" 
        />
        
        {/* Ambient Dark Overlay on bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent"></div>
        
        {/* Glassmorphic overlay badge */}
        <div className="absolute bottom-6 left-6 right-6 glass-panel p-4 rounded-xl flex justify-between items-center border border-white/20">
          <div>
            <span className="text-[8px] uppercase tracking-widest text-gold-rose font-bold block">Specialty Craft</span>
            <h4 className="font-serif text-sm font-bold text-charcoal">{activeCraft.name}</h4>
          </div>
          <span className="font-serif text-sm font-bold text-gold-artistic">{activeCraft.estCommission}</span>
        </div>
      </div>

      {/* DETAILED CONTENT SELECTOR (RIGHT COLUMN) */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
        
        {/* Navigation Selector Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-cream-dark pb-4">
          {craftItems.map((craft) => (
            <button
              key={craft.id}
              onClick={() => setActiveId(craft.id)}
              className={`px-3.5 py-1.5 rounded-full text-[9px] uppercase tracking-wider font-bold transition-all duration-300 ${
                activeId === craft.id 
                  ? 'bg-gold-rose text-white shadow-premium scale-[1.02]' 
                  : 'bg-canvas text-charcoal hover:bg-cream-dark/35 border border-cream-dark/50'
              }`}
            >
              {craft.name}
            </button>
          ))}
        </div>

        {/* Narrative Details */}
        <div className="space-y-4">
          <div>
            <span className="text-[9px] uppercase tracking-widest text-gold-rose font-bold block">{activeCraft.tagline}</span>
            <h3 className="font-serif text-xl md:text-2xl font-bold text-charcoal mt-1">{activeCraft.name}</h3>
          </div>
          
          <p className="text-xs text-charcoal-light font-light leading-relaxed">
            {activeCraft.desc}
          </p>

          {/* Details list */}
          <div className="space-y-2.5 pt-2 border-t border-cream-dark/40">
            <div className="flex justify-between text-xs">
              <span className="text-charcoal-light font-medium">Dimensions:</span>
              <span className="text-charcoal font-semibold">{activeCraft.dimensions}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-charcoal-light font-medium">Bespoke Materials:</span>
              <span className="text-charcoal font-semibold text-right">{activeCraft.materials.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Quick commission prompt */}
        <div className="bg-canvas p-4 rounded-xl border border-cream-dark/50 flex items-start space-x-3 mt-4">
          <Gift size={16} className="text-gold-rose flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-charcoal-light leading-relaxed font-light">
            Need customized text or specific color themes? We adjust every craft to match your unique celebration requirements.
          </p>
        </div>
        
      </div>
      
    </div>
  );
}

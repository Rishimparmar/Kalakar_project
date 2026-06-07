import { useState } from 'react';
import { Sparkles, Calendar, Layers, ShieldCheck, Heart } from 'lucide-react';

const giftItems = [
  {
    id: 'colors-sketch',
    name: 'Memories in Colors',
    image: '/starry_sky_parent_child.jpg',
    tagline: 'Turn your favorite moments into vibrant masterpieces.',
    desc: 'Stunning hand-painted starry sky acrylic canvas depicting a parent carrying a child on their shoulders. A beautiful expression of familial love.',
    materials: ['Acrylic paints', 'Canvas sheet', 'Premium framing options'],
    dimensions: 'A4 Size Canvas',
    estCommission: '₹1,800'
  },
  {
    id: 'decor-ideas',
    name: 'Crafted for Your Corner',
    image: '/buddha_painting.jpg',
    tagline: 'Decor that tells your story.',
    desc: 'Hand-painted Lord Buddha circular MDF wooden canvas panel detailed with concentric mirrors (Lippan Art work) to bring peace to any entryway.',
    materials: ['MDF Round Base', 'Acrylic Painting', 'Concentric Mirror Work'],
    dimensions: '12" Round Panel',
    estCommission: '₹1,900'
  },
  {
    id: 'wall-hangings',
    name: 'Walls That Speak',
    image: '/phoenix_mandala.jpg',
    tagline: 'Beautiful creations that bring life to every wall.',
    desc: 'Vibrant colored pencil phoenix mandala drawing bordered by intricate hand-drawn concentric lines. Adds rich, colorful texture to any empty wall space.',
    materials: ['Prismacolor pencils', 'White gel pen', 'Black board'],
    dimensions: '12" x 12" Frame',
    estCommission: '₹2,000'
  }
];

export default function GiftShowcase() {
  const [activeId, setActiveId] = useState('colors-sketch');

  const activeGift = giftItems.find(g => g.id === activeId);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white p-8 rounded-3xl shadow-premium border border-cream-dark/30">
      
      {/* PHOTO DISPLAY (LEFT COLUMN) */}
      <div className="lg:col-span-7 relative h-[420px] rounded-2xl overflow-hidden border border-cream-dark/40 shadow-inner group">
        <img 
          src={activeGift.image} 
          alt={activeGift.name} 
          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" 
        />
        
        {/* Ambient Dark Overlay on bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent"></div>
        
        {/* Glassmorphic overlay badge */}
        <div className="absolute bottom-6 left-6 right-6 glass-panel p-4 rounded-xl flex justify-between items-center border border-white/20">
          <div>
            <span className="text-[8px] uppercase tracking-widest text-gold-rose font-bold block">Specialty Commission</span>
            <h4 className="font-serif text-sm font-bold text-charcoal">{activeGift.name}</h4>
          </div>
          <span className="font-serif text-sm font-bold text-gold-artistic">{activeGift.estCommission}</span>
        </div>
      </div>

      {/* DETAILED CONTENT SELECTOR (RIGHT COLUMN) */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
        
        {/* Navigation Selector Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-cream-dark pb-4">
          {giftItems.map((gift) => (
            <button
              key={gift.id}
              onClick={() => setActiveId(gift.id)}
              className={`px-3.5 py-1.5 rounded-full text-[9px] uppercase tracking-wider font-bold transition-all duration-300 ${
                activeId === gift.id 
                  ? 'bg-gold-rose text-white shadow-premium scale-[1.02]' 
                  : 'bg-canvas text-charcoal hover:bg-cream-dark/35 border border-cream-dark/50'
              }`}
            >
              {gift.name}
            </button>
          ))}
        </div>

        {/* Narrative Details */}
        <div className="space-y-4">
          <div>
            <span className="text-[9px] uppercase tracking-widest text-gold-rose font-bold block">{activeGift.tagline}</span>
            <h3 className="font-serif text-xl md:text-2xl font-bold text-charcoal mt-1">{activeGift.name}</h3>
          </div>
          
          <p className="text-xs text-charcoal-light font-light leading-relaxed">
            {activeGift.desc}
          </p>

          {/* Details list */}
          <div className="space-y-2.5 pt-2 border-t border-cream-dark/40">
            <div className="flex justify-between text-xs">
              <span className="text-charcoal-light font-medium">Standard Dimensions:</span>
              <span className="text-charcoal font-semibold">{activeGift.dimensions}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-charcoal-light font-medium">Bespoke Materials:</span>
              <span className="text-charcoal font-semibold text-right">{activeGift.materials.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Quick commission prompt */}
        <div className="bg-canvas p-4 rounded-xl border border-cream-dark/50 flex items-start space-x-3 mt-4">
          <Heart size={16} className="text-gold-rose flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-charcoal-light leading-relaxed font-light">
            Need customized text engraving or specific frame colors? We adjust every project parameters to match your celebration themes.
          </p>
        </div>
        
      </div>
      
    </div>
  );
}

import { useState } from 'react';
import { Sparkles, Calendar, Layers, ShieldCheck, Heart } from 'lucide-react';

const giftItems = [
  {
    id: 'colors-sketch',
    name: 'Memories in Colors',
    image: '/parents_portrait.png',
    tagline: 'Turn your favorite moments into vibrant masterpieces.',
    desc: 'A hand-drawn colored pencil portrait capturing life-like smiles and rich colors. Perfect for anniversaries, birthdays, or family memory walls.',
    materials: ['Colored Pencils', 'Archival Paper', 'Premium MDF frame'],
    dimensions: 'A3 Size Frame',
    estCommission: '₹2,800'
  },
  {
    id: 'monochrome-sketch',
    name: 'Monochrome Magic',
    image: '/couple_sketch.jpg',
    tagline: 'Classic sketches that never go out of style.',
    desc: 'Exquisite hand-drawn graphite and charcoal portrait detailing couples and memories. Highlighted by high contrast and fine texturing.',
    materials: ['Charcoal', 'Graphite', 'Textured paper', 'Black wood frame'],
    dimensions: 'A3 Size Frame',
    estCommission: '₹2,500'
  },
  {
    id: 'decor-ideas',
    name: 'Crafted for Your Corner',
    image: '/buddha_painting.jpg',
    tagline: 'Decor that tells your story.',
    desc: 'Stunning hand-painted Lord Buddha circular MDF canvas with detailed mirror work (Lippan Art). Ideal as an accent piece for entryways or meditation corners.',
    materials: ['MDF Round Base', 'Acrylic Painting', 'Concentric Mirrors'],
    dimensions: '12" Round Panel',
    estCommission: '₹1,900'
  },
  {
    id: 'photo-bouquet',
    name: 'Blooming Memories Bouquet',
    image: '/paper_lotus.png',
    tagline: 'Where photographs blossom into unforgettable gifts.',
    desc: 'A customized bouquet where your favorite family and couple photos are artistically shaped and clustered like blooming flowers, combined with handcrafted paper flowers.',
    materials: ['Photo prints', 'Stem supports', 'Decorative wrapping', 'Ribbons'],
    dimensions: '14" Bouquet Height',
    estCommission: '₹1,600'
  },
  {
    id: 'photo-box',
    name: 'Treasures of Memories',
    image: '/explosion_box.jpg',
    tagline: 'Open the box, relive the moments.',
    desc: 'A multi-layered handcrafted exploding photo box with multiple folds, photo slots, secret pockets, and a flower ornament top. Unfolds as a beautiful timeline.',
    materials: ['Premium cardstock', 'Satin ribbons', 'Photo panels'],
    dimensions: '10" x 10" (Opened)',
    estCommission: '₹1,200'
  },
  {
    id: 'wall-hangings',
    name: 'Walls That Speak',
    image: '/krishna_bookmark.png',
    tagline: 'Beautiful creations that bring life to every wall.',
    desc: 'Premium cotton macrame wall hanging or Lippan Art panels designed to add texture, warmth, and artistic vibes to your living space.',
    materials: ['Organic cotton cord', 'Polished driftwood', 'Wooden beads'],
    dimensions: '18" x 24" Wall space',
    estCommission: '₹1,500'
  },
  {
    id: 'flower-bouquet',
    name: 'Forever Blooms',
    image: '/paper_roses.jpg',
    tagline: 'Flowers that never fade, memories that never end.',
    desc: 'Delicately hand-folded red and pink cardstock roses clustered into a bouquet. It never fades, serving as a permanent memory of love and appreciation.',
    materials: ['Matte cardstock', 'Rose foliage', 'Lace wrap'],
    dimensions: '12" Bouquet Height',
    estCommission: '₹1,100'
  },
  {
    id: 'ring-holder',
    name: 'The Forever Nest',
    image: '/ring_holder.png',
    tagline: 'A beautiful home for your precious promise.',
    desc: 'Custom ring platter with name engraving, dried botanicals, and gold highlights. Perfect for engagement ceremonies and wedding keepsakes.',
    materials: ['Velvet base', 'Dried flowers', 'Glitter hoops'],
    dimensions: '8" Round base',
    estCommission: '₹1,800'
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

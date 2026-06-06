import { useState } from 'react';
import { Sparkles, Calendar, Layers, ShieldCheck, Heart } from 'lucide-react';

const giftItems = [
  {
    id: 'ring',
    name: 'Tejas & Bhargavi Ring Holder',
    image: '/ring_holder.png',
    tagline: 'Customized Engagement Keepsake',
    desc: 'Bespoke ring pedestal featuring Tejas & Bhargavi names embedded in gold and silver ring outlines. Structured on a plush green velvet base and decorated with red paper rose and flower clusters.',
    materials: ['Green Velvet Base', 'Gold & Silver Glitter rings', 'Paper floral bouquet'],
    dimensions: '8" Diameter base',
    estCommission: '₹1,800'
  },
  {
    id: 'box',
    name: 'Handcrafted Paper Lotuses',
    image: '/paper_lotus.png',
    tagline: 'Vibrant Pink & Teal Celebration Decor',
    desc: 'Vibrant paper lotus crafts, handfolded from premium cardstock. Perfect as floor centerpieces, backdrop highlights, and home decoration accents for festive events.',
    materials: ['Premium Craft Cardstock', 'Concentric pink/teal folds', 'Durable base backing'],
    dimensions: '12" x 12" base',
    estCommission: '₹1,200'
  },
  {
    id: 'frame',
    name: 'Krishna Silhouette Bookmark',
    image: '/krishna_bookmark.png',
    tagline: 'Concentric Mandala & Silhouette Ink',
    desc: 'Lord Krishna silhouette drawing bordered with fine concentric mandalas on a bookmark strip. Handcrafted on cotton cardstock and flanked by yellow floral sprigs.',
    materials: ['Fineliner Black Ink', 'Graphite Shading', 'Vibrant yellow blossoms'],
    dimensions: '3" x 9" Vertical',
    estCommission: '₹1,500'
  }
];

export default function GiftShowcase() {
  const [activeId, setActiveId] = useState('ring');

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
        <div className="flex space-x-2 border-b border-cream-dark pb-3">
          {giftItems.map((gift) => (
            <button
              key={gift.id}
              onClick={() => setActiveId(gift.id)}
              className={`px-4 py-2 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all ${
                activeId === gift.id 
                  ? 'bg-charcoal text-white shadow-premium' 
                  : 'bg-canvas text-charcoal hover:bg-cream-dark/30 border border-cream-dark/50'
              }`}
            >
              {gift.id === 'ring' ? 'Resin dome' : gift.id === 'box' ? 'Explosion Box' : 'Pressed Frame'}
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

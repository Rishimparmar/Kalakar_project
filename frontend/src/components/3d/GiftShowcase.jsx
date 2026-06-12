import { useState } from 'react';
import { Sparkles, Calendar, Layers, ShieldCheck, Heart } from 'lucide-react';

const giftItems = [
  {
    id: 'bw-portrait',
    name: 'Black And White Portrait Sketch',
    image: '/girl_glasses_smile_sketch.jpg',
    tagline: 'Timeless hand-drawn monochrome sketches.',
    desc: 'Exquisite hand-drawn black and white portrait sketch. Meticulously detailed using professional-grade graphite and charcoal pencils to capture the depth, emotion, and character of your favorite moments.',
    materials: ['Graphite pencils', 'Charcoal sticks', 'Premium cartridge paper'],
    dimensions: 'A4 Size Paper',
    estCommission: '₹999'
  },
  {
    id: 'color-portrait',
    name: 'Colourful Portrait Sketch',
    image: '/woman_red_saree_sketch.jpg',
    tagline: 'Vibrant hand-sketched colourful portraits.',
    desc: 'Stunning colourful sketch portrait hand-drawn with premium artist-grade coloured pencils and soft pastels. A beautiful, lively way to bring your photos to life with warmth and rich details.',
    materials: ['Coloured pencils', 'Soft pastels', 'Acid-free sketching paper'],
    dimensions: 'A4 Size Paper',
    estCommission: '₹1,999'
  }
];

export default function GiftShowcase() {
  const [activeId, setActiveId] = useState('bw-portrait');

  const activeGift = giftItems.find(g => g.id === activeId);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white p-8 rounded-3xl shadow-premium border border-cream-dark/30">
      
      {/* PHOTO DISPLAY (LEFT COLUMN) */}
      <div className="lg:col-span-7 relative h-[420px] rounded-2xl overflow-hidden border border-cream-dark/40 shadow-inner group bg-cream-light/30 flex items-center justify-center">
        <img 
          src={activeGift.image} 
          alt={activeGift.name} 
          className="w-full h-full object-contain p-4 transition-transform duration-1000 ease-out group-hover:scale-[1.02]" 
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

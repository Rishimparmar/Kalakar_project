import { useState, useRef } from 'react';
import { Eye, Info, Sparkles } from 'lucide-react';

const exhibitionArtworks = [
  {
    id: 1,
    title: 'Indian Couple Pencil Portrait',
    category: 'Memories in Colors',
    image: '/parents_portrait.png',
    dimensions: 'A3 Size Frame',
    medium: 'Colored Pencils on Textured Paper',
    description: 'Capturing the detailed contours, facial details, and emotional warmth of parents in traditional wear.'
  },
  {
    id: 2,
    title: 'Customized Name Ring Holder',
    category: 'Crafted for Your Corner',
    image: '/ring_holder.png',
    dimensions: '8" Diameter base',
    medium: 'Glitter Ring Outlines on Velvet Base',
    description: 'Bespoke ring pedestal featuring Tejas & Bhargavi names embedded in gold and silver ring backdrops with paper florals.'
  },
  {
    id: 3,
    title: 'Vibrant Paper Lotus Decor',
    category: 'Crafted for Your Corner',
    image: '/paper_lotus.png',
    dimensions: '12 x 12 inches',
    medium: 'Handfolded Craft Cardstock',
    description: 'Stunning pink and teal lotus designs crafted by hand to decorate home celebrations and traditional event stages.'
  },
  {
    id: 4,
    title: 'Krishna Mandala Bookmark',
    category: 'Memories in Colors',
    image: '/krishna_bookmark.png',
    dimensions: '3 x 9 inches',
    medium: 'Charcoal Silhouette & Fineliner Ink',
    description: 'Lord Krishna playing a flute on a bookmark strip, flanked by concentric mandala art and yellow blossoms.'
  }
];

export default function GalleryWall() {
  const [activeId, setActiveId] = useState(null);
  const wallRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle Parallax mouse tilt
  const handleMouseMove = (e) => {
    if (!wallRef.current) return;
    const rect = wallRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    // Limit rotation angle
    setMousePos({ x: x * 20, y: -y * 20 });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const activeArtwork = exhibitionArtworks.find(a => a.id === activeId);

  return (
    <div className="w-full flex flex-col space-y-6">
      
      {/* 3D Exhibition Container */}
      <div 
        ref={wallRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full min-h-[480px] bg-gradient-to-br from-cream to-cream-light border border-cream-dark/50 rounded-3xl p-8 relative flex items-center justify-center overflow-hidden perspective-1000 preserve-3d transition-all duration-300"
        style={{
          transform: `rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg)`,
        }}
      >
        {/* Soft shadow/ambient backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.08)_0%,transparent_75%)] pointer-events-none"></div>

        {/* Polaroid grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl w-full relative z-10 preserve-3d">
          {exhibitionArtworks.map((art, idx) => {
            const isActive = activeId === art.id;
            
            // Apply slight random base offsets for the artistic collage feel
            const rotations = ['-rotate-3', 'rotate-2', '-rotate-1', 'rotate-3'];
            const rotateClass = rotations[idx % rotations.length];

            return (
              <div
                key={art.id}
                role="button"
                tabIndex={0}
                aria-expanded={isActive}
                onClick={() => setActiveId(isActive ? null : art.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveId(isActive ? null : art.id); } }}
                className={`polaroid-frame transform ${rotateClass} hover:rotate-0 hover:-translate-y-3 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-gold-rose transition-all duration-300 cursor-pointer relative preserve-3d`}
              >
                {/* Photo frame */}
                <div className="w-full aspect-square rounded overflow-hidden bg-cream border border-cream-dark/30 relative mb-3 group">
                  <img 
                    src={art.image} 
                    alt={art.title} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-charcoal/30 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center">
                    <span className="bg-white/95 px-3 py-1.5 rounded-full text-[9px] uppercase tracking-wider font-bold text-gold-rose flex items-center gap-1 shadow-lg">
                      <Eye size={10} /> Inspect
                    </span>
                  </div>
                </div>

                {/* Polaroid Label */}
                <div className="text-left">
                  <span className="text-[8px] uppercase tracking-widest text-gold-rose font-bold block">{art.category}</span>
                  <h4 className="font-serif text-xs font-bold text-charcoal truncate mt-0.5">{art.title}</h4>
                  <span className="font-script text-[11px] text-charcoal-light/75 mt-1 block">Click to view notes</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* floating support badge */}
        <div className="absolute top-4 right-4 bg-white/70 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-cream text-[9px] uppercase tracking-wider text-charcoal-light font-medium flex items-center gap-1 pointer-events-none">
          <Sparkles size={10} className="text-gold-rose" /> Move Mouse to Pivot View
        </div>
      </div>

      {/* DETAILED ARTWORK DIALOG CARD */}
      {activeArtwork && (
        <div className="bg-white p-6 rounded-2xl border border-gold-artistic/35 shadow-premium flex flex-col md:flex-row gap-6 items-center animate-fade-in relative z-20">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-cream border border-cream-dark/40 flex-shrink-0">
            <img src={activeArtwork.image} alt={activeArtwork.title} className="w-full h-full object-cover" />
          </div>
          <div className="text-left space-y-2 flex-grow">
            <div className="flex items-center space-x-2">
              <span className="text-[9px] uppercase tracking-wider text-white bg-gold-rose px-2.5 py-0.5 rounded font-bold">{activeArtwork.category}</span>
              <span className="text-[10px] text-charcoal-light">{activeArtwork.dimensions}</span>
            </div>
            <h3 className="font-serif text-base font-bold text-charcoal">{activeArtwork.title}</h3>
            <p className="text-xs text-charcoal-light font-light leading-relaxed max-w-2xl">{activeArtwork.description}</p>
            <p className="text-[10px] text-gold-artistic font-semibold uppercase tracking-wider">Medium: {activeArtwork.medium}</p>
          </div>
          <button 
            onClick={() => setActiveId(null)}
            className="text-xs uppercase font-semibold text-charcoal-light hover:text-charcoal border-l border-cream-dark/50 pl-6 h-full flex items-center justify-center flex-shrink-0"
          >
            Close Details
          </button>
        </div>
      )}

    </div>
  );
}

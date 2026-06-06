import { useState, useEffect } from 'react';

const journalPages = [
  {
    title: 'Kalaakar Journal',
    category: 'Volume I',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    isCover: true,
    note: 'Turning Memories Into Art'
  },
  {
    title: 'Indian Couple Portrait',
    category: 'Handmade Colored Sketch',
    image: '/parents_portrait.png',
    isCover: false,
    note: 'A detailed colored pencil commission capturing life-like parent smiles.'
  },
  {
    title: 'Krishna Mandala Bookmark',
    category: 'Ink & Silhouette Art',
    image: '/krishna_bookmark.png',
    isCover: false,
    note: 'Lord Krishna silhouette bordered with fine black-and-white patterns.'
  },
  {
    title: 'Customized Ring Holder',
    category: 'Wedding Keepsakes',
    image: '/ring_holder.png',
    isCover: false,
    note: 'Names Tejas & Bhargavi inside gold/silver rings on a plush green velvet base.'
  },
  {
    title: 'Intricate Rabbit Mandala',
    category: 'Graphite & Pencil Art',
    image: '/mandala_rabbit.png',
    isCover: false,
    note: 'A detailed hand-drawn rabbit layered with warm orange & brown shades.'
  },
  {
    title: 'Lotus Paper Crafts',
    category: 'Event Decorations',
    image: '/paper_lotus.png',
    isCover: false,
    note: 'Handfolded pink and teal lotuses designed to make home celebrations bloom.'
  }
];

export default function Sketchbook() {
  const [currentPage, setCurrentPage] = useState(0);

  const nextPage = () => {
    if (currentPage < journalPages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Autoplay page flip on load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 0) {
        setCurrentPage(1);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center py-6 px-4">
      {/* 3D Journal Wrapper */}
      <div className="relative w-full max-w-lg aspect-[4/5] perspective-1000 preserve-3d flex items-center justify-center">
        
        {journalPages.map((page, index) => {
          // Calculate page transformation
          const isFlipped = index < currentPage;
          const isActive = index === currentPage;
          
          let rotateY = 0;
          let zIndex = journalPages.length - index;

          if (isFlipped) {
            rotateY = -180;
            zIndex = index + 10;
          }

          return (
            <div
              key={index}
              className="absolute inset-0 w-full h-full preserve-3d transform-origin-left transition-transform duration-1000 ease-in-out cursor-pointer shadow-premium rounded-2xl overflow-hidden border border-cream-dark/50"
              style={{
                transform: `rotateY(${rotateY}deg)`,
                zIndex: zIndex,
                backfaceVisibility: 'hidden'
              }}
              onClick={isActive ? nextPage : prevPage}
            >
              
              {/* PAGE FACE */}
              {page.isCover ? (
                /* Cover Page Design */
                <div className="w-full h-full bg-charcoal text-cream p-8 flex flex-col justify-between items-center relative canvas-texture">
                  <div className="absolute inset-0 bg-charcoal/85 mix-blend-multiply"></div>
                  <img src={page.image} alt="Journal cover" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />
                  
                  <div className="relative z-10 text-center mt-12 border-b border-gold-artistic/40 pb-6 w-full">
                    <span className="text-[10px] tracking-[0.3em] uppercase text-gold-rose font-bold block mb-2">{page.category}</span>
                    <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-widest text-gold-artistic">KALAAKAR</h2>
                    <span className="text-xs italic text-cream/60 mt-1 block">Atelier Journal</span>
                  </div>

                  <div className="relative z-10 text-center mb-12">
                    <p className="font-script text-2xl text-gold-rose">{page.note}</p>
                    <span className="text-[9px] uppercase tracking-wider text-cream/40 block mt-6">Click Page to Open</span>
                  </div>
                </div>
              ) : (
                /* Standard Art Pages */
                <div className="w-full h-full bg-[#FAF7F2] p-6 flex flex-col justify-between relative canvas-texture border-l-4 border-l-gold-artistic/20">
                  
                  {/* Photo Container */}
                  <div className="relative w-full h-[65%] rounded-lg overflow-hidden border border-cream-dark/60 shadow-inner group">
                    <img 
                      src={page.image} 
                      alt={page.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute bottom-3 right-3 bg-white/95 px-2.5 py-1 rounded text-[9px] uppercase tracking-wider font-bold text-gold-rose border border-cream">
                      {page.category}
                    </div>
                  </div>

                  {/* Narrative details */}
                  <div className="flex-grow pt-4 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-base md:text-lg font-bold text-charcoal">{page.title}</h3>
                      <p className="font-script text-lg text-charcoal-light mt-1 leading-relaxed">
                        "{page.note}"
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-charcoal-light/60 border-t border-cream-dark/30 pt-3">
                      <span>Volume I • Page {index}</span>
                      <span className="uppercase tracking-wider font-bold text-gold-artistic">Click to Flip →</span>
                    </div>
                  </div>
                  
                </div>
              )}

            </div>
          );
        })}

      </div>

      {/* Manual flip controls under book */}
      <div className="flex items-center space-x-6 mt-8 relative z-10">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-cream-dark/60 rounded-full hover:bg-cream disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          ← Prev
        </button>
        <span className="font-serif text-xs text-charcoal-light">
          Journal {currentPage + 1} of {journalPages.length}
        </span>
        <button
          onClick={nextPage}
          disabled={currentPage === journalPages.length - 1}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-cream-dark/60 rounded-full hover:bg-cream disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

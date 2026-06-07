import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, getUploadUrl } from '../services/api';
import GalleryWall from '../components/3d/GalleryWall';
import { Search, Eye, Filter } from 'lucide-react';

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads/')) return getUploadUrl(url);
    return url;
  };

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories
  });

  // Fetch Gallery Items
  const { data: galleryItems = [] } = useQuery({
    queryKey: ['gallery'],
    queryFn: api.getGalleryItems
  });

  const fallbackItems = [
    {
      id: 'f1',
      title: 'Eternal Bond Wedding Sketch',
      category_name: 'Monochrome Magic',
      image_url: '/couple_sketch.jpg',
      dimensions: 'A3 Size Frame',
      medium: 'Charcoal & Graphite on Archival paper',
      year: '2026'
    },
    {
      id: 'f2',
      title: 'Everlasting Paper Rose Bouquet',
      category_name: 'Forever Blooms',
      image_url: '/paper_roses.jpg',
      dimensions: '12" Bouquet Height',
      medium: 'Premium Matte Craft Cardstock',
      year: '2026'
    },
    {
      id: 'f3',
      title: 'Handcrafted Multi-Layer Explosion Box',
      category_name: 'Treasures of Memories',
      image_url: '/explosion_box.jpg',
      dimensions: '10" x 10" (Opened)',
      medium: 'Craft Cardstock & Ribbon accents',
      year: '2026'
    },
    {
      id: 'f4',
      title: 'Lord Buddha Lippan Art Painting',
      category_name: 'Crafted for Your Corner',
      image_url: '/buddha_painting.jpg',
      dimensions: '12" Round Panel',
      medium: 'Acrylics, Mirror Tiles on MDF Board',
      year: '2026'
    },
    {
      id: 'f5',
      title: 'Hand-drawn Indian Couple Portrait',
      category_name: 'Memories in Colors',
      image_url: '/parents_portrait.png',
      dimensions: 'A3 Size Frame',
      medium: 'Colored Pencil on Archival Drawing Sheet',
      year: '2022'
    },
    {
      id: 'f6',
      title: 'Tejas & Bhargavi Name Ring Holder',
      category_name: 'The Forever Nest',
      image_url: '/ring_holder.png',
      dimensions: '8" Round velvet base',
      medium: 'Glitter Loop Outlines & Paper Florals',
      year: '2021'
    },
    {
      id: 'f8',
      title: 'Peacock Tassel Toran Hanging',
      category_name: 'Walls That Speak',
      image_url: '/wall_hanging_peacock.jpg',
      dimensions: '3ft Width',
      medium: 'Embroidery, Wooden beads, Mirror panels & Woolen tassels',
      year: '2026'
    },
    {
      id: 'f9',
      title: 'Cherished Moments Photo Bouquet',
      category_name: 'Blooming Memories Bouquet',
      image_url: '/photo_bouquet.jpg',
      dimensions: '14" Height',
      medium: 'Laminated Photo Prints & Luxury Wrapping Paper',
      year: '2026'
    }
  ];

  // Merge backend gallery items with fallback placeholders
  const displayItems = [
    ...galleryItems,
    ...fallbackItems.filter(fb => !galleryItems.some(gi => gi.image_url === fb.image_url))
  ];

  const fallbackCategories = [
    { name: 'Memories in Colors' },
    { name: 'Monochrome Magic' },
    { name: 'Crafted for Your Corner' },
    { name: 'Blooming Memories Bouquet' },
    { name: 'Treasures of Memories' },
    { name: 'Walls That Speak' },
    { name: 'Forever Blooms' },
    { name: 'The Forever Nest' }
  ];

  const displayCategories = categories.length > 0 ? categories : fallbackCategories;

  const filteredItems = displayItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      item.category_name.toLowerCase() === selectedCategory.toLowerCase();
      
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.medium && item.medium.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-6 md:px-12">
      
      {/* Immersive 3D Gallery Section */}
      <div className="mb-16">
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-rose font-bold">Virtual Exhibition</span>
        <h1 className="text-3xl md:text-5xl font-bold text-charcoal mt-1 mb-4">Art Exhibition Wall</h1>
        <p className="text-sm md:text-base text-charcoal-light font-light max-w-2xl mb-8">
          Welcome to the virtual gallery wall. Click on any frame to zoom in, read catalog details, and explore the craftsmanship.
        </p>
        <GalleryWall />
      </div>

      {/* Grid Filter and Controls */}
      <div className="border-t border-cream-dark/50 pt-16 mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2.5">
          {['All', ...displayCategories.map(c => c.name)].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                selectedCategory === cat
                  ? 'bg-gold-rose text-white shadow-premium'
                  : 'bg-white text-charcoal border border-cream-dark/50 hover:bg-canvas/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search medium or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-cream-dark/80 rounded-full text-xs bg-white text-charcoal focus:outline-none focus:border-gold-rose focus:ring-1 focus:ring-gold-rose"
          />
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-charcoal-light" />
        </div>
      </div>

      {/* Artwork Catalog Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 text-charcoal-light italic font-light">
          No handmade items match your selected filter or search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden shadow-premium border border-cream-dark/20 hover:scale-[1.01] transition-all duration-300 flex flex-col"
            >
              {/* Artwork Photo */}
              <div className="h-72 w-full overflow-hidden bg-cream-light relative group">
                <img
                  src={getImageUrl(item.image_url)}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div 
                  className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  onClick={() => setSelectedArtwork(item)}
                >
                  <span className="bg-white/90 backdrop-blur-sm text-charcoal font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Eye size={14} /> Inspect Catalog
                  </span>
                </div>
              </div>

              {/* Artwork Details */}
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] uppercase tracking-wider text-gold-rose font-bold bg-gold-rose/5 px-2.5 py-1 rounded">
                      {item.category_name}
                    </span>
                    {item.year && <span className="text-[10px] text-charcoal-light font-medium">{item.year}</span>}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-charcoal mt-3 mb-1.5">
                    {item.title}
                  </h3>
                  {item.medium && (
                    <p className="text-xs text-charcoal-light font-light leading-relaxed">
                      <strong>Medium:</strong> {item.medium}
                    </p>
                  )}
                  {item.dimensions && (
                    <p className="text-xs text-charcoal-light font-light leading-relaxed mt-1">
                      <strong>Size:</strong> {item.dimensions}
                    </p>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-cream-dark/40 flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-charcoal-light font-medium">Bespoke Framing Available</span>
                  <span className="text-[10px] text-gold-soft font-semibold uppercase tracking-wider">Unique Commission</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INSPECT POPUP MODAL */}
      {selectedArtwork && (
        <div className="fixed inset-0 bg-charcoal/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden border border-gold-artistic/20 grid grid-cols-1 md:grid-cols-2 relative">
            <button
              onClick={() => setSelectedArtwork(null)}
              className="absolute top-4 right-4 bg-white/80 p-2 rounded-full text-charcoal hover:text-gold-rose shadow-md z-10"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Modal Image */}
            <div className="h-96 md:h-full bg-cream-light">
              <img
                src={getImageUrl(selectedArtwork.image_url)}
                alt={selectedArtwork.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Modal Info */}
            <div className="p-8 md:p-12 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-gold-rose font-bold">
                  {selectedArtwork.category_name}
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal mt-2 mb-4">
                  {selectedArtwork.title}
                </h2>
                <div className="space-y-3 text-sm text-charcoal-light font-light">
                  <p><strong>Medium:</strong> {selectedArtwork.medium || 'Handmade materials'}</p>
                  <p><strong>Dimensions:</strong> {selectedArtwork.dimensions || 'Custom size'}</p>
                  <p><strong>Year:</strong> {selectedArtwork.year || '2026'}</p>
                  {selectedArtwork.description && (
                    <p className="mt-4 border-t border-cream-dark/40 pt-4 leading-relaxed">
                      <strong>Story & Materials:</strong> {selectedArtwork.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-cream-dark/40 flex flex-col space-y-3">
                <a
                  href={`https://wa.me/916355303793?text=Hello%20Kalaakar!%20I'm%20interested%20in%20commissioning%20something%20similar%20to%20"${encodeURIComponent(selectedArtwork.title)}".`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center bg-gradient-to-r from-gold-rose to-gold-soft text-white font-medium py-3 rounded-full shadow-premium uppercase tracking-wider text-xs"
                >
                  Commission Similar Design
                </a>
                <button
                  onClick={() => setSelectedArtwork(null)}
                  className="text-xs uppercase tracking-wider text-charcoal-light hover:text-charcoal text-center"
                >
                  Return to Gallery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Gallery;

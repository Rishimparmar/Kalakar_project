import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SEO from '../components/SEO';
import { api } from '../services/api';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [openFaqId, setOpenFaqId] = useState(null);

  // Fetch FAQ from API
  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: api.getFaqs
  });

  const fallbackFaqs = [
    { id: 1, category: 'Delivery', question: 'How long does it take to make a custom painting or mandala?', answer: 'Typically, it takes 5 to 7 business days to complete a customized painting or mandala art design, depending on the complexity. Delivery takes another 2-4 days.' },
    { id: 2, category: 'Customization', question: 'Can I request changes to my custom artwork?', answer: 'Yes! We send you a preview photo of the completed painting or mandala before framing and shipping. You can request minor modifications at this stage.' },
    { id: 3, category: 'Delivery', question: 'Do you offer express shipping?', answer: 'Yes, we have express shipping options available at checkout for an additional fee, which speeds up shipping to 24-48 hours after completion.' },
    { id: 4, category: 'Pricing', question: 'How is the price calculated for custom orders?', answer: 'Pricing is dynamic and depends on the artwork type (e.g. Mandala Art, Canvas Painting), selected dimensions, and additional features like framing or custom text boxes.' }
  ];

  const displayFaqs = faqs.length > 0 ? faqs : fallbackFaqs;

  const categories = ['All', 'Delivery', 'Customization', 'Pricing'];

  const filteredFaqs = displayFaqs.filter(faq => 
    activeCategory === 'All' || faq.category.toLowerCase() === activeCategory.toLowerCase()
  );

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-6 md:px-12 min-h-screen">
      <SEO 
        title="FAQs | Kalaakar" 
        description="Frequently asked questions about Kalaakar's custom handmade gifts, delivery times, and pricing."
        url="https://kalaakar.online/faq"
      />
      
      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-rose font-bold">Frequently Asked Questions</span>
        <h1 className="text-3xl md:text-5xl font-bold text-charcoal mt-1 mb-4">Support & FAQ</h1>
        <p className="text-sm text-charcoal-light font-light leading-relaxed max-w-md mx-auto">
          Find instant answers to inquiries regarding pricing calculations, portrait customizations, and shipping policies.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center space-x-2.5 mb-12 border-b border-cream-dark/50 pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setOpenFaqId(null); }}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
              activeCategory === cat
                ? 'bg-gold-rose text-white shadow-premium'
                : 'text-charcoal-light hover:text-charcoal'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion FAQ List */}
      {filteredFaqs.length === 0 ? (
        <div className="text-center py-10 text-charcoal-light italic font-light">
          No questions listed in this category.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div 
                key={faq.id}
                className="bg-white rounded-2xl border border-cream-dark/30 overflow-hidden shadow-premium transition-all duration-200"
              >
                {/* Header/Question Trigger */}
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle size={18} className="text-gold-rose flex-shrink-0" />
                    <span className="font-serif text-sm md:text-base font-bold text-charcoal">{faq.question}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp size={18} className="text-gold-soft flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDown size={18} className="text-gold-soft flex-shrink-0 ml-4" />
                  )}
                </button>

                {/* Answer Box */}
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-xs md:text-sm text-charcoal-light font-light leading-relaxed border-t border-cream-dark/20 bg-canvas/30">
                    <p>{faq.answer}</p>
                    <div className="mt-4 pt-3 border-t border-cream-dark/10 flex justify-between items-center text-[10px] text-charcoal-light/60">
                      <span>Category: {faq.category}</span>
                      <span>100% Artist Verified</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default FAQ;

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Gallery from './pages/Gallery';
import CustomOrder from './pages/CustomOrder';
import OrderTracking from './pages/OrderTracking';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// WhatsApp Floating Button Component
const WhatsAppButton = () => {
  const whatsappNumber = '+919876543210'; // Dynamically configured
  const message = encodeURIComponent("Hello Kalaakar! I'm interested in ordering a customized handmade artwork.");
  
  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#128C7E] transition-all hover:scale-110 flex items-center justify-center"
      aria-label="Contact us on WhatsApp"
    >
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.488 1.459 5.407 1.46h.007c5.626 0 10.204-4.579 10.207-10.205.002-2.727-1.059-5.29-2.99-7.222C17.34 1.256 14.78.197 12.01.197c-5.63 0-10.21 4.579-10.213 10.206-.001 1.932.504 3.82 1.463 5.438L2.24 21.03l4.407-1.876zm9.89-6.859c.27-.135.45-.225.54-.36.09-.136.09-.766-.045-1.036-.135-.27-.54-.405-1.125-.675-.585-.27-2.745-1.353-3.172-1.508-.428-.155-.743-.225-1.058.225-.315.45-1.216 1.508-1.486 1.801-.27.293-.54.33-.113.045.428-.27 1.82-1.06 2.624-1.777.625-.557 1.011-1.231 1.101-1.366.09-.135.01-.225-.08-.315-.09-.09-.27-.315-.405-.473-.135-.157-.18-.27-.09-.45.09-.18.45-.9.45-1.035 0-.135-.27-.225-.54-.36-.27-.135-2.205-.901-2.925-.901-.72 0-1.35.225-1.8.766-.45.54-1.71 1.666-1.71 4.053 0 2.387 1.737 4.693 1.983 5.031.246.338 3.393 5.181 8.219 7.262 1.147.495 2.043.79 2.743 1.012 1.152.367 2.202.314 3.03.19.923-.139 2.835-1.16 3.24-2.277.405-1.117.405-2.073.284-2.277-.12-.203-.45-.338-.72-.473z"/>
      </svg>
    </a>
  );
};

// Scroll To Top on page change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-canvas">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/custom-order" element={<CustomOrder />} />
            <Route path="/track" element={<OrderTracking />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />

        {/* Floating WhatsApp */}
        <WhatsAppButton />
      </div>
    </Router>
  );
}

export default App;

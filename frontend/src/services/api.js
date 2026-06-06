import axios from 'axios';

const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const API_URL = import.meta.env.VITE_API_URL || `http://${hostname}:5000/api`;

const apiClient = axios.create({
  baseURL: API_URL,
});

// Helper to resolve backend upload asset URLs dynamically
export const getUploadUrl = (filePath) => {
  if (!filePath) return '';
  if (filePath.startsWith('http')) return filePath;
  // Derive backend base from API_URL (removing /api suffix)
  const base = API_URL.replace(/\/api$/, '');
  return `${base}${filePath}`;
};

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kalaakar_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('kalaakar_token', res.data.token);
      localStorage.setItem('kalaakar_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('kalaakar_token');
    localStorage.removeItem('kalaakar_user');
  },
  verifyToken: async () => {
    const res = await apiClient.get('/auth/verify');
    return res.data;
  },

  // Settings
  getSettings: async () => {
    const res = await apiClient.get('/settings');
    return res.data;
  },
  updateSettings: async (settings) => {
    const res = await apiClient.put('/settings', settings);
    return res.data;
  },

  // Categories
  getCategories: async () => {
    const res = await apiClient.get('/categories');
    return res.data;
  },

  // Products (Dynamic Pricing System)
  getProducts: async () => {
    const res = await apiClient.get('/products');
    return res.data;
  },
  updateProduct: async (id, data) => {
    const res = await apiClient.put(`/products/${id}`, data);
    return res.data;
  },

  // Gallery
  getGalleryItems: async () => {
    const res = await apiClient.get('/gallery');
    return res.data;
  },
  createGalleryItem: async (formData) => {
    const res = await apiClient.post('/gallery', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  deleteGalleryItem: async (id) => {
    const res = await apiClient.delete(`/gallery/${id}`);
    return res.data;
  },

  // Custom Orders
  createOrder: async (formData) => {
    const res = await apiClient.post('/orders', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  trackOrder: async (orderNumber, phone) => {
    const res = await apiClient.get('/orders/track', {
      params: { order_number: orderNumber, phone }
    });
    return res.data;
  },
  getOrders: async () => {
    const res = await apiClient.get('/orders');
    return res.data;
  },
  updateOrderStatus: async (id, status, notes, price) => {
    const res = await apiClient.put(`/orders/${id}/status`, { status, notes, price });
    return res.data;
  },

  // Quotation Requests
  createQuote: async (formData) => {
    const res = await apiClient.post('/quotes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  getQuotes: async () => {
    const res = await apiClient.get('/quotes');
    return res.data;
  },
  respondToQuote: async (id, data) => {
    const res = await apiClient.put(`/quotes/${id}`, data);
    return res.data;
  },

  // Testimonials
  getTestimonials: async () => {
    const res = await apiClient.get('/testimonials');
    return res.data;
  },
  getAllTestimonials: async () => {
    const res = await apiClient.get('/testimonials/all');
    return res.data;
  },
  submitTestimonial: async (data) => {
    const res = await apiClient.post('/testimonials', data);
    return res.data;
  },
  approveTestimonial: async (id, isApproved) => {
    const res = await apiClient.put(`/testimonials/${id}/approve`, { is_approved: isApproved });
    return res.data;
  },

  // Contact Messages
  submitContact: async (data) => {
    const res = await apiClient.post('/contact', data);
    return res.data;
  },
  getContacts: async () => {
    const res = await apiClient.get('/contact');
    return res.data;
  },
  replyContact: async (id) => {
    const res = await apiClient.put(`/contact/${id}/reply`);
    return res.data;
  },

  // FAQ
  getFaqs: async () => {
    const res = await apiClient.get('/faq');
    return res.data;
  },
  createFaq: async (faqData) => {
    const res = await apiClient.post('/faq', faqData);
    return res.data;
  },
  deleteFaq: async (id) => {
    const res = await apiClient.delete(`/faq/${id}`);
    return res.data;
  },

  // Admin Activity logs & stats
  getActivityLogs: async () => {
    const res = await apiClient.get('/activity-logs');
    return res.data;
  },
  getStats: async () => {
    const res = await apiClient.get('/stats');
    return res.data;
  }
};

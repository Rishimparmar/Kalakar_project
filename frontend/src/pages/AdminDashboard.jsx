import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getUploadUrl } from '../services/api';
import { 
  BarChart3, ShoppingBag, DollarSign, MessageCircle, FileSpreadsheet, 
  Settings, LogOut, CheckCircle, XCircle, RefreshCw, Upload, Plus, Trash2, ShieldCheck, ListOrdered
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders'); // orders, quotes, pricing, gallery, reviews, contacts, settings, logs
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Redirect if not authenticated & load fresh data
  useEffect(() => {
    const token = sessionStorage.getItem('kalaakar_token');
    if (!token) {
      navigate('/admin/login');
    } else {
      queryClient.invalidateQueries();
    }
  }, [navigate, queryClient]);

  const handleLogout = () => {
    api.logout();
    queryClient.clear();
    navigate('/admin/login');
  };

  // Queries
  const { data: stats = {}, refetch: refetchStats } = useQuery({ queryKey: ['adminStats'], queryFn: api.getStats });
  const { data: orders = [], refetch: refetchOrders } = useQuery({ queryKey: ['adminOrders'], queryFn: api.getOrders });
  const { data: quotes = [], refetch: refetchQuotes } = useQuery({ queryKey: ['adminQuotes'], queryFn: api.getQuotes });
  const { data: products = [], refetch: refetchProducts } = useQuery({ queryKey: ['adminProducts'], queryFn: api.getProducts });
  const { data: gallery = [], refetch: refetchGallery } = useQuery({ queryKey: ['adminGallery'], queryFn: api.getGalleryItems });
  const { data: categories = [] } = useQuery({ queryKey: ['adminCategories'], queryFn: api.getCategories });
  const { data: testimonials = [], refetch: refetchTestimonials } = useQuery({ queryKey: ['adminTestimonials'], queryFn: api.getAllTestimonials });
  const { data: contacts = [], refetch: refetchContacts } = useQuery({ queryKey: ['adminContacts'], queryFn: api.getContacts });
  const { data: settings = {}, refetch: refetchSettings } = useQuery({ queryKey: ['adminSettings'], queryFn: api.getSettings });
  const { data: logs = [], refetch: refetchLogs } = useQuery({ queryKey: ['adminLogs'], queryFn: api.getActivityLogs });

  // Mutations
  const updateOrderMutation = useMutation({
    mutationFn: ({ id, status, notes, price }) => api.updateOrderStatus(id, status, notes, price),
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ['adminOrders'] });
      const previousOrders = queryClient.getQueryData(['adminOrders']);
      queryClient.setQueryData(['adminOrders'], old => 
        old ? old.map(o => o.id === newOrder.id ? { ...o, status: newOrder.status, notes: newOrder.notes, price: newOrder.price } : o) : []
      );
      return { previousOrders };
    },
    onError: (err, newOrder, context) => {
      queryClient.setQueryData(['adminOrders'], context.previousOrders);
      alert('Failed to update order. Reverting changes.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    }
  });

  const respondQuoteMutation = useMutation({
    mutationFn: ({ id, price, status, message }) => api.respondToQuote(id, { proposed_price: price, status, admin_message: message }),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminQuotes']);
      queryClient.invalidateQueries(['adminStats']);
      alert('Quotation response dispatched!');
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, price, active }) => api.updateProduct(id, { base_price: price, is_active: active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      alert('Pricing updated successfully!');
    }
  });

  const uploadGalleryMutation = useMutation({
    mutationFn: (formData) => api.createGalleryItem(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGallery'] });
      alert('New artwork added to gallery!');
    }
  });

  const deleteGalleryMutation = useMutation({
    mutationFn: (id) => api.deleteGalleryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGallery'] });
      alert('Gallery item removed.');
    }
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (id) => api.deleteOrder(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['adminOrders'] });
      const previousOrders = queryClient.getQueryData(['adminOrders']);
      queryClient.setQueryData(['adminOrders'], old => 
        old ? old.filter(o => o.id !== deletedId) : []
      );
      return { previousOrders };
    },
    onError: (err, newOrder, context) => {
      queryClient.setQueryData(['adminOrders'], context.previousOrders);
      alert('Failed to delete order.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    }
  });

  const approveTestiMutation = useMutation({
    mutationFn: ({ id, approved }) => api.approveTestimonial(id, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
    }
  });

  const replyContactMutation = useMutation({
    mutationFn: (id) => api.replyContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminContacts'] });
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => api.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
      alert('Site configuration updated!');
    }
  });

  // Local Form states
  const [newGallery, setNewGallery] = useState({ title: '', category_id: '1', description: '', dimensions: '', medium: '', year: '2026', is_featured: false });
  const [galleryFile, setGalleryFile] = useState(null);
  const [localSettings, setLocalSettings] = useState({});

  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      setLocalSettings(settings);
    }
  }, [settings]);

  // Handle Order modification
  const [editingOrder, setEditingOrder] = useState(null);
  const [orderForm, setOrderForm] = useState({ status: '', notes: '', price: 0 });

  const startEditOrder = (order) => {
    setEditingOrder(order.id);
    setOrderForm({ status: order.status, notes: '', price: order.price });
  };

  const submitEditOrder = (id) => {
    updateOrderMutation.mutate({ id, status: orderForm.status, notes: orderForm.notes, price: parseFloat(orderForm.price) });
    setEditingOrder(null);
  };

  // Handle Quote response
  const [answeringQuote, setAnsweringQuote] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ price: 0, status: 'approved', message: '' });

  const startAnswerQuote = (quote) => {
    setAnsweringQuote(quote.id);
    setQuoteForm({ price: quote.proposed_price || 2000, status: 'approved', message: '' });
  };

  const submitAnswerQuote = (id) => {
    respondQuoteMutation.mutate({ id, price: parseFloat(quoteForm.price), status: quoteForm.status, message: quoteForm.message });
    setAnsweringQuote(null);
  };

  // Handle Pricing update
  const [editingProduct, setEditingProduct] = useState(null);
  const [productPrice, setProductPrice] = useState(0);

  const saveProductPrice = (id) => {
    updateProductMutation.mutate({ id, price: parseFloat(productPrice) });
    setEditingProduct(null);
  };

  // Handle Gallery Upload submission
  const handleGallerySubmit = (e) => {
    e.preventDefault();
    if (!newGallery.title || !galleryFile) {
      alert('Please fill in title and select image.');
      return;
    }
    const formData = new FormData();
    formData.append('title', newGallery.title);
    formData.append('category_id', newGallery.category_id);
    formData.append('description', newGallery.description);
    formData.append('dimensions', newGallery.dimensions);
    formData.append('medium', newGallery.medium);
    formData.append('year', newGallery.year);
    formData.append('is_featured', newGallery.is_featured ? '1' : '0');
    formData.append('photo', galleryFile);

    uploadGalleryMutation.mutate(formData);
    setNewGallery({ title: '', category_id: '1', description: '', dimensions: '', medium: '', year: '2026', is_featured: false });
    setGalleryFile(null);
  };

  // Quick refresh
  const triggerRefresh = () => {
    refetchStats();
    refetchOrders();
    refetchQuotes();
    refetchProducts();
    refetchGallery();
    refetchTestimonials();
    refetchContacts();
    refetchSettings();
    refetchLogs();
    
    // Create a temporary toast/alert to show success
    alert('Data refreshed successfully from the latest database state.');
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-6 md:px-12">
      
      {/* Header and Logout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-cream-dark/50 pb-6 mb-8 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-gold-rose font-bold">Studio Master Control Panel</span>
          <h1 className="text-3xl font-serif font-bold text-charcoal mt-1 flex items-center gap-2">
            <ShieldCheck className="text-gold-artistic" /> Kalaakar Administration
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={triggerRefresh}
            className="p-2.5 rounded-lg border border-cream-dark bg-white hover:bg-canvas/50 text-charcoal-light flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
          >
            <RefreshCw size={14} /> Refresh Data
          </button>
          
          <button
            onClick={handleLogout}
            className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-premium border border-cream-dark/30 flex items-center space-x-4">
          <div className="bg-gold-rose/10 p-3.5 rounded-xl text-gold-rose">
            <ShoppingBag size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase text-charcoal-light tracking-wider font-semibold block">Total Orders</span>
            <span className="text-2xl font-bold text-charcoal font-serif">{stats.total_orders || 0}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-premium border border-cream-dark/30 flex items-center space-x-4">
          <div className="bg-gold-soft/10 p-3.5 rounded-xl text-gold-soft">
            <ListOrdered size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase text-charcoal-light tracking-wider font-semibold block">Pending Queue</span>
            <span className="text-2xl font-bold text-charcoal font-serif">{stats.pending_orders || 0}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-premium border border-cream-dark/30 flex items-center space-x-4">
          <div className="bg-green-50 p-3.5 rounded-xl text-green-600">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase text-charcoal-light tracking-wider font-semibold block">Sales Revenue</span>
            <span className="text-2xl font-bold text-charcoal font-serif">₹{stats.revenue || 0}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-premium border border-cream-dark/30 flex items-center space-x-4">
          <div className="bg-charcoal/5 p-3.5 rounded-xl text-charcoal">
            <MessageCircle size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase text-charcoal-light tracking-wider font-semibold block">Unreplied Mail</span>
            <span className="text-2xl font-bold text-charcoal font-serif">{stats.unread_messages || 0}</span>
          </div>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-cream-dark/40 pb-4">
        {[
          { id: 'orders', name: 'Custom Orders', icon: ShoppingBag },
          { id: 'quotes', name: 'Quotes Requests', icon: FileSpreadsheet },
          { id: 'pricing', name: 'Dynamic Pricing', icon: DollarSign },
          { id: 'gallery', name: 'Gallery Catalog', icon: Upload },
          { id: 'reviews', name: 'Testimonials', icon: BarChart3 },
          { id: 'contacts', name: 'Mails Inquiries', icon: MessageCircle },
          { id: 'settings', name: 'Site Settings', icon: Settings },
          { id: 'logs', name: 'System Logs', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === tab.id 
                  ? 'bg-charcoal text-white shadow-premium' 
                  : 'bg-white text-charcoal border border-cream-dark/50 hover:bg-canvas/50'
              }`}
            >
              <Icon size={14} /> {tab.name}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      <div className="bg-white rounded-3xl p-8 shadow-premium border border-cream-dark/30 min-h-[400px]">
        
        {/* 1. ORDERS MANAGER */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="font-serif text-xl font-bold text-charcoal mb-4">Commission Bookings</h2>
            
            {orders.length === 0 ? (
              <p className="text-sm text-charcoal-light font-light italic">No custom commissions placed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-cream-dark text-charcoal-light uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Artwork Spec</th>
                      <th className="py-3 px-4">Delivery</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-cream-dark/30 hover:bg-canvas/30">
                        <td className="py-4 px-4 font-bold text-gold-rose">{order.order_number}</td>
                        <td className="py-4 px-4">
                          <div><strong>{order.name}</strong></div>
                          <div className="text-[10px] text-charcoal-light">{order.phone} • {order.email}</div>
                          {order.address && (
                            <div className="text-[10px] text-charcoal-light mt-1">
                              <strong>Address:</strong> {order.address}
                              {order.delivery_zone && ` (${order.delivery_zone})`}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div><strong>{order.artwork_type}</strong></div>
                          <div className="text-[10px] text-charcoal-light">Size: {order.size_selection} | Color: {order.color_preference}</div>
                          {order.image_url && (
                            <a href={getUploadUrl(order.image_url)} target="_blank" rel="noopener noreferrer" className="text-[9px] text-gold-soft underline uppercase font-bold mt-1 block">View Reference Image</a>
                          )}
                        </td>
                        <td className="py-4 px-4 text-charcoal-light">{order.delivery_date}</td>
                        <td className="py-4 px-4 font-serif font-bold">₹{order.price}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold ${
                            order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                            order.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            order.status === 'completed' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            order.status === 'delivered' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {editingOrder === order.id ? (
                            <div className="bg-canvas p-4 rounded-xl space-y-3 max-w-xs border border-cream-dark/80">
                              <div>
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-charcoal-light mb-1">Status</label>
                                <select
                                  value={orderForm.status}
                                  onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value })}
                                  className="w-full p-2 border border-cream-dark rounded bg-white text-xs"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-charcoal-light mb-1">Price (₹)</label>
                                <input
                                  type="number"
                                  value={orderForm.price}
                                  onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                                  className="w-full p-2 border border-cream-dark rounded bg-white text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-charcoal-light mb-1">Notes (Emailed to Client)</label>
                                <textarea
                                  placeholder="e.g. Sketch outline finished. Starting framing."
                                  value={orderForm.notes}
                                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                                  className="w-full p-2 border border-cream-dark rounded bg-white text-xs"
                                  rows={2}
                                />
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => submitEditOrder(order.id)} className="bg-gold-rose text-white px-3 py-1 rounded font-bold hover:opacity-90">Save</button>
                                <button onClick={() => setEditingOrder(null)} className="text-charcoal-light hover:text-charcoal px-3 py-1">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditOrder(order)}
                                className="flex-1 text-center border border-cream-dark/60 hover:bg-canvas/50 font-bold px-3.5 py-1.5 rounded"
                              >
                                Update Status
                              </button>
                              <button
                                onClick={() => { if(confirm('Are you sure you want to permanently delete this order?')) deleteOrderMutation.mutate(order.id); }}
                                className="text-center border border-red-200 text-red-600 hover:bg-red-50 font-bold px-3.5 py-1.5 rounded title='Delete Order'"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 2. QUOTATIONS MODERATOR */}
        {activeTab === 'quotes' && (
          <div className="space-y-6">
            <h2 className="font-serif text-xl font-bold text-charcoal mb-4">Bespoke Quotation Requests</h2>
            
            {quotes.length === 0 ? (
              <p className="text-sm text-charcoal-light font-light italic">No custom quotes requested yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-cream-dark text-charcoal-light uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Request ID</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Project Description</th>
                      <th className="py-3 px-4">Suggested Price</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((q) => (
                      <tr key={q.id} className="border-b border-cream-dark/30 hover:bg-canvas/30">
                        <td className="py-4 px-4 font-bold text-charcoal-light">Quote #{q.id}</td>
                        <td className="py-4 px-4">
                          <div><strong>{q.name}</strong></div>
                          <div className="text-[10px] text-charcoal-light">{q.phone} • {q.email}</div>
                        </td>
                        <td className="py-4 px-4 max-w-sm">
                          <p className="line-clamp-3 leading-relaxed">{q.description}</p>
                          {q.image_url && (
                            <a href={getUploadUrl(q.image_url)} target="_blank" rel="noopener noreferrer" className="text-[9px] text-gold-rose underline uppercase font-bold mt-1.5 block">View Design Sketch</a>
                          )}
                        </td>
                        <td className="py-4 px-4 font-serif font-bold text-gold-soft">₹{q.proposed_price || 'Pending review'}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold ${
                            q.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                            q.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                            q.status === 'negotiating' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-red-50 text-red-700'
                          }`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {answeringQuote === q.id ? (
                            <div className="bg-canvas p-4 rounded-xl space-y-3 max-w-xs border border-cream-dark/80">
                              <div>
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-charcoal-light mb-1">Set Price (₹)</label>
                                <input
                                  type="number"
                                  value={quoteForm.price}
                                  onChange={(e) => setQuoteForm({ ...quoteForm, price: e.target.value })}
                                  className="w-full p-2 border border-cream-dark rounded bg-white text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-charcoal-light mb-1">Decision Status</label>
                                <select
                                  value={quoteForm.status}
                                  onChange={(e) => setQuoteForm({ ...quoteForm, status: e.target.value })}
                                  className="w-full p-2 border border-cream-dark rounded bg-white text-xs"
                                >
                                  <option value="approved">Approved / Price Offered</option>
                                  <option value="negotiating">Negotiating Details</option>
                                  <option value="rejected">Rejected / Not possible</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-charcoal-light mb-1">Remarks (Emailed to Client)</label>
                                <textarea
                                  placeholder="e.g. Can craft in 10 days. Framed and packed."
                                  value={quoteForm.message}
                                  onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                                  className="w-full p-2 border border-cream-dark rounded bg-white text-xs"
                                  rows={2}
                                />
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => submitAnswerQuote(q.id)} className="bg-gold-rose text-white px-3 py-1 rounded font-bold">Send Quote</button>
                                <button onClick={() => setAnsweringQuote(null)} className="text-charcoal-light hover:text-charcoal px-3 py-1">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => startAnswerQuote(q)}
                              className="w-full text-center border border-cream-dark/60 hover:bg-canvas/50 font-bold px-3.5 py-1.5 rounded"
                            >
                              Offer Price
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. DYNAMIC PRICING SYSTEM EDITOR */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-charcoal">Dynamic Pricing Matrix</h2>
              <p className="text-xs text-charcoal-light font-light leading-relaxed mt-1">
                Edit catalog base prices. Updates calculate live on customer checkout/order commissions page.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((prod) => (
                <div key={prod.id} className="p-4 rounded-xl border border-cream-dark bg-canvas/30 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-gold-rose font-bold">{prod.category_name}</span>
                    <h3 className="font-serif text-base font-bold text-charcoal mt-1">{prod.name}</h3>
                    <p className="text-xs text-charcoal-light leading-relaxed max-w-sm font-light mt-1">{prod.description}</p>
                  </div>
                  
                  <div className="text-right">
                    {editingProduct === prod.id ? (
                      <div className="space-y-2">
                        <input
                          type="number"
                          value={productPrice}
                          onChange={(e) => setProductPrice(e.target.value)}
                          className="w-24 p-1.5 border border-cream-dark rounded bg-white text-xs font-bold"
                        />
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => saveProductPrice(prod.id)} className="bg-charcoal text-white text-[10px] uppercase font-bold px-2 py-1 rounded">Save</button>
                          <button onClick={() => setEditingProduct(null)} className="text-[10px] text-charcoal-light px-2 py-1">X</button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="block font-serif text-base font-bold text-gold-soft">₹{prod.base_price}</span>
                        <button
                          onClick={() => { setEditingProduct(prod.id); setProductPrice(prod.base_price); }}
                          className="text-[10px] uppercase tracking-wider text-gold-rose font-bold underline"
                        >
                          Modify Rate
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. GALLERY UPLOADER */}
        {activeTab === 'gallery' && (
          <div className="space-y-8">
            {/* Upload form */}
            <form onSubmit={handleGallerySubmit} className="bg-canvas/40 p-6 rounded-2xl border border-cream-dark/50 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-1.5"><Plus size={16} /> Add Artwork / Gifting Design</h3>
                
                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-semibold text-charcoal-light mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={newGallery.title}
                    onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                    className="w-full px-3 py-2 border border-cream-dark/60 rounded-lg text-xs"
                    placeholder="e.g. Floral Resin Ring Holder"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-semibold text-charcoal-light mb-1">Category *</label>
                    <select
                      value={newGallery.category_id}
                      onChange={(e) => setNewGallery({ ...newGallery, category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-cream-dark/60 rounded-lg text-xs"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-semibold text-charcoal-light mb-1">Creation Year</label>
                    <input
                      type="text"
                      value={newGallery.year}
                      onChange={(e) => setNewGallery({ ...newGallery, year: e.target.value })}
                      className="w-full px-3 py-2 border border-cream-dark/60 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-semibold text-charcoal-light mb-1">Medium</label>
                    <input
                      type="text"
                      placeholder="e.g. Graphite / Resin / Wood"
                      value={newGallery.medium}
                      onChange={(e) => setNewGallery({ ...newGallery, medium: e.target.value })}
                      className="w-full px-3 py-2 border border-cream-dark/60 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-semibold text-charcoal-light mb-1">Dimensions</label>
                    <input
                      type="text"
                      placeholder="e.g. A4 size"
                      value={newGallery.dimensions}
                      onChange={(e) => setNewGallery({ ...newGallery, dimensions: e.target.value })}
                      className="w-full px-3 py-2 border border-cream-dark/60 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-semibold text-charcoal-light mb-1">Description / Story</label>
                  <textarea
                    rows={3}
                    value={newGallery.description}
                    onChange={(e) => setNewGallery({ ...newGallery, description: e.target.value })}
                    className="w-full px-3 py-2 border border-cream-dark/60 rounded-lg text-xs"
                    placeholder="Short description of the custom materials..."
                  />
                </div>
              </div>

              {/* Photo file input */}
              <div className="flex flex-col justify-between">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-semibold text-charcoal-light mb-2">Upload Photo *</label>
                  <div className="border border-dashed border-cream-dark rounded-xl p-8 flex flex-col items-center justify-center bg-white cursor-pointer relative hover:bg-canvas/50">
                    <input
                      type="file"
                      required
                      accept="image/*"
                      onChange={(e) => setGalleryFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload size={24} className="text-gold-rose mb-1" />
                    <span className="text-xs text-charcoal font-semibold">{galleryFile ? galleryFile.name : 'Select file'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 my-4">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={newGallery.is_featured}
                    onChange={(e) => setNewGallery({ ...newGallery, is_featured: e.target.checked })}
                    className="rounded border-cream-dark text-gold-rose focus:ring-gold-rose"
                  />
                  <label htmlFor="is_featured" className="text-xs text-charcoal-light font-medium">Mark as Featured Artwork</label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-gold-rose to-gold-soft text-white font-medium py-3 rounded-lg shadow-premium"
                >
                  Upload Artwork File
                </button>
              </div>
            </form>

            {/* List and delete existing gallery items */}
            <div className="border-t border-cream-dark/40 pt-6">
              <h3 className="font-serif text-base font-bold text-charcoal mb-4">Active Gallery Catalog ({gallery.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gallery.map((item) => (
                  <div key={item.id} className="bg-canvas/30 rounded-xl p-3 border border-cream-dark flex flex-col justify-between">
                    <div>
                      <img src={getUploadUrl(item.image_url)} alt={item.title} className="w-full h-32 object-cover rounded-lg mb-2" />
                      <span className="text-[8px] uppercase tracking-wider text-gold-rose font-bold block">{item.category_name}</span>
                      <h4 className="font-serif text-sm font-bold text-charcoal truncate mt-0.5">{item.title}</h4>
                    </div>
                    <button
                      onClick={() => { if(confirm('Delete artwork?')) deleteGalleryMutation.mutate(item.id); }}
                      className="text-[9px] uppercase tracking-wider text-red-600 font-bold flex items-center justify-center gap-1 border border-red-200 hover:bg-red-50 py-1 rounded mt-3"
                    >
                      <Trash2 size={12} /> Remove Design
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. TESTIMONIALS MODERATOR */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h2 className="font-serif text-xl font-bold text-charcoal mb-4">Customer Reviews Moderation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((testi) => (
                <div key={testi.id} className="p-5 rounded-xl border border-cream-dark flex flex-col justify-between bg-canvas/20">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <strong className="text-charcoal text-sm">{testi.name}</strong>
                      <span className="text-[10px] text-charcoal-light">{new Date(testi.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-gold-artistic text-xs mb-3">{'★'.repeat(testi.rating)}</div>
                    <p className="text-xs text-charcoal-light leading-relaxed italic">"{testi.review}"</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-cream-dark/30 flex justify-between items-center">
                    <span className={`text-[9px] font-bold uppercase ${testi.is_approved ? 'text-green-600' : 'text-yellow-600'}`}>
                      {testi.is_approved ? '● Visible on website' : '● Hidden/Awaiting Approval'}
                    </span>
                    <button
                      onClick={() => approveTestiMutation.mutate({ id: testi.id, approved: !testi.is_approved })}
                      className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                        testi.is_approved 
                          ? 'border-red-200 text-red-600 hover:bg-red-50' 
                          : 'border-green-200 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {testi.is_approved ? 'Hide' : 'Approve'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. CONTACT MAIL INBOX */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <h2 className="font-serif text-xl font-bold text-charcoal mb-4">Mail Inquiry Inbox</h2>
            {contacts.length === 0 ? (
              <p className="text-sm text-charcoal-light font-light italic">No inquiries received yet.</p>
            ) : (
              <div className="space-y-4">
                {contacts.map((c) => (
                  <div key={c.id} className={`p-6 rounded-2xl border ${c.is_replied ? 'border-cream-dark/50 bg-canvas/10' : 'border-gold-artistic/30 bg-gold-rose/5'} transition-all`}>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b border-cream-dark/20 pb-3 mb-3 gap-2">
                      <div>
                        <h4 className="font-serif text-sm font-bold text-charcoal">{c.name}</h4>
                        <span className="text-[10px] text-charcoal-light font-light">{c.email} • {c.phone}</span>
                      </div>
                      <span className="text-[10px] text-charcoal-light font-light">{new Date(c.created_at).toLocaleString()}</span>
                    </div>
                    
                    <p className="text-xs text-charcoal-light leading-relaxed mb-4">"{c.message}"</p>
                    
                    <div className="flex justify-between items-center text-[10px]">
                      <span className={`font-bold uppercase ${c.is_replied ? 'text-charcoal-light' : 'text-gold-rose'}`}>
                        {c.is_replied ? '✓ Replied' : '● Unread Inquiry'}
                      </span>
                      {!c.is_replied && (
                        <button
                          onClick={() => replyContactMutation.mutate(c.id)}
                          className="bg-charcoal text-white font-bold px-3.5 py-1.5 rounded"
                        >
                          Mark Replied
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. WEBSITE CONFIGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-xl">
            <h2 className="font-serif text-xl font-bold text-charcoal mb-4">Site Customization Settings</h2>
            
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-charcoal-light mb-1.5">Business Name</label>
                <input
                  type="text"
                  value={localSettings.site_name || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, site_name: e.target.value })}
                  className="w-full p-2.5 border border-cream-dark rounded-xl bg-canvas"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-charcoal-light mb-1.5">Tagline / Mission</label>
                <input
                  type="text"
                  value={localSettings.site_tagline || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, site_tagline: e.target.value })}
                  className="w-full p-2.5 border border-cream-dark rounded-xl bg-canvas"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-charcoal-light mb-1.5">WhatsApp Phone Number</label>
                <input
                  type="text"
                  value={localSettings.contact_whatsapp || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, contact_whatsapp: e.target.value })}
                  className="w-full p-2.5 border border-cream-dark rounded-xl bg-canvas"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-charcoal-light mb-1.5">Instagram Sync Handle</label>
                <input
                  type="text"
                  value={localSettings.contact_instagram || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, contact_instagram: e.target.value })}
                  className="w-full p-2.5 border border-cream-dark rounded-xl bg-canvas"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-charcoal-light mb-1.5">Studio Support Email</label>
                <input
                  type="email"
                  value={localSettings.contact_email || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, contact_email: e.target.value })}
                  className="w-full p-2.5 border border-cream-dark rounded-xl bg-canvas"
                />
              </div>
              
              <button
                onClick={() => updateSettingsMutation.mutate(localSettings)}
                className="w-full bg-gradient-to-r from-gold-rose to-gold-soft text-white font-medium py-3 rounded-lg mt-4 shadow-premium uppercase tracking-wider text-[11px] font-bold"
              >
                Save Site Configurations
              </button>
            </div>
          </div>
        )}

        {/* 8. SYSTEM LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <h2 className="font-serif text-xl font-bold text-charcoal mb-4 flex items-center gap-1.5">Administrative Action Logs</h2>
            <div className="border border-cream-dark rounded-2xl overflow-hidden bg-canvas/10 max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-canvas border-b border-cream-dark text-charcoal-light font-bold">
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4">Operator</th>
                    <th className="py-2.5 px-4">Action Event</th>
                    <th className="py-2.5 px-4">Parameter details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-cream-dark/30 hover:bg-canvas/20">
                      <td className="py-3 px-4 font-mono text-[10px] text-charcoal-light">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold">{log.admin_name || 'System Automated'}</td>
                      <td className="py-3 px-4 uppercase font-bold text-gold-rose text-[10px]">{log.action}</td>
                      <td className="py-3 px-4 text-charcoal-light font-light max-w-sm truncate">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default AdminDashboard;

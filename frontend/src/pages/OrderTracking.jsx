import { useState } from 'react';
import { api, getUploadUrl } from '../services/api';
import { Search, MapPin, Package, Clock, CheckCircle, HelpCircle } from 'lucide-react';

const OrderTracking = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setTrackingData(null);

    if (!orderNumber || !phone) {
      setErrorMsg('Please enter both Order ID and Phone Number.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.trackOrder(orderNumber.trim(), phone.trim());
      setTrackingData(res);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Order not found. Check credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Status mapping to highlight stages
  const stages = [
    { key: 'pending', name: 'Order Received', desc: 'Awaiting artist review & layout setup' },
    { key: 'in_progress', name: 'In Progress', desc: 'Artwork is actively being handcrafted' },
    { key: 'completed', name: 'Completed', desc: 'Craft completed & undergoing quality check' },
    { key: 'delivered', name: 'Shipped & Delivered', desc: 'Packed securely and delivered to client' }
  ];

  const getStageIndex = (status) => {
    const statusMap = {
      'pending': 0,
      'in_progress': 1,
      'completed': 2,
      'delivered': 3,
      'rejected': -1
    };
    return statusMap[status] !== undefined ? statusMap[status] : 0;
  };

  const currentStageIdx = trackingData ? getStageIndex(trackingData.order.status) : 0;

  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-6 md:px-12">
      
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-rose font-bold">Commissions Tracking</span>
        <h1 className="text-3xl md:text-5xl font-bold text-charcoal mt-1 mb-4">Track Order Status</h1>
        <p className="text-sm text-charcoal-light font-light leading-relaxed">
          Verify the status of your handcrafted sketch or gift commission. Enter your order credentials.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white max-w-md mx-auto p-8 rounded-3xl shadow-premium border border-cream-dark/30 mb-12">
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3.5 rounded-lg text-xs mb-6 font-light">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleTrack} className="space-y-5">
          <div>
            <label className="block text-[10px] text-charcoal-light font-medium uppercase tracking-wider mb-1.5">Order ID *</label>
            <input
              type="text"
              placeholder="e.g. KK-123456"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose"
            />
          </div>

          <div>
            <label className="block text-[10px] text-charcoal-light font-medium uppercase tracking-wider mb-1.5">Phone Number *</label>
            <input
              type="tel"
              placeholder="e.g. +919876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-rose to-gold-soft text-white font-medium py-3.5 rounded-xl shadow-premium hover:opacity-95 transition-opacity"
          >
            {loading ? 'Finding Details...' : 'Track Commission'}
          </button>
        </form>
      </div>

      {/* TRACKING PIPELINE DETAILS DISPLAY */}
      {trackingData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white p-8 rounded-3xl shadow-premium border border-cream-dark/40">
          
          {/* Order Details Left */}
          <div className="lg:col-span-4 space-y-6 border-b lg:border-b-0 lg:border-r border-cream-dark/40 pb-6 lg:pb-0 lg:pr-8">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-gold-rose font-bold">Commission Information</span>
              <h3 className="font-serif text-xl font-bold text-charcoal mt-1">Order {trackingData.order.order_number}</h3>
            </div>

            <div className="space-y-4 text-xs text-charcoal-light font-light leading-relaxed">
              <p><strong>Client:</strong> {trackingData.order.name}</p>
              <p><strong>Art Style:</strong> {trackingData.order.artwork_type}</p>
              <p><strong>Dimensions:</strong> {trackingData.order.size_selection}</p>
              <p><strong>Delivery Target:</strong> {trackingData.order.delivery_date}</p>
              <p>
                <strong>Commission Cost:</strong> <span className="font-serif text-sm font-bold text-charcoal">₹{trackingData.order.price}</span>
              </p>
              
              {trackingData.order.image_url && (
                <div className="mt-4 pt-4 border-t border-cream-dark/40">
                  <span className="block text-[10px] uppercase tracking-wider text-charcoal-light font-medium mb-2">Uploaded Reference:</span>
                  <img 
                    src={getUploadUrl(trackingData.order.image_url)} 
                    alt="Reference" 
                    className="w-32 h-32 object-cover rounded-lg border border-cream-dark" 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Pipeline Progress Right */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Visual step pipeline progress */}
            {trackingData.order.status === 'rejected' ? (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-xl text-sm font-light">
                This custom order request was cancelled or declined. Please contact our support team.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4 relative py-6">
                {stages.map((stage, idx) => {
                  const isFinished = idx <= currentStageIdx;
                  const isCurrent = idx === currentStageIdx;

                  return (
                    <div key={idx} className="flex flex-col items-center text-center relative z-10">
                      {/* Node circle */}
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          isFinished 
                            ? 'bg-gold-rose border-gold-rose text-white shadow-premium' 
                            : 'bg-white border-cream-dark/80 text-charcoal-light'
                        }`}
                      >
                        {isFinished ? '✓' : idx + 1}
                      </div>
                      
                      {/* Name */}
                      <h4 className={`text-[10px] uppercase font-bold tracking-wider mt-3 ${isCurrent ? 'text-gold-rose' : 'text-charcoal-light'}`}>
                        {stage.name}
                      </h4>
                    </div>
                  );
                })}
                
                {/* Horizontal line connector */}
                <div className="absolute top-10 left-[12%] right-[12%] h-0.5 bg-cream-dark -z-0"></div>
                <div 
                  className="absolute top-10 left-[12%] h-0.5 bg-gold-rose -z-0 transition-all duration-500" 
                  style={{ width: `${(currentStageIdx / 3) * 76}%` }}
                ></div>
              </div>
            )}

            {/* Status logs list */}
            <div className="border-t border-cream-dark/40 pt-8">
              <h4 className="font-serif text-sm font-bold text-charcoal mb-4">Tracking History Log</h4>
              <div className="space-y-6">
                {trackingData.tracking.map((log) => (
                  <div key={log.id} className="flex items-start gap-4">
                    <div className="bg-cream p-2 rounded-full text-gold-rose">
                      <Clock size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs uppercase text-charcoal">{log.status.replace('_', ' ')}</span>
                        <span className="text-[10px] text-charcoal-light font-light">
                          {new Date(log.updated_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-light font-light mt-1">{log.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default OrderTracking;

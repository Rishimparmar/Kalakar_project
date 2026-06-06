import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ShieldAlert, LogIn, Lock } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('kalaakar_token');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both admin email and password.');
      setLoading(false);
      return;
    }

    try {
      await api.login(email.trim().toLowerCase(), password.trim());
      navigate('/admin/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 max-w-md mx-auto px-6">
      
      {/* Brand Label */}
      <div className="text-center mb-8">
        <span className="font-serif text-3xl font-bold tracking-wider text-gold-artistic">Kalaakar</span>
        <h1 className="text-sm uppercase tracking-[0.25em] text-gold-rose font-medium mt-1">Artist Portal Sign In</h1>
      </div>

      {/* Login Box */}
      <div className="bg-white p-8 rounded-3xl shadow-premium border border-cream-dark/30">
        
        <div className="flex items-center space-x-2 text-gold-rose mb-6 pb-2 border-b border-cream-dark/30">
          <Lock size={16} />
          <span className="text-xs uppercase font-bold tracking-wider">Secure Admin Login</span>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3.5 rounded-lg text-xs mb-6 font-light">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] text-charcoal-light font-medium uppercase tracking-wider mb-1.5">Admin Email *</label>
            <input
              type="email"
              placeholder="admin@kalaakar.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose text-charcoal"
            />
          </div>

          <div>
            <label className="block text-[10px] text-charcoal-light font-medium uppercase tracking-wider mb-1.5">Password *</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-cream-dark/60 rounded-xl bg-canvas text-sm focus:outline-none focus:border-gold-rose text-charcoal"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-rose to-gold-soft text-white font-medium py-3.5 rounded-xl shadow-premium flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
          >
            {loading ? 'Authenticating...' : <><LogIn size={15} /> Sign In</>}
          </button>
        </form>

        <div className="bg-cream/20 p-4 rounded-xl mt-6 border border-cream-dark/40 flex items-start space-x-2">
          <ShieldAlert size={16} className="text-gold-soft flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-charcoal-light/80 leading-relaxed font-light">
            Demo account seeded: <strong>admin@kalaakar.com</strong> / password: <strong>admin123</strong>. Authorized logins only.
          </p>
        </div>
      </div>

    </div>
  );
};

export default AdminLogin;

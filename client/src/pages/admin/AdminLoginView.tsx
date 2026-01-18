import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, LayoutDashboard, ArrowLeft, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const AdminLoginView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* Left side: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 xl:px-32 relative z-10 bg-white">
        <Link
          to="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-[#16516f] transition-colors text-sm font-semibold group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="w-full max-w-sm mx-auto space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-[#16516f] rounded-xl flex items-center justify-center shadow-lg shadow-[#16516f]/20">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">LeafClutch</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">Welcome back!</h1>
            <p className="text-slate-500 text-sm">Enter your credentials to access your restaurant dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#16516f] transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@leafclutch.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#16516f]/10 focus:border-[#16516f] outline-none transition-all placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Password</label>
                <a href="#" className="text-xs font-bold text-[#16516f] hover:underline">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#16516f] transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#16516f]/10 focus:border-[#16516f] outline-none transition-all placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#16516f] text-white py-4 rounded-xl font-black shadow-xl shadow-[#16516f]/20 hover:bg-[#114058] hover:translate-y-[-2px] active:translate-y-[0] disabled:opacity-50 disabled:translate-y-0 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying Account...
                </>
              ) : (
                <>
                  Sign In to Dashboard
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-xs">
            New to LeafClutch? <a href="/#pricing" className="text-[#16516f] font-bold underline">Upgrade your plan</a>
          </p>
        </div>

        <div className="mt-20 flex justify-center gap-8 opacity-40 grayscale pointer-events-none">
          {/* Subtle branding or trust badges */}
          <ShieldCheck className="w-10 h-10" />
          <div className="w-[1px] h-10 bg-slate-200"></div>
          <LayoutDashboard className="w-10 h-10" />
        </div>
      </div>

      {/* Right side: Visual Showcase */}
      <div className="hidden lg:flex flex-1 bg-[#16516f] relative overflow-hidden items-center justify-center">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-400 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-lg px-12 space-y-12 text-center lg:text-left">
          <div className="space-y-6">
            <h2 className="text-5xl font-black text-white leading-tight">
              Manage your empire from any <span className="text-orange-400 italic">device.</span>
            </h2>
            <p className="text-blue-100 text-lg font-medium opacity-80 leading-relaxed">
              Your real-time restaurant command center. Track orders, manage inventory, and delight customers—all from one premium dashboard.
            </p>
          </div>

          <div className="relative group perspective-1000">
            <img
              src="/restaurant_dashboard_mobile_1768761512106.png"
              alt="Dashboard Preview"
              className="rounded-3xl shadow-[0_45px_100px_-20px_rgba(0,0,0,0.5)] transform -rotate-2 group-hover:rotate-0 transition-transform duration-700"
            />
            {/* Floating UI Card */}
            <div className="absolute top-1/2 -right-12 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl animate-bounce-subtle">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#16516f]" />
                </div>
                <div>
                  <p className="text-white font-bold">New Sale! +Rs 1500</p>
                  <p className="text-xs text-blue-200">Table 8 • Mixed Payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom scroll/animation styles */}
        <style>{`
          .perspective-1000 { perspective: 1000px; }
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
          .animate-bounce-subtle {
            animation: bounce-subtle 4s infinite ease-in-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AdminLoginView;

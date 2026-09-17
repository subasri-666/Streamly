import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Tv, Sparkles, UserCheck, ShieldCheck, BarChart3, AlertCircle, ArrowRight, Lock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (token && user) {
      if (user.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'ANALYST') navigate('/analyst/dashboard', { replace: true });
      else navigate('/viewer/home', { replace: true });
    }
  }, [user, token, navigate]);

  const [selectedRole, setSelectedRole] = useState<UserRole>('VIEWER');
  const [email, setEmail] = useState<string>('viewer@streamly.demo');
  const [password, setPassword] = useState<string>('StreamlyViewer2026!');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const demoAccounts: Record<UserRole, { email: string; pass: string; label: string; desc: string }> = {
    VIEWER: {
      email: 'viewer@streamly.demo',
      pass: 'StreamlyViewer2026!',
      label: 'Viewer Experience',
      desc: 'Cinematic OTT platform, 3D Page-Turn deck, Segment DNA, & Familiar-Explore slider'
    },
    ANALYST: {
      email: 'analyst@streamly.demo',
      pass: 'StreamlyAnalyst2026!',
      label: 'Analyst Dashboard',
      desc: 'Audience cluster deep-dives, K evaluation elbow/silhouette plots, & ML rules matrix'
    },
    ADMIN: {
      email: 'admin@streamly.demo',
      pass: 'StreamlyAdmin2026!',
      label: 'Admin Platform',
      desc: 'User management (CRUD), SQLite state, model metadata, & metrics.json verification'
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(demoAccounts[role].email);
    setPassword(demoAccounts[role].pass);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await login(email, password, selectedRole);

      // Redirect based on selected role
      if (selectedRole === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (selectedRole === 'ANALYST') {
        navigate('/analyst/dashboard', { replace: true });
      } else {
        navigate('/viewer/home', { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 selection:bg-[#FF1744] selection:text-white">
      <div className="w-full max-w-xl space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF1744] to-[#FF2D75] p-3 shadow-2xl shadow-[#FF1744]/40 mb-2">
            <Tv className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-4xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
            STREAM<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF1744] to-[#FF2D75]">LY</span>
          </h1>
          <p className="text-sm font-medium text-gray-400">
            "Understand Your Watch. Discover Your Next."
          </p>
        </div>

        {/* Login Container */}
        <div className="bg-[#151518] border border-[#252529] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Step 1: Role Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF2D75] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF1744]" /> Step 1: Select Role
              </span>
              <span className="text-[11px] text-gray-400 font-medium">Continue as</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(['VIEWER', 'ANALYST', 'ADMIN'] as UserRole[]).map((r) => {
                const isSelected = selectedRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#FF1744]/20 to-[#FF2D75]/10 border-[#FF1744] ring-1 ring-[#FF1744]'
                        : 'bg-[#0D0D0F] border-[#252529] hover:border-gray-600 hover:bg-[#1E1E22]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-black uppercase ${isSelected ? 'text-[#FF6B9A]' : 'text-gray-300'}`}>
                        {r}
                      </span>
                      {r === 'VIEWER' && <UserCheck className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FF1744]' : 'text-gray-500'}`} />}
                      {r === 'ANALYST' && <BarChart3 className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FF2D75]' : 'text-gray-500'}`} />}
                      {r === 'ADMIN' && <ShieldCheck className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FF6B9A]' : 'text-gray-500'}`} />}
                    </div>
                    <p className="text-[10px] text-gray-400 leading-tight line-clamp-2">
                      {demoAccounts[r].label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Role Scope Card */}
          <div className="bg-[#0D0D0F] p-3.5 rounded-2xl border border-[#252529] text-xs text-gray-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#FF1744] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">{demoAccounts[selectedRole].label} Scope</span>
              <p className="text-gray-400 leading-relaxed text-[11px]">{demoAccounts[selectedRole].desc}</p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-[#FF1744]/15 border border-[#FF1744]/40 rounded-xl text-xs font-medium text-[#FF6B9A] flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-[#FF1744] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 2: Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0D0D0F] border border-[#252529] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FF1744] transition-colors"
                placeholder="email@streamly.demo"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0D0D0F] border border-[#252529] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FF1744] transition-colors"
                placeholder="••••••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FF1744] to-[#FF2D75] hover:opacity-95 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-xl shadow-[#FF1744]/25 active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to {selectedRole} Shell</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Footer Info */}
        <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-gray-500" />
          <span>Streamly Role-Based Authentication • Strict RBAC Protection</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tv, BarChart3, Layers, Users, PieChart, Sliders, CheckCircle2, LogOut, Shield } from 'lucide-react';

export const AnalystLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] font-['Outfit',sans-serif] flex flex-col">
      {/* Analyst Header */}
      <header className="sticky top-0 z-40 w-full bg-[#050505]/95 backdrop-blur-xl border-b border-[#252529]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <NavLink to="/analyst/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF2D75] to-[#FF6B9A] p-2 flex items-center justify-center shadow-lg shadow-[#FF2D75]/30">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                STREAMLY <span className="text-xs font-bold px-2 py-0.5 bg-[#FF2D75]/20 text-[#FF6B9A] border border-[#FF2D75]/40 rounded-md">ANALYST</span>
              </span>
            </NavLink>

            {/* Analyst Nav Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              <NavLink
                to="/analyst/dashboard"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-white bg-[#151518] font-bold' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <PieChart className="w-3.5 h-3.5 text-[#FF2D75]" /> Dashboard
              </NavLink>

              <NavLink
                to="/analyst/audience-segments"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-white bg-[#151518] font-bold' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <Layers className="w-3.5 h-3.5 text-[#FF1744]" /> Audience Segments
              </NavLink>

              <NavLink
                to="/analyst/user-analytics"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-white bg-[#151518] font-bold' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <Users className="w-3.5 h-3.5 text-[#FF6B9A]" /> User Analytics
              </NavLink>

              <NavLink
                to="/analyst/cluster-analysis"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-white bg-[#151518] font-bold' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#FF2D75]" /> Cluster Analysis
              </NavLink>

              <NavLink
                to="/analyst/recommendations"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-white bg-[#151518] font-bold' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <Sliders className="w-3.5 h-3.5 text-[#FF6B9A]" /> Recommendation Rules
              </NavLink>

              <NavLink
                to="/analyst/model-evaluation"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-white bg-[#151518] font-bold' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Model Evaluation
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">{user?.name || 'Data Analyst'}</p>
              <p className="text-[10px] text-[#FF6B9A] font-semibold uppercase">ANALYST ROLE</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#151518]"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Analyst Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-[#0D0D0F] border-t border-[#252529] py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <p>© 2026 STREAMLY Audience Intelligence Analytics</p>
          <span className="text-gray-400 font-semibold">StandardScaler + KMeans Model Evaluation</span>
        </div>
      </footer>
    </div>
  );
};

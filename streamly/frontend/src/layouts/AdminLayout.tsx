import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Database, Cpu, CheckCircle2, Settings, Layers, LogOut, LayoutDashboard } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] font-['Outfit',sans-serif] flex flex-col">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 w-full bg-[#050505]/95 backdrop-blur-xl border-b border-[#252529]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <NavLink to="/admin/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF1744] to-[#FF2D75] p-2 flex items-center justify-center shadow-lg shadow-[#FF1744]/30">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                STREAMLY <span className="text-xs font-bold px-2 py-0.5 bg-[#FF1744]/20 text-[#FF6B9A] border border-[#FF1744]/40 rounded-md">ADMIN</span>
              </span>
            </NavLink>

            {/* Admin Nav Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-white bg-[#151518] font-bold' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#FF1744]" /> Dashboard
              </NavLink>

              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-white bg-[#151518] font-bold' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <Users className="w-3.5 h-3.5 text-[#FF2D75]" /> Users
              </NavLink>

              <NavLink
                to="/admin/viewer-data"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-white bg-[#151518] font-bold' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <Database className="w-3.5 h-3.5 text-[#FF6B9A]" /> Viewer Data
              </NavLink>

              <NavLink
                to="/admin/audience-segments"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-white bg-[#151518] font-bold' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <Layers className="w-3.5 h-3.5 text-[#FF1744]" /> Segments
              </NavLink>

              <NavLink
                to="/admin/model"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-white bg-[#151518] font-bold' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <Cpu className="w-3.5 h-3.5 text-[#FF2D75]" /> Model
              </NavLink>

              <NavLink
                to="/admin/evaluation"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-white bg-[#151518] font-bold' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Evaluation
              </NavLink>

              <NavLink
                to="/admin/settings"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-white bg-[#151518] font-bold' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <Settings className="w-3.5 h-3.5 text-gray-400" /> Settings
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-[#FF1744] font-semibold uppercase">ADMIN ROLE</p>
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

      {/* Admin Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-[#0D0D0F] border-t border-[#252529] py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <p>© 2026 STREAMLY Platform Administration & Governance</p>
          <span className="text-gray-400 font-semibold">SQLite Database • Docker Compose</span>
        </div>
      </footer>
    </div>
  );
};

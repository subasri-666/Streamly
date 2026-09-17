import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tv, Sparkles, LogOut, User, Home, Film, Dna, Bookmark, UserCircle } from 'lucide-react';
import { AnalyzeNewViewerModal } from '../components/AnalyzeNewViewerModal';
import { RecommendResponse } from '../types';

interface ViewerLayoutProps {
  onAnalysisComplete?: (res: RecommendResponse) => void;
}

export const ViewerLayout: React.FC<ViewerLayoutProps> = ({ onAnalysisComplete }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] font-['Outfit',sans-serif]">
      {/* Viewer Header */}
      <header className="sticky top-0 z-40 w-full bg-[#050505]/90 backdrop-blur-xl border-b border-[#252529]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & OTT Nav */}
          <div className="flex items-center gap-8">
            <NavLink to="/viewer/home" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF1744] to-[#FF2D75] p-2 flex items-center justify-center shadow-lg shadow-[#FF1744]/30 group-hover:scale-105 transition-transform">
                <Tv className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                STREAM<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF1744] to-[#FF2D75]">LY</span>
              </span>
            </NavLink>

            {/* Viewer Navigation */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              <NavLink
                to="/viewer/home"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-white bg-[#151518]' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <Home className="w-3.5 h-3.5 text-[#FF1744]" /> Home
              </NavLink>

              <NavLink
                to="/viewer/for-you"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-white bg-[#151518]' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <Film className="w-3.5 h-3.5 text-[#FF2D75]" /> For You
              </NavLink>

              <NavLink
                to="/viewer/segment-dna"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-white bg-[#151518]' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <Dna className="w-3.5 h-3.5 text-[#FF6B9A]" /> Segment DNA
              </NavLink>

              <NavLink
                to="/viewer/my-list"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-white bg-[#151518]' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <Bookmark className="w-3.5 h-3.5 text-gray-400" /> My List
              </NavLink>

              <NavLink
                to="/viewer/profile"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-white bg-[#151518]' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <UserCircle className="w-3.5 h-3.5 text-gray-400" /> Profile
              </NavLink>
            </nav>
          </div>

          {/* Right Header Section */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAnalyzeModalOpen(true)}
              className="flex items-center gap-2 bg-[#FF1744]/15 hover:bg-[#FF1744]/25 text-[#FF6B9A] border border-[#FF1744]/40 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF1744]" />
              <span>Analyze New Viewer</span>
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-[#252529]">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white">{user?.name || 'Demo Viewer'}</p>
                <p className="text-[10px] text-[#FF6B9A] font-semibold uppercase">VIEWER</p>
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
        </div>
      </header>

      {/* Page Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet context={{ onOpenAnalyzeModal: () => setIsAnalyzeModalOpen(true) }} />
      </main>

      {/* Footer */}
      <footer className="bg-[#0D0D0F] border-t border-[#252529] py-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 STREAMLY OTT Platform. Personalization Engine.</p>
          <div className="flex items-center gap-3 text-gray-400">
            <span>Role: VIEWER</span>
            <span>•</span>
            <span>StandardScaler + KMeans</span>
          </div>
        </div>
      </footer>

      {/* Interactive Analyze New Viewer Modal */}
      <AnalyzeNewViewerModal
        isOpen={isAnalyzeModalOpen}
        onClose={() => setIsAnalyzeModalOpen(false)}
        onAnalysisComplete={(res) => {
          if (onAnalysisComplete) onAnalysisComplete(res);
          navigate('/viewer/for-you');
        }}
      />
    </div>
  );
};

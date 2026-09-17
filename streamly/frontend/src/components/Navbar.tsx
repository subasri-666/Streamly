import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Tv, Sparkles, Shield, BarChart3, User, LogOut, PlayCircle } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAnalyzeModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAnalyzeModal }) => {
  const { user, logout } = useAuth();
  const currentRole = user?.role || 'VIEWER';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050505]/90 backdrop-blur-xl border-b border-[#252529]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF1744] to-[#FF2D75] p-2 flex items-center justify-center shadow-lg shadow-[#FF1744]/30 group-hover:scale-105 transition-transform">
              <Tv className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                STREAM<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF1744] to-[#FF2D75]">LY</span>
              </span>
            </div>
          </div>

          {/* Role Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            {currentRole === 'VIEWER' && (
              <>
                <button
                  onClick={() => setActiveTab('home')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'home' ? 'text-white bg-[#151518]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setActiveTab('for-you')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'for-you' ? 'text-white bg-[#151518]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  For You
                </button>
                <button
                  onClick={() => setActiveTab('segment-dna')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'segment-dna' ? 'text-white bg-[#151518]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Segment DNA
                </button>
              </>
            )}

            {currentRole === 'ADMIN' && (
              <>
                <button
                  onClick={() => setActiveTab('admin-dashboard')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'admin-dashboard' ? 'text-white bg-[#151518]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('admin-users')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'admin-users' ? 'text-white bg-[#151518]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Users
                </button>
                <button
                  onClick={() => setActiveTab('admin-segments')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'admin-segments' ? 'text-white bg-[#151518]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Segments
                </button>
                <button
                  onClick={() => setActiveTab('admin-model')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'admin-model' ? 'text-white bg-[#151518]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Model & Evaluation
                </button>
              </>
            )}

            {currentRole === 'ANALYST' && (
              <>
                <button
                  onClick={() => setActiveTab('analyst-dashboard')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'analyst-dashboard' ? 'text-white bg-[#151518]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('analyst-clusters')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'analyst-clusters' ? 'text-white bg-[#151518]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Cluster Analysis
                </button>
                <button
                  onClick={() => setActiveTab('analyst-rules')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'analyst-rules' ? 'text-white bg-[#151518]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Recommendation Rules
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Right Section: Analyze New Viewer & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Analyze New Viewer Demo CTA */}
          <button
            onClick={onOpenAnalyzeModal}
            className="hidden sm:flex items-center gap-2 bg-[#FF1744]/15 hover:bg-[#FF1744]/25 text-[#FF6B9A] border border-[#FF1744]/40 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF1744]" />
            <span>Analyze New Viewer</span>
          </button>

          {/* Demo Role Selector Pill */}
          <div className="flex items-center bg-[#151518] p-1 rounded-xl border border-[#252529]">
            {(['VIEWER', 'ANALYST', 'ADMIN'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  if (r === 'ADMIN') setActiveTab('admin-dashboard');
                  else if (r === 'ANALYST') setActiveTab('analyst-dashboard');
                  else setActiveTab('home');
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                  currentRole === r
                    ? 'bg-gradient-to-r from-[#FF1744] to-[#FF2D75] text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#252529]">
            <div className="text-right hidden xl:block">
              <p className="text-xs font-bold text-white">{user?.name || 'Guest Viewer'}</p>
              <p className="text-[10px] text-[#FF6B9A] font-semibold">{currentRole}</p>
            </div>
            {user && (
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#151518]"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

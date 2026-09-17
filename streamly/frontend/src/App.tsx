import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ViewerHome } from './pages/ViewerHome';
import { AdminDashboard } from './pages/AdminDashboard';
import { AnalystDashboard } from './pages/AnalystDashboard';
import { AnalyzeNewViewerModal } from './components/AnalyzeNewViewerModal';
import { RecommendResponse } from './types';
import { RefreshCw } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false);
  const [recommendData, setRecommendData] = useState<RecommendResponse | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <RefreshCw className="w-8 h-8 text-[#FF1744] animate-spin" />
      </div>
    );
  }

  const role = user?.role || 'VIEWER';

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] font-['Outfit',sans-serif]">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAnalyzeModal={() => setIsAnalyzeModalOpen(true)}
      />

      {/* Main Content Router */}
      <main className="min-h-[calc(100vh-4rem)]">
        {role === 'ADMIN' || activeTab.startsWith('admin') ? (
          <AdminDashboard />
        ) : role === 'ANALYST' || activeTab.startsWith('analyst') ? (
          <AnalystDashboard />
        ) : (
          <ViewerHome
            onOpenAnalyzeModal={() => setIsAnalyzeModalOpen(true)}
            recommendData={recommendData}
            setRecommendData={setRecommendData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0D0D0F] border-t border-[#252529] py-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 STREAMLY OTT Platform. Containerized Audience Intelligence Service.</p>
          <div className="flex items-center gap-4 text-gray-400">
            <span>StandardScaler + KMeans</span>
            <span>•</span>
            <span>FastAPI + SQLite</span>
            <span>•</span>
            <span>Docker Compose</span>
          </div>
        </div>
      </footer>

      {/* Interactive Analyze New Viewer Modal */}
      <AnalyzeNewViewerModal
        isOpen={isAnalyzeModalOpen}
        onClose={() => setIsAnalyzeModalOpen(false)}
        onAnalysisComplete={(res) => {
          setRecommendData(res);
          setActiveTab('for-you');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

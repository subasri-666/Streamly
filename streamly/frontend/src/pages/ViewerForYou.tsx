import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { RecommendResponse } from '../types';
import { PageTurnDeck } from '../components/PageTurnDeck';
import { FamiliarExploreSlider } from '../components/FamiliarExploreSlider';
import { Sparkles, RefreshCw } from 'lucide-react';

export const ViewerForYou: React.FC = () => {
  const { user } = useAuth();
  const [explorationLevel, setExplorationLevel] = useState<number>(0.5);
  const [recommendData, setRecommendData] = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadRecommendations();
  }, [explorationLevel]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const res = await apiService.getRecommendations({
        user_id: user?.email || 'viewer-demo',
        total_watch_time_mins: 3450.0,
        avg_session_duration_mins: 110.0,
        viewing_frequency_per_week: 9.5,
        top_genres: ['Action', 'Thriller'],
        exploration_level: explorationLevel
      });
      setRecommendData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#FF2D75] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FF1744]" /> Personalized For You
        </span>
        <h1 className="text-3xl font-black text-white mt-1">FOR YOU RECOMMENDATIONS</h1>
        <p className="text-xs text-gray-400 mt-1">
          Recommendations powered by your discovered segment: <strong className="text-[#FF6B9A]">{recommendData?.segment?.segment_name || 'High-Engagement Action Viewers'}</strong>
        </p>
      </div>

      <FamiliarExploreSlider
        value={explorationLevel}
        onChange={(val) => setExplorationLevel(val)}
      />

      <div className="bg-gradient-to-b from-[#0D0D0F] to-[#050505] rounded-3xl p-6 border border-[#252529] shadow-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-[#FF1744] animate-spin" />
          </div>
        ) : (
          <PageTurnDeck movies={recommendData?.recommendations || []} />
        )}
      </div>
    </div>
  );
};

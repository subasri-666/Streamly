import React, { useState } from 'react';
import { RecommendResponse } from '../types';
import { apiService } from '../services/api';
import { Sparkles, X, UserCheck, Play, Activity } from 'lucide-react';

interface AnalyzeNewViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (res: RecommendResponse) => void;
}

export const AnalyzeNewViewerModal: React.FC<AnalyzeNewViewerModalProps> = ({ isOpen, onClose, onAnalysisComplete }) => {
  const [userId, setUserId] = useState(`DEMO-JUDGE-${Math.floor(100 + Math.random() * 900)}`);
  const [watchTime, setWatchTime] = useState<number>(3400);
  const [sessionDur, setSessionDur] = useState<number>(115);
  const [frequency, setFrequency] = useState<number>(9.5);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Action', 'Thriller']);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const genresList = ['Action', 'Comedy', 'Drama', 'Thriller', 'Sci-Fi', 'Romance', 'Horror', 'Animation'];

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter((g) => g !== genre));
      }
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiService.getRecommendations({
        user_id: userId,
        total_watch_time_mins: Number(watchTime),
        avg_session_duration_mins: Number(sessionDur),
        viewing_frequency_per_week: Number(frequency),
        top_genres: selectedGenres,
        exploration_level: 0.5
      });

      onAnalysisComplete(res);
      onClose();
    } catch (err: any) {
      alert(`Inference failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#151518] border border-[#252529] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        <div className="p-5 border-b border-[#252529] flex items-center justify-between bg-[#0D0D0F]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FF1744]/10 rounded-xl text-[#FF1744]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Analyze New Viewer Profile</h3>
              <p className="text-xs text-gray-400">Live ML inference test — zero retraining</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#252529]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAnalyze} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Viewer ID / Profile Label</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full bg-[#0D0D0F] border border-[#252529] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF1744]"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Watch Time (mins)</label>
              <input
                type="number"
                value={watchTime}
                onChange={(e) => setWatchTime(Number(e.target.value))}
                className="w-full bg-[#0D0D0F] border border-[#252529] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF1744]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Avg Session (mins)</label>
              <input
                type="number"
                value={sessionDur}
                onChange={(e) => setSessionDur(Number(e.target.value))}
                className="w-full bg-[#0D0D0F] border border-[#252529] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF1744]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Visits / Week</label>
              <input
                type="number"
                step="0.5"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full bg-[#0D0D0F] border border-[#252529] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF1744]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">Preferred Genres</label>
            <div className="flex flex-wrap gap-2">
              {genresList.map((g) => {
                const isSelected = selectedGenres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#FF1744] text-white shadow-md shadow-[#FF1744]/20'
                        : 'bg-[#0D0D0F] text-gray-400 border border-[#252529] hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#252529] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#252529] text-xs font-semibold text-gray-300 hover:bg-[#252529]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#FF1744] to-[#FF2D75] text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-[#FF1744]/25 hover:opacity-95 disabled:opacity-50"
            >
              {loading ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
              ANALYZE VIEWER
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

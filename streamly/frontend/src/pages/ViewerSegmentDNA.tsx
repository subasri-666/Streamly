import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { RecommendResponse, SegmentInfo } from '../types';
import { SegmentDNA } from '../components/SegmentDNA';
import { Dna, RefreshCw, Activity } from 'lucide-react';

export const ViewerSegmentDNA: React.FC = () => {
  const { user } = useAuth();
  const [recommendData, setRecommendData] = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSegmentData();
  }, []);

  const loadSegmentData = async () => {
    setLoading(true);
    try {
      const res = await apiService.getRecommendations({
        user_id: user?.email || 'viewer-demo',
        total_watch_time_mins: 3450.0,
        avg_session_duration_mins: 110.0,
        viewing_frequency_per_week: 9.5,
        top_genres: ['Action', 'Thriller'],
        exploration_level: 0.5
      });
      setRecommendData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const defaultSegment: SegmentInfo = {
    segment_id: 0,
    segment_name: 'High-Engagement Action Viewers',
    description: 'Power users with extensive watch time and long sessions.',
    top_genres: ['Action', 'Thriller'],
    dna_metrics: {
      engagement: 91,
      session_pattern: 84,
      genre_affinity: 89,
      exploration: 42
    }
  };

  const segment = recommendData?.segment || defaultSegment;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#FF2D75] flex items-center gap-1.5">
          <Dna className="w-3.5 h-3.5 text-[#FF1744]" /> Signature AI Feature
        </span>
        <h1 className="text-3xl font-black text-white mt-1">SEGMENT DNA ANALYSIS</h1>
        <p className="text-xs text-gray-400 mt-1">
          Detailed breakdown of your cluster assignment derived from cluster centroid statistics
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-[#FF1744] animate-spin" />
        </div>
      ) : (
        <SegmentDNA segment={segment} />
      )}
    </div>
  );
};

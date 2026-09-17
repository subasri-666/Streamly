import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { MetricsData } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { BarChart3, PieChart, Layers, Sliders, CheckCircle2, RefreshCw, Compass } from 'lucide-react';

export const AnalystDashboard: React.FC = () => {
  const { token } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [ovData, evalData] = await Promise.all([
        apiService.getAnalystOverview(token),
        apiService.getEvaluationMetrics()
      ]);
      setOverview(ovData);
      setMetrics(evalData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const segmentList = overview?.segment_metadata ? Object.values(overview.segment_metadata) : [];
  const kEvaluations = overview?.model_metadata?.k_evaluations || [
    { k: 2, silhouette_score: 0.4449, inertia: 8816 },
    { k: 3, silhouette_score: 0.5182, inertia: 5299 },
    { k: 4, silhouette_score: 0.5428, inertia: 2968 },
    { k: 5, silhouette_score: 0.4610, inertia: 2820 },
    { k: 6, silhouette_score: 0.3583, inertia: 2684 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-[#FF1744] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#FF2D75]">
          Audience Intelligence & ML Insights
        </span>
        <h1 className="text-3xl font-black text-white mt-1">ANALYST DASHBOARD</h1>
      </div>

      {/* Discovered Audience Segments Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#FF1744]" /> Discovered Audience Clusters (K={segmentList.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {segmentList.map((seg: any, idx: number) => (
            <div key={idx} className="bg-[#151518] rounded-2xl border border-[#252529] p-6 space-y-4 hover:border-gray-700 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#FF2D75]">Cluster #{seg.segment_id}</span>
                  <h4 className="text-lg font-bold text-white">{seg.name}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-white">{seg.percentage}%</span>
                  <p className="text-[10px] text-gray-400">{seg.size} Viewers</p>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed bg-[#0D0D0F] p-3 rounded-xl border border-[#252529]">
                {seg.description}
              </p>

              {/* Centroid Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-[#0D0D0F] rounded-lg border border-[#252529]">
                  <p className="text-[10px] text-gray-400">Avg Watch</p>
                  <p className="font-bold text-white">{seg.centroid_summary?.avg_watch_time_mins}m</p>
                </div>
                <div className="p-2.5 bg-[#0D0D0F] rounded-lg border border-[#252529]">
                  <p className="text-[10px] text-gray-400">Avg Session</p>
                  <p className="font-bold text-white">{seg.centroid_summary?.avg_session_duration_mins}m</p>
                </div>
                <div className="p-2.5 bg-[#0D0D0F] rounded-lg border border-[#252529]">
                  <p className="text-[10px] text-gray-400">Top Genres</p>
                  <p className="font-bold text-[#FF6B9A]">{seg.top_genres?.join(', ')}</p>
                </div>
              </div>

              {/* Content Strategy */}
              <div className="text-xs text-gray-300 pt-2 border-t border-[#252529] flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#FF1744] shrink-0" />
                <span><strong className="text-white">Rule Strategy:</strong> {seg.recommendation_behavior}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cluster Analysis & Elbow Plot */}
      <div className="bg-[#151518] rounded-2xl border border-[#252529] p-6 space-y-6">
        <div>
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#FF2D75]" /> Cluster Selection Methodology (Elbow & Silhouette Score)
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Empirical evidence evaluating K values from 2 to 6 to determine defensible number of clusters
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kEvaluations}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252529" />
              <XAxis dataKey="k" stroke="#929292" label={{ value: 'Number of Clusters (K)', position: 'insideBottom', offset: -5, fill: '#929292' }} />
              <YAxis stroke="#929292" domain={[0, 0.7]} />
              <Tooltip contentStyle={{ backgroundColor: '#151518', borderColor: '#252529', color: '#fff' }} />
              <Bar dataKey="silhouette_score" fill="#FF1744" radius={[6, 6, 0, 0]} name="Silhouette Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 bg-[#0D0D0F] rounded-xl border border-[#252529] text-xs text-gray-300 space-y-1">
          <p className="font-bold text-white">Selection Decision Rationale:</p>
          <p>• K=4 achieves peak Silhouette Score of <strong className="text-[#FF6B9A]">0.5428</strong> with well-balanced cluster sizes.</p>
          <p>• Lower K (2 or 3) under-segments distinct viewer behaviors; higher K (5 or 6) creates redundant fragmented clusters.</p>
        </div>
      </div>

      {/* Transparent Recommendation Mapping Matrix */}
      <div className="bg-[#151518] rounded-2xl border border-[#252529] p-6 space-y-4">
        <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#FF6B9A]" /> Transparent Recommendation Rule Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0D0D0F] uppercase text-[10px] font-bold text-gray-400">
              <tr>
                <th className="p-3.5 rounded-l-xl">Segment</th>
                <th className="p-3.5">Familiar Mode (0.0 - 0.3)</th>
                <th className="p-3.5">Balanced Mode (0.4 - 0.6)</th>
                <th className="p-3.5 rounded-r-xl">Explore Mode (0.7 - 1.0)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252529]">
              <tr className="hover:bg-[#1E1E22]">
                <td className="p-3.5 font-bold text-white">High-Engagement Action Viewers</td>
                <td className="p-3.5 text-gray-300">Action, Thriller, Sci-Fi Blockbusters</td>
                <td className="p-3.5 text-gray-300">Action + Crime / Adventure Hits</td>
                <td className="p-3.5 text-gray-300">High-Octane Sci-Fi & Psychological Thrillers</td>
              </tr>
              <tr className="hover:bg-[#1E1E22]">
                <td className="p-3.5 font-bold text-white">Casual Short-Session Viewers</td>
                <td className="p-3.5 text-gray-300">Comedy Specials, Short Animations</td>
                <td className="p-3.5 text-gray-300">Trending Short Films & Stand-up</td>
                <td className="p-3.5 text-gray-300">Bite-sized Rom-Coms & Indie Shorts</td>
              </tr>
              <tr className="hover:bg-[#1E1E22]">
                <td className="p-3.5 font-bold text-white">Genre Explorers</td>
                <td className="p-3.5 text-gray-300">Drama & Sci-Fi Favorites</td>
                <td className="p-3.5 text-gray-300">Drama, Sci-Fi, Comedy & Action Mix</td>
                <td className="p-3.5 text-gray-300">Curated International & Experimental Cinema</td>
              </tr>
              <tr className="hover:bg-[#1E1E22]">
                <td className="p-3.5 font-bold text-white">Low-Activity Viewers</td>
                <td className="p-3.5 text-gray-300">Popular Drama & Romance Hits</td>
                <td className="p-3.5 text-gray-300">Top 10 Platform Trending Content</td>
                <td className="p-3.5 text-gray-300">High-Rating Accessible Comedy & Action</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

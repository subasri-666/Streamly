import React from 'react';
import { SegmentInfo } from '../types';
import { Dna, Activity, Clock, Heart, Compass, CheckCircle2 } from 'lucide-react';

interface SegmentDNAProps {
  segment: SegmentInfo;
}

export const SegmentDNA: React.FC<SegmentDNAProps> = ({ segment }) => {
  const metrics = segment.dna_metrics || {
    engagement: 85,
    session_pattern: 78,
    genre_affinity: 88,
    exploration: 45
  };

  const getExplanations = (name: string) => {
    if (name.includes("High-Engagement")) {
      return [
        "Extensive total watch time above platform 85th percentile",
        "Sustained session durations averaging 90+ minutes",
        "Frequent visits throughout the week (8+ sessions/wk)",
        "Focused affinity for high-octane Action and Thriller titles"
      ];
    } else if (name.includes("Short-Session")) {
      return [
        "Compact viewing sessions averaging 20-30 minutes",
        "High visit frequency with quick completion patterns",
        "Strong preference for fast-paced Comedy & Animation",
        "High weekend activity concentration"
      ];
    } else if (name.includes("Low-Activity")) {
      return [
        "Occasional login cadence with selective viewing hours",
        "Moderate session lengths with low overall monthly watch time",
        "Preference for accessible Drama and Romance hits",
        "Low-friction content discovery preference"
      ];
    } else {
      return [
        "Balanced viewing across 4+ distinct genre categories",
        "Moderate session lengths averaging 60 minutes",
        "Consistent completion rates across series and movies",
        "Active interest in adjacent content discovery"
      ];
    }
  };

  const explanations = getExplanations(segment.segment_name);

  return (
    <div className="bg-[#151518] rounded-2xl p-6 border border-[#252529] shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#252529]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#FF1744] to-[#FF2D75] rounded-xl text-white shadow-lg shadow-[#FF1744]/20">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF2D75]">
              Signature AI Feature
            </span>
            <h3 className="text-xl font-extrabold text-white">YOUR VIEWER DNA</h3>
          </div>
        </div>

        <div className="px-3 py-1 bg-[#FF1744]/10 border border-[#FF1744]/30 rounded-full text-xs font-bold text-[#FF6B9A]">
          {segment.segment_name}
        </div>
      </div>

      {/* DNA Metric Meters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3.5 bg-[#0D0D0F] rounded-xl border border-[#252529]">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5 font-medium">
            <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-[#FF1744]" /> Engagement</span>
            <span className="text-white font-bold">{metrics.engagement}%</span>
          </div>
          <div className="w-full h-2 bg-[#252529] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#FF1744] to-[#FF2D75] rounded-full" style={{ width: `${metrics.engagement}%` }} />
          </div>
        </div>

        <div className="p-3.5 bg-[#0D0D0F] rounded-xl border border-[#252529]">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5 font-medium">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#FF2D75]" /> Session Pattern</span>
            <span className="text-white font-bold">{metrics.session_pattern}%</span>
          </div>
          <div className="w-full h-2 bg-[#252529] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#FF2D75] to-[#FF6B9A] rounded-full" style={{ width: `${metrics.session_pattern}%` }} />
          </div>
        </div>

        <div className="p-3.5 bg-[#0D0D0F] rounded-xl border border-[#252529]">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5 font-medium">
            <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-[#FF6B9A]" /> Genre Affinity</span>
            <span className="text-white font-bold">{metrics.genre_affinity}%</span>
          </div>
          <div className="w-full h-2 bg-[#252529] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#FF1744] to-[#FF2D75] rounded-full" style={{ width: `${metrics.genre_affinity}%` }} />
          </div>
        </div>

        <div className="p-3.5 bg-[#0D0D0F] rounded-xl border border-[#252529]">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5 font-medium">
            <span className="flex items-center gap-1.5"><Compass className="w-3.5 h-3.5 text-[#FF1744]" /> Exploration</span>
            <span className="text-white font-bold">{metrics.exploration}%</span>
          </div>
          <div className="w-full h-2 bg-[#252529] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#FF6B9A] to-[#FF1744] rounded-full" style={{ width: `${metrics.exploration}%` }} />
          </div>
        </div>
      </div>

      {/* WHY STREAMLY PLACED YOU HERE */}
      <div className="bg-[#0D0D0F] rounded-xl p-4 border border-[#252529]">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#FF6B9A] mb-3">
          WHY STREAMLY PLACED YOU HERE
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {explanations.map((exp, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-[#FF1744] shrink-0 mt-0.5" />
              <span>{exp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

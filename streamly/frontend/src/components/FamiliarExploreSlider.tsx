import React from 'react';
import { Sliders, Sparkles, ShieldCheck, Compass } from 'lucide-react';

interface FamiliarExploreSliderProps {
  value: number; // 0.0 to 1.0
  onChange: (value: number) => void;
}

export const FamiliarExploreSlider: React.FC<FamiliarExploreSliderProps> = ({ value, onChange }) => {
  const getModeLabel = (val: number) => {
    if (val <= 0.3) return { title: 'Familiar Focus', desc: 'Mostly preferred genres (Action, Thriller)' };
    if (val >= 0.7) return { title: 'Deep Exploration', desc: 'Curated mix with adjacent new genres' };
    return { title: 'Balanced Mix', desc: 'Equal balance of favorites and new picks' };
  };

  const mode = getModeLabel(value);

  return (
    <div className="bg-[#151518] rounded-2xl p-5 border border-[#252529]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#FF1744]/10 rounded-lg text-[#FF1744]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Recommendation Preference</h4>
            <p className="text-xs text-gray-400">Control recommendation adventure level</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-[#FF6B9A] bg-[#FF1744]/10 px-2.5 py-1 rounded-md border border-[#FF1744]/20">
            {mode.title}
          </span>
        </div>
      </div>

      {/* Slider Element */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-gray-400">
          <span className="flex items-center gap-1.5 text-gray-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF2D75]" /> Familiar
          </span>
          <span className="flex items-center gap-1.5 text-gray-300">
            <Compass className="w-3.5 h-3.5 text-[#FF1744]" /> Explore
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-[#0D0D0F] rounded-lg appearance-none cursor-pointer accent-[#FF1744] border border-[#252529]"
        />

        <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-[#FF1744]" />
          <span>{mode.desc}</span>
        </p>
      </div>
    </div>
  );
};

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Shield, Dna, Activity, Clock } from 'lucide-react';

export const ViewerProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#FF2D75]">
          Account Settings & Telemetry
        </span>
        <h1 className="text-3xl font-black text-white mt-1">VIEWER PROFILE</h1>
      </div>

      <div className="bg-[#151518] rounded-2xl border border-[#252529] p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-[#252529] pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF1744] to-[#FF2D75] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-[#FF1744]/30">
            {user?.name?.[0] || 'V'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{user?.name || 'Demo Viewer'}</h3>
            <p className="text-xs text-gray-400">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#FF1744]/20 text-[#FF6B9A] border border-[#FF1744]/30">
              ROLE: {user?.role || 'VIEWER'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-[#0D0D0F] rounded-xl border border-[#252529]">
            <p className="text-gray-400 font-medium">Assigned Segment</p>
            <p className="text-base font-bold text-[#FF6B9A] mt-1">High-Engagement Action Viewers</p>
          </div>
          <div className="p-4 bg-[#0D0D0F] rounded-xl border border-[#252529]">
            <p className="text-gray-400 font-medium">Telemetry Watch Time</p>
            <p className="text-base font-bold text-white mt-1">3,450 mins</p>
          </div>
          <div className="p-4 bg-[#0D0D0F] rounded-xl border border-[#252529]">
            <p className="text-gray-400 font-medium">Session Duration</p>
            <p className="text-base font-bold text-white mt-1">110 mins/session</p>
          </div>
        </div>
      </div>
    </div>
  );
};

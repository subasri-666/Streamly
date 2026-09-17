import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Movie } from '../types';
import { Bookmark, Star, Play, Film } from 'lucide-react';

export const ViewerMyList: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getMovies().then((res) => {
      setMovies(res.slice(0, 4));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#FF2D75] flex items-center gap-1.5">
          <Bookmark className="w-3.5 h-3.5 text-[#FF1744]" /> Saved Content
        </span>
        <h1 className="text-3xl font-black text-white mt-1">MY WATCHLIST</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {movies.map((m) => (
          <div key={m.id} className="bg-[#151518] rounded-xl overflow-hidden border border-[#252529] group hover:border-[#FF1744]/50 transition-all">
            <div className="relative h-60 overflow-hidden">
              <img src={m.poster_url} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-2 right-2 bg-[#050505]/80 px-2 py-0.5 rounded text-[10px] font-bold text-amber-400 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400" /> {m.rating}
              </div>
            </div>
            <div className="p-3">
              <span className="text-[10px] font-bold text-[#FF2D75] uppercase">{m.genre}</span>
              <h4 className="text-xs font-bold text-white truncate mt-0.5">{m.title}</h4>
              <p className="text-[10px] text-gray-400">{m.year} • {m.duration_mins} mins</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

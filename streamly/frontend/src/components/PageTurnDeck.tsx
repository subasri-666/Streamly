import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie } from '../types';
import { Play, Plus, ChevronLeft, ChevronRight, Star, Clock, Sparkles, Check } from 'lucide-react';

interface PageTurnDeckProps {
  movies: Movie[];
  onSelectMovie?: (movie: Movie) => void;
}

export const PageTurnDeck: React.FC<PageTurnDeckProps> = ({ movies, onSelectMovie }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addedToList, setAddedToList] = useState<Record<number, boolean>>({});

  if (!movies || movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#151518] rounded-2xl border border-[#252529]">
        <Sparkles className="w-10 h-10 text-[#FF1744] animate-pulse mb-3" />
        <p className="text-gray-400 font-medium">Generating recommendations...</p>
      </div>
    );
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  const activeMovie = movies[currentIndex];

  const toggleMyList = (id: number) => {
    setAddedToList((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto py-8 px-4">
      {/* Deck Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF2D75] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Interactive Page-Turn Deck
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">Recommended For You</h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium mr-2">
            Movie {currentIndex + 1} of {movies.length}
          </span>
          <button
            onClick={handlePrev}
            className="p-3 bg-[#151518] hover:bg-[#1E1E22] text-white rounded-full border border-[#252529] transition-all hover:scale-105 active:scale-95"
            aria-label="Previous movie"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="p-3 bg-[#FF1744] hover:bg-[#FF2D75] text-white rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#FF1744]/20"
            aria-label="Next movie"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3D Stacked Container */}
      <div className="relative h-[480px] w-full perspective-1000 flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {movies.map((movie, idx) => {
            const position = (idx - currentIndex + movies.length) % movies.length;
            const isFront = position === 0;

            // Display top 3 cards in stack
            if (position > 3 && position < movies.length - 1) return null;

            return (
              <motion.div
                key={movie.id}
                layout
                initial={{ scale: 0.8, y: 40, opacity: 0 }}
                animate={{
                  scale: isFront ? 1 : 1 - position * 0.06,
                  y: isFront ? 0 : position * 18,
                  z: isFront ? 0 : -position * 50,
                  opacity: isFront ? 1 : Math.max(0.2, 1 - position * 0.25),
                  rotateY: isFront ? 0 : -position * 4,
                  rotateZ: isFront ? 0 : position * 1.5,
                }}
                exit={{
                  x: -350,
                  rotateY: -45,
                  opacity: 0,
                  scale: 0.8,
                  transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] }
                }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 24,
                }}
                style={{
                  zIndex: movies.length - position,
                  transformStyle: 'preserve-3d',
                }}
                className={`absolute inset-0 w-full h-full rounded-2xl overflow-hidden glass-card border border-[#252529] shadow-2xl flex flex-col md:flex-row ${
                  isFront ? 'cursor-default ring-1 ring-[#FF1744]/40' : 'cursor-pointer hover:border-gray-600'
                }`}
                onClick={() => {
                  if (!isFront) setCurrentIndex(idx);
                }}
              >
                {/* Movie Backdrop Artwork */}
                <div className="relative md:w-3/5 h-64 md:h-full overflow-hidden">
                  <img
                    src={movie.backdrop_url || movie.poster_url}
                    alt={movie.title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#151518]/70 to-[#151518]" />
                  <div className="absolute top-4 left-4 bg-[#050505]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{movie.rating}</span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="md:w-2/5 p-6 flex flex-col justify-between bg-[#151518]/90 backdrop-blur-xl">
                  <div>
                    {/* Transparent Recommendation Reason */}
                    {movie.recommendation_reason && (
                      <div className="mb-3 px-3 py-1.5 bg-[#FF1744]/10 border border-[#FF1744]/30 rounded-lg text-xs font-medium text-[#FF6B9A] flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#FF1744] shrink-0 mt-0.5" />
                        <span>{movie.recommendation_reason}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-400">
                      <span className="text-[#FF2D75] font-bold">{movie.genre}</span>
                      <span>•</span>
                      <span>{movie.year}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {movie.duration_mins}m
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-white leading-tight mb-2 tracking-tight">
                      {movie.title}
                    </h3>

                    <p className="text-xs text-gray-300 leading-relaxed line-clamp-3 mb-4">
                      {movie.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {movie.genres.map((g) => (
                        <span key={g} className="px-2 py-0.5 text-[10px] font-medium bg-[#252529] text-gray-300 rounded">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t border-[#252529]">
                    <button
                      onClick={() => onSelectMovie?.(movie)}
                      className="flex-1 bg-gradient-to-r from-[#FF1744] to-[#FF2D75] hover:opacity-95 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF1744]/25 active:scale-95 text-xs"
                    >
                      <Play className="w-4 h-4 fill-white" /> Watch Now
                    </button>

                    <button
                      onClick={() => toggleMyList(movie.id)}
                      className={`p-2.5 rounded-xl border transition-all text-xs flex items-center justify-center ${
                        addedToList[movie.id]
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                          : 'bg-[#252529] border-transparent text-gray-300 hover:text-white hover:bg-[#1E1E22]'
                      }`}
                    >
                      {addedToList[movie.id] ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

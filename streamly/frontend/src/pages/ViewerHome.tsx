import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Movie, RecommendResponse, SegmentInfo } from '../types';
import { PageTurnDeck } from '../components/PageTurnDeck';
import { SegmentDNA } from '../components/SegmentDNA';
import { FamiliarExploreSlider } from '../components/FamiliarExploreSlider';
import { Play, Plus, Star, Sparkles, TrendingUp, History, Film, RefreshCw, Check } from 'lucide-react';

interface ViewerHomeProps {
  onOpenAnalyzeModal?: () => void;
  recommendData: RecommendResponse | null;
  setRecommendData: React.Dispatch<React.SetStateAction<RecommendResponse | null>>;
}

export const ViewerHome: React.FC<ViewerHomeProps> = ({ onOpenAnalyzeModal: propOnOpenModal, recommendData, setRecommendData }) => {
  const { user } = useAuth();
  const outletCtx = useOutletContext<{ onOpenAnalyzeModal?: () => void }>();
  const handleOpenAnalyzeModal = propOnOpenModal || outletCtx?.onOpenAnalyzeModal || (() => {});
  const [movies, setMovies] = useState<Movie[]>([]);
  const [explorationLevel, setExplorationLevel] = useState<number>(0.5);
  const [loading, setLoading] = useState<boolean>(true);
  const [addedHeroList, setAddedHeroList] = useState(false);

  useEffect(() => {
    loadData();
  }, [explorationLevel]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [movieCatalog, recs] = await Promise.all([
        apiService.getMovies(),
        apiService.getRecommendations({
          user_id: user?.email || 'viewer-demo',
          total_watch_time_mins: 3450.0,
          avg_session_duration_mins: 110.0,
          viewing_frequency_per_week: 9.5,
          top_genres: ['Action', 'Thriller'],
          exploration_level: explorationLevel
        })
      ]);
      setMovies(movieCatalog);
      setRecommendData(recs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const heroMovie = movies.find((m) => m.is_trending) || movies[0];

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

  const currentSegment = recommendData?.segment || defaultSegment;

  return (
    <div className="space-y-12 pb-16">
      {/* Cinematic Hero Section */}
      {heroMovie && (
        <div className="relative w-full h-[520px] md:h-[600px] overflow-hidden rounded-b-3xl">
          <img
            src={heroMovie.backdrop_url}
            alt={heroMovie.title}
            className="w-full h-full object-cover object-center scale-105 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />

          {/* Hero Content overlay */}
          <div className="absolute bottom-12 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#FF1744] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider">
                SPOTLIGHT MOVIE
              </span>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {heroMovie.rating} IMDb
              </span>
              <span className="text-xs text-gray-400">• {heroMovie.year} • {heroMovie.genre}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg">
              {heroMovie.title}
            </h1>

            <p className="max-w-2xl text-sm md:text-base text-gray-300 line-clamp-2 drop-shadow-md leading-relaxed">
              {heroMovie.description}
            </p>

            <div className="flex items-center gap-4 pt-2">
              <button className="bg-gradient-to-r from-[#FF1744] to-[#FF2D75] hover:opacity-95 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-xl shadow-[#FF1744]/30 active:scale-95 text-sm">
                <Play className="w-5 h-5 fill-white" /> Watch Now
              </button>

              <button
                onClick={() => setAddedHeroList(!addedHeroList)}
                className={`py-3 px-5 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 ${
                  addedHeroList
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : 'bg-[#151518]/80 border-[#252529] text-white hover:bg-[#1E1E22]'
                }`}
              >
                {addedHeroList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {addedHeroList ? 'In My List' : 'Add to My List'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Controls & Deck Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Controls: Familiar-Explore Slider & Analyze Demo trigger */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2">
            <FamiliarExploreSlider
              value={explorationLevel}
              onChange={(val) => setExplorationLevel(val)}
            />
          </div>

          <div className="bg-[#151518] rounded-2xl p-5 border border-[#252529] flex flex-col justify-between h-full space-y-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#FF2D75] tracking-widest">
                Hackathon Demo Mode
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">Test Custom Viewer Inference</h4>
            </div>
            <button
              onClick={handleOpenAnalyzeModal}
              className="w-full bg-[#FF1744]/15 hover:bg-[#FF1744]/25 text-[#FF6B9A] border border-[#FF1744]/40 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#FF1744]" /> Analyze New Viewer Profile
            </button>
          </div>
        </div>

        {/* Signature 3D Stacked Page-Turn Recommendation Deck */}
        <div className="bg-gradient-to-b from-[#0D0D0F] to-[#050505] rounded-3xl p-6 border border-[#252529] shadow-2xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 text-[#FF1744] animate-spin" />
            </div>
          ) : (
            <PageTurnDeck movies={recommendData?.recommendations || []} />
          )}
        </div>

        {/* Signature Segment DNA Section */}
        <SegmentDNA segment={currentSegment} />

        {/* Signature Feature 2 — Behavior Shift Component */}
        <div className="bg-[#151518] rounded-2xl p-6 border border-[#252529] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#FF2D75]/10 rounded-xl text-[#FF2D75]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#FF2D75] tracking-widest">
                  BEHAVIOR SHIFT TRENDS
                </span>
                <h3 className="text-lg font-bold text-white">Viewer Activity Evolution</h3>
              </div>
            </div>

            <span className="text-[10px] bg-[#0D0D0F] text-amber-400 font-semibold px-2.5 py-1 rounded-md border border-[#252529]">
              Dataset Capability Notice: Historical Trends
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#0D0D0F] rounded-xl border border-[#252529]">
              <p className="text-xs text-gray-400 font-medium">Watch Time Shift</p>
              <p className="text-2xl font-black text-emerald-400">+145%</p>
              <p className="text-[10px] text-gray-400">Comparing last 30 days vs baseline</p>
            </div>

            <div className="p-4 bg-[#0D0D0F] rounded-xl border border-[#252529]">
              <p className="text-xs text-gray-400 font-medium">Session Duration Trend</p>
              <p className="text-2xl font-black text-emerald-400">+62%</p>
              <p className="text-[10px] text-gray-400">Shifted towards deeper viewing</p>
            </div>

            <div className="p-4 bg-[#0D0D0F] rounded-xl border border-[#252529]">
              <p className="text-xs text-gray-400 font-medium">Genre Diversity Index</p>
              <p className="text-2xl font-black text-white">0.78</p>
              <p className="text-[10px] text-gray-400">Expanded from 2 to 4 active genres</p>
            </div>
          </div>
        </div>

        {/* Content Catalog Rows */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-[#FF1744]" /> Trending On Streamly
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {movies.map((m) => (
              <div
                key={m.id}
                className="bg-[#151518] rounded-xl overflow-hidden border border-[#252529] group hover:border-[#FF1744]/50 transition-all hover:scale-[1.03]"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={m.poster_url}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
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
      </div>
    </div>
  );
};

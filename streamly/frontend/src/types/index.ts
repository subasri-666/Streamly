export type UserRole = 'ADMIN' | 'ANALYST' | 'VIEWER';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  is_active?: boolean;
  created_at?: string;
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  genre: string;
  genres: string[];
  year: number;
  rating: number;
  duration_mins: number;
  poster_url: string;
  backdrop_url: string;
  is_trending?: boolean;
  is_popular?: boolean;
  recommendation_reason?: string;
}

export interface DNAMetrics {
  engagement: number;
  session_pattern: number;
  genre_affinity: number;
  exploration: number;
}

export interface SegmentInfo {
  segment_id: number;
  segment_name: string;
  description: string;
  recommendation_behavior?: string;
  top_genres: string[];
  dna_metrics: DNAMetrics;
}

export interface RecommendResponse {
  status: string;
  user_id: string;
  segment: SegmentInfo;
  exploration_level: number;
  total_recommendations: number;
  recommendations: Movie[];
}

export interface MetricsData {
  timestamp: string;
  evaluator_status: string;
  overall_result: string;
  test_summary: {
    total_tests: number;
    passed: number;
    failed: number;
    pass_rate_percentage: number;
  };
  clustering_quality: {
    algorithm: string;
    scaler: string;
    n_clusters: number;
    silhouette_score: number;
    inertia: number;
    cluster_balance_ratio: number;
    cluster_distribution: Record<string, number>;
  };
  api_performance: {
    health_status: string;
    average_latency_ms: number;
    reproducible: boolean;
  };
  test_suite_details: Array<{
    test_name: string;
    passed: boolean;
    status_code?: number;
    latency_ms?: number;
    details?: any;
  }>;
}

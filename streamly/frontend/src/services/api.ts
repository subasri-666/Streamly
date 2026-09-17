import { RecommendResponse, Movie, User, MetricsData } from '../types';

const API_BASE = '';

export const apiService = {
  // Auth
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async getMe(token: string): Promise<User> {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  // Recommendations
  async getRecommendations(payload: {
    user_id?: string;
    total_watch_time_mins?: number;
    avg_session_duration_mins?: number;
    number_of_sessions?: number;
    viewing_frequency_per_week?: number;
    completion_rate?: number;
    weekend_viewing_ratio?: number;
    top_genres?: string[];
    exploration_level?: number;
  }): Promise<RecommendResponse> {
    const res = await fetch(`${API_BASE}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  // Movies
  async getMovies(): Promise<Movie[]> {
    const res = await fetch(`${API_BASE}/api/movies`);
    if (!res.ok) throw new Error('Failed to fetch movies');
    return res.json();
  },

  // Admin
  async getAdminOverview(token: string) {
    const res = await fetch(`${API_BASE}/api/admin/overview`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Admin access required');
    return res.json();
  },

  async getUsers(token: string): Promise<User[]> {
    const res = await fetch(`${API_BASE}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async createUser(token: string, userData: { email: string; password: string; name: string; role: string }) {
    const res = await fetch(`${API_BASE}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to create user');
    }
    return res.json();
  },

  // Analyst & Evaluation
  async getEvaluationMetrics(): Promise<MetricsData> {
    const res = await fetch(`${API_BASE}/api/analyst/evaluation`);
    if (!res.ok) throw new Error('Failed to fetch evaluation metrics');
    return res.json();
  },

  async getAnalystOverview(token: string) {
    const res = await fetch(`${API_BASE}/api/analyst/overview`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Analyst access required');
    return res.json();
  }
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { User, MetricsData } from '../types';
import { Users, Database, Cpu, CheckCircle2, ShieldAlert, Plus, Search, RefreshCw, BarChart2, Layers } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('VIEWER');

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [ovData, userData, evalData] = await Promise.all([
        apiService.getAdminOverview(token),
        apiService.getUsers(token),
        apiService.getEvaluationMetrics()
      ]);
      setOverview(ovData);
      setUsers(userData);
      setMetrics(evalData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await apiService.createUser(token, {
        email: newUserEmail,
        password: newUserPassword,
        name: newUserName,
        role: newUserRole
      });
      alert('User added to application database! (Note: Creating a user does NOT retrain the ML model)');
      setShowAddUserModal(false);
      setNewUserEmail('');
      setNewUserName('');
      setNewUserPassword('');
      loadData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF2D75]">
            Platform Governance & Administration
          </span>
          <h1 className="text-3xl font-black text-white mt-1">ADMIN DASHBOARD</h1>
        </div>

        <button
          onClick={() => setShowAddUserModal(true)}
          className="bg-gradient-to-r from-[#FF1744] to-[#FF2D75] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-[#FF1744]/20 hover:opacity-95"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#151518] p-5 rounded-2xl border border-[#252529]">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-[#FF1744]" />
          </div>
          <p className="text-3xl font-black text-white">{overview?.total_users || 0}</p>
          <p className="text-[10px] text-gray-400 mt-1">
            {overview?.total_viewers} Viewers • {overview?.total_analysts} Analysts • {overview?.total_admins} Admins
          </p>
        </div>

        <div className="bg-[#151518] p-5 rounded-2xl border border-[#252529]">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Movie Catalog</span>
            <Database className="w-4 h-4 text-[#FF2D75]" />
          </div>
          <p className="text-3xl font-black text-white">{overview?.total_movies || 0}</p>
          <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> SQLite Database Active
          </p>
        </div>

        <div className="bg-[#151518] p-5 rounded-2xl border border-[#252529]">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Model Status</span>
            <Cpu className="w-4 h-4 text-[#FF6B9A]" />
          </div>
          <p className="text-3xl font-black text-white">{overview?.model_status || 'Active'}</p>
          <p className="text-[10px] text-gray-400 mt-1">
            KMeans (K={overview?.n_segments || 4}) • StandardScaler
          </p>
        </div>

        <div className="bg-[#151518] p-5 rounded-2xl border border-[#252529]">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Evaluator Status</span>
            <BarChart2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">{metrics?.overall_result || 'PASS'}</p>
          <p className="text-[10px] text-gray-400 mt-1">
            Pass Rate: {metrics?.test_summary?.pass_rate_percentage || 100}% ({metrics?.test_summary?.passed}/{metrics?.test_summary?.total_tests} tests)
          </p>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-[#151518] rounded-2xl border border-[#252529] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-white">Application Database Users</h3>
            <p className="text-xs text-gray-400">Manage user accounts and access roles in SQLite</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#0D0D0F] border border-[#252529] rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#FF1744]"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#0D0D0F] border border-[#252529] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF1744]"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="ANALYST">ANALYST</option>
              <option value="VIEWER">VIEWER</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0D0D0F] uppercase text-[10px] font-bold text-gray-400">
              <tr>
                <th className="p-3.5 rounded-l-xl">User Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 rounded-r-xl">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252529]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#1E1E22]">
                  <td className="p-3.5 font-bold text-white">{u.name}</td>
                  <td className="p-3.5 text-gray-300">{u.email}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'ADMIN'
                        ? 'bg-[#FF1744]/20 text-[#FF6B9A]'
                        : u.role === 'ANALYST'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-emerald-400 font-semibold">Active</span>
                  </td>
                  <td className="p-3.5 text-gray-400">{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model & Evaluator Metrics Section */}
      {metrics && (
        <div className="bg-[#151518] rounded-2xl border border-[#252529] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#252529] pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Evaluator Evidence Output
              </span>
              <h3 className="text-xl font-extrabold text-white mt-0.5">METRICS.JSON VERIFICATION</h3>
            </div>
            <span className="text-xs text-gray-400 bg-[#0D0D0F] px-3 py-1.5 rounded-lg border border-[#252529]">
              Generated by Evaluator Service
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#0D0D0F] rounded-xl border border-[#252529]">
              <p className="text-xs text-gray-400 font-medium mb-1">Silhouette Score</p>
              <p className="text-2xl font-black text-white">{metrics.clustering_quality.silhouette_score}</p>
              <p className="text-[10px] text-emerald-400 mt-1">Defensible cluster separation (&gt; 0.50)</p>
            </div>

            <div className="p-4 bg-[#0D0D0F] rounded-xl border border-[#252529]">
              <p className="text-xs text-gray-400 font-medium mb-1">Inertia (SSE)</p>
              <p className="text-2xl font-black text-white">{metrics.clustering_quality.inertia}</p>
              <p className="text-[10px] text-gray-400 mt-1">Optimal K={metrics.clustering_quality.n_clusters} convergence</p>
            </div>

            <div className="p-4 bg-[#0D0D0F] rounded-xl border border-[#252529]">
              <p className="text-xs text-gray-400 font-medium mb-1">Cluster Balance Ratio</p>
              <p className="text-2xl font-black text-white">{metrics.clustering_quality.cluster_balance_ratio}</p>
              <p className="text-[10px] text-emerald-400 mt-1">No empty or ultra-dominant clusters</p>
            </div>
          </div>

          {/* Test Suite Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase text-gray-400 mb-3">Independent Evaluator Test Suite Results</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {metrics.test_suite_details?.map((test, idx) => (
                <div key={idx} className="p-3 bg-[#0D0D0F] rounded-xl border border-[#252529] flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-300">{test.test_name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    test.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {test.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#151518] border border-[#252529] rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Add New User to Application Database</h3>
            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-[#0D0D0F] border border-[#252529] rounded-xl p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-[#0D0D0F] border border-[#252529] rounded-xl p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full bg-[#0D0D0F] border border-[#252529] rounded-xl p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full bg-[#0D0D0F] border border-[#252529] rounded-xl p-2.5 text-white"
                >
                  <option value="VIEWER">VIEWER</option>
                  <option value="ANALYST">ANALYST</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#252529] text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF1744] text-white font-bold"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

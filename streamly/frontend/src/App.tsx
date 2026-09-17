import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';

import { ViewerLayout } from './layouts/ViewerLayout';
import { ViewerHome } from './pages/ViewerHome';
import { ViewerForYou } from './pages/ViewerForYou';
import { ViewerSegmentDNA } from './pages/ViewerSegmentDNA';
import { ViewerMyList } from './pages/ViewerMyList';
import { ViewerProfilePage } from './pages/ViewerProfilePage';

import { AnalystLayout } from './layouts/AnalystLayout';
import { AnalystDashboard } from './pages/AnalystDashboard';

import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { RecommendResponse } from './types';

const RootRedirect: React.FC = () => {
  const { user, token } = useAuth();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'ANALYST') return <Navigate to="/analyst/dashboard" replace />;
  return <Navigate to="/viewer/home" replace />;
};

export default function App() {
  const [sharedRecData, setSharedRecData] = React.useState<RecommendResponse | null>(null);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login & Role Selection Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* VIEWER ROLE PROTECTED SHELL */}
          <Route
            path="/viewer"
            element={
              <ProtectedRoute allowedRoles={['VIEWER']}>
                <ViewerLayout onAnalysisComplete={(res) => setSharedRecData(res)} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/viewer/home" replace />} />
            <Route
              path="home"
              element={
                <ViewerHome
                  onOpenAnalyzeModal={() => {}}
                  recommendData={sharedRecData}
                  setRecommendData={setSharedRecData}
                />
              }
            />
            <Route path="for-you" element={<ViewerForYou />} />
            <Route path="segment-dna" element={<ViewerSegmentDNA />} />
            <Route path="my-list" element={<ViewerMyList />} />
            <Route path="profile" element={<ViewerProfilePage />} />
          </Route>

          {/* ANALYST ROLE PROTECTED SHELL */}
          <Route
            path="/analyst"
            element={
              <ProtectedRoute allowedRoles={['ANALYST']}>
                <AnalystLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/analyst/dashboard" replace />} />
            <Route path="dashboard" element={<AnalystDashboard />} />
            <Route path="audience-segments" element={<AnalystDashboard />} />
            <Route path="user-analytics" element={<AnalystDashboard />} />
            <Route path="cluster-analysis" element={<AnalystDashboard />} />
            <Route path="recommendations" element={<AnalystDashboard />} />
            <Route path="model-evaluation" element={<AnalystDashboard />} />
          </Route>

          {/* ADMIN ROLE PROTECTED SHELL */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminDashboard />} />
            <Route path="viewer-data" element={<AdminDashboard />} />
            <Route path="audience-segments" element={<AdminDashboard />} />
            <Route path="model" element={<AdminDashboard />} />
            <Route path="evaluation" element={<AdminDashboard />} />
            <Route path="settings" element={<AdminDashboard />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

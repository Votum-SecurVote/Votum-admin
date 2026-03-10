import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';

// Admin Pages
import ElectionCreate from './pages/admin/ElectionCreate';
import ElectionCreateForm from './pages/admin/ElectionCreateForm';
import BallotDesigner from './pages/admin/BallotDesigner';
import ElectionView from './pages/admin/ElectionView';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import BulkApproval from './pages/admin/BulkApproval';
import CandidateApproval from './pages/admin/CandidateApproval';
import AuditLog from './pages/admin/AuditLog';

// Observer Pages
import ObserverDashboard from './pages/observer/ObserverDashboard';

// Common Pages
import Unauthorized from './pages/Unauthorized';

// Routes
import AdminRoute from './routes/AdminRoute';
import ProtectedRoute from './routes/ProtectedRoute';

import './styles/adminTheme.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Navbar />

        <AnimatePresence mode="wait">
          <Routes>
            {/* ✅ LOGIN (PUBLIC) */}
            <Route
              path="/login"
              element={
                <PageTransition>
                  <Login />
                </PageTransition>
              }
            />

            {/* Unauthorized Page */}
            <Route
              path="/unauthorized"
              element={
                <PageTransition>
                  <Unauthorized />
                </PageTransition>
              }
            />

            {/* Public / read-only election views */}
            <Route
              path="/elections/public"
              element={
                <PageTransition>
                  <ElectionView mode="public" />
                </PageTransition>
              }
            />

            {/* 🔒 Admin-only routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route
                path="dashboard"
                element={
                  <PageTransition>
                    <Dashboard />
                  </PageTransition>
                }
              />

              <Route
                path="election/create"
                element={
                  <PageTransition>
                    <ElectionCreateForm />
                  </PageTransition>
                }
              />

              <Route
                path="ballot/design"
                element={
                  <PageTransition>
                    <BallotDesigner />
                  </PageTransition>
                }
              />

              <Route
                path="election/view"
                element={
                  <PageTransition>
                    <ElectionView mode="admin" />
                  </PageTransition>
                }
              />

              <Route
                path="candidates/bulk-approval"
                element={
                  <PageTransition>
                    <BulkApproval />
                  </PageTransition>
                }
              />

              <Route
                path="candidates/:candidateId/approve"
                element={
                  <PageTransition>
                    <CandidateApproval />
                  </PageTransition>
                }
              />

              <Route
                path="audit-log"
                element={
                  <PageTransition>
                    <AuditLog />
                  </PageTransition>
                }
              />
            </Route>

            {/* 👁️ Observer routes (read-only) */}
            <Route
              path="/observer"
              element={
                <ProtectedRoute allowedRoles={['OBSERVER', 'ADMIN', 'SUPER_ADMIN']} />
              }
            >
              <Route
                path="dashboard"
                element={
                  <PageTransition>
                    <ObserverDashboard />
                  </PageTransition>
                }
              />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
};

export default App;

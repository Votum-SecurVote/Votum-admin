import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Top navigation bar shared by all pages
import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';

// Admin screens for the 3‑step flow
import ElectionCreate from './pages/admin/ElectionCreate';   // Step 1 – create election + dates
import BallotDesigner from './pages/admin/BallotDesigner';   // Step 2 – design ballot + candidates
import ElectionView from './pages/admin/ElectionView';       // Step 3 – dashboard / manage election
import Login from './pages/admin/Login';                     // Admin login (mock auth)

// Route guard that only allows logged‑in admin users
import AdminRoute from './routes/AdminRoute.jsx';

import './styles/adminTheme.css';

// Root React component – wires up routing between Login,
// Create (Step 1), Ballot (Step 2) and View (Step 3).
const App = () => {
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
                path="election/create"
                element={
                  <PageTransition>
                    <ElectionCreate />
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
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/elections/public" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
};

export default App;

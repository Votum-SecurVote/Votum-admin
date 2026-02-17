import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';

import ElectionCreate from './pages/admin/ElectionCreate';
import BallotDesigner from './pages/admin/BallotDesigner';
import ElectionView from './pages/admin/ElectionView';
import Login from './pages/admin/Login';

import AdminRoute from './routes/AdminRoute.jsx';

import './styles/adminTheme.css';

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

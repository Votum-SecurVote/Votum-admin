import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';

import ElectionCreate from './pages/admin/ElectionCreate';
import BallotDesigner from './pages/admin/BallotDesigner';
import ElectionView from './pages/admin/ElectionView';
import VoterApproval from './pages/admin/VoterApproval';
import Login from './pages/admin/Login';

import AdminRoute from './routes/AdminRoute.jsx';

import './styles/adminTheme.css';

const AppContent = () => {
  const location = useLocation();

  // Hide navbar on login page
  const hideNavbar = location.pathname === "/login";

  return (
    <div className="app">
      {!hideNavbar && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/login"
            element={
              <PageTransition>
                <Login />
              </PageTransition>
            }
          />

          <Route
            path="/elections/public"
            element={
              <PageTransition>
                <ElectionView mode="public" />
              </PageTransition>
            }
          />

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

            <Route
              path="voters/approval"
              element={
                <PageTransition>
                  <VoterApproval />
                </PageTransition>
              }
            />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;

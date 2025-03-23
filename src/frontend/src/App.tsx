import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChildProvider } from './contexts/ChildContext';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { PracticePage } from './pages/PracticePage';
import { CalendarPage } from './pages/CalendarPage';
import { JournalPage } from './pages/JournalPage';
import { FamilySettingsPage } from './pages/FamilySettingsPage';
import { ProgressDashboard } from './pages/ProgressDashboard';
import { ChallengeViewer } from './pages/ChallengeViewer';
import { LoginPage } from './pages/LoginPage';
import { useAuth } from './contexts/AuthContext';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ChildProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/practice/:child_id"
              element={
                <PrivateRoute>
                  <PracticePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/calendar/:child_id"
              element={
                <PrivateRoute>
                  <CalendarPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/journal/:child_id"
              element={
                <PrivateRoute>
                  <JournalPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/family-settings"
              element={
                <PrivateRoute>
                  <FamilySettingsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/progress/:child_id"
              element={
                <PrivateRoute>
                  <ProgressDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/challenge/:child_id/:challenge_id"
              element={
                <PrivateRoute>
                  <ChallengeViewer />
                </PrivateRoute>
              }
            />
          </Routes>
        </ChildProvider>
      </AuthProvider>
    </Router>
  );
};

export default App; 
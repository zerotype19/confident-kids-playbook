import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChildProvider } from './contexts/ChildContext';
import HomePage from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { PracticePage } from './pages/PracticePage';
import { CalendarPage } from './pages/CalendarPage';
import { JournalPage } from './pages/JournalPage';
import { FamilySettingsPage } from './pages/FamilySettingsPage';
import { ProgressDashboard } from './pages/ProgressDashboard';
import { ChallengeViewer } from './pages/ChallengeViewer';
import { LoginPage } from './pages/LoginPage';
import { PrivateRoute } from './components/PrivateRoute';
import { ProfilePage } from './pages/ProfilePage';

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      {children}
    </React.Suspense>
  );
}

const App: React.FC = () => {
  console.log("✅ App.tsx rendering");
  
  return (
    <>
      {console.log("✅ App.tsx returning JSX")}
      <AuthProvider>
        <ChildProvider>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<HomePage />} />
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
                path="/practice"
                element={
                  <PrivateRoute>
                    <PracticePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/calendar"
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
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </ChildProvider>
      </AuthProvider>
    </>
  );
};

export default App; 
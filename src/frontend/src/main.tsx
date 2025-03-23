import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChildProvider } from './contexts/ChildContext';
import { DashboardPage } from './pages/DashboardPage';
import { JournalPage } from './pages/JournalPage';
import { ProgressDashboard } from './pages/ProgressDashboard';
import { CalendarPage } from './pages/CalendarPage';
import { ChallengeViewer } from './pages/ChallengeViewer';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChildProvider>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/journal/:child_id" element={<JournalPage />} />
          <Route path="/progress/:child_id" element={<ProgressDashboard />} />
          <Route path="/calendar/:child_id" element={<CalendarPage />} />
          <Route path="/challenge/:id" element={<ChallengeViewer />} />
        </Routes>
      </ChildProvider>
    </BrowserRouter>
  </React.StrictMode>
);

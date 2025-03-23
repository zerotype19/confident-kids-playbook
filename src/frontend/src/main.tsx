import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ChildProvider } from './contexts/ChildContext';
import { DashboardPage } from './pages/DashboardPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChildProvider>
        <DashboardPage />
      </ChildProvider>
    </BrowserRouter>
  </React.StrictMode>
);

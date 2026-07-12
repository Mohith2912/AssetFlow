import React from 'react';
import { useMockData } from './context/MockDataContext';
import Login from './pages/Login';
import OrgSetup from './pages/OrgSetup';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const { currentUser, currentScreen } = useMockData();

  if (!currentUser || currentScreen === 'login') {
    return <Login />;
  }

  const isAdmin = currentUser?.role === 'Admin';

  if (currentScreen === 'orgSetup') {
    return isAdmin ? <OrgSetup /> : <Dashboard />;
  }

  if (currentScreen === 'dashboard') {
    return <Dashboard />;
  }

  return <Dashboard />;
}

export default function App() {
  return <AppContent />;
}
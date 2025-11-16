import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ProjectBoard } from './components/ProjectBoard';
import { ExcelView } from './components/ExcelView';
import { GanttChart } from './components/GanttChart';
import { AdminPanel } from './components/AdminPanel';
import { SystemLogs } from './components/SystemLogs';
import { Auth } from './components/Auth';
import { Role } from './types';
import { LandingPage } from './components/LandingPage';

const AppContent: React.FC = () => {
  const { currentUser } = useStore();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showAuth, setShowAuth] = useState(false);
  const [wasLoggedIn, setWasLoggedIn] = useState(!!currentUser);

  // This effect handles logout detection
  useEffect(() => {
    const isLoggedIn = !!currentUser;
    if (wasLoggedIn && !isLoggedIn) {
      // User just logged out
      setShowAuth(true);
    }
    setWasLoggedIn(isLoggedIn);
  }, [currentUser, wasLoggedIn]);

  // This effect handles login and view resetting
  useEffect(() => {
    if (currentUser) {
      setCurrentView('dashboard');
      setShowAuth(false); // Hide auth page on successful login
    }
  }, [currentUser]);

  if (!currentUser) {
    if (showAuth) {
      return <Auth onBackClick={() => setShowAuth(false)} />;
    }
    return <LandingPage onLoginClick={() => setShowAuth(true)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'projects': return <ProjectBoard />;
      case 'reports': return <ExcelView />;
      case 'timeline': return <GanttChart />;
      case 'users': 
        if (currentUser.role === Role.ADMIN) return <AdminPanel />;
        return <div className="p-8 text-center text-red-500 font-bold bg-white dark:bg-slate-900 rounded-xl shadow-sm">Access Denied: Admin Privileges Required</div>;
      case 'logs':
        if (currentUser.role === Role.ADMIN) return <SystemLogs />;
        return <div className="p-8 text-center text-red-500 font-bold bg-white dark:bg-slate-900 rounded-xl shadow-sm">Access Denied: Admin Privileges Required</div>;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;

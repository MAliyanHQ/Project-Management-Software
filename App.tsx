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

const AppContent: React.FC = () => {
  const { currentUser } = useStore();
  const [currentView, setCurrentView] = useState('dashboard');

  // Fix: Reset view to dashboard whenever user changes (login/logout)
  // This prevents a non-admin from landing on 'users' or 'logs' view if the previous user was an Admin.
  useEffect(() => {
    if (currentUser) {
      setCurrentView('dashboard');
    }
  }, [currentUser]);

  if (!currentUser) {
    return <Auth />;
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
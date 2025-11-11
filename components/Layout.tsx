import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Role } from '../types';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Users, 
  LogOut, 
  Settings, 
  Menu, 
  X,
  Table,
  Activity,
  Sun,
  Moon,
  FileText
} from 'lucide-react';

interface LayoutProps {
  currentView: string;
  onChangeView: (view: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, children }) => {
  const { currentUser, logout } = useStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const NavItem = ({ view, icon: Icon, label }: { view: string, icon: any, label: string }) => (
    <button
      onClick={() => {
        onChangeView(view);
        setIsMobileOpen(false);
      }}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all duration-200 ${
        currentView === view 
          ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h1 className="text-xl font-bold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
              Task Flow
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">by M. Aliyan H. Qureshi</p>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="projects" icon={KanbanSquare} label="Projects & Tasks" />
            <NavItem view="reports" icon={Table} label="Excel Reports" />
            <NavItem view="timeline" icon={Activity} label="Timeline (Gantt)" />
            
            {currentUser?.role === Role.ADMIN && (
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Admin</p>
                <NavItem view="users" icon={Users} label="User Management" />
                <NavItem view="logs" icon={FileText} label="System Logs" />
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
                {currentUser?.username.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{currentUser?.username}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 capitalize">{currentUser?.role}</p>
              </div>
            </div>
            
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center p-2 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors gap-2"
              title="Logout"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Header Bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
             {/* Hamburger on Left */}
            <button onClick={() => setIsMobileOpen(true)} className="p-2 text-slate-600 dark:text-slate-400 lg:hidden">
              <Menu size={24} />
            </button>
            <h1 className="lg:hidden font-bold text-lg text-slate-800 dark:text-white">Task Flow</h1>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
             <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
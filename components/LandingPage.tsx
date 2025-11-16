import React from 'react';
import { Layers, KanbanSquare, ArrowRight, LayoutDashboard, Shield, Table } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
}

const AppMockup: React.FC = () => (
    <div className="relative mt-20 max-w-5xl mx-auto">
        <div className="absolute -inset-x-8 -inset-y-4 bg-gradient-to-r from-brand-600/20 to-purple-600/20 rounded-3xl blur-2xl opacity-50"></div>
        <div className="relative bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 ring-1 ring-inset ring-white/10">
            <div className="flex justify-between items-center mb-3 px-2">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                </div>
                <div className="w-1/2 h-4 bg-slate-700/50 rounded-md"></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                    <div className="h-6 bg-slate-700/80 rounded-md flex items-center justify-center text-xs text-slate-400">To Do</div>
                    <div className="h-16 bg-slate-700/50 rounded-lg p-2"><div className="w-3/4 h-2 bg-slate-600/80 rounded-full"></div></div>
                    <div className="h-24 bg-slate-700/50 rounded-lg p-2"><div className="w-1/2 h-2 bg-slate-600/80 rounded-full"></div></div>
                </div>
                <div className="space-y-2">
                    <div className="h-6 bg-slate-700/80 rounded-md flex items-center justify-center text-xs text-slate-400">In Progress</div>
                    <div className="h-20 bg-slate-700/50 rounded-lg p-2"><div className="w-3/4 h-2 bg-slate-600/80 rounded-full"></div></div>
                    <div className="h-12 bg-slate-700/50 rounded-lg p-2"><div className="w-full h-2 bg-slate-600/80 rounded-full"></div></div>
                    <div className="h-16 bg-slate-700/50 rounded-lg p-2"><div className="w-1/2 h-2 bg-slate-600/80 rounded-full"></div></div>
                </div>
                <div className="space-y-2">
                    <div className="h-6 bg-slate-700/80 rounded-md flex items-center justify-center text-xs text-slate-400">Done</div>
                    <div className="h-16 bg-slate-700/50 rounded-lg p-2"><div className="w-3/4 h-2 bg-slate-600/80 rounded-full"></div></div>
                </div>
            </div>
        </div>
    </div>
);


export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const features = [
    {
      icon: LayoutDashboard,
      title: 'Unified Command Center',
      description: 'Get a real-time overview of all projects with an intuitive dashboard featuring key stats, progress charts, and company-wide announcements.'
    },
    {
      icon: KanbanSquare,
      title: 'Dynamic Project Workspaces',
      description: 'Manage tasks visually on Kanban boards, plan schedules with Gantt timelines, and collaborate with your team using comments and assignments.'
    },
    {
      icon: Table,
      title: 'Insightful Data & Reporting',
      description: 'Leverage a powerful spreadsheet view to manage tasks, export data to CSV, and build custom reports with flexible columns and rows.'
    },
    {
      icon: Shield,
      title: 'Robust Admin Controls',
      description: 'Secure your instance with role-based access, manage users and their project assignments, and review a complete audit trail of all system activities.'
    }
  ];

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans selection:bg-brand-500/30 overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-20%] w-1/2 h-1/2 bg-purple-600/20 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-1/2 h-1/2 bg-brand-600/20 rounded-full blur-[150px] animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="py-6 px-4 md:px-8 animate-in fade-in duration-500">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-white/10">
                <Layers className="text-brand-400" />
              </div>
              <span className="text-xl font-bold">Task Flow</span>
            </div>
            <button
              onClick={onLoginClick}
              className="px-4 py-2 text-sm font-semibold bg-white/10 border border-white/20 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              Sign In / Try Product
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 md:px-8">
          <section className="text-center py-20 md:py-24">
            <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent leading-tight animate-in fade-in slide-in-from-top-4 duration-700" style={{lineHeight: '1.2'}}>
              Elevate Your Project Management
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-400 animate-in fade-in slide-in-from-top-4 duration-700 delay-200">
              Everything you need to ship projects on time. Task Flow combines intuitive design with powerful AI to streamline your workflow, from planning to reporting.
            </p>
            <button
              onClick={onLoginClick}
              className="group mt-10 px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold rounded-xl transition-transform transform hover:-translate-y-1 shadow-2xl shadow-brand-500/30 animate-in fade-in slide-in-from-top-4 duration-700 delay-300"
            >
              <span className="flex items-center gap-2">
                Get Started for Free
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <p className="text-xs text-slate-500 mt-4 animate-in fade-in duration-700 delay-500">No credit card required.</p>
            
            <div className="animate-in fade-in zoom-in-95 duration-1000 delay-500">
                <AppMockup />
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold animate-in fade-in duration-500">Everything You Need in One Platform</h2>
              <p className="text-slate-400 mt-2 animate-in fade-in duration-500 delay-100 max-w-3xl mx-auto">
                Task Flow provides a complete suite of tools to manage your projects effectively, from high-level overviews to granular task management and security controls.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div 
                    key={index} 
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg transform hover:-translate-y-2 transition-transform duration-300 animate-in fade-in slide-in-from-bottom-8 duration-700"
                    style={{ animationDelay: `${200 + index * 150}ms`, willChange: 'transform, opacity' }}
                >
                  <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="text-brand-400" size={24} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="py-12 mt-16 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-slate-500 text-sm">
            <p>&copy; 2025 Task Flow by M. Aliyan H. Qureshi. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

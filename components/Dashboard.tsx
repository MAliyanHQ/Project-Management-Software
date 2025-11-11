
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Status, Priority, Role } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { CheckCircle2, Clock, AlertCircle, Folder, Users, Filter, Megaphone, Plus, Trash2, X } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { visibleProjects, tasks, currentUser, users, announcements, addAnnouncement, deleteAnnouncement } = useStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');

  // Announcement State
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsForm, setNewsForm] = useState({ title: '', content: '' });

  // Filter tasks based on selection
  const filteredTasks = React.useMemo(() => {
    if (selectedProjectId === 'ALL') {
      // Only show tasks from projects the user can see
      const visibleProjectIds = visibleProjects.map(p => p.id);
      return tasks.filter(t => visibleProjectIds.includes(t.projectId));
    }
    return tasks.filter(t => t.projectId === selectedProjectId);
  }, [selectedProjectId, tasks, visibleProjects]);

  // Calculate Stats
  const totalProjects = selectedProjectId === 'ALL' ? visibleProjects.length : 1;
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === Status.DONE).length;
  const pendingTasks = filteredTasks.filter(t => t.status !== Status.DONE).length;
  const highPriority = filteredTasks.filter(t => t.priority === Priority.HIGH).length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Chart Data
  const statusData = [
    { name: 'To Do', value: filteredTasks.filter(t => t.status === Status.TODO).length, color: '#64748b' },
    { name: 'In Progress', value: filteredTasks.filter(t => t.status === Status.IN_PROGRESS).length, color: '#0ea5e9' },
    { name: 'Done', value: filteredTasks.filter(t => t.status === Status.DONE).length, color: '#10b981' },
  ];

  const priorityData = [
    { name: 'Low', value: filteredTasks.filter(t => t.priority === Priority.LOW).length },
    { name: 'Medium', value: filteredTasks.filter(t => t.priority === Priority.MEDIUM).length },
    { name: 'High', value: filteredTasks.filter(t => t.priority === Priority.HIGH).length },
  ];

  const handlePostNews = () => {
      if(newsForm.title && newsForm.content) {
          addAnnouncement(newsForm.title, newsForm.content);
          setNewsForm({ title: '', content: '' });
          setShowNewsModal(false);
      }
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
             {currentUser?.role === Role.ADMIN ? 'Executive Dashboard' : 'My Dashboard'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Overview of your projects and tasks</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
            <Filter size={18} className="text-slate-400 ml-2"/>
            <select 
                className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 dark:text-slate-200 min-w-[150px] cursor-pointer"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
            >
                <option value="ALL">All My Projects</option>
                {visibleProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Folder} label="Active Projects" value={totalProjects} color="bg-indigo-500" />
        <StatCard icon={Clock} label="Pending Tasks" value={pendingTasks} color="bg-amber-500" />
        <StatCard icon={CheckCircle2} label="Completed" value={completedTasks} color="bg-emerald-500" />
        <StatCard icon={AlertCircle} label="High Priority" value={highPriority} color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* News / Announcements Section */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                      <Megaphone size={20} className="text-brand-500"/> Company News
                  </h3>
                  {currentUser?.role === Role.ADMIN && (
                      <button 
                        onClick={() => setShowNewsModal(true)}
                        className="text-xs flex items-center gap-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 px-2 py-1.5 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
                      >
                          <Plus size={14}/> Post News
                      </button>
                  )}
              </div>
              <div className="p-4 space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
                  {announcements.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">No announcements yet.</div>
                  ) : (
                      announcements.map(ann => (
                          <div key={ann.id} className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800 relative group">
                              <div className="flex justify-between items-start mb-1">
                                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{ann.title}</h4>
                                  <span className="text-[10px] text-slate-400">{new Date(ann.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">{ann.content}</p>
                              <div className="mt-2 text-[10px] text-slate-400">Posted by {ann.createdBy}</div>
                              
                              {currentUser?.role === Role.ADMIN && (
                                  <button 
                                    onClick={() => deleteAnnouncement(ann.id)}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 bg-white dark:bg-slate-900 rounded p-1 shadow-sm"
                                  >
                                      <Trash2 size={12} />
                                  </button>
                              )}
                          </div>
                      ))
                  )}
              </div>
          </div>

          {/* Progress Bar - Moved here to fit grid */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-slate-800 dark:text-white">Completion Status</h3>
            <span className="text-sm font-medium text-brand-600 dark:text-brand-400">{completionRate}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden mb-4">
            <div 
                className="bg-gradient-to-r from-brand-500 to-emerald-400 h-3 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${completionRate}%` }}
            />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                {completedTasks} of {totalTasks} tasks completed
            </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-96 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white shrink-0">Status Distribution</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-96 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white shrink-0">Workload by Priority</h3>
          <div className="flex-1 min-h-0 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(148, 163, 184, 0.1)'}}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {currentUser?.role === Role.ADMIN && selectedProjectId === 'ALL' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                  <Users size={18}/> Resource Allocation Overview
              </h3>
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950">
                          <tr>
                              <th className="px-4 py-3">Project Name</th>
                              <th className="px-4 py-3">Managers</th>
                              <th className="px-4 py-3 text-center">Team Size</th>
                              <th className="px-4 py-3 text-center">Tasks</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {visibleProjects.map(p => {
                              // Identify all managers: Project owner + any members with Project Manager role
                              const projectManagers = users.filter(u => 
                                p.members.includes(u.id) && (u.role === Role.PROJECT_MANAGER || u.id === p.managerId)
                              );
                              const uniqueManagers = Array.from(new Set(projectManagers.map(u => u.id)))
                                .map(id => users.find(u => u.id === id));

                              return (
                                <tr key={p.id}>
                                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{p.name}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                        {uniqueManagers.map(m => m?.fullName).join(', ') || 'Unknown'}
                                    </td>
                                    <td className="px-4 py-3 text-center">{p.members.length}</td>
                                    <td className="px-4 py-3 text-center">
                                        {tasks.filter(t => t.projectId === p.id).length}
                                    </td>
                                </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* News Modal */}
      {showNewsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Post Announcement</h3>
                      <button onClick={() => setShowNewsModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  </div>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">TITLE</label>
                          <input 
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                              value={newsForm.title}
                              onChange={e => setNewsForm({...newsForm, title: e.target.value})}
                              placeholder="e.g. Server Maintenance"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">CONTENT</label>
                          <textarea 
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-brand-500 outline-none h-32 resize-none"
                              value={newsForm.content}
                              onChange={e => setNewsForm({...newsForm, content: e.target.value})}
                              placeholder="Details about the announcement..."
                          />
                      </div>
                      <button 
                          onClick={handlePostNews}
                          disabled={!newsForm.title || !newsForm.content}
                          className="w-full bg-brand-600 text-white py-2 rounded-lg hover:bg-brand-700 transition-colors font-medium disabled:opacity-50"
                      >
                          Post Announcement
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

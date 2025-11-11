
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Task, Status, Priority, Role, Project } from '../types';
import { generateProjectSummary, suggestSubtasks } from '../services/geminiService';
import { Plus, MoreVertical, Calendar, User as UserIcon, Sparkles, MessageSquare, Trash2, Edit2, Check, X, Info, Save } from 'lucide-react';

export const ProjectBoard: React.FC = () => {
  const { visibleProjects, tasks, users, currentUser, addProject, updateProject, addTask, updateTask, deleteTask, addComment, addLog } = useStore();
  const [activeProjectId, setActiveProjectId] = useState<string>(visibleProjects[0]?.id || '');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  
  // Task Form States
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState({
      title: '',
      description: '',
      status: Status.TODO,
      priority: Priority.MEDIUM,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      assignedTo: [] as string[]
  });

  // Project Creation State
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectMembers, setNewProjectMembers] = useState<string[]>([]);

  // Project Editing State (Description)
  const [editProjectDesc, setEditProjectDesc] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  
  const [activeCommentTaskId, setActiveCommentTaskId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  
  // AI State
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync active project if projects change or on load
  useEffect(() => {
      if (!activeProjectId && visibleProjects.length > 0) {
          setActiveProjectId(visibleProjects[0].id);
      }
  }, [visibleProjects, activeProjectId]);

  const activeProject = visibleProjects.find(p => p.id === activeProjectId);
  const projectTasks = tasks.filter(t => t.projectId === activeProjectId);
  const canEditProject = currentUser?.role === Role.ADMIN || (currentUser?.role === Role.PROJECT_MANAGER && activeProject?.managerId === currentUser.id);

  const openTaskModal = (task?: Task) => {
      if (task) {
          setEditingTaskId(task.id);
          setTaskForm({
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              startDate: task.startDate,
              endDate: task.endDate,
              assignedTo: task.assignedTo
          });
      } else {
          setEditingTaskId(null);
          setTaskForm({
              title: '',
              description: '',
              status: Status.TODO,
              priority: Priority.MEDIUM,
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0],
              assignedTo: []
          });
      }
      setIsTaskModalOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e: React.DragEvent, status: Status) => {
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== status) {
      updateTask({ ...task, status });
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const generateSummary = async () => {
    if (!activeProject) return;
    setIsGenerating(true);
    const summary = await generateProjectSummary(activeProject, projectTasks, users);
    setAiSummary(summary);
    setIsGenerating(false);
    addLog('AI Action', `Generated summary for project ${activeProject.name}`);
  };

  const handleSuggestSubtasks = async () => {
    if(!taskForm.title) return;
    setIsGenerating(true);
    const subs = await suggestSubtasks(taskForm.title, taskForm.description);
    setTaskForm(prev => ({
        ...prev,
        description: prev.description + (prev.description ? '\n\n' : '') + "AI Suggested Subtasks:\n" + subs.map(s => `- ${s}`).join('\n')
    }));
    setIsGenerating(false);
    addLog('AI Action', `Generated subtasks for task "${taskForm.title}"`);
  };

  const handleSaveTask = () => {
    if (!currentUser || !activeProjectId) return;

    if (editingTaskId) {
        // Update existing
        const existing = tasks.find(t => t.id === editingTaskId);
        if (existing) {
            updateTask({
                ...existing,
                ...taskForm
            });
        }
    } else {
        // Create new
        addTask({
            id: Date.now().toString(),
            projectId: activeProjectId,
            comments: [],
            ...taskForm
        });
    }
    setIsTaskModalOpen(false);
  };

  const toggleAssignee = (userId: string) => {
      setTaskForm(prev => {
          const current = prev.assignedTo;
          if (current.includes(userId)) {
              return { ...prev, assignedTo: current.filter(id => id !== userId) };
          } else {
              return { ...prev, assignedTo: [...current, userId] };
          }
      });
  };

  const toggleNewProjectMember = (userId: string) => {
      if(newProjectMembers.includes(userId)) {
          setNewProjectMembers(prev => prev.filter(id => id !== userId));
      } else {
          setNewProjectMembers(prev => [...prev, userId]);
      }
  };

  const handleCreateProject = () => {
    if(!currentUser) return;
    const newId = Date.now().toString();
    
    // Ensure creator is always a member
    const finalMembers = Array.from(new Set([...newProjectMembers, currentUser.id]));

    addProject({
        id: newId,
        name: newProjectName,
        description: newProjectDesc || "New Project",
        managerId: currentUser.id,
        members: finalMembers,
        createdAt: new Date().toISOString()
    });
    setActiveProjectId(newId);
    setIsProjectModalOpen(false);
    setNewProjectName('');
    setNewProjectDesc('');
    setNewProjectMembers([]);
  }

  const handleUpdateDescription = () => {
      if(activeProject) {
          updateProject({
              ...activeProject,
              description: editProjectDesc
          });
          setIsEditingDesc(false);
      }
  };

  const openProjectDetails = () => {
      if(activeProject) {
          setEditProjectDesc(activeProject.description);
          setIsEditingDesc(false);
          setShowProjectDetails(true);
      }
  };

  const renderColumn = (status: Status) => {
    const columnTasks = projectTasks.filter(t => t.status === status);
    return (
      <div 
        className="flex-1 min-w-[300px] bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 flex flex-col h-full"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            {status}
            <span className="bg-slate-200 dark:bg-slate-700 text-xs py-0.5 px-2 rounded-full text-slate-600 dark:text-slate-400">
              {columnTasks.length}
            </span>
          </h3>
        </div>
        
        <div className="space-y-3 overflow-y-auto flex-1 min-h-[200px]">
          {columnTasks.map(task => (
            <div 
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
              className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing group hover:border-brand-400 dark:hover:border-brand-600 transition-colors relative"
            >
              {/* Edit Overlay */}
              <div 
                onClick={() => openTaskModal(task)}
                className="absolute inset-0 z-10"
              ></div>

              <div className="relative z-20 flex justify-between items-start mb-2 pointer-events-none">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  task.priority === Priority.HIGH ? 'bg-rose-100 text-rose-700' : 
                  task.priority === Priority.MEDIUM ? 'bg-amber-100 text-amber-700' : 
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {task.priority}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                  className="pointer-events-auto text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              
              <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">{task.title}</h4>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
              
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {task.assignedTo.length > 0 ? task.assignedTo.map(uid => {
                            const user = users.find(u => u.id === uid);
                            return (
                                <div key={uid} className="w-6 h-6 rounded-full bg-brand-100 border border-white dark:border-slate-800 flex items-center justify-center text-[10px] text-brand-700 font-bold" title={user?.fullName}>
                                    {user?.username.charAt(0).toUpperCase()}
                                </div>
                            );
                        }) : (
                            <div className="text-xs text-slate-400 italic">Unassigned</div>
                        )}
                    </div>
                </div>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveCommentTaskId(task.id); }}
                  className="pointer-events-auto text-slate-400 hover:text-brand-500 flex items-center gap-1 text-xs z-20"
                >
                  <MessageSquare size={12} />
                  {task.comments.length}
                </button>
              </div>
                
                <div className="mt-2 flex items-center text-[10px] text-slate-400 gap-1">
                    <Calendar size={10}/>
                    {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}
                </div>

              {/* Inline Comments Section */}
              {activeCommentTaskId === task.id && (
                 <div className="relative z-30 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                    <div className="max-h-32 overflow-y-auto space-y-2 mb-2">
                      {task.comments.map(c => (
                        <div key={c.id} className="text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded">
                           <span className="font-bold text-slate-700 dark:text-slate-300">{c.userName}:</span> {c.text}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <input 
                        className="flex-1 text-xs border rounded px-2 py-1 bg-transparent dark:text-white dark:border-slate-600"
                        placeholder="Add comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if(e.key === 'Enter' && commentText) {
                            addComment(task.id, commentText);
                            setCommentText('');
                          }
                        }}
                      />
                      <button onClick={() => setActiveCommentTaskId(null)} className="text-xs text-slate-500"><X size={12}/></button>
                    </div>
                 </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <select 
            value={activeProjectId}
            onChange={(e) => {
                setActiveProjectId(e.target.value);
                setAiSummary('');
            }}
            className="text-xl font-bold bg-transparent border-none focus:ring-0 text-slate-800 dark:text-white cursor-pointer pr-8"
          >
            {visibleProjects.length > 0 ? visibleProjects.map(p => <option key={p.id} value={p.id} className="text-slate-800">{p.name}</option>) : <option>No Projects</option>}
          </select>
          
          {activeProjectId && (
            <button 
                onClick={openProjectDetails}
                className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 rounded-full transition-colors"
                title="Project Info"
            >
                <Info size={20} />
            </button>
          )}

          {currentUser?.role === Role.ADMIN && (
             <button 
                onClick={() => setIsProjectModalOpen(true)}
                className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 rounded-full transition-colors"
                title="New Project"
             >
                <Plus size={20} />
             </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={generateSummary}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm font-medium"
            disabled={isGenerating}
          >
            <Sparkles size={16} />
            {isGenerating ? 'Analyzing...' : 'AI Summary'}
          </button>
          <button 
             onClick={() => openTaskModal()}
             className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-md shadow-brand-600/20 text-sm font-medium"
           >
             <Plus size={16} />
             Add Task
           </button>
        </div>
      </div>

      {/* AI Summary Box */}
      {aiSummary && (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-white dark:from-slate-800 dark:to-slate-900 p-4 rounded-xl border border-purple-100 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-purple-500" />
              <h4 className="font-semibold text-purple-900 dark:text-purple-300">Project Insight</h4>
            </div>
            <button onClick={() => setAiSummary('')} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
            {aiSummary}
          </p>
        </div>
      )}

      {/* Kanban Columns */}
      {activeProjectId ? (
        <div className="flex-1 flex overflow-x-auto gap-6 pb-4">
          {renderColumn(Status.TODO)}
          {renderColumn(Status.IN_PROGRESS)}
          {renderColumn(Status.DONE)}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400">
            {visibleProjects.length === 0 ? "You are not assigned to any projects." : "Select a project."}
        </div>
      )}

      {/* Task Modal (Create/Edit) */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                {editingTaskId ? 'Edit Task' : 'Create New Task'}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                     <label className="block text-xs font-semibold text-slate-500 mb-1">TITLE</label>
                    <input 
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                    />
                </div>
                
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">START DATE</label>
                    <input type="date" 
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent dark:text-white"
                        value={taskForm.startDate}
                        onChange={(e) => setTaskForm({...taskForm, startDate: e.target.value})}
                    />
                </div>
                
                <div>
                     <label className="block text-xs font-semibold text-slate-500 mb-1">END DATE</label>
                     <input type="date" 
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent dark:text-white"
                        value={taskForm.endDate}
                        onChange={(e) => setTaskForm({...taskForm, endDate: e.target.value})}
                    />
                </div>
                
                <div>
                     <label className="block text-xs font-semibold text-slate-500 mb-1">PRIORITY</label>
                     <select 
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent dark:text-white"
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm({...taskForm, priority: e.target.value as Priority})}
                     >
                         {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                     </select>
                </div>

                <div>
                     <label className="block text-xs font-semibold text-slate-500 mb-1">STATUS</label>
                     <select 
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent dark:text-white"
                        value={taskForm.status}
                        onChange={(e) => setTaskForm({...taskForm, status: e.target.value as Status})}
                     >
                         {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                </div>
            </div>

            <div className="mb-4 relative">
                <label className="block text-xs font-semibold text-slate-500 mb-1">DESCRIPTION</label>
                <textarea 
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none h-32 resize-none"
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                />
                <button 
                    onClick={handleSuggestSubtasks}
                    disabled={!taskForm.title || isGenerating}
                    className="absolute bottom-2 right-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded flex items-center gap-1 hover:bg-purple-200"
                >
                    <Sparkles size={10}/> {isGenerating ? '...' : 'Suggest Subtasks'}
                </button>
            </div>

            <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-500 mb-2">ASSIGNED TO (MULTIPLE)</label>
                <div className="flex flex-wrap gap-2">
                    {users.map(user => {
                        const isSelected = taskForm.assignedTo.includes(user.id);
                        return (
                            <button
                                key={user.id}
                                onClick={() => toggleAssignee(user.id)}
                                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                                    isSelected 
                                    ? 'bg-brand-600 border-brand-600 text-white' 
                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-400'
                                }`}
                            >
                                {user.fullName}
                            </button>
                        );
                    })}
                </div>
            </div>
            
            <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <button 
                onClick={() => setIsTaskModalOpen(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveTask}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
              >
                {editingTaskId ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">New Project</h3>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">PROJECT NAME</label>
                    <input 
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="Project Name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">DESCRIPTION</label>
                    <textarea 
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none"
                    placeholder="Brief description of goals and scope..."
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">ASSIGN MEMBERS</label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {users.map(user => {
                            const isSelected = newProjectMembers.includes(user.id) || user.id === currentUser?.id;
                            const isMe = user.id === currentUser?.id;
                            return (
                                <button
                                    key={user.id}
                                    onClick={() => !isMe && toggleNewProjectMember(user.id)}
                                    disabled={isMe}
                                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                                        isSelected 
                                        ? 'bg-brand-600 border-brand-600 text-white' 
                                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-400'
                                    } ${isMe ? 'opacity-80 cursor-not-allowed' : ''}`}
                                >
                                    {user.username} {isMe && '(You)'}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsProjectModalOpen(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateProject}
                disabled={!newProjectName}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {showProjectDetails && activeProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">{activeProject.name}</h3>
                      <button onClick={() => setShowProjectDetails(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  </div>
                  
                  <div className="space-y-6">
                      <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-semibold text-slate-500">DESCRIPTION</label>
                            {canEditProject && !isEditingDesc && (
                                <button onClick={() => setIsEditingDesc(true)} className="text-xs text-brand-600 flex items-center gap-1 hover:underline"><Edit2 size={10}/> Edit</button>
                            )}
                        </div>
                        
                        {isEditingDesc ? (
                            <div className="space-y-2">
                                <textarea 
                                    className="w-full p-2 text-sm border rounded-md dark:bg-slate-800 dark:text-white dark:border-slate-700 h-24 focus:ring-1 focus:ring-brand-500 outline-none"
                                    value={editProjectDesc}
                                    onChange={e => setEditProjectDesc(e.target.value)}
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setIsEditingDesc(false)} className="text-xs px-3 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Cancel</button>
                                    <button onClick={handleUpdateDescription} className="text-xs px-3 py-1 rounded bg-brand-600 text-white flex items-center gap-1"><Save size={10}/> Save</button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                {activeProject.description}
                            </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1">PROJECT MANAGER</label>
                              <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-xs text-brand-700 font-bold">
                                      {users.find(u => u.id === activeProject.managerId)?.username.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-sm font-medium text-slate-800 dark:text-white">
                                      {users.find(u => u.id === activeProject.managerId)?.fullName}
                                  </span>
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1">CREATED AT</label>
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <Calendar size={14}/>
                                  {new Date(activeProject.createdAt).toLocaleDateString()}
                              </div>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">TEAM MEMBERS ({activeProject.members.length})</label>
                          <div className="flex flex-wrap gap-2">
                              {activeProject.members.map(mid => {
                                  const member = users.find(u => u.id === mid);
                                  return (
                                      <div key={mid} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full">
                                          <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                              {member?.username.charAt(0).toUpperCase()}
                                          </div>
                                          <span className="text-xs text-slate-700 dark:text-slate-300">{member?.username}</span>
                                      </div>
                                  )
                              })}
                          </div>
                      </div>
                  </div>

                  <div className="flex justify-end mt-6">
                      <button 
                        onClick={() => setShowProjectDetails(false)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                      >
                        Close
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

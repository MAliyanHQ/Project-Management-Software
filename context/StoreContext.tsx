
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Project, Task, Role, Status, Priority, Comment, Log, CustomReport, Announcement } from '../types';

// Initial Mock Data
const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'Aliyan', password: '1234', role: Role.ADMIN, fullName: 'Aliyan (Admin)' },
  { id: 'u2', username: 'sarah', password: '123', role: Role.PROJECT_MANAGER, fullName: 'Sara Manager' },
  { id: 'u3', username: 'john', password: '123', role: Role.MEMBER, fullName: 'John Dev' },
];

const INITIAL_PROJECTS: Project[] = [
  { id: 'p1', name: 'Website Revamp', description: 'Redesigning the corporate portal with new branding and improved UX.', managerId: 'u2', members: ['u2', 'u3'], createdAt: new Date().toISOString() },
  { id: 'p2', name: 'Mobile App', description: 'iOS and Android Development for the customer loyalty program.', managerId: 'u2', members: ['u2', 'u3'], createdAt: new Date().toISOString() },
];

const INITIAL_TASKS: Task[] = [
  { 
    id: 't1', projectId: 'p1', title: 'Setup React Repo', description: 'Initialize project with TypeScript.', 
    assignedTo: ['u3'], priority: Priority.HIGH, status: Status.DONE, 
    startDate: '2023-10-01', endDate: '2023-10-05', comments: [] 
  },
  { 
    id: 't2', projectId: 'p1', title: 'Design Database', description: 'Create Firestore schema.', 
    assignedTo: ['u3', 'u2'], priority: Priority.MEDIUM, status: Status.IN_PROGRESS, 
    startDate: '2023-10-06', endDate: '2023-10-10', comments: [] 
  },
  { 
    id: 't3', projectId: 'p1', title: 'User Testing', description: 'Coordinate with Jane.', 
    assignedTo: ['u2'], priority: Priority.LOW, status: Status.TODO, 
    startDate: '2023-10-15', endDate: '2023-10-20', comments: [] 
  },
];

interface StoreContextType {
  users: User[];
  projects: Project[];
  visibleProjects: Project[];
  tasks: Task[];
  currentUser: User | null;
  logs: Log[];
  customReports: CustomReport[];
  announcements: Announcement[];
  login: (u: string, p: string) => boolean;
  logout: () => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  addComment: (taskId: string, text: string) => void;
  getProjectTasks: (projectId: string) => Task[];
  addLog: (action: string, details: string, userOverride?: string) => void;
  addCustomReport: (report: CustomReport) => void;
  updateCustomReport: (report: CustomReport) => void;
  deleteCustomReport: (id: string) => void;
  addAnnouncement: (title: string, content: string) => void;
  deleteAnnouncement: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from local storage or use initial
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('tflow_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('tflow_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tflow_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
     const saved = localStorage.getItem('tflow_current_user');
     return saved ? JSON.parse(saved) : null;
  });

  const [logs, setLogs] = useState<Log[]>(() => {
    const saved = localStorage.getItem('tflow_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [customReports, setCustomReports] = useState<CustomReport[]>(() => {
    const saved = localStorage.getItem('tflow_custom_reports');
    return saved ? JSON.parse(saved) : [];
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('tflow_announcements');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence Effects
  useEffect(() => localStorage.setItem('tflow_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('tflow_projects', JSON.stringify(projects)), [projects]);
  useEffect(() => localStorage.setItem('tflow_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('tflow_logs', JSON.stringify(logs)), [logs]);
  useEffect(() => localStorage.setItem('tflow_custom_reports', JSON.stringify(customReports)), [customReports]);
  useEffect(() => localStorage.setItem('tflow_announcements', JSON.stringify(announcements)), [announcements]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('tflow_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('tflow_current_user');
  }, [currentUser]);

  const addLog = (action: string, details: string, userOverride?: string) => {
    const newLog: Log = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action,
      details,
      performedBy: userOverride || currentUser?.username || 'System'
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const login = (u: string, p: string) => {
    const found = users.find(user => user.username === u && user.password === p);
    if (found) {
      setCurrentUser(found);
      addLog('Login', `User logged in successfully`, found.username);
      return true;
    }
    addLog('Login Failed', `Failed login attempt for username: ${u}`, 'System');
    return false;
  };

  const logout = () => {
    addLog('Logout', `User ${currentUser?.username} logged out`);
    setCurrentUser(null);
  };

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
    addLog('User Created', `Created user ${user.username} as ${user.role}`);
  };
  
  const updateUser = (updatedUser: User) => {
    const oldUser = users.find(u => u.id === updatedUser.id);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    
    if (oldUser && oldUser.role !== updatedUser.role) {
        addLog('Role Updated', `Changed role for ${updatedUser.username} from ${oldUser.role} to ${updatedUser.role}`);
    } else {
        addLog('User Updated', `Updated profile for ${updatedUser.username}`);
    }
  };

  const deleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    addLog('User Deleted', `Deleted user ${user?.username || id}`);
  };

  const addProject = (project: Project) => {
    setProjects(prev => [...prev, project]);
    addLog('Project Created', `Created project ${project.name}`);
  };

  const updateProject = (updatedProject: Project) => {
    const oldProject = projects.find(p => p.id === updatedProject.id);
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    
    if (oldProject && JSON.stringify(oldProject.members) !== JSON.stringify(updatedProject.members)) {
        const added = updatedProject.members.filter(m => !oldProject.members.includes(m));
        const removed = oldProject.members.filter(m => !updatedProject.members.includes(m));
        let details = `Updated access for project ${updatedProject.name}.`;
        if (added.length) details += ` Added: ${added.length} users.`;
        if (removed.length) details += ` Removed: ${removed.length} users.`;
        addLog('Project Access Updated', details);
    } else if(oldProject && oldProject.description !== updatedProject.description) {
        addLog('Project Updated', `Updated description for project ${updatedProject.name}`);
    } else {
        addLog('Project Updated', `Updated details for project ${updatedProject.name}`);
    }
  };

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
    addLog('Task Created', `Created task ${task.title}`);
  };
  
  const updateTask = (updatedTask: Task) => {
    const oldTask = tasks.find(t => t.id === updatedTask.id);
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    
    if (oldTask) {
        const changes: string[] = [];
        if (oldTask.status !== updatedTask.status) changes.push(`Status: ${oldTask.status} -> ${updatedTask.status}`);
        if (oldTask.priority !== updatedTask.priority) changes.push(`Priority: ${oldTask.priority} -> ${updatedTask.priority}`);
        if (oldTask.title !== updatedTask.title) changes.push(`Title changed`);
        if (JSON.stringify(oldTask.assignedTo) !== JSON.stringify(updatedTask.assignedTo)) changes.push(`Assignees updated`);
        
        if (changes.length > 0) {
            addLog('Task Updated', `Task "${updatedTask.title}": ${changes.join(', ')}`);
        } else if (oldTask.description !== updatedTask.description) {
            addLog('Task Updated', `Task "${updatedTask.title}" description updated`);
        } else if (oldTask.startDate !== updatedTask.startDate || oldTask.endDate !== updatedTask.endDate) {
            addLog('Task Updated', `Task "${updatedTask.title}" dates updated`);
        }
    }
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    addLog('Task Deleted', `Deleted task ${task?.title || id}`);
  };

  const addComment = (taskId: string, text: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.fullName,
      text,
      createdAt: new Date().toISOString()
    };
    
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, comments: [...t.comments, newComment] };
      }
      return t;
    }));
    addLog('Comment Added', `Comment added to task ID ${taskId}`);
  };

  const addCustomReport = (report: CustomReport) => {
    setCustomReports(prev => [...prev, report]);
    addLog('Report Created', `Created custom report: ${report.title}`);
  };

  const updateCustomReport = (updatedReport: CustomReport) => {
    setCustomReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
  };

  const deleteCustomReport = (id: string) => {
    const report = customReports.find(r => r.id === id);
    setCustomReports(prev => prev.filter(r => r.id !== id));
    addLog('Report Deleted', `Deleted custom report: ${report?.title || id}`);
  };

  const addAnnouncement = (title: string, content: string) => {
    if (!currentUser) return;
    const newAnn: Announcement = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.username
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    addLog('News Posted', `Posted announcement: ${title}`);
  };

  const deleteAnnouncement = (id: string) => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      addLog('News Deleted', `Deleted announcement ID: ${id}`);
  };

  const getProjectTasks = (projectId: string) => tasks.filter(t => t.projectId === projectId);

  // Filter projects based on user role and membership
  const visibleProjects = React.useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === Role.ADMIN) return projects;
    return projects.filter(p => p.members.includes(currentUser.id));
  }, [projects, currentUser]);

  return (
    <StoreContext.Provider value={{
      users, projects, visibleProjects, tasks, currentUser, logs, customReports, announcements,
      login, logout, addUser, updateUser, deleteUser, 
      addProject, updateProject, addTask, updateTask, deleteTask, addComment, getProjectTasks, addLog,
      addCustomReport, updateCustomReport, deleteCustomReport,
      addAnnouncement, deleteAnnouncement
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};

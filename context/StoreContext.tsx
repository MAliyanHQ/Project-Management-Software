
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Project, Task, Role, Status, Priority, Comment, Log, CustomReport, Announcement } from '../types';

// SHA-256 Hashing Utility
async function hashPassword(password: string) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initial Mock Data with Hashed Passwords
// '1234' -> 03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4
// '123'  -> a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3
const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'Aliyan', password: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', role: Role.ADMIN, fullName: 'Aliyan (Admin)' },
  { id: 'u2', username: 'sarah', password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', role: Role.PROJECT_MANAGER, fullName: 'Sara Manager' },
  { id: 'u3', username: 'john', password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', role: Role.MEMBER, fullName: 'John Dev' },
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
  login: (u: string, p: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: User) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
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

  const login = async (u: string, p: string): Promise<boolean> => {
    const found = users.find(user => user.username === u);
    
    if (found && found.password) {
      const inputHash = await hashPassword(p);
      
      // 1. Check if password matches the hash (Secure)
      if (found.password === inputHash) {
        setCurrentUser(found);
        addLog('Login', `User logged in successfully`, found.username);
        return true;
      }
      
      // 2. Migration: Check if stored password is still plain text (Legacy Support)
      // If stored password matches input exactly (and isn't the hash), upgrade it.
      if (found.password === p) {
        const updatedUser = { ...found, password: inputHash };
        setUsers(prev => prev.map(user => user.id === found.id ? updatedUser : user));
        setCurrentUser(updatedUser);
        addLog('Security Upgrade', `Migrated password to hash for ${found.username}`, 'System');
        return true;
      }
    }
    
    addLog('Login Failed', `Failed login attempt for username: ${u}`, 'System');
    return false;
  };

  const logout = () => {
    addLog('Logout', `User ${currentUser?.username} logged out`);
    setCurrentUser(null);
  };

  const addUser = async (user: User) => {
    const hashedPassword = user.password ? await hashPassword(user.password) : '';
    const secureUser = { ...user, password: hashedPassword };
    
    setUsers(prev => [...prev, secureUser]);
    addLog('User Created', `Created user ${secureUser.username} as ${secureUser.role}`);
  };
  
  const updateUser = async (updatedUser: User) => {
    const oldUser = users.find(u => u.id === updatedUser.id);
    let finalUser = { ...updatedUser };

    // If password has changed, we assume it's a new plain text password that needs hashing
    // We verify it's not already the existing hash
    if (oldUser && updatedUser.password && oldUser.password !== updatedUser.password) {
        finalUser.password = await hashPassword(updatedUser.password);
        addLog('Password Changed', `Updated password for ${updatedUser.username}`);
    }

    setUsers(prev => prev.map(u => u.id === finalUser.id ? finalUser : u));
    
    if (oldUser && oldUser.role !== finalUser.role) {
        addLog('Role Updated', `Changed role for ${finalUser.username} from ${oldUser.role} to ${finalUser.role}`);
    } else if (oldUser && oldUser.password === finalUser.password) {
        // Only log general update if password didn't change (password log handled above)
        addLog('User Updated', `Updated profile for ${finalUser.username}`);
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

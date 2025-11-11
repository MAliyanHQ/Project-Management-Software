
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Role, User } from '../types';
import { UserPlus, Shield, Trash2, Eye, EyeOff, KeyRound, Save, X, FolderKanban, CheckSquare } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, projects, updateProject } = useStore();
  
  const [newUser, setNewUser] = useState({ username: '', password: '', role: Role.MEMBER });
  
  // State for viewing passwords (set of user IDs)
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  
  // State for editing password inline
  const [editingPassId, setEditingPassId] = useState<string | null>(null);
  const [tempPass, setTempPass] = useState('');

  // State for Project Assignment Modal
  const [managingUser, setManagingUser] = useState<User | null>(null);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if(newUser.username && newUser.password) {
        addUser({
            id: Date.now().toString(),
            username: newUser.username,
            password: newUser.password,
            role: newUser.role,
            fullName: newUser.username, // Auto-generated
        });
        setNewUser({ username: '', password: '', role: Role.MEMBER });
    }
  };

  const togglePasswordVisibility = (id: string) => {
    const newSet = new Set(visiblePasswords);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setVisiblePasswords(newSet);
  };

  const startEditPass = (user: User) => {
      setEditingPassId(user.id);
      setTempPass(user.password || '');
  };

  const savePass = (user: User) => {
      updateUser({ ...user, password: tempPass });
      setEditingPassId(null);
      setTempPass('');
  };

  const handleRoleChange = (userId: string, newRole: Role) => {
      const user = users.find(u => u.id === userId);
      if (user) {
          updateUser({ ...user, role: newRole });
      }
  };

  const handleDelete = (id: string) => {
      if (window.confirm("Are you sure you want to delete this user? This cannot be undone.")) {
          deleteUser(id);
      }
  };

  const toggleProjectAccess = (projectId: string, userId: string) => {
      const project = projects.find(p => p.id === projectId);
      if(!project) return;

      let newMembers;
      if(project.members.includes(userId)) {
          newMembers = project.members.filter(id => id !== userId);
      } else {
          newMembers = [...project.members, userId];
      }
      updateProject({ ...project, members: newMembers });
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Shield className="text-brand-600" /> User Management
            </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create User Form */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-fit">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                    <UserPlus size={20} /> Create New User
                </h3>
                <form onSubmit={handleAddUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                        <input 
                            required
                            className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                            value={newUser.username}
                            onChange={e => setNewUser({...newUser, username: e.target.value})}
                            placeholder="e.g. john"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                        <input 
                            type="password"
                            required
                            className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                            value={newUser.password}
                            onChange={e => setNewUser({...newUser, password: e.target.value})}
                            placeholder="••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                        <select 
                            className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                            value={newUser.role}
                            onChange={e => setNewUser({...newUser, role: e.target.value as Role})}
                        >
                            <option value={Role.MEMBER}>Member</option>
                            <option value={Role.PROJECT_MANAGER}>Project Manager</option>
                            <option value={Role.ADMIN}>Admin</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-brand-600 text-white py-2 rounded-lg hover:bg-brand-700 transition-colors font-medium shadow-lg shadow-brand-600/20">
                        Create User
                    </button>
                </form>
                
            </div>

            {/* User List */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">System Users</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950">
                            <tr>
                                <th className="px-4 py-3">User Details</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Password</th>
                                <th className="px-4 py-3">Project Access</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 font-bold">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <select 
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                                            disabled={user.id === 'u1'} // Super User protection for Aliyan
                                            title={user.id === 'u1' ? "Super User role cannot be changed" : "Change User Role"}
                                            className={`px-2 py-1 rounded-full text-xs font-bold border-none outline-none cursor-pointer appearance-none text-center transition-all
                                                ${user.role === Role.ADMIN ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 
                                                user.role === Role.PROJECT_MANAGER ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                                                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}
                                                ${user.id === 'u1' ? 'opacity-100 cursor-not-allowed' : 'hover:ring-1 hover:ring-brand-500 hover:bg-white dark:hover:bg-slate-700'}
                                            `}
                                        >
                                            <option value={Role.MEMBER}>Member</option>
                                            <option value={Role.PROJECT_MANAGER}>Project Manager</option>
                                            <option value={Role.ADMIN}>Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingPassId === user.id ? (
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    className="w-20 px-2 py-1 text-xs border rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                                                    value={tempPass}
                                                    onChange={e => setTempPass(e.target.value)}
                                                />
                                                <button onClick={() => savePass(user)} className="text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded p-1"><Save size={14}/></button>
                                                <button onClick={() => setEditingPassId(null)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded p-1"><X size={14}/></button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded w-[60px] text-center truncate">
                                                    {visiblePasswords.has(user.id) ? user.password : '••••••'}
                                                </div>
                                                <button onClick={() => togglePasswordVisibility(user.id)} className="text-slate-400 hover:text-brand-500">
                                                    {visiblePasswords.has(user.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                                <button onClick={() => startEditPass(user)} className="text-slate-400 hover:text-brand-500">
                                                    <KeyRound size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {user.role === Role.ADMIN ? (
                                            <span className="text-xs text-slate-400 italic flex items-center gap-1">
                                                Global Access
                                            </span>
                                        ) : (
                                            <button 
                                                onClick={() => setManagingUser(user)}
                                                className="text-xs flex items-center gap-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 px-2 py-1 rounded border border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
                                            >
                                                <FolderKanban size={12} />
                                                Assign Projects
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button 
                                            onClick={() => handleDelete(user.id)}
                                            className={`text-slate-400 transition-colors ${user.id === 'u1' ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-500'}`}
                                            disabled={user.id === 'u1'} 
                                            title={user.id === 'u1' ? "Super User cannot be deleted" : "Delete User"}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Project Assignment Modal */}
        {managingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Project Access Management</h3>
                            <p className="text-sm text-slate-500">Control which projects <span className="font-semibold text-brand-600">{managingUser.username}</span> can access.</p>
                        </div>
                        <button onClick={() => setManagingUser(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                    </div>

                    <div className="space-y-2 max-h-[60vh] overflow-y-auto my-4 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-lg">
                        {projects.length === 0 && <p className="text-center text-slate-500 py-4">No projects available.</p>}
                        {projects.map(project => {
                            const isMember = project.members.includes(managingUser.id);
                            return (
                                <div 
                                    key={project.id} 
                                    onClick={() => toggleProjectAccess(project.id, managingUser.id)}
                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                                        isMember 
                                        ? 'bg-white dark:bg-slate-800 border-brand-500 shadow-sm ring-1 ring-brand-500' 
                                        : 'bg-slate-100 dark:bg-slate-900 border-transparent opacity-70 hover:opacity-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                            isMember ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                                        }`}>
                                            {isMember && <CheckSquare size={12} />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-700 dark:text-slate-200">{project.name}</p>
                                            <p className="text-[10px] text-slate-400">{project.description}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${isMember ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
                                        {isMember ? 'Assigned' : 'Not Assigned'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end">
                        <button 
                            onClick={() => setManagingUser(null)}
                            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                        >
                            Save & Close
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

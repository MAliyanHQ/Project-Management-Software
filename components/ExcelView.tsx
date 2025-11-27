
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Task, Priority, Status, Role, CustomReport, CustomColumn, CustomRow, AccessLevel } from '../types';
import { Download, Save, Check, ChevronDown, Plus, Trash2, FilePlus, GripVertical, Share2, ShieldCheck, User as UserIcon, X, Eye } from 'lucide-react';

export const ExcelView: React.FC = () => {
  const { tasks, visibleProjects, users, updateTask, addLog, currentUser, customReports, addCustomReport, updateCustomReport, deleteCustomReport } = useStore();
  const [editCell, setEditCell] = useState<{id: string, field: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'OWNED' | 'SHARED'>('OWNED');
  const [sharingReport, setSharingReport] = useState<CustomReport | null>(null);
  
  const canCreateReports = currentUser?.role === Role.ADMIN || currentUser?.role === Role.PROJECT_MANAGER;

  // --- Standard Report Logic ---
  // Filter tasks to only show those from visible projects
  const visibleTasks = tasks.filter(t => visibleProjects.map(p => p.id).includes(t.projectId));

  // Flatten data for the table
  const tableData = visibleTasks.map(t => ({
    ...t,
    projectName: visibleProjects.find(p => p.id === t.projectId)?.name || 'Unknown',
    assigneeNames: t.assignedTo.map(uid => users.find(u => u.id === uid)?.username || 'Unknown').join(', '),
    commentCount: t.comments.length
  }));

  const handleExport = () => {
    const headers = ['Project', 'Task Title', 'Assignees', 'Status', 'Priority', 'Start Date', 'End Date', 'Comments Count'];
    const csvContent = [
      headers.join(','),
      ...tableData.map(row => [
        `"${row.projectName}"`,
        `"${row.title}"`,
        `"${row.assigneeNames}"`,
        row.status,
        row.priority,
        row.startDate,
        row.endDate,
        row.commentCount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'task_flow_report.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addLog('Report Exported', `Exported CSV report containing ${tableData.length} tasks`);
    }
  };

  const handleUpdateField = (taskId: string, field: keyof Task, value: any) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        updateTask({ ...task, [field]: value });
    }
    setEditCell(null);
  };

  const toggleAssignee = (taskId: string, userId: string) => {
      const task = tasks.find(t => t.id === taskId);
      if(!task) return;
      
      let newAssignees;
      if(task.assignedTo.includes(userId)) {
          newAssignees = task.assignedTo.filter(id => id !== userId);
      } else {
          newAssignees = [...task.assignedTo, userId];
      }
      updateTask({ ...task, assignedTo: newAssignees });
  };

  const renderCell = (task: any, field: string, value: string) => {
    // Handle Status Dropdown
    if (field === 'status') {
        return (
            <div className="relative group">
                <select 
                    value={task.status}
                    onChange={(e) => handleUpdateField(task.id, 'status', e.target.value)}
                    className={`appearance-none w-full px-3 py-1.5 rounded-md text-xs font-medium border border-transparent hover:border-slate-300 dark:hover:border-slate-600 outline-none cursor-pointer transition-colors pr-6
                        ${task.status === Status.DONE ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                          task.status === Status.IN_PROGRESS ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}
                >
                    {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
            </div>
        );
    }

    // Handle Priority Dropdown
    if (field === 'priority') {
        return (
            <div className="relative group">
                <select 
                    value={task.priority}
                    onChange={(e) => handleUpdateField(task.id, 'priority', e.target.value)}
                    className={`appearance-none w-full px-3 py-1.5 rounded-md text-xs font-medium border border-transparent hover:border-slate-300 dark:hover:border-slate-600 outline-none cursor-pointer transition-colors pr-6
                        ${task.priority === Priority.HIGH ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 
                          task.priority === Priority.MEDIUM ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}
                >
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
            </div>
        );
    }

    // Handle Assignees Custom Dropdown
    if (field === 'assigneeNames') {
        if (editCell?.id === task.id && editCell?.field === 'assignees') {
             return (
                 <div className="relative">
                     <div className="fixed inset-0 z-10" onClick={() => setEditCell(null)}></div>
                     <div className="absolute z-20 top-0 left-0 w-48 bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-slate-200 dark:border-slate-700 p-2 max-h-48 overflow-y-auto">
                         <p className="text-xs font-semibold text-slate-500 mb-2 px-2">Select Members</p>
                         {users.map(u => (
                             <div 
                                key={u.id} 
                                onClick={() => toggleAssignee(task.id, u.id)}
                                className="flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer rounded text-xs transition-colors"
                             >
                                 <span className="text-slate-700 dark:text-slate-200">{u.username}</span>
                                 {task.assignedTo.includes(u.id) && <Check size={14} className="text-brand-500"/>}
                             </div>
                         ))}
                     </div>
                 </div>
             )
        }
        return (
            <div 
                onClick={() => setEditCell({ id: task.id, field: 'assignees' })}
                className="cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1.5 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-center justify-between min-h-[28px]"
            >
                <span className="truncate max-w-[120px]">
                    {value || <span className="text-slate-400 italic">Unassigned</span>}
                </span>
                <ChevronDown size={12} className="opacity-0 group-hover:opacity-50 transition-opacity" />
            </div>
        );
    }

    // Default Text Edit
    if (editCell?.id === task.id && editCell?.field === field) {
      return (
        <div className="flex items-center">
            <input 
            autoFocus
            className="w-full p-1.5 bg-white dark:bg-slate-700 border border-brand-500 outline-none text-sm rounded shadow-lg z-10 dark:text-white"
            defaultValue={value}
            onBlur={(e) => handleUpdateField(task.id, field as keyof Task, e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUpdateField(task.id, field as keyof Task, (e.target as HTMLInputElement).value)}
            />
        </div>
      );
    }
    
    return (
      <div 
        onClick={() => setEditCell({ id: task.id, field })}
        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1.5 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-slate-600 dark:text-slate-300"
        title="Click to edit"
      >
        {value}
      </div>
    );
  };

  // --- Custom Report Logic ---

  const handleCreateCustomReport = () => {
    if (!currentUser) return;
    const newReport: CustomReport = {
      id: Date.now().toString(),
      title: 'New Custom Report',
      createdBy: currentUser.id,
      ownerId: currentUser.id, // Explicitly set current user as owner
      createdAt: new Date().toISOString(),
      columns: [
        { id: 'c1', name: 'Item Name' },
        { id: 'c2', name: 'Status' },
        { id: 'c3', name: 'Notes' }
      ],
      rows: [
        { id: 'r1', data: { 'c1': 'Example Item', 'c2': 'Draft', 'c3': '' } }
      ],
      sharedWith: []
    };
    addCustomReport(newReport);
  };

  // Helper: Get effective permission for current user
  const getPermission = (report: CustomReport): 'OWNER' | 'EDITOR' | 'VIEWER' => {
      if (!currentUser) return 'VIEWER';
      if (report.ownerId === currentUser.id) return 'OWNER';
      const share = report.sharedWith?.find(s => s.userId === currentUser.id);
      return share?.accessLevel || 'VIEWER';
  };

  const handleShareChange = (userId: string, value: string) => {
    if (!sharingReport || !currentUser) return;
    
    // Transfer Ownership
    if (value === 'OWNER') {
        if(confirm(`Transfer ownership of "${sharingReport.title}" to this user? The report will move to their "Owned Reports" list.`)) {
             const updated = {
                ...sharingReport,
                ownerId: userId,
                // Automatically add the previous owner (me) as an editor so I don't lose access
                sharedWith: [
                    ...sharingReport.sharedWith.filter(s => s.userId !== userId),
                    { userId: currentUser.id, accessLevel: 'EDITOR' as AccessLevel }
                ]
            };
            updateCustomReport(updated);
            setSharingReport(null); // Close modal as ownership transferred
            addLog('Report Ownership Transferred', `Transferred report "${updated.title}" to user ID ${userId}`);
        }
        return;
    }

    // Remove Access
    if (value === 'REMOVE') {
         const updated = {
            ...sharingReport,
            sharedWith: sharingReport.sharedWith.filter(s => s.userId !== userId)
        };
        setSharingReport(updated); // Update local modal state
        updateCustomReport(updated); // Update store
        return;
    }

    // Handle Viewer/Editor
    const currentShares = sharingReport.sharedWith.filter(s => s.userId !== userId);
    const updated = {
        ...sharingReport,
        sharedWith: [...currentShares, { userId, accessLevel: value as AccessLevel }]
    };
    setSharingReport(updated);
    updateCustomReport(updated);
  }

  const handleAddCustomColumn = (report: CustomReport) => {
    const newColId = `c${Date.now()}`;
    const updatedReport = {
      ...report,
      columns: [...report.columns, { id: newColId, name: 'New Column' }]
    };
    updateCustomReport(updatedReport);
  };

  const handleUpdateColumnName = (report: CustomReport, colId: string, newName: string) => {
    const updatedReport = {
      ...report,
      columns: report.columns.map(c => c.id === colId ? { ...c, name: newName } : c)
    };
    updateCustomReport(updatedReport);
  };

  const handleDeleteColumn = (report: CustomReport, colId: string) => {
    if(confirm("Delete this column and all its data?")) {
        const updatedReport = {
            ...report,
            columns: report.columns.filter(c => c.id !== colId),
            // Cleanup row data for this column
            rows: report.rows.map(r => {
                const newData = { ...r.data };
                delete newData[colId];
                return { ...r, data: newData };
            })
        };
        updateCustomReport(updatedReport);
    }
  };

  const handleAddCustomRow = (report: CustomReport) => {
    const newRowId = `r${Date.now()}`;
    const updatedReport = {
      ...report,
      rows: [...report.rows, { id: newRowId, data: {} }]
    };
    updateCustomReport(updatedReport);
  };

  const handleDeleteRow = (report: CustomReport, rowId: string) => {
      const updatedReport = {
          ...report,
          rows: report.rows.filter(r => r.id !== rowId)
      };
      updateCustomReport(updatedReport);
  };

  const handleUpdateCustomCell = (report: CustomReport, rowId: string, colId: string, value: string) => {
    const updatedReport = {
      ...report,
      rows: report.rows.map(r => {
        if (r.id === rowId) {
          return { ...r, data: { ...r.data, [colId]: value } };
        }
        return r;
      })
    };
    updateCustomReport(updatedReport);
  };

  const handleUpdateReportTitle = (report: CustomReport, title: string) => {
      updateCustomReport({ ...report, title });
  };

  // Filter reports based on active tab and ownership
  const displayedReports = customReports.filter(r => {
      if (activeTab === 'OWNED') {
          return r.ownerId === currentUser?.id;
      } else {
          // Shared reports are those where current user is in the sharedWith list
          return r.sharedWith?.some(s => s.userId === currentUser?.id);
      }
  });

  return (
    <div className="space-y-8 pb-20">
      {/* --- Standard Project Reports --- */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Project Reports</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Manage tasks in a spreadsheet view</p>
          </div>
          <div className="flex gap-2">
              <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium shadow-md shadow-brand-600/20"
              >
                  <Download size={16} />
                  Export CSV
              </button>
          </div>
        </div>
        {/* ... (Standard Report Table code remains same) ... */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3 min-w-[150px]">Project</th>
                  <th className="px-6 py-3 min-w-[200px]">Task</th>
                  <th className="px-6 py-3 min-w-[180px]">Assignees</th>
                  <th className="px-6 py-3 min-w-[140px]">Status</th>
                  <th className="px-6 py-3 min-w-[140px]">Priority</th>
                  <th className="px-6 py-3 min-w-[120px]">Start Date</th>
                  <th className="px-6 py-3 min-w-[120px]">End Date</th>
                  <th className="px-6 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {tableData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{row.projectName}</td>
                    <td className="px-6 py-4 font-medium">{renderCell(row, 'title', row.title)}</td>
                    <td className="px-6 py-4">
                        {renderCell(row, 'assigneeNames', row.assigneeNames)}
                    </td>
                    <td className="px-6 py-4">
                      {renderCell(row, 'status', row.status)}
                    </td>
                    <td className="px-6 py-4">
                      {renderCell(row, 'priority', row.priority)}
                    </td>
                    <td className="px-6 py-4">{renderCell(row, 'startDate', row.startDate)}</td>
                    <td className="px-6 py-4">{renderCell(row, 'endDate', row.endDate)}</td>
                    <td className="px-6 py-4 text-slate-500 italic">{row.commentCount} comments</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-slate-400 text-right">* Click on Task Name or Dates to edit. Use dropdowns for Status, Priority and Assignees.</p>
      </div>

      {/* Separator */}
      <hr className="border-slate-200 dark:border-slate-800" />

      {/* --- Custom Reports Section --- */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    Custom Reports
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Flexible data tables with custom columns.</p>
            </div>
            
            {canCreateReports && (
                <button 
                    onClick={handleCreateCustomReport}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                >
                    <FilePlus size={16} />
                    New Custom Report
                </button>
            )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
                onClick={() => setActiveTab('OWNED')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'OWNED'
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
                My Owned Reports
            </button>
            <button
                onClick={() => setActiveTab('SHARED')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'SHARED'
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
                Shared with Me
            </button>
        </div>

        {displayedReports.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <FilePlus className="text-slate-400" size={24} />
                </div>
                <h3 className="text-slate-700 dark:text-slate-300 font-medium">No Reports Found</h3>
                <p className="text-slate-500 text-sm mt-1">
                    {activeTab === 'OWNED' ? "You haven't created any custom reports yet." : "No reports have been shared with you."}
                </p>
            </div>
        ) : (
            <div className="space-y-8">
                {displayedReports.map(report => {
                    const permission = getPermission(report);
                    const canEditStructure = permission === 'OWNER' || permission === 'EDITOR';
                    const canEditData = permission === 'OWNER' || permission === 'EDITOR';
                    const isOwner = permission === 'OWNER';

                    return (
                        <div key={report.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                            {/* Report Header */}
                            <div className="bg-slate-50 dark:bg-slate-950 p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-3 flex-1">
                                    {isOwner ? (
                                        <input 
                                            className="text-lg font-bold bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-700 rounded px-2 py-1 text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-all w-full max-w-md"
                                            value={report.title}
                                            onChange={(e) => handleUpdateReportTitle(report, e.target.value)}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white px-2 py-1">{report.title}</h3>
                                            <span className="text-[10px] uppercase bg-slate-200 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">{permission}</span>
                                        </div>
                                    )}
                                    <span className="text-xs text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full whitespace-nowrap hidden sm:inline-block">
                                        {report.rows.length} rows
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isOwner && (
                                        <button 
                                            onClick={() => setSharingReport(report)}
                                            className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 px-3 py-1.5 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                                        >
                                            <Share2 size={14} /> Share
                                        </button>
                                    )}
                                    
                                    {canEditStructure && (
                                        <button 
                                            onClick={() => handleAddCustomColumn(report)}
                                            className="flex items-center gap-1 text-xs bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 px-3 py-1.5 rounded-md hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
                                        >
                                            <Plus size={14} /> Col
                                        </button>
                                    )}
                                    
                                    {isOwner && (
                                        <button 
                                            onClick={() => deleteCustomReport(report.id)}
                                            className="text-slate-400 hover:text-red-500 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            title="Delete Report"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Report Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="px-4 py-3 w-12 text-center text-slate-400 font-light">#</th>
                                            {report.columns.map(col => (
                                                <th key={col.id} className="px-4 py-3 min-w-[150px] group relative border-r border-slate-100 dark:border-slate-800 last:border-0">
                                                    <div className="flex items-center justify-between">
                                                        {canEditStructure ? (
                                                            <input 
                                                                className="bg-transparent w-full outline-none text-xs font-bold text-slate-500 uppercase placeholder:text-slate-300"
                                                                value={col.name}
                                                                onChange={(e) => handleUpdateColumnName(report, col.id, e.target.value)}
                                                            />
                                                        ) : (
                                                            <span>{col.name}</span>
                                                        )}
                                                        {canEditStructure && (
                                                            <button 
                                                                onClick={() => handleDeleteColumn(report, col.id)}
                                                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </th>
                                            ))}
                                            {canEditStructure && <th className="w-10"></th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {report.rows.map((row, index) => (
                                            <tr key={row.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-4 py-2 text-center text-xs text-slate-400">{index + 1}</td>
                                                {report.columns.map(col => (
                                                    <td key={col.id} className="px-4 py-2 border-r border-slate-50 dark:border-slate-800/50 last:border-0 p-0">
                                                        {canEditData ? (
                                                            <input 
                                                                className="w-full bg-transparent outline-none py-1 px-0 text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:text-brand-600 dark:focus:text-brand-400"
                                                                placeholder="..."
                                                                value={row.data[col.id] || ''}
                                                                onChange={(e) => handleUpdateCustomCell(report, row.id, col.id, e.target.value)}
                                                            />
                                                        ) : (
                                                            <span className="text-slate-700 dark:text-slate-300 block py-1">{row.data[col.id] || '-'}</span>
                                                        )}
                                                    </td>
                                                ))}
                                                {canEditStructure && (
                                                    <td className="px-2 text-center">
                                                        <button 
                                                            onClick={() => handleDeleteRow(report, row.id)}
                                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {canEditStructure && (
                                <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <button 
                                        onClick={() => handleAddCustomRow(report)}
                                        className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:border-brand-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                                    >
                                        <Plus size={16} /> Add Row
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      {/* Share Modal */}
      {sharingReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                             <Share2 size={20} className="text-brand-500"/> Share Report
                        </h3>
                        <p className="text-sm text-slate-500">Manage access for "{sharingReport.title}"</p>
                      </div>
                      <button onClick={() => setSharingReport(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  </div>
                  
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                      {users.filter(u => u.id !== currentUser?.id).map(user => {
                          // Determine current access level
                          const share = sharingReport.sharedWith?.find(s => s.userId === user.id);
                          const currentAccess = share ? share.accessLevel : 'NONE';
                          
                          return (
                              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                                  <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-xs">
                                          {user.username.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user.username}</p>
                                          <p className="text-[10px] text-slate-500">{user.role}</p>
                                      </div>
                                  </div>
                                  
                                  <select 
                                      value={currentAccess}
                                      onChange={(e) => handleShareChange(user.id, e.target.value)}
                                      className={`text-xs font-semibold rounded px-2 py-1 outline-none border transition-colors cursor-pointer
                                        ${currentAccess === 'NONE' ? 'text-slate-500 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900' : ''}
                                        ${currentAccess === 'VIEWER' ? 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800' : ''}
                                        ${currentAccess === 'EDITOR' ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800' : ''}
                                      `}
                                  >
                                      <option value="NONE">No Access</option>
                                      <option value="VIEWER">Viewer</option>
                                      <option value="EDITOR">Editor</option>
                                      <option disabled>──────────</option>
                                      <option value="OWNER">Make Owner (Admin)</option>
                                  </select>
                              </div>
                          );
                      })}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <button 
                        onClick={() => setSharingReport(null)}
                        className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium text-sm"
                      >
                        Done
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
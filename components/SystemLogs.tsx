import React from 'react';
import { useStore } from '../context/StoreContext';
import { FileText, Clock } from 'lucide-react';

export const SystemLogs: React.FC = () => {
  const { logs } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="text-brand-600" /> System Logs
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
              <Clock size={20}/> Audit Trail
          </h3>
          <div className="overflow-x-auto max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                <table className="w-full text-sm text-left relative">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950 sticky top-0 z-10 shadow-sm">
                      <tr>
                          <th className="px-4 py-3 bg-slate-50 dark:bg-slate-950">Timestamp</th>
                          <th className="px-4 py-3 bg-slate-50 dark:bg-slate-950">Action</th>
                          <th className="px-4 py-3 bg-slate-50 dark:bg-slate-950">Performed By</th>
                          <th className="px-4 py-3 bg-slate-50 dark:bg-slate-950">Details</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {logs.length === 0 ? (
                          <tr><td colSpan={4} className="text-center py-8 text-slate-500">No logs recorded yet.</td></tr>
                      ) : (
                          logs.map(log => (
                              <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                  <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono text-xs">
                                      {new Date(log.timestamp).toLocaleString()}
                                  </td>
                                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                          log.action.includes('Delete') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                          log.action.includes('Create') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                          log.action.includes('Login') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                      }`}>
                                          {log.action}
                                      </span>
                                  </td>
                                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-semibold text-xs">{log.performedBy}</td>
                                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{log.details}</td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};
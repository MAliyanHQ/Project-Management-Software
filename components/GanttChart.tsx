import React from 'react';
import { useStore } from '../context/StoreContext';
import { Priority } from '../types';

export const GanttChart: React.FC = () => {
  const { tasks, projects } = useStore();
  
  // Determine timeline range
  const allDates = tasks.flatMap(t => [new Date(t.startDate).getTime(), new Date(t.endDate).getTime()]);
  const minDate = allDates.length ? Math.min(...allDates) : Date.now();
  const maxDate = allDates.length ? Math.max(...allDates) : Date.now() + 86400000 * 7; // +7 days default

  // Buffer
  const startTimestamp = minDate - 86400000 * 2; 
  const endTimestamp = maxDate + 86400000 * 5;
  const totalDuration = endTimestamp - startTimestamp;

  const getLeftPos = (dateStr: string) => {
    const current = new Date(dateStr).getTime();
    return ((current - startTimestamp) / totalDuration) * 100;
  };

  const getWidth = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const w = ((e - s) / totalDuration) * 100;
    return w < 1 ? 1 : w; // Minimum width
  };

  const getDaysArray = () => {
    const days = [];
    let current = startTimestamp;
    while (current <= endTimestamp) {
      days.push(new Date(current));
      current += 86400000;
    }
    return days;
  };

  const days = getDaysArray();

  return (
    <div className="space-y-4">
       <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Project Timeline</h2>
       
       <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto">
         <div className="min-w-[800px] p-6">
            {/* Timeline Header */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 mb-4 pb-2">
                <div className="w-48 shrink-0 font-semibold text-slate-600 dark:text-slate-300">Task</div>
                <div className="flex-1 flex relative h-6">
                   {days.filter((_, i) => i % 2 === 0).map((day, i) => ( // Show every other day to save space
                     <div 
                        key={i} 
                        className="absolute text-xs text-slate-400 transform -translate-x-1/2"
                        style={{ left: `${((day.getTime() - startTimestamp) / totalDuration) * 100}%` }}
                     >
                       {day.getDate()}/{day.getMonth() + 1}
                     </div>
                   ))}
                </div>
            </div>

            {/* Tasks */}
            <div className="space-y-4">
                {projects.map(project => {
                    const projectTasks = tasks.filter(t => t.projectId === project.id);
                    if(projectTasks.length === 0) return null;

                    return (
                        <div key={project.id} className="space-y-2">
                            <div className="font-medium text-sm text-brand-600 dark:text-brand-400">{project.name}</div>
                            {projectTasks.map(task => (
                                <div key={task.id} className="flex items-center group">
                                    <div className="w-48 shrink-0 text-sm text-slate-700 dark:text-slate-300 truncate pr-4">{task.title}</div>
                                    <div className="flex-1 relative h-8 bg-slate-50 dark:bg-slate-800/50 rounded">
                                         {/* Grid lines */}
                                         {days.filter((_,i) => i % 5 === 0).map((day,i) => (
                                            <div 
                                                key={i}
                                                className="absolute top-0 bottom-0 border-l border-slate-200 dark:border-slate-700/50 border-dashed"
                                                style={{ left: `${((day.getTime() - startTimestamp) / totalDuration) * 100}%` }}
                                            />
                                         ))}
                                         
                                         {/* Bar */}
                                         <div
                                            className={`absolute h-6 top-1 rounded-md shadow-sm transition-all hover:brightness-110 cursor-pointer
                                                ${task.priority === Priority.HIGH ? 'bg-rose-500' : task.priority === Priority.MEDIUM ? 'bg-amber-500' : 'bg-emerald-500'}
                                            `}
                                            style={{
                                                left: `${getLeftPos(task.startDate)}%`,
                                                width: `${getWidth(task.startDate, task.endDate)}%`
                                            }}
                                            title={`${task.title}: ${task.startDate} - ${task.endDate}`}
                                         >
                                            <div className="px-2 text-xs text-white font-medium truncate leading-6">
                                                {task.status}
                                            </div>
                                         </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
         </div>
       </div>
    </div>
  );
};

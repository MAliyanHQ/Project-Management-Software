import React from 'react';
import { useStore } from '../context/StoreContext';
import { Priority } from '../types';

// Helper function to parse 'YYYY-MM-DD' strings into local Date objects
// This avoids timezone issues where `new Date('2023-10-01')` might result in
// the previous day depending on the user's timezone.
const parseLocalDate = (dateStr: string): Date => {
  if (!dateStr) return new Date(); // Fallback for undefined dates
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};


export const GanttChart: React.FC = () => {
  const { tasks, visibleProjects } = useStore();
  
  // Filter tasks to only those in visible projects and with valid dates for scale calculation
  const visibleProjectIds = visibleProjects.map(p => p.id);
  const visibleTasks = tasks.filter(t => visibleProjectIds.includes(t.projectId) && t.startDate && t.endDate);
  
  // Determine timeline range based on visible tasks only
  const allDates = visibleTasks.flatMap(t => [parseLocalDate(t.startDate).getTime(), parseLocalDate(t.endDate).getTime()]);
  const minDate = allDates.length ? Math.min(...allDates) : Date.now();
  const maxDate = allDates.length ? Math.max(...allDates) : Date.now() + 86400000 * 7; // +7 days default

  // Buffer and align to the start of the day
  const startTimestamp = new Date(new Date(minDate).toDateString()).getTime() - 86400000 * 2; 
  const endTimestamp = new Date(new Date(maxDate).toDateString()).getTime() + 86400000 * 5;
  const totalDuration = endTimestamp - startTimestamp;

  const getLeftPos = (dateStr: string) => {
    const current = parseLocalDate(dateStr).getTime();
    return ((current - startTimestamp) / totalDuration) * 100;
  };

  const getWidth = (start: string, end: string) => {
    const s = parseLocalDate(start).getTime();
    const e = parseLocalDate(end).getTime();
    // Add one day's worth of ms to make the end date inclusive
    const duration = e - s + 86400000;
    const w = (duration / totalDuration) * 100;
    // Minimum width of ~half a day for visibility
    const minWidth = (86400000 / 2 / totalDuration) * 100; 
    return w < minWidth ? minWidth : w;
  };

  const getDaysArray = () => {
    const days = [];
    let current = startTimestamp;
    while (current <= endTimestamp) {
      days.push(new Date(current));
      current += 86400000; // Add one day
    }
    return days;
  };

  const days = getDaysArray();

  return (
    <div className="space-y-4">
       <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Project Timeline</h2>
       <p className="text-slate-500 dark:text-slate-400 text-sm">A visual overview of task schedules across your projects.</p>
       
       <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto">
         <div className="min-w-[1200px] p-6">
            {/* Timeline Header */}
            <div className="flex border-b-2 border-slate-100 dark:border-slate-800 mb-4 pb-2">
                <div className="w-56 shrink-0 font-semibold text-slate-600 dark:text-slate-300">Task</div>
                <div className="flex-1 flex relative h-6">
                   {days.filter((_, i) => i % 2 === 0).map((day, i) => ( // Show every other day to save space
                     <div 
                        key={i} 
                        className="absolute text-[10px] text-slate-400 transform -translate-x-1/2"
                        style={{ left: `${((day.getTime() - startTimestamp) / totalDuration) * 100}%` }}
                     >
                       {day.getDate()}/{day.getMonth() + 1}
                     </div>
                   ))}
                </div>
            </div>

            {/* Tasks */}
            <div className="space-y-8">
                {visibleProjects.length === 0 && (
                    <div className="text-center text-slate-500 py-8 italic">
                        No projects available.
                    </div>
                )}
                {visibleProjects.map(project => {
                    const projectTasks = visibleTasks.filter(t => t.projectId === project.id);
                    
                    return (
                        <div key={project.id} className="space-y-2 border-b border-slate-50 dark:border-slate-800 pb-4 last:border-0">
                            <div className="font-bold text-md text-brand-600 dark:text-brand-400 sticky left-0">{project.name}</div>
                            {projectTasks.length === 0 ? (
                                <div className="text-xs text-slate-400 italic pl-2">No tasks scheduled.</div>
                            ) : (
                                projectTasks.map(task => (
                                    <div key={task.id} className="flex items-center group">
                                        <div className="w-56 shrink-0 text-sm text-slate-700 dark:text-slate-300 truncate pr-4" title={task.title}>{task.title}</div>
                                        <div className="flex-1 relative h-8 bg-slate-50 dark:bg-slate-800/50 rounded">
                                             {/* Weekend Highlighting & Grid Lines */}
                                             {days.map((day, i) => {
                                                const isWeekend = day.getDay() === 0 || day.getDay() === 6; // Sunday=0, Saturday=6
                                                return (
                                                  <div 
                                                      key={i}
                                                      className={`absolute top-0 bottom-0 border-l ${isWeekend ? 'bg-slate-100 dark:bg-slate-800/30' : 'border-slate-200/70 dark:border-slate-700/50'}`}
                                                      style={{ 
                                                          left: `${((day.getTime() - startTimestamp) / totalDuration) * 100}%`,
                                                          width: `${(86400000 / totalDuration) * 100}%`
                                                      }}
                                                  />
                                                );
                                             })}
                                             
                                             {/* Bar */}
                                             <div
                                                className={`absolute h-6 top-1 rounded-md shadow-sm transition-all hover:brightness-110 cursor-pointer z-10 flex items-center
                                                    ${task.priority === Priority.HIGH ? 'bg-gradient-to-r from-rose-500 to-red-600' : task.priority === Priority.MEDIUM ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-green-500'}
                                                `}
                                                style={{
                                                    left: `${getLeftPos(task.startDate)}%`,
                                                    width: `${getWidth(task.startDate, task.endDate)}%`
                                                }}
                                                title={`${task.title}: ${task.startDate} to ${task.endDate} (${task.status})`}
                                             >
                                                <div className="px-2 text-xs text-white font-medium truncate leading-6">
                                                    {task.title}
                                                </div>
                                             </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    );
                })}
            </div>
         </div>
       </div>
    </div>
  );
};

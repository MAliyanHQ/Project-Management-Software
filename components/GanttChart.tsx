import React from 'react';
import { useStore } from '../context/StoreContext';
import { Priority, Project, Task } from '../types';
import { CalendarOff } from 'lucide-react';

// Helper function to parse 'YYYY-MM-DD' strings into local Date objects
const parseLocalDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

interface ProjectGanttCardProps {
  project: Project;
  tasks: Task[];
}

const ProjectGanttCard: React.FC<ProjectGanttCardProps> = ({ project, tasks }) => {
  // 1. Filter tasks for this project and ensure they have valid dates
  const projectTasks = tasks.filter(t => 
    t.projectId === project.id && t.startDate && t.endDate
  ).sort((a, b) => a.startDate.localeCompare(b.startDate));

  // 2. Handle empty state
  if (projectTasks.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{project.name}</h3>
        <p className="text-xs text-slate-500 mb-4">{project.description}</p>
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-3">
            <CalendarOff className="text-slate-400" size={24} />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">No scheduled tasks available for this timeline.</p>
      </div>
    );
  }

  // 3. Calculate Scale specifically for this project
  const allDates = projectTasks.flatMap(t => [parseLocalDate(t.startDate).getTime(), parseLocalDate(t.endDate).getTime()]);
  const minDate = Math.min(...allDates);
  const maxDate = Math.max(...allDates);

  // Buffer: 2 days before start, 5 days after end for better visuals
  const startTimestamp = new Date(new Date(minDate).toDateString()).getTime() - 86400000 * 2; 
  const endTimestamp = new Date(new Date(maxDate).toDateString()).getTime() + 86400000 * 5;
  const totalDuration = endTimestamp - startTimestamp;

  // 4. Generate Days Array
  const days = [];
  let current = startTimestamp;
  while (current <= endTimestamp) {
    days.push(new Date(current));
    current += 86400000; 
  }

  // 5. Positioning Helpers
  const getLeftPos = (dateStr: string) => {
    const current = parseLocalDate(dateStr).getTime();
    return ((current - startTimestamp) / totalDuration) * 100;
  };

  const getWidth = (start: string, end: string) => {
    const s = parseLocalDate(start).getTime();
    const e = parseLocalDate(end).getTime();
    const duration = e - s + 86400000; // Inclusive of end date
    const w = (duration / totalDuration) * 100;
    const minWidth = (86400000 / 2 / totalDuration) * 100; // Min visual width
    return w < minWidth ? minWidth : w;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-between items-center">
         <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{project.name}</h3>
            <p className="text-xs text-slate-500">{project.description}</p>
         </div>
         <span className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-slate-500">
             {projectTasks.length} Tasks
         </span>
      </div>
      
      <div className="p-6 overflow-x-auto">
         <div className="min-w-[800px]">
            {/* Timeline Header */}
            <div className="flex border-b-2 border-slate-100 dark:border-slate-800 mb-4 pb-2">
                <div className="w-56 shrink-0 font-semibold text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wider">Task</div>
                <div className="flex-1 flex relative h-6">
                   {days.filter((_, i) => i % 2 === 0).map((day, i) => ( 
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

            {/* Tasks Rows */}
            <div className="space-y-3">
                {projectTasks.map(task => (
                    <div key={task.id} className="flex items-center group relative hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded py-1 transition-colors">
                        <div className="w-56 shrink-0 text-sm font-medium text-slate-700 dark:text-slate-300 truncate pr-4 pl-2" title={task.title}>
                            {task.title}
                        </div>
                        <div className="flex-1 relative h-8">
                             {/* Grid Lines */}
                             {days.map((day, i) => {
                                const isWeekend = day.getDay() === 0 || day.getDay() === 6; 
                                return (
                                  <div 
                                      key={i}
                                      className={`absolute top-0 bottom-0 border-l ${isWeekend ? 'bg-slate-100/50 dark:bg-slate-800/20' : 'border-slate-100 dark:border-slate-800'}`}
                                      style={{ 
                                          left: `${((day.getTime() - startTimestamp) / totalDuration) * 100}%`,
                                          width: `${(86400000 / totalDuration) * 100}%`
                                      }}
                                  />
                                );
                             })}
                             
                             {/* Task Bar */}
                             <div
                                className={`absolute h-6 top-1 rounded shadow-sm transition-all hover:scale-[1.01] cursor-pointer z-10 flex items-center group/bar
                                    ${task.priority === Priority.HIGH ? 'bg-rose-500 hover:bg-rose-600' : 
                                      task.priority === Priority.MEDIUM ? 'bg-amber-500 hover:bg-amber-600' : 
                                      'bg-emerald-500 hover:bg-emerald-600'}
                                `}
                                style={{
                                    left: `${getLeftPos(task.startDate)}%`,
                                    width: `${getWidth(task.startDate, task.endDate)}%`
                                }}
                             >
                                <div className="px-2 text-[10px] text-white font-medium truncate leading-6 opacity-90 w-full">
                                    {task.title}
                                </div>
                                
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/bar:block bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-20 shadow-lg">
                                    {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                                </div>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export const GanttChart: React.FC = () => {
  const { tasks, visibleProjects } = useStore();

  return (
    <div className="space-y-6 pb-20">
       <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Project Timeline</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Visual schedules for your active projects.</p>
       </div>
       
       <div className="grid grid-cols-1 gap-8">
            {visibleProjects.length === 0 && (
                <div className="text-center text-slate-500 py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    No active projects to display.
                </div>
            )}
            
            {visibleProjects.map(project => (
                <ProjectGanttCard 
                    key={project.id} 
                    project={project} 
                    tasks={tasks} 
                />
            ))}
       </div>
    </div>
  );
};

import {
  CalendarClock,
  Target,
  TrendingUp,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react';
import type { StudyTask } from '@/types';
import { formatDeadline, deadlineColor, formatDate } from '@/utils/date';

interface ContextPanelProps {
  tasks: StudyTask[];
  onNavigate: (view: 'plan' | 'ask') => void;
}

export function ContextPanel({ tasks, onNavigate }: ContextPanelProps) {
  const incomplete = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);
  const completionRate =
    tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;

  const todayTasks = incomplete
    .filter((t) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(t.deadline);
      due.setHours(0, 0, 0, 0);
      return due.getTime() <= today.getTime() + 2 * 86400000;
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  const nextDeadline = incomplete
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-navy-100 bg-cream-50 p-4 xl:flex">
      {/* Progress */}
      <div className="card p-4">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp size={18} className="text-lavender-500" />
          <h3 className="text-sm font-semibold text-navy-800">Study Progress</h3>
        </div>
        <div className="mb-2 flex items-end justify-between">
          <span className="text-2xl font-bold text-navy-800">{completionRate}%</span>
          <span className="text-xs text-navy-400">
            {completed.length} of {tasks.length} done
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-navy-100">
          <div
            className="h-full rounded-full bg-lavender-400 transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Target size={18} className="text-lavender-500" />
          <h3 className="text-sm font-semibold text-navy-800">Today &amp; Tomorrow</h3>
        </div>
        {todayTasks.length === 0 ? (
          <p className="text-sm text-navy-400">No urgent tasks. Great job!</p>
        ) : (
          <ul className="space-y-2.5">
            {todayTasks.map((task) => (
              <li key={task.id} className="flex items-start gap-2">
                <Circle size={16} className="mt-0.5 shrink-0 text-navy-300" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-navy-700">{task.title}</p>
                  <p className={`text-xs ${deadlineColor(task.deadline)}`}>
                    {formatDeadline(task.deadline)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {todayTasks.length > 0 && (
          <button
            onClick={() => onNavigate('plan')}
            className="btn-ghost mt-3 w-full text-xs"
          >
            View full study plan
          </button>
        )}
      </div>

      {/* Next Deadline */}
      <div className="card p-4">
        <div className="mb-3 flex items-center gap-2">
          <CalendarClock size={18} className="text-lavender-500" />
          <h3 className="text-sm font-semibold text-navy-800">Next Deadline</h3>
        </div>
        {nextDeadline ? (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className={`badge ${
                nextDeadline.priority === 'high' ? 'badge-high' :
                nextDeadline.priority === 'medium' ? 'badge-medium' : 'badge-low'
              }`}>
                {nextDeadline.priority}
              </span>
              <span className={`text-xs font-medium ${deadlineColor(nextDeadline.deadline)}`}>
                {formatDeadline(nextDeadline.deadline)}
              </span>
            </div>
            <p className="text-sm text-navy-700">{nextDeadline.title}</p>
            <p className="mt-1 text-xs text-navy-400">
              {nextDeadline.subject} &middot; Due {formatDate(nextDeadline.deadline)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-navy-400">All tasks complete!</p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="card p-4">
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-lavender-500" />
          <h3 className="text-sm font-semibold text-navy-800">Overview</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-navy-500">Incomplete</span>
            <span className="font-medium text-navy-800">{incomplete.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-navy-500">Completed</span>
            <span className="font-medium text-accent-green">{completed.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-navy-500">High priority</span>
            <span className="font-medium text-accent-red">
              {incomplete.filter((t) => t.priority === 'high').length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-navy-500">Total study time</span>
            <span className="flex items-center gap-1 font-medium text-navy-800">
              <Clock size={14} />
              {incomplete.reduce((sum, t) => sum + t.estimatedMinutes, 0)} min
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

import { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Sparkles,
  AlertCircle,
  Info,
} from 'lucide-react';
import type { StudyTask, StudySchedule } from '@/types';
import { generateStudyPlan } from '@/services/api';

interface PlannerViewProps {
  tasks: StudyTask[];
  isDemoMode: boolean;
}

export function PlannerView({ tasks, isDemoMode }: PlannerViewProps) {
  const [availableMinutes, setAvailableMinutes] = useState(120);
  const [schedule, setSchedule] = useState<StudySchedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduleDemo, setIsScheduleDemo] = useState(false);

  const incomplete = tasks.filter((t) => !t.completed);

  const handleGenerate = async () => {
    if (incomplete.length === 0) return;
    setIsLoading(true);
    try {
      const { schedule: result, isDemo } = await generateStudyPlan(
        incomplete,
        availableMinutes,
      );
      setSchedule(result);
      setIsScheduleDemo(isDemo);
    } catch {
      setSchedule(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Group blocks by day
  const blocksByDay: Record<string, typeof schedule extends null ? never : StudySchedule['blocks']> = {};
  if (schedule) {
    for (const block of schedule.blocks) {
      if (!blocksByDay[block.day]) blocksByDay[block.day] = [];
      blocksByDay[block.day].push(block);
    }
  }

  const priorityColor = (p: string) => {
    if (p === 'high') return 'border-l-accent-red';
    if (p === 'medium') return 'border-l-accent-amber';
    return 'border-l-accent-green';
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-navy-800">My Study Plan</h2>
          <p className="text-sm text-navy-400">
            Generate a personalized schedule from your tasks and available time
          </p>
        </div>

        {/* Generator */}
        <div className="card mb-6 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <label className="label-text" htmlFor="available-time">
                Available study time per day (minutes)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="available-time"
                  type="range"
                  min={30}
                  max={300}
                  step={15}
                  value={availableMinutes}
                  onChange={(e) => setAvailableMinutes(Number(e.target.value))}
                  className="flex-1 accent-lavender-500"
                />
                <span className="w-20 text-right text-sm font-medium text-navy-700">
                  {availableMinutes} min
                </span>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={incomplete.length === 0 || isLoading}
              className="btn-accent"
            >
              <Sparkles size={18} />
              {isLoading ? 'Generating...' : 'Generate Schedule'}
            </button>
          </div>

          {incomplete.length === 0 && (
            <p className="mt-3 text-sm text-navy-400">
              No incomplete tasks to schedule. Add tasks in the Tasks section first.
            </p>
          )}

          {isScheduleDemo && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-lavender-50 px-3 py-2 text-xs text-lavender-700">
              <Info size={14} />
              This schedule was generated locally in demo mode. Connecting an AI backend will provide smarter scheduling.
            </div>
          )}
        </div>

        {/* Schedule */}
        {schedule && (
          <div className="animate-slide-up space-y-5">
            {/* Explanation */}
            <div className="card p-5">
              <div className="mb-2 flex items-center gap-2">
                <Info size={16} className="text-lavender-500" />
                <h3 className="text-sm font-semibold text-navy-800">Why this schedule?</h3>
              </div>
              <p className="text-sm leading-relaxed text-navy-600">
                {schedule.explanation}
              </p>
            </div>

            {/* Schedule blocks */}
            <div className="space-y-4">
              {Object.entries(blocksByDay).map(([day, blocks]) => (
                <div key={day}>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-navy-700">
                    <CalendarDays size={16} className="text-lavender-500" />
                    {day}
                    <span className="text-xs font-normal text-navy-400">
                      ({blocks.reduce((s, b) => s + b.minutes, 0)} min total)
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {blocks.map((block, i) => (
                      <div
                        key={i}
                        className={`card flex items-center gap-3 border-l-4 p-3.5 ${priorityColor(block.priority)}`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-100 text-navy-600">
                          <Clock size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-navy-800">{block.taskTitle}</p>
                          <p className="text-xs text-navy-400">
                            {block.subject} &middot; {block.minutes} min &middot; {block.priority} priority
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!schedule && !isLoading && (
          <div className="card p-12 text-center">
            <CalendarDays size={36} className="mx-auto mb-3 text-navy-200" />
            <h3 className="text-sm font-medium text-navy-700">No schedule generated yet</h3>
            <p className="mt-1 text-sm text-navy-400">
              Set your available time and click "Generate Schedule" to create a study plan.
            </p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="card flex items-center justify-center gap-3 p-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-lavender-200 border-t-lavender-500" />
            <span className="text-sm text-navy-500">Generating your study schedule...</span>
          </div>
        )}

        {/* Current tasks summary */}
        <div className="mt-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy-700">
            <AlertCircle size={16} />
            Tasks being scheduled ({incomplete.length})
          </h3>
          <div className="space-y-2">
            {incomplete
              .sort((a, b) => {
                const order = { high: 0, medium: 1, low: 2 };
                if (order[a.priority] !== order[b.priority]) {
                  return order[a.priority] - order[b.priority];
                }
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
              })
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border border-navy-100 bg-white px-3.5 py-2.5 text-sm"
                >
                  <div>
                    <span className="font-medium text-navy-700">{task.title}</span>
                    <span className="ml-2 text-xs text-navy-400">{task.subject}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-navy-400">
                    <span>{task.estimatedMinutes} min</span>
                    <span className={`badge ${
                      task.priority === 'high' ? 'badge-high' :
                      task.priority === 'medium' ? 'badge-medium' : 'badge-low'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

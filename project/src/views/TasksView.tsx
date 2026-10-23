import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  CalendarDays,
  Clock,
  Flag,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import type { StudyTask, Priority } from '@/types';
import { storage, generateId } from '@/services/storage';
import { formatDate, formatDeadline, deadlineColor, daysUntil } from '@/utils/date';

interface TasksViewProps {
  tasks: StudyTask[];
  setTasks: (tasks: StudyTask[]) => void;
}

export function TasksView({ tasks, setTasks }: TasksViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    deadline: '',
    priority: 'medium' as Priority,
    estimatedMinutes: 60,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const incomplete = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  const completed = tasks.filter((t) => t.completed);

  const openAddForm = () => {
    setEditingId(null);
    setFormData({
      subject: '',
      title: '',
      deadline: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      priority: 'medium',
      estimatedMinutes: 60,
    });
    setErrors({});
    setShowForm(true);
  };

  const openEditForm = (task: StudyTask) => {
    setEditingId(task.id);
    setFormData({
      subject: task.subject,
      title: task.title,
      deadline: task.deadline,
      priority: task.priority,
      estimatedMinutes: task.estimatedMinutes,
    });
    setErrors({});
    setShowForm(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.subject.trim()) e.subject = 'Subject is required';
    if (!formData.title.trim()) e.title = 'Task title is required';
    if (!formData.deadline) e.deadline = 'Deadline is required';
    if (formData.estimatedMinutes < 1) e.estimatedMinutes = 'Must be at least 1 minute';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingId) {
      setTasks(
        tasks.map((t) =>
          t.id === editingId
            ? { ...t, ...formData, subject: formData.subject.trim(), title: formData.title.trim() }
            : t,
        ),
      );
    } else {
      const newTask: StudyTask = {
        id: generateId(),
        ...formData,
        subject: formData.subject.trim(),
        title: formData.title.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTasks([...tasks, newTask]);
    }

    setShowForm(false);
    setEditingId(null);
  };

  const toggleComplete = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const priorityBadge = (p: Priority) => {
    if (p === 'high') return <span className="badge-high">High</span>;
    if (p === 'medium') return <span className="badge-medium">Medium</span>;
    return <span className="badge-low">Low</span>;
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-navy-800">Tasks</h2>
            <p className="text-sm text-navy-400">Manage your study tasks and deadlines</p>
          </div>
          <button onClick={openAddForm} className="btn-primary">
            <Plus size={18} />
            Add Task
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="card mb-6 animate-slide-up p-5">
            <h3 className="mb-4 text-sm font-semibold text-navy-800">
              {editingId ? 'Edit Task' : 'New Task'}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-text" htmlFor="task-subject">Subject</label>
                <input
                  id="task-subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Electronics"
                />
                {errors.subject && (
                  <p className="mt-1 text-xs text-accent-red">{errors.subject}</p>
                )}
              </div>
              <div>
                <label className="label-text" htmlFor="task-title">Task Title</label>
                <input
                  id="task-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Revise Chapter 5"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-accent-red">{errors.title}</p>
                )}
              </div>
              <div>
                <label className="label-text" htmlFor="task-deadline">Deadline</label>
                <input
                  id="task-deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="input-field"
                />
                {errors.deadline && (
                  <p className="mt-1 text-xs text-accent-red">{errors.deadline}</p>
                )}
              </div>
              <div>
                <label className="label-text" htmlFor="task-priority">Priority</label>
                <select
                  id="task-priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                  className="input-field"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label-text" htmlFor="task-minutes">Estimated Study Time (minutes)</label>
                <input
                  id="task-minutes"
                  type="number"
                  min={1}
                  value={formData.estimatedMinutes}
                  onChange={(e) => setFormData({ ...formData, estimatedMinutes: Number(e.target.value) })}
                  className="input-field"
                />
                {errors.estimatedMinutes && (
                  <p className="mt-1 text-xs text-accent-red">{errors.estimatedMinutes}</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="btn-primary">
                {editingId ? 'Save Changes' : 'Add Task'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Incomplete tasks */}
        <div className="mb-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy-700">
            <CalendarDays size={16} />
            Upcoming ({incomplete.length})
          </h3>
          {incomplete.length === 0 ? (
            <div className="card p-8 text-center">
              <Check size={32} className="mx-auto mb-2 text-accent-green" />
              <p className="text-sm text-navy-500">All tasks complete. Time to relax!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {incomplete.map((task) => {
                const overdue = daysUntil(task.deadline) < 0;
                return (
                  <div
                    key={task.id}
                    className="card flex items-center gap-3 p-4 transition-shadow hover:shadow-lifted"
                  >
                    <button
                      onClick={() => toggleComplete(task.id)}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-navy-200 transition-colors hover:border-accent-green hover:bg-accent-green/10"
                      aria-label="Mark complete"
                    >
                      {task.completed && <Check size={14} className="text-accent-green" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-navy-800">{task.title}</span>
                        {priorityBadge(task.priority)}
                        {overdue && (
                          <span className="badge bg-accent-red/10 text-accent-red">
                            <AlertCircle size={10} />
                            Overdue
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-navy-400">
                        <span className="flex items-center gap-1">
                          <BookOpen size={12} />
                          {task.subject}
                        </span>
                        <span className={deadlineColor(task.deadline)}>
                          {formatDeadline(task.deadline)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {task.estimatedMinutes} min
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => openEditForm(task)}
                        className="btn-ghost p-2"
                        aria-label="Edit task"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="btn-ghost p-2 text-accent-red hover:bg-accent-red/10"
                        aria-label="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed tasks */}
        {completed.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy-700">
              <Check size={16} className="text-accent-green" />
              Completed ({completed.length})
            </h3>
            <div className="space-y-2.5">
              {completed.map((task) => (
                <div
                  key={task.id}
                  className="card flex items-center gap-3 bg-cream-50 p-4 opacity-75"
                >
                  <button
                    onClick={() => toggleComplete(task.id)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-green text-white"
                    aria-label="Mark incomplete"
                  >
                    <Check size={14} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-navy-500 line-through">{task.title}</p>
                    <p className="text-xs text-navy-400">
                      {task.subject} &middot; Was due {formatDate(task.deadline)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="btn-ghost p-2 text-accent-red hover:bg-accent-red/10"
                    aria-label="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tasks.length === 0 && !showForm && (
          <div className="card p-12 text-center">
            <Flag size={36} className="mx-auto mb-3 text-navy-200" />
            <h3 className="text-sm font-medium text-navy-700">No tasks yet</h3>
            <p className="mt-1 text-sm text-navy-400">
              Add your first study task to get started.
            </p>
            <button onClick={openAddForm} className="btn-primary mt-4">
              <Plus size={18} />
              Add Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

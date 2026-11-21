import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Edit2,
  ListChecks,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Exam, RevisionTask, SyllabusTopic } from '../types/examPrep';
import {
  formatReadableDate,
  formatTime12,
  isValidDateISO,
  isValidTime24,
  parseLocalDateTime,
  toLocalDateISO,
} from '../utils/dateUtils';
import { ConfirmModal } from './ConfirmModal';

interface RevisionScreenProps {
  revisions: RevisionTask[];
  exams: Exam[];
  topics: SyllabusTopic[];
  now: Date;
  onAddRevision: (task: Omit<RevisionTask, 'id' | 'createdAt'>) => void;
  onUpdateRevision: (id: string, task: Omit<RevisionTask, 'id' | 'createdAt'>) => void;
  onToggleRevision: (id: string) => void;
  onDeleteRevision: (id: string) => void;
  openModalTrigger?: number;
}

type RevisionFilter = 'all' | 'today' | 'upcoming' | 'completed';

interface RevisionFormState {
  subjectName: string;
  customSubject: string;
  title: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
}

export const RevisionScreen: React.FC<RevisionScreenProps> = ({
  revisions,
  exams,
  topics,
  now,
  onAddRevision,
  onUpdateRevision,
  onToggleRevision,
  onDeleteRevision,
  openModalTrigger = 0,
}) => {
  const todayISO = toLocalDateISO(now);
  const [filter, setFilter] = useState<RevisionFilter>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<RevisionTask | null>(null);
  const [form, setForm] = useState<RevisionFormState>({
    subjectName: '',
    customSubject: '',
    title: '',
    description: '',
    scheduledDate: todayISO,
    scheduledTime: '16:00',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RevisionTask | null>(null);

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    exams.forEach((ex) => {
      if (ex.courseName.trim()) set.add(ex.courseName.trim());
    });
    topics.forEach((t) => {
      if (t.subjectName.trim()) set.add(t.subjectName.trim());
    });
    revisions.forEach((r) => {
      if (r.subjectName.trim()) set.add(r.subjectName.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [exams, topics, revisions]);

  const lastTriggerRef = React.useRef(openModalTrigger);
  React.useEffect(() => {
    if (openModalTrigger !== lastTriggerRef.current) {
      lastTriggerRef.current = openModalTrigger;
      openAddModal();
    }
  });

  const openAddModal = () => {
    setEditingTask(null);
    setForm({
      subjectName:
        subjectFilter !== 'all' ? subjectFilter : availableSubjects[0] || '__custom__',
      customSubject: '',
      title: '',
      description: '',
      scheduledDate: todayISO,
      scheduledTime: '16:00',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (task: RevisionTask) => {
    setEditingTask(task);
    const known = availableSubjects.includes(task.subjectName);
    setForm({
      subjectName: known ? task.subjectName : '__custom__',
      customSubject: known ? '' : task.subjectName,
      title: task.title,
      description: task.description,
      scheduledDate: task.scheduledDate,
      scheduledTime: task.scheduledTime,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedSubject =
      form.subjectName === '__custom__' ? form.customSubject.trim() : form.subjectName.trim();
    const title = form.title.trim();
    const description = form.description.trim();

    if (!resolvedSubject) {
      setFormError('Please select or enter a subject for this revision task.');
      return;
    }
    if (!title) {
      setFormError('Revision task title cannot be empty.');
      return;
    }
    if (!isValidDateISO(form.scheduledDate)) {
      setFormError('Please select a valid scheduled date.');
      return;
    }
    if (!isValidTime24(form.scheduledTime)) {
      setFormError('Please select a valid scheduled time.');
      return;
    }

    const payload = {
      subjectName: resolvedSubject,
      title,
      description,
      scheduledDate: form.scheduledDate,
      scheduledTime: form.scheduledTime,
      completed: editingTask ? editingTask.completed : false,
    };

    if (editingTask) {
      onUpdateRevision(editingTask.id, payload);
    } else {
      onAddRevision(payload);
    }
    setModalOpen(false);
  };

  const counts = useMemo(() => {
    let today = 0;
    let upcoming = 0;
    let completed = 0;
    revisions.forEach((r) => {
      if (r.completed) completed += 1;
      if (r.scheduledDate === todayISO) today += 1;
      if (!r.completed && r.scheduledDate > todayISO) upcoming += 1;
    });
    return { all: revisions.length, today, upcoming, completed };
  }, [revisions, todayISO]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return revisions
      .filter((task) => {
        if (filter === 'today' && task.scheduledDate !== todayISO) return false;
        if (filter === 'upcoming' && (task.completed || task.scheduledDate <= todayISO)) return false;
        if (filter === 'completed' && !task.completed) return false;
        if (subjectFilter !== 'all' && task.subjectName !== subjectFilter) return false;
        if (!query) return true;
        return (
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.subjectName.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return (
          parseLocalDateTime(a.scheduledDate, a.scheduledTime).getTime() -
          parseLocalDateTime(b.scheduledDate, b.scheduledTime).getTime()
        );
      });
  }, [revisions, filter, subjectFilter, search, todayISO]);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80">
            {(
              [
                { id: 'all', label: `All (${counts.all})` },
                { id: 'today', label: `Today (${counts.today})` },
                { id: 'upcoming', label: `Upcoming (${counts.upcoming})` },
                { id: 'completed', label: `Completed (${counts.completed})` },
              ] as { id: RevisionFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                  filter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            aria-label="Filter revision tasks by subject"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Subjects</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64 sm:flex-initial">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search revision tasks..."
              aria-label="Search revision tasks"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Revision Task List */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center">
          <ListChecks className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
            {revisions.length === 0 ? 'No revision tasks planned yet' : 'No matching revision tasks'}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {revisions.length === 0
              ? 'Create structured revision sessions linked to your courses and track daily completion.'
              : 'Try clearing the search input or changing the schedule filter.'}
          </p>
          {revisions.length === 0 && (
            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Revision Task</span>
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTasks.map((task) => {
            const isToday = task.scheduledDate === todayISO;
            const isOverdue = !task.completed && task.scheduledDate < todayISO;

            return (
              <div
                key={task.id}
                className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onToggleRevision(task.id)}
                    aria-label={task.completed ? `Mark "${task.title}" as pending` : `Mark "${task.title}" as completed`}
                    className="mt-0.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300 hover:text-indigo-500 dark:text-slate-600 dark:group-hover:text-indigo-400 transition-colors" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {task.subjectName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {isToday ? 'Today' : formatReadableDate(task.scheduledDate)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {formatTime12(task.scheduledTime)}
                      </span>
                      {isOverdue && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-red-600 dark:text-red-400">
                            Overdue
                          </span>
                        </>
                      )}
                      {task.completed && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            Completed
                          </span>
                        </>
                      )}
                    </div>

                    <h3
                      className={`mt-1 text-base font-semibold ${
                        task.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 shrink-0 pl-8 sm:pl-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(task)}
                    aria-label={`Edit ${task.title}`}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(task)}
                    aria-label={`Delete ${task.title}`}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Revision Task Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-[2px] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="revision-modal-title"
        >
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <h2
                id="revision-modal-title"
                className="text-lg font-semibold text-slate-900 dark:text-slate-100"
              >
                {editingTask ? 'Edit Revision Task' : 'New Revision Task'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-300"
                >
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject
                </label>
                <select
                  value={form.subjectName}
                  onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {availableSubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                  <option value="__custom__">+ Enter another subject...</option>
                </select>
              </div>

              {form.subjectName === '__custom__' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Custom Subject Name
                  </label>
                  <input
                    type="text"
                    value={form.customSubject}
                    onChange={(e) => setForm({ ...form, customSubject: e.target.value })}
                    placeholder="e.g., Linear Algebra"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Task Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Review Past Midterm Questions (2024–2025)"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={form.scheduledTime}
                    onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Task Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Notes, chapters, or problem sets to focus on..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors"
                >
                  {editingTask ? 'Save Changes' : 'Add Revision Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Revision Task"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.title}" scheduled for ${formatReadableDate(deleteTarget.scheduledDate)}?`
            : ''
        }
        confirmLabel="Delete Task"
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteRevision(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

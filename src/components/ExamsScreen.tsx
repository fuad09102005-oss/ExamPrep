import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  CalendarClock,
  CheckCircle2,
  Clock,
  Edit2,
  MapPin,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { AppSettings, Exam } from '../types/examPrep';
import {
  formatCountdownCompact,
  formatReadableDate,
  formatTime12,
  getCountdownInfo,
  isValidDateISO,
  isValidTime24,
  parseLocalDateTime,
  toLocalDateISO,
} from '../utils/dateUtils';
import { ConfirmModal } from './ConfirmModal';

interface ExamsScreenProps {
  exams: Exam[];
  settings: AppSettings;
  now: Date;
  onAddExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => void;
  onUpdateExam: (id: string, exam: Omit<Exam, 'id' | 'createdAt'>) => void;
  onDeleteExam: (id: string) => void;
  openModalTrigger?: number;
}

type ExamFilter = 'all' | 'upcoming' | 'today' | 'completed';

interface ExamFormState {
  courseName: string;
  courseCode: string;
  examDate: string;
  examTime: string;
  location: string;
}

export const ExamsScreen: React.FC<ExamsScreenProps> = ({
  exams,
  settings,
  now,
  onAddExam,
  onUpdateExam,
  onDeleteExam,
  openModalTrigger = 0,
}) => {
  const [filter, setFilter] = useState<ExamFilter>('all');
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExamFormState>({
    courseName: '',
    courseCode: '',
    examDate: toLocalDateISO(now),
    examTime: '09:30',
    location: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);

  const lastTriggerRef = React.useRef(openModalTrigger);
  React.useEffect(() => {
    if (openModalTrigger !== lastTriggerRef.current) {
      lastTriggerRef.current = openModalTrigger;
      openAddModal();
    }
  });

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      courseName: '',
      courseCode: '',
      examDate: toLocalDateISO(now),
      examTime: '09:30',
      location: '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingId(exam.id);
    setForm({
      courseName: exam.courseName,
      courseCode: exam.courseCode,
      examDate: exam.examDate,
      examTime: exam.examTime,
      location: exam.location,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const courseName = form.courseName.trim();
    const courseCode = form.courseCode.trim().toUpperCase();
    const location = form.location.trim();

    if (!courseName) {
      setFormError('Course name cannot be empty.');
      return;
    }
    if (!courseCode) {
      setFormError('Course code cannot be empty (for example, CSE 2100).');
      return;
    }
    if (!isValidDateISO(form.examDate)) {
      setFormError('Please enter a valid examination date.');
      return;
    }
    if (!isValidTime24(form.examTime)) {
      setFormError('Please enter a valid examination time.');
      return;
    }
    if (!location) {
      setFormError('Please specify an examination room or location.');
      return;
    }

    // Duplicate check: same courseCode and examDate (excluding currently edited exam)
    const duplicate = exams.find(
      (ex) =>
        ex.id !== editingId &&
        ex.courseCode.trim().toUpperCase() === courseCode &&
        ex.examDate === form.examDate
    );
    if (duplicate) {
      setFormError(
        `An examination for ${courseCode} on ${formatReadableDate(form.examDate)} already exists.`
      );
      return;
    }

    const payload = {
      courseName,
      courseCode,
      examDate: form.examDate,
      examTime: form.examTime,
      location,
    };

    if (editingId) {
      onUpdateExam(editingId, payload);
    } else {
      onAddExam(payload);
    }
    setModalOpen(false);
  };

  const classified = useMemo(() => {
    return exams.map((exam) => ({
      exam,
      countdown: getCountdownInfo(exam.examDate, exam.examTime, now, settings.approachingDays),
    }));
  }, [exams, now, settings.approachingDays]);

  const counts = useMemo(() => {
    let upcoming = 0;
    let today = 0;
    let completed = 0;
    for (const item of classified) {
      if (item.countdown.isPast) {
        completed += 1;
      } else {
        upcoming += 1;
        if (item.countdown.isToday) today += 1;
      }
    }
    return { all: classified.length, upcoming, today, completed };
  }, [classified]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return classified
      .filter(({ exam, countdown }) => {
        if (filter === 'upcoming' && countdown.isPast) return false;
        if (filter === 'today' && !countdown.isToday) return false;
        if (filter === 'completed' && !countdown.isPast) return false;
        if (!query) return true;
        return (
          exam.courseName.toLowerCase().includes(query) ||
          exam.courseCode.toLowerCase().includes(query) ||
          exam.location.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const diff =
          parseLocalDateTime(a.exam.examDate, a.exam.examTime).getTime() -
          parseLocalDateTime(b.exam.examDate, b.exam.examTime).getTime();
        return sortAsc ? diff : -diff;
      });
  }, [classified, filter, search, sortAsc]);

  const isSelectedDateInPast =
    isValidDateISO(form.examDate) &&
    isValidTime24(form.examTime) &&
    parseLocalDateTime(form.examDate, form.examTime).getTime() <= now.getTime();

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 w-fit">
          {(
            [
              { id: 'all', label: `All (${counts.all})` },
              { id: 'upcoming', label: `Upcoming (${counts.upcoming})` },
              { id: 'today', label: `Today (${counts.today})` },
              { id: 'completed', label: `Completed (${counts.completed})` },
            ] as { id: ExamFilter; label: string }[]
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

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64 sm:flex-initial">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search course, code, room..."
              aria-label="Search examinations"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setSortAsc((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowUpDown className="h-4 w-4 text-slate-400" />
            <span>{sortAsc ? 'Soonest First' : 'Latest First'}</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Exam</span>
          </button>
        </div>
      </div>

      {/* Exam List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center">
          <CalendarClock className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
            {exams.length === 0 ? 'No examinations added yet' : 'No matching examinations'}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {exams.length === 0
              ? 'Register your university examination schedule to see live countdowns and room assignments.'
              : 'Try adjusting your search query or switching the status filter above.'}
          </p>
          {exams.length === 0 && (
            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Examination</span>
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map(({ exam, countdown }) => {
            const statusText = countdown.isPast
              ? 'Completed'
              : countdown.isToday
                ? 'Exam Today'
                : countdown.isApproachingSoon
                  ? 'Approaching Soon'
                  : 'Upcoming';

            const statusColorClass = countdown.isPast
              ? 'text-emerald-700 dark:text-emerald-400'
              : countdown.isToday
                ? 'text-red-600 dark:text-red-400'
                : countdown.isApproachingSoon
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-600 dark:text-slate-300';

            return (
              <div
                key={exam.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {exam.courseCode}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{formatReadableDate(exam.examDate)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{formatTime12(exam.examTime)}</span>
                    <span aria-hidden="true">·</span>
                    <span className={`inline-flex items-center gap-1 font-semibold ${statusColorClass}`}>
                      {countdown.isPast ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                      {statusText}
                    </span>
                  </div>

                  <h3 className="mt-1.5 text-base font-semibold text-slate-900 dark:text-slate-100">
                    {exam.courseName}
                  </h3>

                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{exam.location}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left lg:text-right">
                    <span className="block text-xs text-slate-400 dark:text-slate-500">
                      {countdown.isPast ? 'Status' : 'Countdown'}
                    </span>
                    <span
                      className={`font-mono text-sm sm:text-base font-semibold tabular-nums ${
                        countdown.isPast
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : countdown.isToday
                            ? 'text-red-600 dark:text-red-400'
                            : countdown.isApproachingSoon
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {formatCountdownCompact(countdown, settings.showSecondsInCountdown)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(exam)}
                      aria-label={`Edit ${exam.courseName}`}
                      title="Edit examination"
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(exam)}
                      aria-label={`Delete ${exam.courseName}`}
                      title="Delete examination"
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Exam Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-[2px] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exam-modal-title"
        >
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <h2
                id="exam-modal-title"
                className="text-lg font-semibold text-slate-900 dark:text-slate-100"
              >
                {editingId ? 'Edit Examination' : 'Add New Examination'}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={form.courseCode}
                    onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
                    placeholder="CSE 2100"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 font-mono text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={form.courseName}
                    onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                    placeholder="Software Development Project I"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    value={form.examDate}
                    onChange={(e) => setForm({ ...form, examDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Exam Time
                  </label>
                  <input
                    type="time"
                    value={form.examTime}
                    onChange={(e) => setForm({ ...form, examTime: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {isSelectedDateInPast && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Note: Because this date and time are in the past, it will be recorded under Completed examinations rather than Upcoming.
                </p>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Location / Room Number
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Central Examination Hall · Room 204"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                  {editingId ? 'Save Changes' : 'Save Examination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Examination"
        message={
          deleteTarget
            ? `Remove ${deleteTarget.courseCode} (${deleteTarget.courseName}) scheduled on ${formatReadableDate(deleteTarget.examDate)}? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Exam"
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteExam(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

import React from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock,
  ListChecks,
  MapPin,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { AppSettings, Exam, RevisionTask, ScreenId, SyllabusTopic } from '../types/examPrep';
import {
  formatReadableDate,
  formatTime12,
  getCountdownInfo,
  parseLocalDateTime,
  toLocalDateISO,
} from '../utils/dateUtils';

interface DashboardScreenProps {
  exams: Exam[];
  topics: SyllabusTopic[];
  revisions: RevisionTask[];
  settings: AppSettings;
  now: Date;
  onNavigate: (screen: ScreenId) => void;
  onToggleRevision: (id: string) => void;
  onQuickAddExam: () => void;
  onQuickAddTopic: () => void;
  onQuickAddRevision: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  exams,
  topics,
  revisions,
  settings,
  now,
  onNavigate,
  onToggleRevision,
  onQuickAddExam,
  onQuickAddTopic,
  onQuickAddRevision,
}) => {
  const todayISO = toLocalDateISO(now);

  // Classify exams
  const upcomingExams = exams
    .filter((ex) => !getCountdownInfo(ex.examDate, ex.examTime, now, settings.approachingDays).isPast)
    .sort(
      (a, b) =>
        parseLocalDateTime(a.examDate, a.examTime).getTime() -
        parseLocalDateTime(b.examDate, b.examTime).getTime()
    );

  const examsToday = upcomingExams.filter((ex) => ex.examDate === todayISO);
  const completedExams = exams.filter(
    (ex) => getCountdownInfo(ex.examDate, ex.examTime, now, settings.approachingDays).isPast
  );
  const nearestExam = upcomingExams[0] || null;
  const nearestCountdown = nearestExam
    ? getCountdownInfo(nearestExam.examDate, nearestExam.examTime, now, settings.approachingDays)
    : null;

  // Syllabus completion
  const totalTopics = topics.length;
  const completedTopics = topics.filter((t) => t.completed).length;
  const syllabusPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Today's revision tasks
  const todaysRevisions = revisions
    .filter((r) => r.scheduledDate === todayISO)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
  const todaysCompletedCount = todaysRevisions.filter((r) => r.completed).length;

  // Subject progress summary (top 4 subjects by exam proximity or count)
  const subjectMap = new Map<string, { total: number; completed: number }>();
  topics.forEach((t) => {
    const entry = subjectMap.get(t.subjectName) || { total: 0, completed: 0 };
    entry.total += 1;
    if (t.completed) entry.completed += 1;
    subjectMap.set(t.subjectName, entry);
  });
  const subjectSummaries = Array.from(subjectMap.entries())
    .map(([name, stats]) => ({
      name,
      total: stats.total,
      completed: stats.completed,
      pct: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    }))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* KPI Summary Strip */}
      <section aria-label="Academic Summary Metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => onNavigate('exams')}
            className="text-left rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-sm font-medium">Upcoming Exams</span>
              <CalendarClock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="mt-3 font-mono text-3xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {upcomingExams.length}
            </p>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              {upcomingExams.length === 1 ? '1 scheduled paper ahead' : `${upcomingExams.length} scheduled papers ahead`}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('exams')}
            className="text-left rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-sm font-medium">Exams Today</span>
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="mt-3 font-mono text-3xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {examsToday.length}
            </p>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              {examsToday.length > 0 ? `Next at ${formatTime12(examsToday[0].examTime)}` : 'No remaining exams today'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('exams')}
            className="text-left rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-sm font-medium">Completed Exams</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mt-3 font-mono text-3xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {completedExams.length}
            </p>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              Out of {exams.length} total registered
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('syllabus')}
            className="text-left rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-sm font-medium">Syllabus Completion</span>
              <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="mt-3 font-mono text-3xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {syllabusPct}%
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-[width] duration-300"
                style={{ width: `${syllabusPct}%` }}
              />
            </div>
          </button>
        </div>
      </section>

      {/* Nearest Exam Spotlight & Quick Access */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Nearest Upcoming Examination */}
        <div className="lg:col-span-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
          {nearestExam && nearestCountdown ? (
            <>
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Nearest Upcoming Examination
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                      nearestCountdown.isToday
                        ? 'text-red-600 dark:text-red-400'
                        : nearestCountdown.isApproachingSoon
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {nearestCountdown.isToday
                      ? 'Scheduled Today'
                      : nearestCountdown.isApproachingSoon
                        ? 'Approaching Soon'
                        : 'On Schedule'}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                      {nearestExam.courseCode}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{formatReadableDate(nearestExam.examDate)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{formatTime12(nearestExam.examTime)}</span>
                  </div>
                  <h2 className="mt-1.5 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                    {nearestExam.courseName}
                  </h2>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{nearestExam.location || 'Location not specified'}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-end justify-between gap-4">
                <div className="grid grid-cols-4 gap-4 sm:gap-6">
                  <div>
                    <span className="block font-mono text-2xl sm:text-3xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                      {String(nearestCountdown.days).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Days</span>
                  </div>
                  <div>
                    <span className="block font-mono text-2xl sm:text-3xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                      {String(nearestCountdown.hours).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Hours</span>
                  </div>
                  <div>
                    <span className="block font-mono text-2xl sm:text-3xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                      {String(nearestCountdown.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Minutes</span>
                  </div>
                  {settings.showSecondsInCountdown && (
                    <div>
                      <span className="block font-mono text-2xl sm:text-3xl font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
                        {String(nearestCountdown.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Seconds</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('exams')}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 whitespace-nowrap shrink-0"
                >
                  <span>View all exams</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-start justify-center py-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                No upcoming examinations scheduled
              </h2>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-md">
                Add your upcoming course examination dates and rooms to activate live countdown tracking.
              </p>
              <button
                type="button"
                onClick={onQuickAddExam}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Add Examination</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Access Panel */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Quick Actions
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Jump directly to planning or update your study logs.
            </p>
          </div>

          <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
            <button
              type="button"
              onClick={onQuickAddExam}
              className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <CalendarClock className="h-4 w-4 text-slate-400" />
                <span>Schedule New Exam</span>
              </span>
              <Plus className="h-4 w-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={onQuickAddTopic}
              className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="h-4 w-4 text-slate-400" />
                <span>Add Syllabus Topic</span>
              </span>
              <Plus className="h-4 w-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={onQuickAddRevision}
              className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <ListChecks className="h-4 w-4 text-slate-400" />
                <span>Create Revision Task</span>
              </span>
              <Plus className="h-4 w-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('progress')}
              className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <TrendingUp className="h-4 w-4 text-slate-400" />
                <span>Open Progress Reports</span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      </section>

      {/* Today's Revision Tasks & Subject Preparation */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Today's Revision Tasks */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Today&apos;s Revision Tasks
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {todaysCompletedCount} of {todaysRevisions.length} completed today
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('revision')}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 whitespace-nowrap shrink-0"
            >
              <span>Planner</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {todaysRevisions.length === 0 ? (
            <div className="mt-6 py-8 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No revision tasks scheduled for today.
              </p>
              <button
                type="button"
                onClick={onQuickAddRevision}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Today&apos;s Task</span>
              </button>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {todaysRevisions.map((task) => (
                <li key={task.id} className="py-3 first:pt-1 last:pb-0">
                  <button
                    type="button"
                    onClick={() => onToggleRevision(task.id)}
                    className="flex w-full items-start gap-3 text-left group"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-300 group-hover:text-indigo-500 dark:text-slate-600 dark:group-hover:text-indigo-400 transition-colors" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium ${
                          task.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2">
                        <span>{task.subjectName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{formatTime12(task.scheduledTime)}</span>
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Subject-wise Syllabus Readiness */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Subject Readiness
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {completedTopics} of {totalTopics} syllabus topics covered
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('syllabus')}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 whitespace-nowrap shrink-0"
            >
              <span>Manage Syllabus</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {subjectSummaries.length === 0 ? (
            <div className="mt-6 py-8 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Add syllabus topics to monitor subject readiness.
              </p>
              <button
                type="button"
                onClick={onQuickAddTopic}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Syllabus Topic</span>
              </button>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {subjectSummaries.map((sub) => (
                <div key={sub.name}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                      {sub.name}
                    </span>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                      {sub.completed}/{sub.total} · {sub.pct}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-[width] duration-300 ${
                        sub.pct === 100
                          ? 'bg-emerald-600 dark:bg-emerald-500'
                          : 'bg-indigo-600 dark:bg-indigo-500'
                      }`}
                      style={{ width: `${sub.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

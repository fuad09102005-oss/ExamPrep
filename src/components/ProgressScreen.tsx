import React, { useEffect, useMemo, useRef } from 'react';
import Chart from 'chart.js/auto';
import { BarChart3, Download } from 'lucide-react';
import { AppSettings, Exam, RevisionTask, SyllabusTopic } from '../types/examPrep';
import { getCurrentWeekDays } from '../utils/dateUtils';

interface ProgressScreenProps {
  exams: Exam[];
  topics: SyllabusTopic[];
  revisions: RevisionTask[];
  settings: AppSettings;
  now: Date;
  isDarkActive: boolean;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  exams,
  topics,
  revisions,
  now,
  isDarkActive,
}) => {
  const subjectChartRef = useRef<HTMLCanvasElement | null>(null);
  const weeklyChartRef = useRef<HTMLCanvasElement | null>(null);
  const breakdownChartRef = useRef<HTMLCanvasElement | null>(null);

  const stats = useMemo(() => {
    const totalTopics = topics.length;
    const completedTopics = topics.filter((t) => t.completed).length;
    const pendingTopics = totalTopics - completedTopics;
    const syllabusPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    const totalRevisions = revisions.length;
    const completedRevisions = revisions.filter((r) => r.completed).length;
    const pendingRevisions = totalRevisions - completedRevisions;
    const revisionPct = totalRevisions > 0 ? Math.round((completedRevisions / totalRevisions) * 100) : 0;

    const combinedItems = totalTopics + totalRevisions;
    const overallPct =
      combinedItems > 0
        ? Math.round(((completedTopics + completedRevisions) / combinedItems) * 100)
        : 0;

    // Subject-wise statistics
    const subjectNames = new Set<string>();
    exams.forEach((e) => subjectNames.add(e.courseName));
    topics.forEach((t) => subjectNames.add(t.subjectName));
    revisions.forEach((r) => subjectNames.add(r.subjectName));

    const subjectRows = Array.from(subjectNames)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => {
        const subTopics = topics.filter((t) => t.subjectName === name);
        const subTopicsDone = subTopics.filter((t) => t.completed).length;
        const subRevs = revisions.filter((r) => r.subjectName === name);
        const subRevsDone = subRevs.filter((r) => r.completed).length;
        const pct =
          subTopics.length > 0
            ? Math.round((subTopicsDone / subTopics.length) * 100)
            : subRevs.length > 0
              ? Math.round((subRevsDone / subRevs.length) * 100)
              : 0;

        return {
          name,
          topicsCompleted: subTopicsDone,
          topicsPending: subTopics.length - subTopicsDone,
          topicsTotal: subTopics.length,
          revisionsCompleted: subRevsDone,
          revisionsTotal: subRevs.length,
          pct,
        };
      });

    // Weekly revision breakdown (Mon-Sun)
    const weekDays = getCurrentWeekDays(now);
    const weeklyData = weekDays.map((day) => {
      const dayTasks = revisions.filter((r) => r.scheduledDate === day.iso);
      const done = dayTasks.filter((r) => r.completed).length;
      const pending = dayTasks.length - done;
      return {
        label: day.isToday ? `${day.label} (Today)` : day.label,
        done,
        pending,
      };
    });

    return {
      totalTopics,
      completedTopics,
      pendingTopics,
      syllabusPct,
      totalRevisions,
      completedRevisions,
      pendingRevisions,
      revisionPct,
      overallPct,
      subjectRows,
      weeklyData,
    };
  }, [exams, topics, revisions, now]);

  useEffect(() => {
    const textColor = isDarkActive ? '#cbd5e1' : '#475569';
    const gridColor = isDarkActive ? 'rgba(148, 163, 184, 0.12)' : 'rgba(15, 23, 42, 0.08)';
    const fontFamily = '"Plus Jakarta Sans", sans-serif';

    const instances: Chart[] = [];

    // 1. Subject-wise Preparation Bar Chart
    if (subjectChartRef.current && stats.subjectRows.length > 0) {
      const ctx = subjectChartRef.current.getContext('2d');
      if (ctx) {
        instances.push(
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: stats.subjectRows.map((s) =>
                s.name.length > 22 ? `${s.name.slice(0, 20)}…` : s.name
              ),
              datasets: [
                {
                  label: 'Completed Topics',
                  data: stats.subjectRows.map((s) => s.topicsCompleted),
                  backgroundColor: isDarkActive ? '#6366f1' : '#4f46e5',
                  borderRadius: 6,
                },
                {
                  label: 'Remaining Topics',
                  data: stats.subjectRows.map((s) => s.topicsPending),
                  backgroundColor: isDarkActive ? '#334155' : '#e2e8f0',
                  borderRadius: 6,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { color: textColor, font: { family: fontFamily, size: 12 }, boxWidth: 12 },
                },
              },
              scales: {
                x: {
                  stacked: true,
                  ticks: { color: textColor, font: { family: fontFamily, size: 11 } },
                  grid: { display: false },
                },
                y: {
                  stacked: true,
                  beginAtZero: true,
                  ticks: { stepSize: 1, color: textColor, font: { family: fontFamily, size: 11 } },
                  grid: { color: gridColor },
                },
              },
            },
          })
        );
      }
    }

    // 2. Weekly Preparation Overview Chart
    if (weeklyChartRef.current) {
      const ctx = weeklyChartRef.current.getContext('2d');
      if (ctx) {
        instances.push(
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: stats.weeklyData.map((d) => d.label),
              datasets: [
                {
                  label: 'Completed Tasks',
                  data: stats.weeklyData.map((d) => d.done),
                  backgroundColor: isDarkActive ? '#10b981' : '#16a34a',
                  borderRadius: 6,
                },
                {
                  label: 'Pending Tasks',
                  data: stats.weeklyData.map((d) => d.pending),
                  backgroundColor: isDarkActive ? '#f59e0b' : '#d97706',
                  borderRadius: 6,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { color: textColor, font: { family: fontFamily, size: 12 }, boxWidth: 12 },
                },
              },
              scales: {
                x: {
                  ticks: { color: textColor, font: { family: fontFamily, size: 11 } },
                  grid: { display: false },
                },
                y: {
                  beginAtZero: true,
                  ticks: { stepSize: 1, color: textColor, font: { family: fontFamily, size: 11 } },
                  grid: { color: gridColor },
                },
              },
            },
          })
        );
      }
    }

    // 3. Syllabus Status Doughnut Chart
    if (breakdownChartRef.current && (stats.totalTopics > 0 || stats.totalRevisions > 0)) {
      const ctx = breakdownChartRef.current.getContext('2d');
      if (ctx) {
        instances.push(
          new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: ['Topics Completed', 'Topics Pending', 'Revisions Done', 'Revisions Pending'],
              datasets: [
                {
                  data: [
                    stats.completedTopics,
                    stats.pendingTopics,
                    stats.completedRevisions,
                    stats.pendingRevisions,
                  ],
                  backgroundColor: [
                    isDarkActive ? '#6366f1' : '#4f46e5',
                    isDarkActive ? '#334155' : '#cbd5e1',
                    isDarkActive ? '#10b981' : '#16a34a',
                    isDarkActive ? '#f59e0b' : '#f59e0b',
                  ],
                  borderWidth: 0,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '64%',
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { color: textColor, font: { family: fontFamily, size: 11 }, boxWidth: 10 },
                },
              },
            },
          })
        );
      }
    }

    return () => {
      instances.forEach((chart) => chart.destroy());
    };
  }, [stats, isDarkActive]);

  const handleExportCSV = () => {
    const header = [
      'Subject',
      'Syllabus Topics Completed',
      'Syllabus Topics Pending',
      'Syllabus Completion %',
      'Revision Tasks Completed',
      'Revision Tasks Total',
    ];
    const rows = stats.subjectRows.map((row) => [
      `"${row.name.replace(/"/g, '""')}"`,
      row.topicsCompleted,
      row.topicsPending,
      `${row.pct}%`,
      row.revisionsCompleted,
      row.revisionsTotal,
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `examprep-progress-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Overall Preparation
          </span>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
            {stats.overallPct}%
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Combined topics &amp; revision tasks
          </p>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Completed Syllabus Topics
          </span>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {stats.completedTopics}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {stats.syllabusPct}% of {stats.totalTopics} total topics
          </p>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Pending Syllabus Topics
          </span>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {stats.pendingTopics}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Remaining topics to cover
          </p>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Completed Revision Tasks
          </span>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {stats.completedRevisions}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {stats.pendingRevisions} pending · {stats.revisionPct}% done
          </p>
        </div>
      </div>

      {/* Chart.js Visualizations */}
      {stats.totalTopics === 0 && stats.totalRevisions === 0 ? (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center">
          <BarChart3 className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
            No preparation data to graph yet
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Add syllabus topics or revision tasks to generate subject-wise and weekly preparation charts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Subject-wise Syllabus Completion
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Completed versus remaining syllabus topics per subject
            </p>
            <div className="mt-4 h-72 relative">
              {stats.subjectRows.length > 0 ? (
                <canvas ref={subjectChartRef} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No syllabus topics recorded yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Workload Distribution
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Syllabus topics &amp; revision tasks breakdown
            </p>
            <div className="mt-4 h-72 relative">
              <canvas ref={breakdownChartRef} />
            </div>
          </div>

          <div className="lg:col-span-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Weekly Revision Activity Overview
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Scheduled and completed revision tasks across Monday through Sunday of the current week
            </p>
            <div className="mt-4 h-64 relative">
              <canvas ref={weeklyChartRef} />
            </div>
          </div>
        </div>
      )}

      {/* Subject-wise Statistics Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Subject-wise Preparation Statistics
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Detailed breakdown of syllabus coverage and revision task completion
            </p>
          </div>
          {stats.subjectRows.length > 0 && (
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV Report</span>
            </button>
          )}
        </div>

        {stats.subjectRows.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            No subjects available yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-5">Subject</th>
                  <th className="py-3 px-4 text-right">Topics Done</th>
                  <th className="py-3 px-4 text-right">Topics Pending</th>
                  <th className="py-3 px-4 text-right">Revisions Done</th>
                  <th className="py-3 px-5 text-right">Readiness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {stats.subjectRows.map((row) => (
                  <tr
                    key={row.name}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-5 font-medium text-slate-900 dark:text-slate-100">
                      {row.name}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {row.topicsCompleted}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {row.topicsPending}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {row.revisionsCompleted}/{row.revisionsTotal}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="inline-flex items-center justify-end gap-3">
                        <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${
                              row.pct === 100
                                ? 'bg-emerald-600 dark:bg-emerald-500'
                                : 'bg-indigo-600 dark:bg-indigo-500'
                            }`}
                            style={{ width: `${row.pct}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-200 w-9 text-right">
                          {row.pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

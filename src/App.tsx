import React, { useEffect, useState } from 'react';
import { CheckCircle2, Menu, Moon, Sun, X, AlertCircle } from 'lucide-react';
import {
  AppSettings,
  Exam,
  ExamPrepData,
  RevisionTask,
  ScreenId,
  ToastMessage,
} from './types/examPrep';
import {
  createSampleData,
  generateId,
  loadExamPrepData,
  saveExamPrepData,
} from './utils/storage';
import { getCountdownInfo } from './utils/dateUtils';
import { Sidebar } from './components/Sidebar';
import { DashboardScreen } from './components/DashboardScreen';
import { ExamsScreen } from './components/ExamsScreen';
import { SyllabusScreen } from './components/SyllabusScreen';
import { RevisionScreen } from './components/RevisionScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { SettingsScreen } from './components/SettingsScreen';

const SCREEN_META: Record<ScreenId, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Academic overview, upcoming countdowns, and daily revision focus',
  },
  exams: {
    title: 'My Exams',
    subtitle: 'Manage examination schedules, rooms, and live time remaining',
  },
  syllabus: {
    title: 'Syllabus',
    subtitle: 'Organize course topics and track subject-wise completion',
  },
  revision: {
    title: 'Revision Planner',
    subtitle: 'Schedule and complete daily and upcoming study sessions',
  },
  progress: {
    title: 'Progress Reports',
    subtitle: 'Analyze subject readiness and weekly revision statistics',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Customize theme, countdown preferences, profile, and local backups',
  },
};

export default function App() {
  const [data, setData] = useState<ExamPrepData>(() => loadExamPrepData());
  const [activeScreen, setActiveScreen] = useState<ScreenId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Quick-action modal triggers across screens
  const [examModalTrigger, setExamModalTrigger] = useState(0);
  const [topicModalTrigger, setTopicModalTrigger] = useState(0);
  const [revisionModalTrigger, setRevisionModalTrigger] = useState(0);

  // Persist changes to localStorage
  useEffect(() => {
    saveExamPrepData(data);
  }, [data]);

  // Live clock tick (1s when seconds enabled or on dashboard/exams, otherwise 15s)
  useEffect(() => {
    const intervalMs = data.settings.showSecondsInCountdown ? 1000 : 15000;
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [data.settings.showSecondsInCountdown]);

  // Listen to OS color scheme changes when theme is set to 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDarkActive =
    data.settings.theme === 'dark' ||
    (data.settings.theme === 'system' && systemPrefersDark);

  // Synchronize .dark class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkActive);
  }, [isDarkActive]);

  const notify = (type: ToastMessage['type'], text: string) => {
    const id = generateId('toast');
    setToasts((prev) => [...prev.slice(-2), { id, type, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Exam handlers
  const handleAddExam = (payload: Omit<Exam, 'id' | 'createdAt'>) => {
    const newExam: Exam = {
      ...payload,
      id: generateId('exam'),
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, exams: [...prev.exams, newExam] }));
    notify('success', `Added ${payload.courseCode} examination.`);
  };

  const handleUpdateExam = (id: string, payload: Omit<Exam, 'id' | 'createdAt'>) => {
    setData((prev) => ({
      ...prev,
      exams: prev.exams.map((ex) => (ex.id === id ? { ...ex, ...payload } : ex)),
    }));
    notify('success', `Updated ${payload.courseCode} examination.`);
  };

  const handleDeleteExam = (id: string) => {
    setData((prev) => ({
      ...prev,
      exams: prev.exams.filter((ex) => ex.id !== id),
    }));
    notify('info', 'Examination removed.');
  };

  // Syllabus handlers
  const handleAddTopic = (subjectName: string, topicName: string) => {
    setData((prev) => ({
      ...prev,
      topics: [
        ...prev.topics,
        {
          id: generateId('top'),
          subjectName,
          topicName,
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    notify('success', 'Syllabus topic added.');
  };

  const handleUpdateTopic = (id: string, subjectName: string, topicName: string) => {
    setData((prev) => ({
      ...prev,
      topics: prev.topics.map((t) =>
        t.id === id ? { ...t, subjectName, topicName } : t
      ),
    }));
    notify('success', 'Syllabus topic updated.');
  };

  const handleToggleTopic = (id: string) => {
    setData((prev) => ({
      ...prev,
      topics: prev.topics.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }));
  };

  const handleDeleteTopic = (id: string) => {
    setData((prev) => ({
      ...prev,
      topics: prev.topics.filter((t) => t.id !== id),
    }));
    notify('info', 'Syllabus topic deleted.');
  };

  // Revision handlers
  const handleAddRevision = (payload: Omit<RevisionTask, 'id' | 'createdAt'>) => {
    setData((prev) => ({
      ...prev,
      revisions: [
        ...prev.revisions,
        {
          ...payload,
          id: generateId('rev'),
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    notify('success', 'Revision task scheduled.');
  };

  const handleUpdateRevision = (id: string, payload: Omit<RevisionTask, 'id' | 'createdAt'>) => {
    setData((prev) => ({
      ...prev,
      revisions: prev.revisions.map((r) => (r.id === id ? { ...r, ...payload } : r)),
    }));
    notify('success', 'Revision task updated.');
  };

  const handleToggleRevision = (id: string) => {
    setData((prev) => ({
      ...prev,
      revisions: prev.revisions.map((r) =>
        r.id === id ? { ...r, completed: !r.completed } : r
      ),
    }));
  };

  const handleDeleteRevision = (id: string) => {
    setData((prev) => ({
      ...prev,
      revisions: prev.revisions.filter((r) => r.id !== id),
    }));
    notify('info', 'Revision task deleted.');
  };

  // Settings & backup handlers
  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...partial },
    }));
  };

  const handleToggleThemeQuick = () => {
    handleUpdateSettings({ theme: isDarkActive ? 'light' : 'dark' });
  };

  const handleImportData = (imported: ExamPrepData) => {
    setData(imported);
  };

  const handleResetSampleData = () => {
    const sample = createSampleData(new Date());
    setData((prev) => ({
      ...sample,
      settings: {
        ...sample.settings,
        theme: prev.settings.theme,
        sidebarCollapsed: prev.settings.sidebarCollapsed,
      },
    }));
    notify('success', 'Sample academic dataset restored.');
  };

  const handleClearAllData = () => {
    setData((prev) => ({
      exams: [],
      topics: [],
      revisions: [],
      settings: prev.settings,
    }));
    notify('info', 'All exams, topics, and revision tasks cleared.');
  };

  // Sidebar badges
  const upcomingCount = data.exams.filter(
    (ex) => !getCountdownInfo(ex.examDate, ex.examTime, now, data.settings.approachingDays).isPast
  ).length;

  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayRevisionPending = data.revisions.filter(
    (r) => r.scheduledDate === todayISO && !r.completed
  ).length;

  const meta = SCREEN_META[activeScreen];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        settings={data.settings}
        onToggleSidebar={() =>
          handleUpdateSettings({ sidebarCollapsed: !data.settings.sidebarCollapsed })
        }
        onToggleTheme={handleToggleThemeQuick}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        upcomingCount={upcomingCount}
        todayRevisionPending={todayRevisionPending}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Workspace Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 truncate">
                {meta.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:inline-block text-xs text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
              {now.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <button
              type="button"
              onClick={handleToggleThemeQuick}
              aria-label={isDarkActive ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              title={isDarkActive ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkActive ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Main Screen Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1320px] w-full mx-auto">
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">{meta.subtitle}</p>

          {activeScreen === 'dashboard' && (
            <DashboardScreen
              exams={data.exams}
              topics={data.topics}
              revisions={data.revisions}
              settings={data.settings}
              now={now}
              onNavigate={setActiveScreen}
              onToggleRevision={handleToggleRevision}
              onQuickAddExam={() => {
                setActiveScreen('exams');
                setExamModalTrigger((n) => n + 1);
              }}
              onQuickAddTopic={() => {
                setActiveScreen('syllabus');
                setTopicModalTrigger((n) => n + 1);
              }}
              onQuickAddRevision={() => {
                setActiveScreen('revision');
                setRevisionModalTrigger((n) => n + 1);
              }}
            />
          )}

          {activeScreen === 'exams' && (
            <ExamsScreen
              exams={data.exams}
              settings={data.settings}
              now={now}
              onAddExam={handleAddExam}
              onUpdateExam={handleUpdateExam}
              onDeleteExam={handleDeleteExam}
              openModalTrigger={examModalTrigger}
            />
          )}

          {activeScreen === 'syllabus' && (
            <SyllabusScreen
              topics={data.topics}
              exams={data.exams}
              onAddTopic={handleAddTopic}
              onUpdateTopic={handleUpdateTopic}
              onToggleTopic={handleToggleTopic}
              onDeleteTopic={handleDeleteTopic}
              openModalTrigger={topicModalTrigger}
            />
          )}

          {activeScreen === 'revision' && (
            <RevisionScreen
              revisions={data.revisions}
              exams={data.exams}
              topics={data.topics}
              now={now}
              onAddRevision={handleAddRevision}
              onUpdateRevision={handleUpdateRevision}
              onToggleRevision={handleToggleRevision}
              onDeleteRevision={handleDeleteRevision}
              openModalTrigger={revisionModalTrigger}
            />
          )}

          {activeScreen === 'progress' && (
            <ProgressScreen
              exams={data.exams}
              topics={data.topics}
              revisions={data.revisions}
              settings={data.settings}
              now={now}
              isDarkActive={isDarkActive}
            />
          )}

          {activeScreen === 'settings' && (
            <SettingsScreen
              data={data}
              onUpdateSettings={handleUpdateSettings}
              onImportData={handleImportData}
              onResetSampleData={handleResetSampleData}
              onClearAllData={handleClearAllData}
              onNotify={notify}
            />
          )}
        </main>
      </div>

      {/* Toast Feedback Stack */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 shadow-lg text-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {toast.type === 'error' ? (
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                )}
                <span className="text-slate-800 dark:text-slate-100 truncate">{toast.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                aria-label="Dismiss notification"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

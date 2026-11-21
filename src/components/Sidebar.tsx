import React, { useState } from 'react';
import {
  BarChart3,
  BookOpen,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Moon,
  Settings,
  Sun,
  X,
} from 'lucide-react';
import { AppSettings, ScreenId } from '../types/examPrep';

const AVATAR_SRC = '/src/assets/images/avatar_student_profile_1795179533080.jpg';

interface SidebarProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  settings: AppSettings;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  upcomingCount: number;
  todayRevisionPending: number;
}

const NAV_ITEMS: { id: ScreenId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'exams', label: 'My Exams', icon: CalendarClock },
  { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
  { id: 'revision', label: 'Revision Planner', icon: ListChecks },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen,
  onNavigate,
  settings,
  onToggleSidebar,
  onToggleTheme,
  mobileOpen,
  onCloseMobile,
  upcomingCount,
  todayRevisionPending,
}) => {
  const [imgError, setImgError] = useState(false);
  const collapsed = settings.sidebarCollapsed;
  const isDark =
    settings.theme === 'dark' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const initials = settings.studentName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'ST';

  const handleSelect = (id: ScreenId) => {
    onNavigate(id);
    onCloseMobile();
  };

  const sidebarContent = (isMobileDrawer: boolean) => {
    const isCompact = !isMobileDrawer && collapsed;

    return (
      <div className="flex h-full flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 select-none">
        {/* Brand Header */}
        <div
          className={`flex h-16 items-center border-b border-slate-200 dark:border-slate-800 ${
            isCompact ? 'justify-center px-3' : 'justify-between px-5'
          }`}
        >
          <button
            type="button"
            onClick={() => handleSelect('dashboard')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white dark:bg-indigo-500">
              <GraduationCap className="h-5 w-5" />
            </div>
            {!isCompact && (
              <div className="min-w-0">
                <span className="block font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
                  ExamPrep
                </span>
              </div>
            )}
          </button>

          {isMobileDrawer ? (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            !isCompact && (
              <button
                type="button"
                onClick={onToggleSidebar}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeScreen === item.id;
            const countText =
              item.id === 'exams' && upcomingCount > 0
                ? String(upcomingCount)
                : item.id === 'revision' && todayRevisionPending > 0
                  ? String(todayRevisionPending)
                  : null;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                title={isCompact ? item.label : undefined}
                className={`group flex w-full items-center rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isCompact ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'
                } ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 ${
                      active
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-200'
                    }`}
                  />
                  {!isCompact && <span className="truncate whitespace-nowrap">{item.label}</span>}
                </span>
                {!isCompact && countText && (
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      active
                        ? 'text-indigo-600 dark:text-indigo-300 font-semibold'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {countText}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Controls & Student Profile */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-2">
          {isCompact && !isMobileDrawer && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="flex w-full items-center justify-center rounded-lg py-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className={`flex w-full items-center rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors ${
              isCompact ? 'justify-center px-2 py-2' : 'justify-between px-3 py-2'
            }`}
          >
            <span className="flex items-center gap-2.5">
              {isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-500" />}
              {!isCompact && <span className="whitespace-nowrap">{isDark ? 'Light Theme' : 'Dark Theme'}</span>}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelect('settings')}
            className={`flex w-full items-center rounded-lg p-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors ${
              isCompact ? 'justify-center' : 'gap-3'
            }`}
          >
            {!imgError ? (
              <img
                src={AVATAR_SRC}
                alt={`${settings.studentName} profile`}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-9 w-9 shrink-0 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
                {initials}
              </div>
            )}
            {!isCompact && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {settings.studentName || 'Student'}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {settings.semester || 'Academic Term'}
                </p>
              </div>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-[width] duration-200 ${
          collapsed ? 'w-[76px]' : 'w-[252px]'
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebarContent(false)}</div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 w-[264px] max-w-[80vw] h-full">
            {sidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
};

import React, { useRef, useState } from 'react';
import {
  Download,
  Monitor,
  Moon,
  RotateCcw,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import { AppSettings, ExamPrepData, ThemeMode } from '../types/examPrep';
import { validateImportedData } from '../utils/storage';
import { ConfirmModal } from './ConfirmModal';

const AVATAR_SRC = '/src/assets/images/avatar_student_profile_1795179533080.jpg';

interface SettingsScreenProps {
  data: ExamPrepData;
  onUpdateSettings: (partial: Partial<AppSettings>) => void;
  onImportData: (imported: ExamPrepData) => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  data,
  onUpdateSettings,
  onImportData,
  onResetSampleData,
  onClearAllData,
  onNotify,
}) => {
  const { settings } = data;
  const [imgError, setImgError] = useState(false);
  const [studentName, setStudentName] = useState(settings.studentName);
  const [department, setDepartment] = useState(settings.department);
  const [semester, setSemester] = useState(settings.semester);

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      onNotify('error', 'Student name cannot be empty.');
      return;
    }
    onUpdateSettings({
      studentName: studentName.trim(),
      department: department.trim(),
      semester: semester.trim(),
    });
    onNotify('success', 'Student profile preferences saved.');
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `examprep-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onNotify('success', 'Local backup downloaded.');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const validation = validateImportedData(parsed);
        if (!validation.valid || !validation.data) {
          onNotify('error', validation.error || 'Invalid backup file.');
          return;
        }
        onImportData(validation.data);
        setStudentName(validation.data.settings.studentName);
        setDepartment(validation.data.settings.department);
        setSemester(validation.data.settings.semester);
        onNotify('success', 'Backup restored successfully.');
      } catch {
        onNotify('error', 'Could not parse JSON file. Ensure it is a valid ExamPrep backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const initials =
    settings.studentName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || '')
      .join('') || 'ST';

  return (
    <div className="max-w-4xl space-y-6">
      {/* Appearance Theme */}
      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Appearance &amp; Theme
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Switch between Light, Dark, or your operating system color preference.
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            [
              { id: 'light', label: 'Light Theme', desc: 'Clean bright surfaces', icon: Sun },
              { id: 'dark', label: 'Dark Theme', desc: 'Low-glare night study', icon: Moon },
              { id: 'system', label: 'System Default', desc: 'Matches OS setting', icon: Monitor },
            ] as { id: ThemeMode; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[]
          ).map((opt) => {
            const Icon = opt.icon;
            const selected = settings.theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdateSettings({ theme: opt.id })}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                  selected
                    ? 'border-indigo-600 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/40'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon
                  className={`mt-0.5 h-5 w-5 shrink-0 ${
                    selected
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <div>
                  <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {opt.label}
                  </span>
                  <span className="block mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {opt.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Countdown Preferences */}
      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Countdown &amp; Alert Preferences
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Configure when upcoming examinations are highlighted as approaching soon.
        </p>

        <div className="mt-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label
                htmlFor="approaching-days"
                className="text-sm font-medium text-slate-900 dark:text-slate-100"
              >
                &ldquo;Approaching Soon&rdquo; Threshold
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Highlight exams occurring within this many days.
              </p>
            </div>
            <select
              id="approaching-days"
              value={settings.approachingDays}
              onChange={(e) => onUpdateSettings({ approachingDays: Number(e.target.value) })}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-44"
            >
              <option value={2}>Within 2 days</option>
              <option value={3}>Within 3 days</option>
              <option value={5}>Within 5 days</option>
              <option value={7}>Within 7 days</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <div>
              <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                Live Seconds in Countdown
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                Display real-time seconds on the nearest exam and same-day countdowns.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.showSecondsInCountdown}
              onClick={() =>
                onUpdateSettings({ showSecondsInCountdown: !settings.showSecondsInCountdown })
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                settings.showSecondsInCountdown
                  ? 'bg-indigo-600 dark:bg-indigo-500'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                  settings.showSecondsInCountdown ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Student Profile */}
      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-4">
          {!imgError ? (
            <img
              src={AVATAR_SRC}
              alt={`${settings.studentName} avatar`}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-14 w-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 text-base font-semibold text-slate-700 dark:text-slate-200">
              {initials}
            </div>
          )}
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Academic Profile
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Displayed in your workspace sidebar. Saved locally on this device.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Student Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Department / Program
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Current Term
            </label>
            <input
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors"
            >
              Save Profile
            </button>
          </div>
        </form>
      </section>

      {/* Local Data & Backup */}
      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Local Storage &amp; Backup
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          All examinations, syllabus topics, and revision tasks are stored offline in your browser&apos;s local storage.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportJSON}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="h-4 w-4 text-slate-400" />
            <span>Export JSON Backup</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Upload className="h-4 w-4 text-slate-400" />
            <span>Import JSON Backup</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="h-4 w-4 text-slate-400" />
            <span>Restore Sample Data</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All Data</span>
          </button>
        </div>
      </section>

      <ConfirmModal
        open={confirmResetOpen}
        title="Restore Sample Semester Data"
        message="This will replace your current exams, syllabus topics, and revision tasks with the default sample CSE semester dataset."
        confirmLabel="Restore Sample Data"
        destructive={false}
        onConfirm={() => {
          onResetSampleData();
          setConfirmResetOpen(false);
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />

      <ConfirmModal
        open={confirmClearOpen}
        title="Clear All Application Data"
        message="Are you sure you want to permanently remove all exams, syllabus topics, and revision tasks? Export a JSON backup first if you want to keep your records."
        confirmLabel="Clear Everything"
        onConfirm={() => {
          onClearAllData();
          setConfirmClearOpen(false);
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
};

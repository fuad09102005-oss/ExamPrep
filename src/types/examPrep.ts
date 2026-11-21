export type ScreenId =
  | 'dashboard'
  | 'exams'
  | 'syllabus'
  | 'revision'
  | 'progress'
  | 'settings';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Exam {
  id: string;
  courseName: string;
  courseCode: string;
  examDate: string; // YYYY-MM-DD
  examTime: string; // HH:MM (24-hour)
  location: string;
  createdAt: string;
}

export interface SyllabusTopic {
  id: string;
  subjectName: string;
  topicName: string;
  completed: boolean;
  createdAt: string;
}

export interface RevisionTask {
  id: string;
  subjectName: string;
  title: string;
  description: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  completed: boolean;
  createdAt: string;
}

export interface AppSettings {
  theme: ThemeMode;
  studentName: string;
  department: string;
  semester: string;
  approachingDays: number;
  showSecondsInCountdown: boolean;
  sidebarCollapsed: boolean;
}

export interface ExamPrepData {
  exams: Exam[];
  topics: SyllabusTopic[];
  revisions: RevisionTask[];
  settings: AppSettings;
}

export type ExamTimingStatus = 'today' | 'soon' | 'upcoming' | 'completed';

export interface CountdownInfo {
  status: ExamTimingStatus;
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isToday: boolean;
  isPast: boolean;
  isApproachingSoon: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

import { AppSettings, Exam, ExamPrepData, RevisionTask, SyllabusTopic } from '../types/examPrep';
import { addDaysISO, isValidDateISO, isValidTime24, toLocalDateISO } from './dateUtils';

export const STORAGE_KEY = 'examprep_data_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  studentName: 'Amina Rahman',
  department: 'Computer Science & Engineering',
  semester: 'Spring Semester · Year 2',
  approachingDays: 3,
  showSecondsInCountdown: true,
  sidebarCollapsed: false,
};

export function createSampleData(now: Date = new Date()): ExamPrepData {
  const todayISO = toLocalDateISO(now);
  const soonHour = Math.min(22, Math.max(now.getHours() + 4, 14));
  const todayExamTime = `${String(soonHour).padStart(2, '0')}:30`;

  const exams: Exam[] = [
    {
      id: 'exam-cse2101',
      courseName: 'Data Structures & Algorithms',
      courseCode: 'CSE 2101',
      examDate: todayISO,
      examTime: todayExamTime,
      location: 'Academic Building 2 · Room 304',
      createdAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
    },
    {
      id: 'exam-cse2100',
      courseName: 'Software Development Project I',
      courseCode: 'CSE 2100',
      examDate: addDaysISO(now, 2),
      examTime: '10:00',
      location: 'Engineering Lab 1 · Desk B4',
      createdAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
    },
    {
      id: 'exam-math2103',
      courseName: 'Discrete Mathematics',
      courseCode: 'MATH 2103',
      examDate: addDaysISO(now, 5),
      examTime: '09:30',
      location: 'Central Examination Hall · Seat 42',
      createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
    },
    {
      id: 'exam-cse2105',
      courseName: 'Digital Logic Design',
      courseCode: 'CSE 2105',
      examDate: addDaysISO(now, 9),
      examTime: '14:00',
      location: 'Science Block · Auditorium A',
      createdAt: new Date(now.getTime() - 8 * 86400000).toISOString(),
    },
    {
      id: 'exam-eng2102',
      courseName: 'Technical Communication',
      courseCode: 'ENG 2102',
      examDate: addDaysISO(now, -4),
      examTime: '11:00',
      location: 'Humanities Wing · Room 112',
      createdAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
    },
    {
      id: 'exam-stat2104',
      courseName: 'Probability & Statistics',
      courseCode: 'STAT 2104',
      examDate: addDaysISO(now, -9),
      examTime: '09:00',
      location: 'Central Examination Hall · Seat 18',
      createdAt: new Date(now.getTime() - 24 * 86400000).toISOString(),
    },
  ];

  const topics: SyllabusTopic[] = [
    // CSE 2101
    { id: 'top-1', subjectName: 'Data Structures & Algorithms', topicName: 'Asymptotic Analysis & Recurrence Relations', completed: true, createdAt: now.toISOString() },
    { id: 'top-2', subjectName: 'Data Structures & Algorithms', topicName: 'Balanced Binary Search Trees (AVL & Red-Black)', completed: true, createdAt: now.toISOString() },
    { id: 'top-3', subjectName: 'Data Structures & Algorithms', topicName: 'Graph Traversal, Topological Sort & Shortest Paths', completed: true, createdAt: now.toISOString() },
    { id: 'top-4', subjectName: 'Data Structures & Algorithms', topicName: 'Dynamic Programming & Memoization Patterns', completed: false, createdAt: now.toISOString() },
    { id: 'top-5', subjectName: 'Data Structures & Algorithms', topicName: 'Heaps, Priority Queues & Union-Find', completed: true, createdAt: now.toISOString() },

    // CSE 2100
    { id: 'top-6', subjectName: 'Software Development Project I', topicName: 'Requirements Specification & System Architecture', completed: true, createdAt: now.toISOString() },
    { id: 'top-7', subjectName: 'Software Development Project I', topicName: 'Modular State Management & Local Persistence', completed: true, createdAt: now.toISOString() },
    { id: 'top-8', subjectName: 'Software Development Project I', topicName: 'Input Validation, Error Handling & Usability Testing', completed: false, createdAt: now.toISOString() },

    // MATH 2103
    { id: 'top-9', subjectName: 'Discrete Mathematics', topicName: 'Propositional & Predicate Logic Proofs', completed: true, createdAt: now.toISOString() },
    { id: 'top-10', subjectName: 'Discrete Mathematics', topicName: 'Mathematical Induction & Strong Induction', completed: true, createdAt: now.toISOString() },
    { id: 'top-11', subjectName: 'Discrete Mathematics', topicName: 'Counting Principles, Permutations & Pigeonhole', completed: false, createdAt: now.toISOString() },
    { id: 'top-12', subjectName: 'Discrete Mathematics', topicName: 'Equivalence Relations, Posets & Lattices', completed: false, createdAt: now.toISOString() },

    // CSE 2105
    { id: 'top-13', subjectName: 'Digital Logic Design', topicName: 'Boolean Algebra & Karnaugh Map Simplification', completed: true, createdAt: now.toISOString() },
    { id: 'top-14', subjectName: 'Digital Logic Design', topicName: 'Combinational Circuits: Multiplexers & Adders', completed: false, createdAt: now.toISOString() },
    { id: 'top-15', subjectName: 'Digital Logic Design', topicName: 'Sequential Logic, Flip-Flops & State Machines', completed: false, createdAt: now.toISOString() },

    // ENG 2102
    { id: 'top-16', subjectName: 'Technical Communication', topicName: 'Engineering Report Structure & Abstracts', completed: true, createdAt: now.toISOString() },
    { id: 'top-17', subjectName: 'Technical Communication', topicName: 'Oral Defense & Visual Slide Design', completed: true, createdAt: now.toISOString() },
  ];

  const revisions: RevisionTask[] = [
    {
      id: 'rev-1',
      subjectName: 'Data Structures & Algorithms',
      title: 'Solve 5 DP Knapsack & LCS Past Paper Questions',
      description: 'Focus on bottom-up tabulation transitions and space optimization.',
      scheduledDate: todayISO,
      scheduledTime: '10:30',
      completed: true,
      createdAt: now.toISOString(),
    },
    {
      id: 'rev-2',
      subjectName: 'Data Structures & Algorithms',
      title: 'Final Formula & Complexity Sheet Review',
      description: 'Review Dijkstra, Bellman-Ford, Kruskal, and AVL rotation time complexities.',
      scheduledDate: todayISO,
      scheduledTime: '13:00',
      completed: false,
      createdAt: now.toISOString(),
    },
    {
      id: 'rev-3',
      subjectName: 'Software Development Project I',
      title: 'Walkthrough CRUD Validation & Edge Cases',
      description: 'Verify empty inputs, duplicate detection, and confirmation dialogs.',
      scheduledDate: todayISO,
      scheduledTime: '19:30',
      completed: false,
      createdAt: now.toISOString(),
    },
    {
      id: 'rev-4',
      subjectName: 'Discrete Mathematics',
      title: 'Practice Pigeonhole & Recurrence Proofs',
      description: 'Complete Chapter 6 problem set #1–#12 without solution notes.',
      scheduledDate: addDaysISO(now, 1),
      scheduledTime: '16:00',
      completed: false,
      createdAt: now.toISOString(),
    },
    {
      id: 'rev-5',
      subjectName: 'Digital Logic Design',
      title: 'Draw Mealy vs Moore State Transition Diagrams',
      description: 'Work through 3-bit synchronous counter design examples.',
      scheduledDate: addDaysISO(now, 2),
      scheduledTime: '18:00',
      completed: false,
      createdAt: now.toISOString(),
    },
    {
      id: 'rev-6',
      subjectName: 'Discrete Mathematics',
      title: 'Review Equivalence Classes & Hasse Diagrams',
      description: 'Summarize reflexive, symmetric, antisymmetric, and transitive rules.',
      scheduledDate: addDaysISO(now, -1),
      scheduledTime: '15:00',
      completed: true,
      createdAt: now.toISOString(),
    },
    {
      id: 'rev-7',
      subjectName: 'Data Structures & Algorithms',
      title: 'Implement BFS/DFS & Cycle Detection Drills',
      description: 'Trace directed vs undirected graph cycle detection on paper.',
      scheduledDate: addDaysISO(now, -2),
      scheduledTime: '17:00',
      completed: true,
      createdAt: now.toISOString(),
    },
    {
      id: 'rev-8',
      subjectName: 'Digital Logic Design',
      title: '4-Variable K-Map Prime Implicant Practice',
      description: 'Practice don’t-care conditions and SOP/POS conversions.',
      scheduledDate: addDaysISO(now, -3),
      scheduledTime: '14:30',
      completed: true,
      createdAt: now.toISOString(),
    },
  ];

  return {
    exams,
    topics,
    revisions,
    settings: { ...DEFAULT_SETTINGS },
  };
}

export function loadExamPrepData(): ExamPrepData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createSampleData();
      saveExamPrepData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<ExamPrepData>;
    return {
      exams: Array.isArray(parsed.exams) ? parsed.exams : [],
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      revisions: Array.isArray(parsed.revisions) ? parsed.revisions : [],
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings || {}),
      },
    };
  } catch {
    const fallback = createSampleData();
    return fallback;
  }
}

export function saveExamPrepData(data: ExamPrepData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to persist ExamPrep data to localStorage:', err);
  }
}

export function validateImportedData(raw: unknown): { valid: boolean; data?: ExamPrepData; error?: string } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Backup file must contain a valid JSON object.' };
  }
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.exams) || !Array.isArray(obj.topics) || !Array.isArray(obj.revisions)) {
    return { valid: false, error: 'Backup JSON is missing exams, topics, or revisions arrays.' };
  }

  for (const item of obj.exams) {
    if (
      !item ||
      typeof item !== 'object' ||
      typeof (item as Exam).courseName !== 'string' ||
      typeof (item as Exam).courseCode !== 'string' ||
      !isValidDateISO((item as Exam).examDate) ||
      !isValidTime24((item as Exam).examTime)
    ) {
      return { valid: false, error: 'One or more exam records in the backup have invalid fields or date formats.' };
    }
  }

  for (const topic of obj.topics) {
    if (
      !topic ||
      typeof topic !== 'object' ||
      typeof (topic as SyllabusTopic).subjectName !== 'string' ||
      typeof (topic as SyllabusTopic).topicName !== 'string'
    ) {
      return { valid: false, error: 'One or more syllabus topics in the backup are malformed.' };
    }
  }

  for (const rev of obj.revisions) {
    if (
      !rev ||
      typeof rev !== 'object' ||
      typeof (rev as RevisionTask).title !== 'string' ||
      typeof (rev as RevisionTask).subjectName !== 'string' ||
      !isValidDateISO((rev as RevisionTask).scheduledDate)
    ) {
      return { valid: false, error: 'One or more revision tasks in the backup are malformed.' };
    }
  }

  const importedSettings =
    obj.settings && typeof obj.settings === 'object' ? (obj.settings as Partial<AppSettings>) : {};

  return {
    valid: true,
    data: {
      exams: obj.exams as Exam[],
      topics: obj.topics as SyllabusTopic[],
      revisions: obj.revisions as RevisionTask[],
      settings: {
        ...DEFAULT_SETTINGS,
        ...importedSettings,
      },
    },
  };
}

export function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

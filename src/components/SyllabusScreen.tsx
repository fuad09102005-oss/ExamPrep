import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Edit2,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Exam, SyllabusTopic } from '../types/examPrep';
import { ConfirmModal } from './ConfirmModal';

interface SyllabusScreenProps {
  topics: SyllabusTopic[];
  exams: Exam[];
  onAddTopic: (subjectName: string, topicName: string) => void;
  onUpdateTopic: (id: string, subjectName: string, topicName: string) => void;
  onToggleTopic: (id: string) => void;
  onDeleteTopic: (id: string) => void;
  openModalTrigger?: number;
}

type TopicFilter = 'all' | 'pending' | 'completed';

export const SyllabusScreen: React.FC<SyllabusScreenProps> = ({
  topics,
  exams,
  onAddTopic,
  onUpdateTopic,
  onToggleTopic,
  onDeleteTopic,
  openModalTrigger = 0,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<TopicFilter>('all');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<SyllabusTopic | null>(null);
  const [subjectInput, setSubjectInput] = useState('');
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<SyllabusTopic | null>(null);

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    exams.forEach((ex) => {
      if (ex.courseName.trim()) set.add(ex.courseName.trim());
    });
    topics.forEach((t) => {
      if (t.subjectName.trim()) set.add(t.subjectName.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [exams, topics]);

  const lastTriggerRef = React.useRef(openModalTrigger);
  React.useEffect(() => {
    if (openModalTrigger !== lastTriggerRef.current) {
      lastTriggerRef.current = openModalTrigger;
      openAddModal();
    }
  });

  const openAddModal = (prefillSubject?: string) => {
    setEditingTopic(null);
    const defaultSub =
      prefillSubject || (selectedSubject !== 'all' ? selectedSubject : availableSubjects[0] || '__custom__');
    setSubjectInput(defaultSub);
    setCustomSubjectInput('');
    setTopicInput('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (topic: SyllabusTopic) => {
    setEditingTopic(topic);
    setSubjectInput(topic.subjectName);
    setCustomSubjectInput('');
    setTopicInput(topic.topicName);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedSubject =
      subjectInput === '__custom__' ? customSubjectInput.trim() : subjectInput.trim();
    const trimmedTopic = topicInput.trim();

    if (!resolvedSubject) {
      setFormError('Subject name cannot be empty.');
      return;
    }
    if (!trimmedTopic) {
      setFormError('Syllabus topic name cannot be empty.');
      return;
    }

    const duplicate = topics.find(
      (t) =>
        t.id !== editingTopic?.id &&
        t.subjectName.trim().toLowerCase() === resolvedSubject.toLowerCase() &&
        t.topicName.trim().toLowerCase() === trimmedTopic.toLowerCase()
    );
    if (duplicate) {
      setFormError(`"${trimmedTopic}" already exists under ${resolvedSubject}.`);
      return;
    }

    if (editingTopic) {
      onUpdateTopic(editingTopic.id, resolvedSubject, trimmedTopic);
    } else {
      onAddTopic(resolvedSubject, trimmedTopic);
    }
    setModalOpen(false);
  };

  // Overall stats
  const totalCount = topics.length;
  const completedCount = topics.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const overallPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Grouped by subject with filtering
  const groupedSubjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    const map = new Map<string, { all: SyllabusTopic[]; visible: SyllabusTopic[] }>();

    topics.forEach((topic) => {
      const sub = topic.subjectName;
      if (!map.has(sub)) {
        map.set(sub, { all: [], visible: [] });
      }
      const group = map.get(sub)!;
      group.all.push(topic);

      const matchesSubject = selectedSubject === 'all' || sub === selectedSubject;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'completed' && topic.completed) ||
        (statusFilter === 'pending' && !topic.completed);
      const matchesSearch =
        !query ||
        topic.topicName.toLowerCase().includes(query) ||
        sub.toLowerCase().includes(query);

      if (matchesSubject && matchesStatus && matchesSearch) {
        group.visible.push(topic);
      }
    });

    return Array.from(map.entries())
      .filter(([, group]) => group.visible.length > 0)
      .sort(([a], [b]) => a.localeCompare(b));
  }, [topics, selectedSubject, statusFilter, search]);

  return (
    <div className="space-y-6">
      {/* Overall Syllabus Banner */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Overall Syllabus Progress
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {completedCount} completed · {pendingCount} remaining · {totalCount} total topics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-2xl font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
              {overallPct}%
            </span>
            <button
              type="button"
              onClick={() => openAddModal()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add Topic</span>
            </button>
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-[width] duration-300"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80">
            {(
              [
                { id: 'all', label: `All (${totalCount})` },
                { id: 'pending', label: `Pending (${pendingCount})` },
                { id: 'completed', label: `Completed (${completedCount})` },
              ] as { id: TopicFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            aria-label="Filter by subject"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Subjects ({availableSubjects.length})</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics or subjects..."
            aria-label="Search syllabus topics"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Subject Groups */}
      {groupedSubjects.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
            {topics.length === 0 ? 'No syllabus topics added yet' : 'No matching syllabus topics'}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {topics.length === 0
              ? 'Break down each course syllabus into individual topics and track your coverage.'
              : 'Adjust your subject selector, status filter, or search text.'}
          </p>
          {topics.length === 0 && (
            <button
              type="button"
              onClick={() => openAddModal()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Topic</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {groupedSubjects.map(([subjectName, group]) => {
            const subCompleted = group.all.filter((t) => t.completed).length;
            const subTotal = group.all.length;
            const subPct = subTotal > 0 ? Math.round((subCompleted / subTotal) * 100) : 0;

            return (
              <div
                key={subjectName}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {subjectName}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {subCompleted} of {subTotal} topics completed · {subTotal - subCompleted} remaining
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-sm font-semibold tabular-nums ${
                          subPct === 100
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {subPct}%
                      </span>
                      <button
                        type="button"
                        onClick={() => openAddModal(subjectName)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Topic</span>
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-[width] duration-300 ${
                        subPct === 100
                          ? 'bg-emerald-600 dark:bg-emerald-500'
                          : 'bg-indigo-600 dark:bg-indigo-500'
                      }`}
                      style={{ width: `${subPct}%` }}
                    />
                  </div>
                </div>

                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {group.visible.map((topic) => (
                    <li
                      key={topic.id}
                      className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => onToggleTopic(topic.id)}
                        className="flex flex-1 items-center gap-3 text-left min-w-0 group"
                      >
                        {topic.completed ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle className="h-5 w-5 shrink-0 text-slate-300 group-hover:text-indigo-500 dark:text-slate-600 dark:group-hover:text-indigo-400 transition-colors" />
                        )}
                        <span
                          className={`text-sm font-medium truncate ${
                            topic.completed
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {topic.topicName}
                        </span>
                      </button>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-xs font-medium ${
                            topic.completed
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {topic.completed ? 'Completed' : 'Pending'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(topic)}
                            aria-label={`Edit ${topic.topicName}`}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(topic)}
                            aria-label={`Delete ${topic.topicName}`}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Topic Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-[2px] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="topic-modal-title"
        >
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <h2
                id="topic-modal-title"
                className="text-lg font-semibold text-slate-900 dark:text-slate-100"
              >
                {editingTopic ? 'Edit Syllabus Topic' : 'Add Syllabus Topic'}
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
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {availableSubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                  <option value="__custom__">+ Enter a new subject...</option>
                </select>
              </div>

              {subjectInput === '__custom__' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    New Subject Name
                  </label>
                  <input
                    type="text"
                    value={customSubjectInput}
                    onChange={(e) => setCustomSubjectInput(e.target.value)}
                    placeholder="e.g., Operating Systems"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Topic Name
                </label>
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="e.g., Deadlock Avoidance & Banker's Algorithm"
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
                  {editingTopic ? 'Save Topic' : 'Add Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Syllabus Topic"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.topicName}" from ${deleteTarget.subjectName}?`
            : ''
        }
        confirmLabel="Delete Topic"
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteTopic(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

import { CountdownInfo } from '../types/examPrep';

export function toLocalDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysISO(base: Date, daysOffset: number): string {
  const copy = new Date(base.getFullYear(), base.getMonth(), base.getDate() + daysOffset);
  return toLocalDateISO(copy);
}

export function parseLocalDateTime(dateStr: string, timeStr: string = '09:00'): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = (timeStr || '09:00').split(':').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
}

export function isValidDateISO(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

export function isValidTime24(timeStr: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeStr);
}

export function formatReadableDate(dateStr: string): string {
  if (!isValidDateISO(dateStr)) return dateStr;
  const dt = parseLocalDateTime(dateStr, '12:00');
  return dt.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  if (!isValidDateISO(dateStr)) return dateStr;
  const dt = parseLocalDateTime(dateStr, '12:00');
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime12(timeStr: string): string {
  if (!isValidTime24(timeStr)) return timeStr;
  const [hh, mm] = timeStr.split(':').map(Number);
  const suffix = hh >= 12 ? 'PM' : 'AM';
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${hour12}:${String(mm).padStart(2, '0')} ${suffix}`;
}

export function getCountdownInfo(
  examDate: string,
  examTime: string,
  now: Date,
  approachingDays: number = 3
): CountdownInfo {
  const target = parseLocalDateTime(examDate, examTime);
  const diffMs = target.getTime() - now.getTime();
  const todayISO = toLocalDateISO(now);
  const isSameDay = examDate === todayISO;

  if (diffMs <= 0) {
    return {
      status: 'completed',
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isToday: false,
      isPast: true,
      isApproachingSoon: false,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const isApproachingSoon = days < approachingDays || (days === approachingDays && hours === 0 && minutes === 0);

  return {
    status: isSameDay ? 'today' : isApproachingSoon ? 'soon' : 'upcoming',
    totalMs: diffMs,
    days,
    hours,
    minutes,
    seconds,
    isToday: isSameDay,
    isPast: false,
    isApproachingSoon,
  };
}

export function formatCountdownCompact(info: CountdownInfo, showSeconds: boolean): string {
  if (info.isPast) return 'Completed';
  if (info.days > 1) {
    return `${info.days}d ${info.hours}h remaining`;
  }
  if (info.days === 1) {
    return `1d ${info.hours}h ${info.minutes}m`;
  }
  if (showSeconds) {
    return `${String(info.hours).padStart(2, '0')}h ${String(info.minutes).padStart(2, '0')}m ${String(info.seconds).padStart(2, '0')}s`;
  }
  return `${info.hours}h ${info.minutes}m remaining`;
}

export function getCurrentWeekDays(now: Date): { iso: string; label: string; isToday: boolean }[] {
  // Monday through Sunday of the current week
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const todayISO = toLocalDateISO(now);
  const result: { iso: string; label: string; isToday: boolean }[] = [];

  for (let i = 0; i < 7; i++) {
    const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset + i);
    const iso = toLocalDateISO(dt);
    const label = dt.toLocaleDateString('en-US', { weekday: 'short' });
    result.push({ iso, label, isToday: iso === todayISO });
  }
  return result;
}

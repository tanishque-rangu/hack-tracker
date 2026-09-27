import { differenceInHours, differenceInCalendarDays, isPast, isToday, formatDistanceToNowStrict, parseISO, isValid } from "date-fns";
import { DeadlineUrgency } from "@/lib/types";

export interface DeadlineCalculationResult {
  urgency: DeadlineUrgency;
  relativeTime: string;
  isActionUrgent: boolean;
  hoursRemaining: number | null;
}

/**
 * Calculates deadline urgency dynamically from the date.
 * Does NOT hard-code any hackathon IDs or static tags.
 */
export function calculateDeadlineUrgency(
  deadlineDateStr: string | null | undefined,
  isCompleted: boolean = false,
  now: Date = new Date()
): DeadlineCalculationResult {
  if (isCompleted) {
    return {
      urgency: 'COMPLETED',
      relativeTime: 'Completed',
      isActionUrgent: false,
      hoursRemaining: null,
    };
  }

  if (!deadlineDateStr) {
    return {
      urgency: 'TBD',
      relativeTime: 'Date TBD',
      isActionUrgent: false,
      hoursRemaining: null,
    };
  }

  let date: Date;
  try {
    date = typeof deadlineDateStr === 'string' ? parseISO(deadlineDateStr) : new Date(deadlineDateStr);
    if (!isValid(date)) {
      return {
        urgency: 'TBD',
        relativeTime: 'Date TBD',
        isActionUrgent: false,
        hoursRemaining: null,
      };
    }
  } catch {
    return {
      urgency: 'TBD',
      relativeTime: 'Date TBD',
      isActionUrgent: false,
      hoursRemaining: null,
    };
  }

  const isPastReference = date.getTime() < now.getTime();
  const isSameDayReference = differenceInCalendarDays(date, now) === 0;

  // Check if overdue
  if (isPastReference && !isSameDayReference) {
    return {
      urgency: 'OVERDUE',
      relativeTime: `${formatDistanceToNowStrict(date, { addSuffix: true })} (Overdue)`,
      isActionUrgent: true,
      hoursRemaining: differenceInHours(date, now),
    };
  }

  // Today
  if (isSameDayReference) {
    const hoursLeft = differenceInHours(date, now);
    if (hoursLeft <= 0) {
      return {
        urgency: 'TODAY',
        relativeTime: 'Due today',
        isActionUrgent: true,
        hoursRemaining: 0,
      };
    }
    return {
      urgency: 'TODAY',
      relativeTime: `Due today (in ~${hoursLeft}h)`,
      isActionUrgent: true,
      hoursRemaining: hoursLeft,
    };
  }

  const hours = differenceInHours(date, now);
  const days = differenceInCalendarDays(date, now);

  if (hours <= 24 && hours > 0) {
    return {
      urgency: 'CRITICAL',
      relativeTime: `in ${hours} hours`,
      isActionUrgent: true,
      hoursRemaining: hours,
    };
  }

  if (days <= 3) {
    return {
      urgency: 'DUE_SOON',
      relativeTime: `in ${days} day${days === 1 ? '' : 's'}`,
      isActionUrgent: true,
      hoursRemaining: hours,
    };
  }

  return {
    urgency: 'UPCOMING',
    relativeTime: `in ${days} days`,
    isActionUrgent: false,
    hoursRemaining: hours,
  };
}

export function getUrgencyBadgeStyle(urgency: DeadlineUrgency): {
  badgeClass: string;
  dotClass: string;
  label: string;
} {
  switch (urgency) {
    case 'CRITICAL':
      return {
        badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20 font-semibold',
        dotClass: 'bg-rose-500 animate-pulse',
        label: 'Critical',
      };
    case 'TODAY':
      return {
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20 font-semibold',
        dotClass: 'bg-amber-400 animate-pulse',
        label: 'Today',
      };
    case 'DUE_SOON':
      return {
        badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        dotClass: 'bg-orange-400',
        label: 'Due Soon',
      };
    case 'OVERDUE':
      return {
        badgeClass: 'bg-red-950/50 text-red-400 border-red-500/40',
        dotClass: 'bg-red-500',
        label: 'Overdue',
      };
    case 'UPCOMING':
      return {
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        dotClass: 'bg-emerald-400',
        label: 'Upcoming',
      };
    case 'COMPLETED':
      return {
        badgeClass: 'bg-zinc-800 text-zinc-400 border-zinc-700',
        dotClass: 'bg-zinc-500',
        label: 'Completed',
      };
    case 'TBD':
    default:
      return {
        badgeClass: 'bg-zinc-800/80 text-zinc-400 border-zinc-700/50',
        dotClass: 'bg-zinc-600',
        label: 'TBD',
      };
  }
}

export interface ActiveCountdown {
  isPast: boolean;
  isUrgent: boolean; // < 48 hours
  isCritical: boolean; // < 24 hours
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedString: string;
  badgeLabel: string;
  badgeColor: string;
  badgeBg: string;
}

/**
 * Calculates active, real-time changing countdowns down to seconds.
 */
export function calculateActiveCountdown(
  deadlineDateStr: string | null | undefined,
  now: Date = new Date()
): ActiveCountdown | null {
  if (!deadlineDateStr) return null;

  let targetDate: Date;
  try {
    targetDate = typeof deadlineDateStr === 'string' ? parseISO(deadlineDateStr) : new Date(deadlineDateStr);
    if (!isValid(targetDate)) return null;
  } catch {
    return null;
  }

  // If date string has no time component (length === 10, e.g. "2026-09-27"), set to end of day 23:59:59
  if (deadlineDateStr.length === 10) {
    targetDate.setHours(23, 59, 59, 999);
  }

  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    const pastMs = Math.abs(diffMs);
    const pastDays = Math.floor(pastMs / (1000 * 60 * 60 * 24));
    const pastHours = Math.floor((pastMs / (1000 * 60 * 60)) % 24);
    const pastMins = Math.floor((pastMs / (1000 * 60)) % 60);

    const timeAgoStr =
      pastDays > 0
        ? `${pastDays}d ago`
        : pastHours > 0
        ? `${pastHours}h ago`
        : `${pastMins}m ago`;

    return {
      isPast: true,
      isUrgent: false,
      isCritical: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formattedString: `Ended (${timeAgoStr})`,
      badgeLabel: 'Passed',
      badgeColor: 'text-zinc-500',
      badgeBg: 'bg-zinc-800/40 border-zinc-700/40',
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const totalHours = days * 24 + hours;
  const isCritical = totalHours < 24;
  const isUrgent = totalHours <= 48;

  let formattedString = '';
  if (days > 0) {
    formattedString = `${days}d ${hours}h ${minutes}m ${seconds}s left`;
  } else if (hours > 0) {
    formattedString = `${hours}h ${minutes}m ${seconds}s left`;
  } else {
    formattedString = `${minutes}m ${seconds}s left`;
  }

  let badgeColor = 'text-emerald-400';
  let badgeBg = 'bg-emerald-500/10 border-emerald-500/30';
  let badgeLabel = 'Upcoming';

  if (isCritical) {
    badgeColor = 'text-rose-400';
    badgeBg = 'bg-rose-500/20 border-rose-500/40';
    badgeLabel = '<24h Critical';
  } else if (isUrgent) {
    badgeColor = 'text-amber-400';
    badgeBg = 'bg-amber-500/15 border-amber-500/35';
    badgeLabel = '<48h Urgent';
  }

  return {
    isPast: false,
    isUrgent,
    isCritical,
    days,
    hours,
    minutes,
    seconds,
    formattedString,
    badgeLabel,
    badgeColor,
    badgeBg,
  };
}

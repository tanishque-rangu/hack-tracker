import { RegistrationChecklistItem, SubmissionChecklistItem, RegistrationStatus } from "@/lib/types";

/**
 * Calculates submission completion percentage strictly from checklist items.
 * If no items exist, returns 0 with a clear unconfigured indicator.
 */
export function calculateSubmissionProgress(checklist: SubmissionChecklistItem[] | undefined | null): {
  percentage: number;
  completedCount: number;
  totalCount: number;
  hasItems: boolean;
  statusLabel: string;
} {
  if (!checklist || checklist.length === 0) {
    return {
      percentage: 0,
      completedCount: 0,
      totalCount: 0,
      hasItems: false,
      statusLabel: 'No Checklist Configured',
    };
  }

  const totalCount = checklist.length;
  const completedCount = checklist.filter((item) => item.is_completed).length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  let statusLabel = 'Not Started';
  if (completedCount === totalCount) {
    statusLabel = 'Complete';
  } else if (completedCount > 0) {
    statusLabel = `${completedCount}/${totalCount} Completed`;
  }

  return {
    percentage,
    completedCount,
    totalCount,
    hasItems: true,
    statusLabel,
  };
}

/**
 * Calculates registration checklist progress and maps to RegistrationStatus.
 */
export function calculateRegistrationProgress(checklist: RegistrationChecklistItem[] | undefined | null): {
  percentage: number;
  completedCount: number;
  totalCount: number;
  derivedStatus: RegistrationStatus;
} {
  if (!checklist || checklist.length === 0) {
    return {
      percentage: 0,
      completedCount: 0,
      totalCount: 0,
      derivedStatus: 'NOT_STARTED',
    };
  }

  const totalCount = checklist.length;
  const completedCount = checklist.filter((item) => item.is_completed).length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  let derivedStatus: RegistrationStatus = 'NOT_STARTED';
  if (completedCount === totalCount) {
    derivedStatus = 'FULLY_REGISTERED';
  } else if (completedCount > 0) {
    derivedStatus = completedCount === 1 ? 'PENDING' : 'PARTIALLY_REGISTERED';
  }

  return {
    percentage,
    completedCount,
    totalCount,
    derivedStatus,
  };
}

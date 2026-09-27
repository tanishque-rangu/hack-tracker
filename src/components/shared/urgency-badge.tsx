import * as React from "react";
import { DeadlineUrgency } from "@/lib/types";
import { getUrgencyBadgeStyle } from "@/lib/utils/deadlines";
import { cn } from "@/lib/utils/cn";

export function UrgencyBadge({
  urgency,
  customLabel,
  className,
}: {
  urgency: DeadlineUrgency;
  customLabel?: string;
  className?: string;
}) {
  const { badgeClass, dotClass, label } = getUrgencyBadgeStyle(urgency);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border",
        badgeClass,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />
      {customLabel || label}
    </span>
  );
}

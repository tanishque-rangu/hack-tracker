import * as React from "react";
import { AlertCircle, FolderGit2, FileCode, CheckCircle2, Users } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400 mb-3">
        {icon || <AlertCircle className="h-6 w-6" />}
      </div>
      <h4 className="text-sm font-semibold text-zinc-200">{title}</h4>
      {description && (
        <p className="mt-1 text-xs text-zinc-500 max-w-sm leading-relaxed">{description}</p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
        >
          {actionText} →
        </button>
      )}
    </div>
  );
}

export function MissingValueBadge({
  type,
  customText,
}: {
  type: "repo" | "project" | "submission" | "assigned" | "date" | "generic";
  customText?: string;
}) {
  const labelMap = {
    repo: "No Repository",
    project: "No Project",
    submission: "No Submission",
    assigned: "Not Assigned",
    date: "TBD",
    generic: "Not Yet",
  };

  return (
    <span className="inline-flex items-center text-[11px] font-mono text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-700/40">
      {customText || labelMap[type]}
    </span>
  );
}

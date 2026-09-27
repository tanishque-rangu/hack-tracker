import * as React from "react";
import { Badge } from "@/lib/../components/ui/badge";
import { BuildStatus, RegistrationStatus, TaskStatus, TaskPriority } from "@/lib/types";

export function BuildStatusBadge({ status }: { status: BuildStatus | undefined | null }) {
  if (!status) {
    return <span className="text-xs text-zinc-500 italic">Not Started</span>;
  }

  switch (status) {
    case "SUBMITTED":
      return <Badge variant="success">Submitted</Badge>;
    case "READY_FOR_SUBMISSION":
      return <Badge variant="info">Ready for Submission</Badge>;
    case "BUILDING":
      return <Badge variant="warning">In Progress / Building</Badge>;
    case "PLANNING":
      return <Badge variant="secondary">Planning</Badge>;
    case "NOT_STARTED":
    default:
      return <Badge variant="outline">Not Started</Badge>;
  }
}

export function RegistrationStatusBadge({ status }: { status: RegistrationStatus | undefined | null }) {
  if (!status) {
    return <span className="text-xs text-zinc-500 italic">Not Started</span>;
  }

  switch (status) {
    case "FULLY_REGISTERED":
      return <Badge variant="success">Fully Registered</Badge>;
    case "PARTIALLY_REGISTERED":
      return <Badge variant="warning">Partially Registered</Badge>;
    case "PENDING":
      return <Badge variant="secondary">Pending Verification</Badge>;
    case "NOT_STARTED":
    default:
      return <Badge variant="outline">Not Started</Badge>;
  }
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  switch (status) {
    case "DONE":
      return <Badge variant="success">Done</Badge>;
    case "IN_PROGRESS":
      return <Badge variant="warning">In Progress</Badge>;
    case "BLOCKED":
      return <Badge variant="danger">Blocked</Badge>;
    case "TODO":
    default:
      return <Badge variant="secondary">Todo</Badge>;
  }
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  switch (priority) {
    case "URGENT":
      return <Badge variant="danger" size="sm">Urgent</Badge>;
    case "HIGH":
      return <Badge variant="warning" size="sm">High</Badge>;
    case "MEDIUM":
      return <Badge variant="secondary" size="sm">Medium</Badge>;
    case "LOW":
    default:
      return <Badge variant="outline" size="sm">Low</Badge>;
  }
}

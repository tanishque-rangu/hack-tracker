'use client';

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  FolderGit2,
  CheckSquare,
  Files,
  GitFork,
  Send,
  Plus,
  ArrowLeft,
  Lock,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BuildStatusBadge, TaskStatusBadge, TaskPriorityBadge } from "@/components/shared/status-badge";
import { EmptyState, MissingValueBadge } from "@/components/shared/empty-state";
import { useAppStore } from "@/lib/store/use-app-store";
import { canUserAccessTeam } from "@/lib/utils/permissions";
import { calculateSubmissionProgress } from "@/lib/utils/progress";
import { format, parseISO } from "date-fns";

export default function TeamWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params?.id as string;

  const {
    teams,
    teamMembers,
    hackathons,
    projects,
    tasks,
    files,
    submissions,
    activityLogs,
    users,
    currentUser,
    createTask,
    updateTask,
    addFile,
  } = useAppStore();

  const [newTaskTitle, setNewTaskTitle] = React.useState("");

  const team = teams.find((t) => t.id === teamId);
  const hack = hackathons.find((h) => h.id === team?.hackathon_id);

  if (!team) {
    return (
      <div className="p-8">
        <EmptyState
          title="Team Not Found"
          description="The requested team does not exist in the database."
          actionText="Back to Teams"
          onAction={() => router.push("/teams")}
        />
      </div>
    );
  }

  // =========================================================================
  // STRICT AUTHORIZATION CHECK (RLS ENFORCEMENT)
  // =========================================================================
  const isAuthorized = canUserAccessTeam(currentUser, team.id, teamMembers);

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="border-rose-900/50 bg-rose-950/20 p-8 text-center space-y-4 shadow-2xl">
          <div className="h-14 w-14 rounded-full bg-rose-900/40 text-rose-400 border border-rose-800/50 flex items-center justify-center mx-auto">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-rose-200">Private Team Workspace (403 Forbidden)</h2>
          <p className="text-xs text-rose-300/80 max-w-md mx-auto leading-relaxed">
            Row Level Security (RLS) policy active: You are authenticated as{" "}
            <strong>{currentUser?.full_name || "Guest"}</strong>, but you are not assigned to{" "}
            <strong>{team.name}</strong>. Access to private tasks, files, repository metadata, and notes is prohibited.
          </p>
          <div className="pt-4 flex items-center justify-center">
            <Button variant="outline" size="sm" onClick={() => router.push("/teams")}>
              Return to Teams Directory
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Authorized team workspace view
  const members = teamMembers
    .filter((tm) => tm.team_id === team.id)
    .map((tm) => ({ ...tm, profile: users.find((u) => u.id === tm.user_id) }));

  const project = projects.find((p) => p.team_id === team.id);
  const teamTasks = tasks.filter((t) => t.team_id === team.id);
  const teamFiles = files.filter((f) => f.team_id === team.id);
  const submission = submissions.find((s) => s.team_id === team.id);
  const teamLogs = activityLogs.filter((l) => l.team_id === team.id);
  const subProgress = calculateSubmissionProgress(submission?.checklist_items);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    createTask({
      team_id: team.id,
      project_id: project?.id || null,
      title: newTaskTitle.trim(),
      description: null,
      status: "TODO",
      priority: "MEDIUM",
      assignee_id: currentUser?.id || "user-guest",
      creator_id: currentUser?.id || "user-guest",
      due_date: null,
      completed_at: null,
    });

    setNewTaskTitle("");
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/teams"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Teams Directory</span>
        </Link>
      </div>

      {/* Header */}
      <Card className="border-zinc-800/90 bg-zinc-950/70 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-950/40 px-2.5 py-0.5 rounded border border-indigo-800/40">
                {hack?.name || "Hackathon"}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                RLS Authorized
              </span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-100">{team.name} Workspace</h1>
            <p className="text-xs text-zinc-400">
              Private coordination hub for {members.length} assigned squad members.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/hackathons/${team.hackathon_id}`}>
              <Button variant="outline" size="sm" className="text-xs">
                View Hackathon Details
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Grid: Project & Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 bg-zinc-900/40 border-zinc-800/80">
            <div className="flex items-start justify-between pb-3 border-b border-zinc-800/80 mb-3">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Active Project Spec</span>
                <h3 className="text-base font-bold text-zinc-100 mt-0.5">
                  {project?.name || "No Project Spec Initialized"}
                </h3>
              </div>
              <BuildStatusBadge status={project?.build_status || "NOT_STARTED"} />
            </div>

            {project ? (
              <div className="space-y-4">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {project.description || "No project description provided."}
                </p>

                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold mb-1.5">
                      Tech Stack
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tech_stack.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 text-xs font-mono rounded bg-zinc-800 text-zinc-200 border border-zinc-700/60"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Repository URL */}
                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <GitFork className="h-4 w-4 text-zinc-400" />
                    <span className="font-mono text-zinc-300">
                      {project.repository_url || <MissingValueBadge type="repo" />}
                    </span>
                  </div>
                  {project.repository_url && (
                    <a href={project.repository_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-400">
                        GitHub <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState
                title="Initialize Team Project"
                description="Attach a specification, MVP scope, and repository for this squad."
                actionText="Go to Hackathon Project Tab"
                onAction={() => router.push(`/hackathons/${team.hackathon_id}`)}
              />
            )}
          </Card>

          {/* Private Tasks */}
          <Card className="p-5 bg-zinc-900/40 border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-zinc-100">Private Squad Tasks</h3>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-zinc-800 text-zinc-400">
                  {teamTasks.length}
                </span>
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="flex gap-2">
              <input
                type="text"
                placeholder="Add private task for squad..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 h-8 px-3 rounded-lg border border-zinc-700 bg-zinc-900 text-xs text-zinc-100 focus:outline-none"
              />
              <Button type="submit" variant="primary" size="sm" className="h-8 text-xs">
                Add
              </Button>
            </form>

            <div className="space-y-2">
              {teamTasks.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">No tasks assigned yet.</p>
              ) : (
                teamTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <select
                        value={t.status}
                        onChange={(e) => updateTask(t.id, { status: e.target.value as any })}
                        className="h-6 px-1.5 rounded border border-zinc-700 bg-zinc-900 text-[10px] text-zinc-300 focus:outline-none"
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="BLOCKED">BLOCKED</option>
                        <option value="DONE">DONE</option>
                      </select>
                      <span className={t.status === "DONE" ? "line-through text-zinc-500" : "text-zinc-200 font-medium"}>
                        {t.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TaskPriorityBadge priority={t.priority} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar: Roster & Submission progress */}
        <div className="space-y-6">
          <Card className="p-5 bg-zinc-900/40 border-zinc-800/80">
            <h3 className="text-sm font-semibold text-zinc-100 mb-3">Squad Roster ({members.length})</h3>
            <div className="space-y-2.5">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-bold">
                      {m.profile?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">{m.profile?.full_name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">{m.profile?.email}</p>
                    </div>
                  </div>
                  {m.role === "lead" && (
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                      Lead
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 bg-zinc-900/40 border-zinc-800/80">
            <h3 className="text-sm font-semibold text-zinc-100 mb-2">Submission Checklist</h3>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span>Verified Progress</span>
              <span className="font-mono font-bold text-indigo-400">{subProgress.percentage}%</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full" style={{ width: `${subProgress.percentage}%` }} />
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">
              {subProgress.completedCount} of {subProgress.totalCount} deliverables complete.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

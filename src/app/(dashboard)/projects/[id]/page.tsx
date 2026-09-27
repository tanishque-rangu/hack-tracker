'use client';

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FolderGit2,
  GitFork,
  Globe,
  Video,
  ExternalLink,
  ArrowLeft,
  CheckSquare,
  Files,
  Activity,
  Plus,
  Edit2,
  Save,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BuildStatusBadge, TaskStatusBadge, TaskPriorityBadge } from "@/components/shared/status-badge";
import { EmptyState, MissingValueBadge } from "@/components/shared/empty-state";
import { useAppStore } from "@/lib/store/use-app-store";
import { BuildStatus } from "@/lib/types";

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const {
    projects,
    teams,
    hackathons,
    tasks,
    files,
    users,
    activityLogs,
    currentUser,
    updateProject,
    createTask,
    updateTask,
  } = useAppStore();

  const [activeTab, setActiveTab] = React.useState<
    "overview" | "tasks" | "repository" | "demo" | "files" | "notes" | "activity"
  >("overview");

  const [isEditing, setIsEditing] = React.useState(false);
  const project = projects.find((p) => p.id === projectId);
  const team = teams.find((t) => t.id === project?.team_id);
  const hack = hackathons.find((h) => h.id === team?.hackathon_id);
  const owner = users.find((u) => u.id === project?.owner_id);

  // Edit form state
  const [name, setName] = React.useState(project?.name || "");
  const [desc, setDesc] = React.useState(project?.description || "");
  const [problem, setProblem] = React.useState(project?.problem_statement || "");
  const [repoUrl, setRepoUrl] = React.useState(project?.repository_url || "");
  const [demoUrl, setDemoUrl] = React.useState(project?.demo_url || "");
  const [deployUrl, setDeployUrl] = React.useState(project?.deployment_url || "");
  const [notes, setNotes] = React.useState(project?.notes || "");
  const [buildStatus, setBuildStatus] = React.useState<BuildStatus>(project?.build_status || "NOT_STARTED");
  const [newTaskTitle, setNewTaskTitle] = React.useState("");

  React.useEffect(() => {
    if (project) {
      setName(project.name);
      setDesc(project.description || "");
      setProblem(project.problem_statement || "");
      setRepoUrl(project.repository_url || "");
      setDemoUrl(project.demo_url || "");
      setDeployUrl(project.deployment_url || "");
      setNotes(project.notes || "");
      setBuildStatus(project.build_status);
    }
  }, [project]);

  if (!project) {
    return (
      <div className="p-8">
        <EmptyState
          title="Project Not Found"
          description={`No project specification found for ID "${projectId}".`}
          actionText="Back to Projects"
          onAction={() => router.push("/projects")}
        />
      </div>
    );
  }

  const projectTasks = tasks.filter((t) => t.project_id === project.id || t.team_id === project.team_id);
  const projectFiles = files.filter((f) => f.team_id === project.team_id);
  const projectLogs = activityLogs.filter((a) => a.team_id === project.team_id);

  const completedTasks = projectTasks.filter((t) => t.status === "DONE").length;
  const taskProgress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

  const handleSave = () => {
    updateProject(project.id, {
      name,
      description: desc || null,
      problem_statement: problem || null,
      repository_url: repoUrl || null,
      demo_url: demoUrl || null,
      deployment_url: deployUrl || null,
      notes: notes || null,
      build_status: buildStatus,
    });
    setIsEditing(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    createTask({
      team_id: project.team_id,
      project_id: project.id,
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
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Header */}
      <Card className="border-zinc-800/90 bg-zinc-950/70 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-950/40 px-2.5 py-0.5 rounded border border-indigo-800/40">
                {hack?.name || "Hackathon"} · {team?.name}
              </span>
              <BuildStatusBadge status={project.build_status} />
            </div>

            <h1 className="text-2xl font-bold text-zinc-100">{project.name}</h1>
            <p className="text-xs text-zinc-400 max-w-2xl">{project.description}</p>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <Button variant="primary" size="sm" onClick={handleSave} className="flex items-center gap-1.5">
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="flex items-center gap-1.5">
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Project Spec</span>
              </Button>
            )}
          </div>
        </div>

        {/* Progress & Quick Links bar */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-zinc-500 block">Lead Architect</span>
            <span className="font-semibold text-zinc-200">{owner?.full_name || "Unassigned"}</span>
          </div>
          <div>
            <span className="text-zinc-500 block">Task Execution</span>
            <span className="font-mono text-indigo-400 font-bold">
              {projectTasks.length > 0 ? `${taskProgress}% (${completedTasks}/${projectTasks.length})` : "0 Tasks"}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block">Repository</span>
            <span className="font-mono text-zinc-300">
              {project.repository_url ? "Connected" : <MissingValueBadge type="repo" />}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block">Deployment</span>
            <span className="font-mono text-zinc-300">
              {project.deployment_url ? "Live" : <MissingValueBadge type="generic" customText="Not Deployed" />}
            </span>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-zinc-800 flex overflow-x-auto gap-2 pb-1">
        {[
          { id: "overview", label: "Overview", icon: FolderGit2 },
          { id: "tasks", label: "Tasks", icon: CheckSquare, count: projectTasks.length },
          { id: "repository", label: "Repository", icon: GitFork },
          { id: "demo", label: "Demo & Deployment", icon: Globe },
          { id: "files", label: "Files", icon: Files, count: projectFiles.length },
          { id: "notes", label: "Internal Notes", icon: Edit2 },
          { id: "activity", label: "Activity", icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg cursor-pointer transition-colors ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 bg-zinc-800 rounded-full text-zinc-400">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5 bg-zinc-900/40 border-zinc-800/80 space-y-4">
              <h3 className="text-sm font-semibold text-zinc-100">Problem Statement & User Need</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {project.problem_statement || (
                  <span className="italic text-zinc-500">
                    No problem statement documented yet. Click "Edit Project Spec" to specify the target consumer problem.
                  </span>
                )}
              </p>
            </Card>

            <Card className="p-5 bg-zinc-900/40 border-zinc-800/80 space-y-3">
              <h3 className="text-sm font-semibold text-zinc-100">Architecture & Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack?.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-lg bg-zinc-800 text-xs font-mono text-zinc-200 border border-zinc-700/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-5 bg-zinc-900/40 border-zinc-800/80 space-y-3">
              <h3 className="text-sm font-semibold text-zinc-100">Build Status Pipeline</h3>
              <select
                value={project.build_status}
                onChange={(e) => updateProject(project.id, { build_status: e.target.value as any })}
                className="w-full h-9 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="NOT_STARTED">NOT_STARTED</option>
                <option value="PLANNING">PLANNING</option>
                <option value="BUILDING">BUILDING (In Progress)</option>
                <option value="READY_FOR_SUBMISSION">READY_FOR_SUBMISSION</option>
                <option value="SUBMITTED">SUBMITTED</option>
              </select>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Updating build status notifies squad members and feeds into command center telemetry.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: TASKS */}
      {activeTab === "tasks" && (
        <Card className="p-5 bg-zinc-900/40 border-zinc-800/80 space-y-4">
          <form onSubmit={handleCreateTask} className="flex gap-2">
            <input
              type="text"
              placeholder="Add project milestone task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 h-9 px-3 rounded-lg border border-zinc-700 bg-zinc-900 text-xs text-zinc-100 focus:outline-none"
            />
            <Button type="submit" variant="primary" size="sm" className="h-9 px-4 text-xs">
              Add Task
            </Button>
          </form>

          <div className="space-y-2">
            {projectTasks.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between text-xs"
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
                  <TaskStatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: REPOSITORY */}
      {activeTab === "repository" && (
        <Card className="p-6 bg-zinc-900/40 border-zinc-800/80 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-100">Git Repository Link</h3>
          {project.repository_url ? (
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-2">
              <span className="text-xs font-mono text-indigo-400">{project.repository_url}</span>
              <p className="text-xs text-zinc-400">Keep private until submission evaluation begins.</p>
            </div>
          ) : (
            <EmptyState
              title="No Repository Attached"
              description="Enter a GitHub repository URL in Edit Spec to link code telemetry."
            />
          )}
        </Card>
      )}

      {/* TAB 4: DEMO & DEPLOYMENT */}
      {activeTab === "demo" && (
        <Card className="p-6 bg-zinc-900/40 border-zinc-800/80 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-100">Demo Video & Live Prototype</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-2">
              <div className="flex items-center gap-2 text-zinc-200 text-xs font-semibold">
                <Video className="h-4 w-4 text-indigo-400" />
                <span>Demo Video URL</span>
              </div>
              <p className="text-xs font-mono text-zinc-400">
                {project.demo_url || <MissingValueBadge type="generic" customText="No Demo URL" />}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-2">
              <div className="flex items-center gap-2 text-zinc-200 text-xs font-semibold">
                <Globe className="h-4 w-4 text-emerald-400" />
                <span>Live Prototype Deployment</span>
              </div>
              <p className="text-xs font-mono text-zinc-400">
                {project.deployment_url || <MissingValueBadge type="generic" customText="No Deployment URL" />}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 5: INTERNAL NOTES */}
      {activeTab === "notes" && (
        <Card className="p-6 bg-zinc-900/40 border-zinc-800/80 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-100">Private Squad Notes & Architecture Scratchpad</h3>
          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {project.notes || <span className="italic text-zinc-500">No private notes entered yet.</span>}
          </p>
        </Card>
      )}
    </div>
  );
}

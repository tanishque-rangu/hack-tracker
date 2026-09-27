'use client';

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  ExternalLink,
  Calendar,
  Users,
  FolderGit2,
  CheckSquare,
  GitFork,
  Send,
  Files,
  Activity,
  Plus,
  Clock,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Video,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UrgencyBadge } from "@/components/shared/urgency-badge";
import { BuildStatusBadge, RegistrationStatusBadge, TaskStatusBadge, TaskPriorityBadge } from "@/components/shared/status-badge";
import { MissingValueBadge, EmptyState } from "@/components/shared/empty-state";
import { useAppStore } from "@/lib/store/use-app-store";
import { calculateDeadlineUrgency } from "@/lib/utils/deadlines";
import { calculateSubmissionProgress, calculateRegistrationProgress } from "@/lib/utils/progress";
import { format, parseISO, isValid } from "date-fns";

export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hackathonId = params?.id as string;

  const {
    hackathons,
    teams,
    teamMembers,
    projects,
    tasks,
    registrations,
    submissions,
    files,
    activityLogs,
    users,
    currentUser,
    updateProject,
    createProject,
    createTask,
    updateTask,
    toggleRegistrationChecklistItem,
    toggleSubmissionChecklistItem,
    setDemoVideoRequired,
    requestTeamChange,
  } = useAppStore();

  const [activeTab, setActiveTab] = React.useState<
    "overview" | "timeline" | "teams" | "registration" | "project" | "tasks" | "repository" | "submission" | "files" | "activity"
  >("overview");

  // Local state for modals / inputs
  const [newProjectName, setNewProjectName] = React.useState("");
  const [newProjectDesc, setNewProjectDesc] = React.useState("");
  const [newProjectStack, setNewProjectStack] = React.useState("Next.js, TypeScript, Tailwind");
  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const [newTaskPriority, setNewTaskPriority] = React.useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [selectedTeamId, setSelectedTeamId] = React.useState<string>("");
  const [changeReason, setChangeReason] = React.useState("");
  const [showChangeModal, setShowChangeModal] = React.useState(false);

  const hackathon = hackathons.find((h) => h.id === hackathonId);
  const associatedTeams = teams.filter((t) => t.hackathon_id === hackathonId);
  const associatedTeamIds = associatedTeams.map((t) => t.id);

  // Set default selected team
  React.useEffect(() => {
    if (associatedTeams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(associatedTeams[0].id);
    }
  }, [associatedTeams, selectedTeamId]);

  if (!hackathon) {
    return (
      <div className="p-8 text-center">
        <EmptyState
          title="Hackathon Not Found"
          description={`No competition records found for ID "${hackathonId}".`}
          actionText="Back to Hackathons"
          onAction={() => router.push("/hackathons")}
        />
      </div>
    );
  }

  const currentSelectedTeam = associatedTeams.find((t) => t.id === selectedTeamId) || associatedTeams[0];
  const currentTeamMembers = teamMembers.filter((tm) => tm.team_id === currentSelectedTeam?.id);
  const currentProject = projects.find((p) => p.team_id === currentSelectedTeam?.id);
  const currentRegistration = registrations.find((r) => r.team_id === currentSelectedTeam?.id);
  const currentSubmission = submissions.find((s) => s.team_id === currentSelectedTeam?.id);
  const currentTeamTasks = tasks.filter((t) => t.team_id === currentSelectedTeam?.id);
  const currentTeamFiles = files.filter((f) => f.team_id === currentSelectedTeam?.id);
  const hackActivity = activityLogs.filter((a) => a.hackathon_id === hackathonId);

  const regCalc = calculateDeadlineUrgency(hackathon.registration_deadline);
  const subCalc = calculateDeadlineUrgency(hackathon.submission_deadline);
  const subProgress = calculateSubmissionProgress(currentSubmission?.checklist_items);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !currentSelectedTeam) return;

    createProject({
      team_id: currentSelectedTeam.id,
      name: newProjectName.trim(),
      description: newProjectDesc.trim() || null,
      problem_statement: null,
      tech_stack: newProjectStack.split(",").map((s) => s.trim()),
      build_status: "BUILDING",
      repository_url: null,
      demo_url: null,
      deployment_url: null,
      owner_id: currentUser?.id || null,
      notes: null,
    });

    setNewProjectName("");
    setNewProjectDesc("");
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !currentSelectedTeam) return;

    createTask({
      team_id: currentSelectedTeam.id,
      project_id: currentProject?.id || null,
      title: newTaskTitle.trim(),
      description: null,
      status: "TODO",
      priority: newTaskPriority,
      assignee_id: currentUser?.id || "user-guest",
      creator_id: currentUser?.id || "user-guest",
      due_date: hackathon.submission_deadline || null,
      completed_at: null,
    });

    setNewTaskTitle("");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Trophy },
    { id: "timeline", label: "Timeline", icon: Calendar },
    { id: "teams", label: "Squads", icon: Users },
    { id: "registration", label: "Registration", icon: CheckCircle2 },
    { id: "project", label: "Project Spec", icon: FolderGit2 },
    { id: "tasks", label: "Tasks", icon: CheckSquare, count: currentTeamTasks.length },
    { id: "repository", label: "Repository", icon: GitFork },
    { id: "submission", label: "Submission", icon: Send },
    { id: "files", label: "Files", icon: Files, count: currentTeamFiles.length },
    { id: "activity", label: "Activity", icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/hackathons"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Hackathons</span>
        </Link>
      </div>

      {/* Header Banner */}
      <Card className="border-zinc-800/90 bg-zinc-950/70 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/50 px-2.5 py-0.5 rounded border border-cyan-800/50">
                {hackathon.platform}
              </span>
              <UrgencyBadge urgency={regCalc.urgency} customLabel={`Reg: ${regCalc.urgency}`} />
              {hackathon.submission_deadline && (
                <UrgencyBadge urgency={subCalc.urgency} customLabel={`Sub: ${subCalc.urgency}`} />
              )}
            </div>

            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">{hackathon.name}</h1>
            <p className="text-xs text-zinc-400 max-w-2xl">{hackathon.format}</p>

            {hackathon.notes && (
              <p className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg max-w-2xl mt-2">
                <strong>Important Note:</strong> {hackathon.notes}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hackathon.registration_url && (
              <a
                href={hackathon.registration_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                  <span>Portal Website</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            )}

            {hackathon.submission_url && (
              <a
                href={hackathon.submission_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5" />
                  <span>Submission Portal</span>
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Quick summary strip */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-zinc-500 block">Registration Deadline</span>
            <span className="font-mono font-semibold text-zinc-200">
              {hackathon.registration_deadline ? format(parseISO(hackathon.registration_deadline), "MMM d, yyyy · 23:59") : "TBD"}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block">Submission Deadline</span>
            <span className="font-mono font-semibold text-zinc-200">
              {hackathon.submission_deadline ? format(parseISO(hackathon.submission_deadline), "MMM d, yyyy · 23:59") : "TBD"}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block">Event Schedule</span>
            <span className="font-mono text-zinc-300 truncate block" title={hackathon.event_dates_label || "TBD"}>
              {hackathon.event_dates_label || "TBD"}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block">Assigned Squads</span>
            <span className="font-semibold text-indigo-400">
              {associatedTeams.length} {associatedTeams.length === 1 ? "Unified Team" : "Divided Teams"}
            </span>
          </div>
        </div>
      </Card>

      {/* Team selector if multiple teams exist for this hackathon */}
      {associatedTeams.length > 1 && (
        <div className="flex items-center gap-2 bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/80">
          <span className="text-xs text-zinc-400 font-medium px-2">Viewing Squad Context:</span>
          {associatedTeams.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeamId(team.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentSelectedTeam?.id === team.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              {team.name}
            </button>
          ))}
        </div>
      )}

      {/* Tabs navigation */}
      <div className="border-b border-zinc-800 flex overflow-x-auto gap-2 pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
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
            <Card className="p-5 bg-zinc-900/40 border-zinc-800/80">
              <h3 className="text-sm font-semibold text-zinc-100 mb-2">Hackathon Overview</h3>
              <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                <strong>Format:</strong> {hackathon.format}
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                  <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Hosting Platform</span>
                  <span className="text-zinc-200 font-medium">{hackathon.platform}</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                  <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Build Status</span>
                  <BuildStatusBadge status={currentProject?.build_status || "NOT_STARTED"} />
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-zinc-900/40 border-zinc-800/80">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-100">Project Spec: {currentSelectedTeam?.name}</h3>
                <Link href={`/projects/${currentProject?.id || ""}`}>
                  <Button variant="ghost" size="sm" className="text-xs text-indigo-400">
                    Open Workspace →
                  </Button>
                </Link>
              </div>
              {currentProject ? (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100">{currentProject.name}</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{currentProject.description}</p>
                  </div>
                  {currentProject.tech_stack && currentProject.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {currentProject.tech_stack.map((t) => (
                        <Badge key={t} variant="secondary">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  title="No Project Configured Yet"
                  description="This squad has not created a project specification for this hackathon yet."
                  actionText="Switch to Project Spec Tab"
                  onAction={() => setActiveTab("project")}
                />
              )}
            </Card>
          </div>

          <div className="space-y-6">
            {/* Squad Snapshot */}
            <Card className="p-5 bg-zinc-900/40 border-zinc-800/80">
              <h3 className="text-sm font-semibold text-zinc-100 mb-3">
                Squad Roster: {currentSelectedTeam?.name}
              </h3>
              <div className="space-y-2">
                {currentTeamMembers.map((tm) => {
                  const u = users.find((usr) => usr.id === tm.user_id);
                  return (
                    <div
                      key={tm.id}
                      className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-md bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-bold">
                          {u?.full_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-200">{u?.full_name}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">{u?.role}</p>
                        </div>
                      </div>
                      {tm.role === "lead" && (
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          Lead
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/60 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChangeModal(true)}
                  className="text-xs"
                >
                  Request Squad Change
                </Button>
              </div>
            </Card>

            {/* Submission Checklist Summary */}
            <Card className="p-5 bg-zinc-900/40 border-zinc-800/80">
              <h3 className="text-sm font-semibold text-zinc-100 mb-2">Submission Checklist</h3>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span>Completion Status</span>
                <span className="font-mono font-semibold text-indigo-400">{subProgress.statusLabel}</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${subProgress.percentage}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">
                {subProgress.completedCount} of {subProgress.totalCount} items completed.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: TIMELINE */}
      {activeTab === "timeline" && (
        <Card className="p-6 bg-zinc-900/40 border-zinc-800/80">
          <h3 className="text-base font-semibold text-zinc-100 mb-4">Milestone Timeline</h3>
          <div className="relative pl-6 border-l border-zinc-800 space-y-6">
            {/* Registration Deadline */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-zinc-900 border-2 border-indigo-500" />
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-zinc-200">Registration Deadline</h4>
                  <UrgencyBadge urgency={regCalc.urgency} />
                </div>
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  {hackathon.registration_deadline ? format(parseISO(hackathon.registration_deadline), "EEEE, MMMM d, yyyy · 23:59") : "TBD"}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Relative countdown: {regCalc.relativeTime}</p>
              </div>
            </div>

            {/* Submission Deadline */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-zinc-900 border-2 border-cyan-500" />
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-zinc-200">Final Submission Deadline</h4>
                  <UrgencyBadge urgency={subCalc.urgency} />
                </div>
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  {hackathon.submission_deadline ? format(parseISO(hackathon.submission_deadline), "EEEE, MMMM d, yyyy · 23:59") : "TBD"}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Relative countdown: {subCalc.relativeTime}</p>
              </div>
            </div>

            {/* Event Dates */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-zinc-900 border-2 border-emerald-500" />
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
                <h4 className="text-xs font-semibold text-zinc-200">Event Window / Hack Days</h4>
                <p className="text-xs font-mono text-zinc-300 mt-1">{hackathon.event_dates_label || "TBD"}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Onsite build / Presentation period</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: TEAMS */}
      {activeTab === "teams" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {associatedTeams.map((team) => {
              const members = teamMembers
                .filter((tm) => tm.team_id === team.id)
                .map((tm) => ({ ...tm, profile: users.find((u) => u.id === tm.user_id) }));
              const proj = projects.find((p) => p.team_id === team.id);

              return (
                <Card key={team.id} className="p-5 bg-zinc-900/40 border-zinc-800/80">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100">{team.name}</h4>
                      <p className="text-[11px] text-zinc-500 font-mono">Team ID: {team.id}</p>
                    </div>
                    <BuildStatusBadge status={proj?.build_status || "NOT_STARTED"} />
                  </div>

                  <div className="mt-4 space-y-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block">
                      Assigned Members ({members.length})
                    </span>
                    {members.map((m) => (
                      <div
                        key={m.id}
                        className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-zinc-200">{m.profile?.full_name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500 font-mono">{m.profile?.email}</span>
                          {m.role === "lead" && (
                            <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                              Lead
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/60 flex justify-between items-center text-xs">
                    <span className="text-zinc-500">
                      {proj ? proj.name : <MissingValueBadge type="project" />}
                    </span>
                    <Link href={`/teams/${team.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs text-indigo-400 h-7">
                        Open Workspace →
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: REGISTRATION */}
      {activeTab === "registration" && (
        <Card className="p-6 bg-zinc-900/40 border-zinc-800/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">
                  Registration Checklist: {currentSelectedTeam?.name}
                </h3>
                <RegistrationStatusBadge status={currentRegistration?.status} />
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Keep the registration pipeline updated as accounts and team entries are verified on {hackathon.platform}.
              </p>
            </div>
            {hackathon.registration_url && (
              <a href={hackathon.registration_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
                  <span>Open Registration Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            )}
          </div>

          <div className="space-y-3">
            {currentRegistration?.checklist_items?.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleRegistrationChecklistItem(currentRegistration.id, item.id)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  item.is_completed
                    ? "bg-emerald-950/15 border-emerald-500/30 text-emerald-200"
                    : "bg-zinc-950/60 border-zinc-800/70 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-5 w-5 rounded flex items-center justify-center border ${
                      item.is_completed
                        ? "bg-emerald-500 border-emerald-400 text-white"
                        : "border-zinc-700 bg-zinc-900"
                    }`}
                  >
                    {item.is_completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>
                  <span className={`text-xs font-medium ${item.is_completed ? "line-through text-zinc-400" : ""}`}>
                    {item.title}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  {item.is_completed ? "Completed" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 5: PROJECT SPEC */}
      {activeTab === "project" && (
        <div className="space-y-6">
          {currentProject ? (
            <Card className="p-6 bg-zinc-900/40 border-zinc-800/80 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">{currentProject.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-2xl">{currentProject.description}</p>
                </div>
                <BuildStatusBadge status={currentProject.build_status} />
              </div>

              {currentProject.problem_statement && (
                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block mb-1">
                    Problem Statement
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">{currentProject.problem_statement}</p>
                </div>
              )}

              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block mb-2">
                  Tech Stack
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentProject.tech_stack?.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 text-xs font-mono rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status updater */}
              <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Update Build Status:</span>
                  <select
                    value={currentProject.build_status}
                    onChange={(e) => updateProject(currentProject.id, { build_status: e.target.value as any })}
                    className="h-8 px-2.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="PLANNING">Planning</option>
                    <option value="BUILDING">Building / In Progress</option>
                    <option value="READY_FOR_SUBMISSION">Ready for Submission</option>
                    <option value="SUBMITTED">Submitted</option>
                  </select>
                </div>

                <Link href={`/projects/${currentProject.id}`}>
                  <Button variant="primary" size="sm" className="text-xs">
                    Full Project Workspace →
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-zinc-900/40 border-zinc-800/80">
              <h3 className="text-sm font-semibold text-zinc-100 mb-2">Initialize Project Workspace</h3>
              <p className="text-xs text-zinc-400 mb-4">
                Define the MVP scope, architecture, and technology stack for {currentSelectedTeam?.name}.
              </p>
              <form onSubmit={handleCreateProject} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Financial Decision Assistant"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-zinc-700 bg-zinc-900 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Description / MVP Scope</label>
                  <textarea
                    rows={3}
                    placeholder="Short description of what the team is building..."
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    value={newProjectStack}
                    onChange={(e) => setNewProjectStack(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-zinc-700 bg-zinc-900 text-xs text-zinc-100 focus:outline-none"
                  />
                </div>
                <Button type="submit" variant="primary" size="sm">
                  Initialize Project
                </Button>
              </form>
            </Card>
          )}
        </div>
      )}

      {/* TAB 6: TASKS */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          {/* Quick Task Creation */}
          <Card className="p-4 bg-zinc-900/40 border-zinc-800/80">
            <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Add a new task for this squad..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 h-9 px-3 rounded-lg border border-zinc-700 bg-zinc-900 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="h-9 px-3 rounded-lg border border-zinc-700 bg-zinc-900 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent</option>
              </select>
              <Button type="submit" variant="primary" size="sm" className="h-9 px-4 text-xs shrink-0">
                Add Task
              </Button>
            </form>
          </Card>

          {/* Task List */}
          <div className="space-y-2">
            {currentTeamTasks.length === 0 ? (
              <EmptyState
                title="No Tasks for this Squad"
                description="Use the bar above to dispatch tasks for this hackathon."
              />
            ) : (
              currentTeamTasks.map((t) => {
                const assignee = users.find((u) => u.id === t.assignee_id);
                return (
                  <Card
                    key={t.id}
                    className="p-3.5 bg-zinc-900/50 border-zinc-800/70 hover:border-zinc-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <select
                        value={t.status}
                        onChange={(e) => updateTask(t.id, { status: e.target.value as any })}
                        className="h-7 px-2 rounded border border-zinc-700 bg-zinc-900 text-[11px] text-zinc-300 focus:outline-none"
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="BLOCKED">BLOCKED</option>
                        <option value="DONE">DONE</option>
                      </select>
                      <div>
                        <h4
                          className={`text-xs font-semibold ${
                            t.status === "DONE" ? "line-through text-zinc-500" : "text-zinc-200"
                          }`}
                        >
                          {t.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                          <span>Assignee: {assignee?.full_name || "Unassigned"}</span>
                          {t.due_date && (
                            <>
                              <span>·</span>
                              <span className="font-mono">Due: {format(parseISO(t.due_date), "MMM d")}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <TaskPriorityBadge priority={t.priority} />
                      <TaskStatusBadge status={t.status} />
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 7: REPOSITORY */}
      {activeTab === "repository" && (
        <Card className="p-6 bg-zinc-900/40 border-zinc-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100">Repository Management</h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              Git Isolation
            </span>
          </div>

          {currentProject?.repository_url ? (
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-indigo-400">{currentProject.repository_url}</span>
                <a href={currentProject.repository_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-xs">
                    View on GitHub
                  </Button>
                </a>
              </div>
              <p className="text-xs text-zinc-400">
                Private during development. Switch to public prior to final evaluation submission.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <EmptyState
                title="No Repository Attached"
                description="Team has not linked a GitHub repository yet. Create a private repository for collaborative development."
                icon={<GitFork className="h-6 w-6 text-zinc-500" />}
              />
              {currentProject && (
                <div className="max-w-md mx-auto flex gap-2">
                  <input
                    type="url"
                    placeholder="https://github.com/organization/repo"
                    id="repo-input"
                    className="flex-1 h-9 px-3 rounded-lg border border-zinc-700 bg-zinc-900 text-xs text-zinc-100 focus:outline-none"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const input = document.getElementById("repo-input") as HTMLInputElement;
                      if (input?.value.trim()) {
                        updateProject(currentProject.id, { repository_url: input.value.trim() });
                      }
                    }}
                  >
                    Attach
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* TAB 8: SUBMISSION */}
      {activeTab === "submission" && (
        <Card className="p-6 bg-zinc-900/40 border-zinc-800/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Submission Workspace: {currentSelectedTeam?.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Strict checklist validation. Completion is calculated dynamically from completed items.
              </p>
            </div>

            {/* Demo Video Requirement Toggle */}
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
              <Video className="h-4 w-4 text-indigo-400" />
              <div className="text-xs">
                <span className="font-medium text-zinc-200 block">Demo Video Required</span>
                <span className="text-[10px] text-zinc-500">For online evaluation phase</span>
              </div>
              <input
                type="checkbox"
                checked={currentSubmission?.demo_video_required || false}
                onChange={(e) => {
                  if (currentSelectedTeam) {
                    setDemoVideoRequired(currentSelectedTeam.id, e.target.checked);
                  }
                }}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Submission Readiness</span>
              <span className="font-mono font-bold text-indigo-400">{subProgress.percentage}% Complete</span>
            </div>
            <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${subProgress.percentage}%` }}
              />
            </div>
          </div>

          {/* Checklist items */}
          <div className="space-y-2.5">
            {currentSubmission?.checklist_items?.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleSubmissionChecklistItem(currentSubmission.id, item.id)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  item.is_completed
                    ? "bg-emerald-950/15 border-emerald-500/30 text-emerald-200"
                    : "bg-zinc-950/60 border-zinc-800/70 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-5 w-5 rounded flex items-center justify-center border ${
                      item.is_completed
                        ? "bg-emerald-500 border-emerald-400 text-white"
                        : "border-zinc-700 bg-zinc-900"
                    }`}
                  >
                    {item.is_completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <span className={`text-xs font-medium ${item.is_completed ? "line-through text-zinc-400" : ""}`}>
                      {item.title}
                    </span>
                    {item.item_key === "demo_video" && currentSubmission.demo_video_required && (
                      <span className="ml-2 text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                        Mandatory
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  {item.is_completed ? "Verified" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 9: FILES */}
      {activeTab === "files" && (
        <Card className="p-6 bg-zinc-900/40 border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Files Vault: {currentSelectedTeam?.name}</h3>
              <p className="text-xs text-zinc-400">Team-isolated Supabase storage assets.</p>
            </div>
            <Link href="/files">
              <Button variant="outline" size="sm" className="text-xs">
                Upload Asset
              </Button>
            </Link>
          </div>

          {currentTeamFiles.length === 0 ? (
            <EmptyState
              title="No Files Uploaded Yet"
              description="Upload presentations, PDFs, architecture diagrams, or screen recordings."
              icon={<Files className="h-6 w-6 text-zinc-500" />}
            />
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {currentTeamFiles.map((f) => (
                <div key={f.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 rounded font-mono text-[10px] bg-zinc-800 text-zinc-300">
                      {f.category}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">{f.file_name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {(f.file_size / (1024 * 1024)).toFixed(2)} MB · {f.created_at}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs text-indigo-400">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 10: ACTIVITY */}
      {activeTab === "activity" && (
        <Card className="p-6 bg-zinc-900/40 border-zinc-800/80 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-100 pb-2 border-b border-zinc-800/80">
            Hackathon Activity Audit
          </h3>
          {hackActivity.length === 0 ? (
            <EmptyState
              title="No Logged Activity"
              description="Any actions taken in this hackathon will be recorded in this timeline."
            />
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {hackActivity.map((log) => {
                const author = users.find((u) => u.id === log.user_id);
                return (
                  <div key={log.id} className="py-3 flex items-start gap-3">
                    <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0">
                      {author?.full_name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-200">
                        <span className="font-semibold text-zinc-100">{author?.full_name || "System"}</span>{" "}
                        <span className="text-zinc-400">· {log.action}</span>
                      </p>
                      {log.details && (
                        <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{log.details}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Squad Change Request Modal */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-zinc-100">Request Squad Reassignment</h3>
            <p className="text-xs text-zinc-400">
              Submit a formal request to change teams for {hackathon.name}. Admin review will process the assignment.
            </p>
            <textarea
              rows={3}
              placeholder="State rationale (e.g. alignment with backend track or scheduling conflict)..."
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-zinc-700 bg-zinc-950 text-xs text-zinc-100 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowChangeModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (changeReason.trim() && currentSelectedTeam) {
                    requestTeamChange({
                      hackathonId,
                      requesterId: currentUser?.id || "user-guest",
                      currentTeamId: currentSelectedTeam.id,
                      reason: changeReason.trim(),
                    });
                    setShowChangeModal(false);
                    setChangeReason("");
                  }
                }}
              >
                Submit Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

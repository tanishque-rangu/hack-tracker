'use client';

import * as React from "react";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  Video,
  ExternalLink,
  GitFork,
  FileText,
  AlertTriangle,
  Clock,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UrgencyBadge } from "@/components/shared/urgency-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useAppStore } from "@/lib/store/use-app-store";
import { calculateSubmissionProgress } from "@/lib/utils/progress";
import { calculateDeadlineUrgency } from "@/lib/utils/deadlines";
import { format, parseISO } from "date-fns";

export default function SubmissionsPage() {
  const {
    submissions,
    teams,
    hackathons,
    projects,
    tasks,
    currentUser,
    toggleSubmissionChecklistItem,
    setDemoVideoRequired,
    updateSubmission,
    createTask,
  } = useAppStore();

  const [selectedTeamId, setSelectedTeamId] = React.useState<string>(teams[0]?.id || "");
  const [submissionUrlInput, setSubmissionUrlInput] = React.useState("");

  const currentTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const currentHack = hackathons.find((h) => h.id === currentTeam?.hackathon_id);
  const currentProject = projects.find((p) => p.team_id === currentTeam?.id);
  const currentSubmission = submissions.find((s) => s.team_id === currentTeam?.id);

  const subProgress = calculateSubmissionProgress(currentSubmission?.checklist_items);
  const subUrgency = currentHack?.submission_deadline
    ? calculateDeadlineUrgency(currentHack.submission_deadline)
    : null;

  const handleToggleDemoVideo = (required: boolean) => {
    if (!currentTeam) return;
    setDemoVideoRequired(currentTeam.id, required);

    // If turned on, automatically dispatch a task if not already present
    if (required) {
      const existingDemoTask = tasks.find(
        (t) => t.team_id === currentTeam.id && t.title.toLowerCase().includes("demo video")
      );
      if (!existingDemoTask) {
        createTask({
          team_id: currentTeam.id,
          project_id: currentProject?.id || null,
          title: `Record 2-3 minute demo walkthrough video for ${currentHack?.name || "hackathon"}`,
          description: "Required for online evaluation phase. Prepare test quote sample and screen walkthrough.",
          status: "TODO",
          priority: "HIGH",
          assignee_id: currentUser?.id || "user-guest",
          creator_id: currentUser?.id || "user-guest",
          due_date: currentHack?.submission_deadline || null,
          completed_at: null,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Submission Tracker</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Verified Pipeline
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real deliverable checklists, demo video requirements, and completion metrics.
          </p>
        </div>

        {/* Squad Context Dropdown */}
        <select
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(e.target.value)}
          className="h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 focus:outline-none"
        >
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.hackathon_id})
            </option>
          ))}
        </select>
      </div>

      {/* Main workspace */}
      <Card className="p-6 bg-zinc-950/70 border-zinc-800/90 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-950/40 px-2.5 py-0.5 rounded border border-indigo-800/40">
                {currentHack?.name || "Competition"}
              </span>
              <span className="text-xs font-bold text-zinc-100">{currentTeam?.name}</span>
            </div>
            <h2 className="text-xl font-bold text-zinc-100 mt-1">
              {currentProject?.name || "Project Unnamed"}
            </h2>
            <p className="text-xs text-zinc-400">
              Platform: {currentHack?.platform} · Deadline:{" "}
              {currentHack?.submission_deadline
                ? format(parseISO(currentHack.submission_deadline), "MMM d, yyyy · 23:59")
                : "TBD"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {subUrgency && <UrgencyBadge urgency={subUrgency.urgency} />}
            {currentHack?.submission_url && (
              <a href={currentHack.submission_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
                  <span>Open Platform Submission</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Progress Metric Card */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-semibold">Deliverables Verified Progress</span>
            <span className="font-mono text-base font-bold text-indigo-400">
              {subProgress.percentage}%
            </span>
          </div>
          <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full transition-all duration-300"
              style={{ width: `${subProgress.percentage}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-400">
            {subProgress.completedCount} of {subProgress.totalCount} submission items completed.
            Completion is calculated strictly from verified checklist elements.
          </p>
        </div>

        {/* Demo Video Requirement Toggle Banner */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-950/50 text-indigo-400 border border-indigo-800/50">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-200">Online Demo Video Requirement</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Flagging this deliverable generates a high-priority video preparation task for the team.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentSubmission?.demo_video_required || false}
              onChange={(e) => handleToggleDemoVideo(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-0 cursor-pointer"
            />
            <span className="text-xs font-semibold text-zinc-200">Video Required</span>
          </label>
        </div>

        {/* Checklist Deliverables */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Mandatory Submission Checklist
          </h3>

          <div className="space-y-2">
            {currentSubmission?.checklist_items?.map((item) => {
              const isMandatoryVideo =
                item.item_key === "demo_video" && currentSubmission.demo_video_required;

              return (
                <div
                  key={item.id}
                  onClick={() => toggleSubmissionChecklistItem(currentSubmission.id, item.id)}
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

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium ${
                            item.is_completed ? "line-through text-zinc-400" : "text-zinc-200"
                          }`}
                        >
                          {item.title}
                        </span>
                        {isMandatoryVideo && (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                            Required Video Task
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Key: {item.item_key}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-zinc-500">
                    {item.is_completed ? "Verified" : "Pending"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

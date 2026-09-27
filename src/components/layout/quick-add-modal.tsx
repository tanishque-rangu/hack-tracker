'use client';

import * as React from "react";
import { Plus, CheckSquare, Trophy, UserCheck } from "lucide-react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store/use-app-store";
import { TaskPriority } from "@/lib/types";

export function QuickAddModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [tab, setTab] = React.useState<"task" | "hackathon" | "change_request">("task");
  const { currentUser, teams, hackathons, users, createTask, addHackathon, requestTeamChange } = useAppStore();

  // Task form state
  const [taskTitle, setTaskTitle] = React.useState("");
  const [taskTeamId, setTaskTeamId] = React.useState(teams[0]?.id || "");
  const [taskPriority, setTaskPriority] = React.useState<TaskPriority>("MEDIUM");
  const [taskDueDate, setTaskDueDate] = React.useState("");

  // Hackathon form state
  const [hackName, setHackName] = React.useState("");
  const [hackPlatform, setHackPlatform] = React.useState("");
  const [hackFormat, setHackFormat] = React.useState("Idea Submission -> Build");
  const [hackRegDeadline, setHackRegDeadline] = React.useState("");
  const [hackSubDeadline, setHackSubDeadline] = React.useState("");

  // Change request form state
  const [changeHackathonId, setChangeHackathonId] = React.useState(hackathons[0]?.id || "");
  const [changeReason, setChangeReason] = React.useState("");

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskTeamId) return;

    createTask({
      team_id: taskTeamId,
      title: taskTitle.trim(),
      priority: taskPriority,
      status: "TODO",
      assignee_id: currentUser?.id || "guest",
      creator_id: currentUser?.id || "guest",
      due_date: taskDueDate ? new Date(taskDueDate).toISOString() : null,
      completed_at: null,
    });

    setTaskTitle("");
    onOpenChange(false);
  };

  const handleCreateHackathon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hackName.trim()) return;

    const id = hackName.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 20);
    addHackathon({
      id: id || `hack-${Date.now()}`,
      name: hackName.trim(),
      platform: hackPlatform.trim() || "Devpost",
      format: hackFormat,
      registration_deadline: hackRegDeadline ? new Date(hackRegDeadline).toISOString() : null,
      submission_deadline: hackSubDeadline ? new Date(hackSubDeadline).toISOString() : null,
      event_start_date: null,
      event_end_date: null,
      event_dates_label: "TBD",
      registration_url: null,
      submission_url: null,
      notes: null,
    });

    setHackName("");
    onOpenChange(false);
  };

  const handleRequestChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeReason.trim()) return;

    const currentTeam = teams.find(
      (t) => t.hackathon_id === changeHackathonId
    );

    if (!currentTeam) return;

    requestTeamChange({
      hackathonId: changeHackathonId,
      requesterId: currentUser?.id || "guest",
      currentTeamId: currentTeam.id,
      reason: changeReason.trim(),
    });

    setChangeReason("");
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle>Quick Action</ModalTitle>
          <ModalDescription>Quickly dispatch a task, register a new hackathon, or request team reallocation.</ModalDescription>
        </ModalHeader>

        {/* Tab switcher */}
        <div className="flex border-b border-zinc-800 pb-2 gap-2">
          <button
            type="button"
            onClick={() => setTab("task")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-colors ${
              tab === "task" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            New Task
          </button>
          <button
            type="button"
            onClick={() => setTab("hackathon")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-colors ${
              tab === "hackathon" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            New Hackathon
          </button>
          <button
            type="button"
            onClick={() => setTab("change_request")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-colors ${
              tab === "change_request" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Team Change
          </button>
        </div>

        {tab === "task" && (
          <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
            <Input
              label="Task Title"
              placeholder="e.g. Implement API authentication flow"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">Assign to Team</label>
              <select
                value={taskTeamId}
                onChange={(e) => setTaskTeamId(e.target.value)}
                className="w-full h-9 rounded-lg border border-zinc-700/80 bg-zinc-900 px-3 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.hackathon_id})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                  className="w-full h-9 rounded-lg border border-zinc-700/80 bg-zinc-900 px-3 text-xs text-zinc-100 focus:outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div>
                <Input
                  type="date"
                  label="Due Date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end pt-3">
              <Button type="submit" variant="primary" size="md">
                Create Task
              </Button>
            </div>
          </form>
        )}

        {tab === "hackathon" && (
          <form onSubmit={handleCreateHackathon} className="space-y-4 pt-2">
            <Input
              label="Hackathon Name"
              placeholder="e.g. ETHIndia 2026"
              value={hackName}
              onChange={(e) => setHackName(e.target.value)}
              required
            />
            <Input
              label="Platform / Host"
              placeholder="e.g. Devfolio / Devpost"
              value={hackPlatform}
              onChange={(e) => setHackPlatform(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                label="Registration Deadline"
                value={hackRegDeadline}
                onChange={(e) => setHackRegDeadline(e.target.value)}
              />
              <Input
                type="date"
                label="Submission Deadline"
                value={hackSubDeadline}
                onChange={(e) => setHackSubDeadline(e.target.value)}
              />
            </div>
            <div className="flex justify-end pt-3">
              <Button type="submit" variant="primary" size="md">
                Register Hackathon
              </Button>
            </div>
          </form>
        )}

        {tab === "change_request" && (
          <form onSubmit={handleRequestChange} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">Hackathon</label>
              <select
                value={changeHackathonId}
                onChange={(e) => setChangeHackathonId(e.target.value)}
                className="w-full h-9 rounded-lg border border-zinc-700/80 bg-zinc-900 px-3 text-xs text-zinc-100 focus:outline-none"
              >
                {hackathons.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">Reason for Request</label>
              <textarea
                rows={3}
                required
                placeholder="Explain the workflow or stack preference reason for requesting a team change..."
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="w-full rounded-lg border border-zinc-700/80 bg-zinc-900 p-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end pt-3">
              <Button type="submit" variant="primary" size="md">
                Submit Request
              </Button>
            </div>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}

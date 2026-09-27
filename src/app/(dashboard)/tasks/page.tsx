'use client';

import * as React from "react";
import {
  CheckSquare,
  Plus,
  Filter,
  ArrowUpDown,
  Calendar,
  User,
  Trash2,
  Clock,
  LayoutGrid,
  List as ListIcon,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store/use-app-store";
import { Task, TaskStatus, TaskPriority } from "@/lib/types";
import { format, parseISO } from "date-fns";

export default function TasksPage() {
  const {
    tasks,
    teams,
    users,
    projects,
    currentUser,
    createTask,
    updateTask,
    deleteTask,
  } = useAppStore();

  const [viewMode, setViewMode] = React.useState<"kanban" | "list">("kanban");
  const [filterTeam, setFilterTeam] = React.useState("ALL");
  const [filterPriority, setFilterPriority] = React.useState("ALL");
  const [createModalOpen, setCreateModalOpen] = React.useState(false);

  // New task form state
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [teamId, setTeamId] = React.useState(teams[0]?.id || "");
  const [priority, setPriority] = React.useState<TaskPriority>("MEDIUM");
  const [assigneeId, setAssigneeId] = React.useState(currentUser?.id || "");
  const [dueDate, setDueDate] = React.useState("");

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      if (filterTeam !== "ALL" && t.team_id !== filterTeam) return false;
      if (filterPriority !== "ALL" && t.priority !== filterPriority) return false;
      return true;
    });
  }, [tasks, filterTeam, filterPriority]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !teamId) return;

    createTask({
      team_id: teamId,
      project_id: projects.find((p) => p.team_id === teamId)?.id || null,
      title: title.trim(),
      description: desc.trim() || null,
      status: "TODO",
      priority,
      assignee_id: assigneeId || null,
      creator_id: currentUser?.id || "user-guest",
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      completed_at: null,
    });

    setTitle("");
    setDesc("");
    setCreateModalOpen(false);
  };

  const columns: { status: TaskStatus; label: string; dotColor: string }[] = [
    { status: "TODO", label: "To Do", dotColor: "bg-zinc-400" },
    { status: "IN_PROGRESS", label: "In Progress", dotColor: "bg-amber-400" },
    { status: "BLOCKED", label: "Blocked", dotColor: "bg-rose-500" },
    { status: "DONE", label: "Done", dotColor: "bg-emerald-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Task Central</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {filteredTasks.length} Active Items
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Task dispatch, priority queuing, and compact Kanban execution board.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-md text-xs cursor-pointer ${
                viewMode === "kanban" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md text-xs cursor-pointer ${
                viewMode === "list" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 text-xs shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {/* Filter Strip */}
      <Card className="p-3 bg-zinc-900/40 border-zinc-800/80 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Filter className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        <select
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
          className="h-8 px-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-300 focus:outline-none"
        >
          <option value="ALL">All Squads</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.hackathon_id})
            </option>
          ))}
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="h-8 px-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-300 focus:outline-none"
        >
          <option value="ALL">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </Card>

      {/* KANBAN VIEW */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.status);

            return (
              <div
                key={col.status}
                className="flex flex-col rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3 min-h-[500px]"
              >
                {/* Column header */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                    <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">{col.label}</h3>
                  </div>
                  <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Task cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnTasks.map((t) => {
                    const team = teams.find((tm) => tm.id === t.team_id);
                    const assignee = users.find((u) => u.id === t.assignee_id);

                    return (
                      <Card
                        key={t.id}
                        className="p-3 bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="text-[10px] font-mono uppercase text-indigo-400 truncate max-w-[150px]">
                            {team?.name}
                          </span>
                          <TaskPriorityBadge priority={t.priority} />
                        </div>

                        <h4 className="text-xs font-semibold text-zinc-100 leading-snug">{t.title}</h4>

                        {t.description && (
                          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                            {t.description}
                          </p>
                        )}

                        <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
                          <div className="flex items-center gap-1 truncate max-w-[120px]">
                            <User className="h-3 w-3" />
                            <span className="truncate">{assignee?.full_name?.split(" ")[0] || "Unassigned"}</span>
                          </div>

                          {/* Quick move dropdown */}
                          <select
                            value={t.status}
                            onChange={(e) => updateTask(t.id, { status: e.target.value as TaskStatus })}
                            className="h-5 px-1 rounded bg-zinc-800 text-[10px] text-zinc-300 border border-zinc-700 focus:outline-none cursor-pointer"
                          >
                            <option value="TODO">TODO</option>
                            <option value="IN_PROGRESS">IN_PROG</option>
                            <option value="BLOCKED">BLOCK</option>
                            <option value="DONE">DONE</option>
                          </select>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <Card className="p-0 overflow-hidden border-zinc-800/90 bg-zinc-950/60 shadow-lg">
          <div className="divide-y divide-zinc-800/60">
            {filteredTasks.map((t) => {
              const team = teams.find((tm) => tm.id === t.team_id);
              const assignee = users.find((u) => u.id === t.assignee_id);

              return (
                <div
                  key={t.id}
                  className="p-3.5 hover:bg-zinc-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <select
                      value={t.status}
                      onChange={(e) => updateTask(t.id, { status: e.target.value as TaskStatus })}
                      className="h-7 px-2 rounded border border-zinc-700 bg-zinc-900 text-xs text-zinc-300 focus:outline-none"
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="BLOCKED">BLOCKED</option>
                      <option value="DONE">DONE</option>
                    </select>

                    <div>
                      <h4 className={`font-semibold ${t.status === "DONE" ? "line-through text-zinc-500" : "text-zinc-100"}`}>
                        {t.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                        <span className="font-mono text-indigo-400">{team?.name}</span>
                        <span>·</span>
                        <span>Assignee: {assignee?.full_name || "Unassigned"}</span>
                        {t.due_date && (
                          <>
                            <span>·</span>
                            <span className="font-mono">Due {format(parseISO(t.due_date), "MMM d")}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <TaskPriorityBadge priority={t.priority} />
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="p-1 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Create Task Modal */}
      <Modal open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle>Create New Task</ModalTitle>
            <ModalDescription>Assign milestone actions with urgency tracking.</ModalDescription>
          </ModalHeader>

          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <Input
              label="Task Title"
              placeholder="e.g. Implement OCR invoice parsing model"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Optional details or technical requirements..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs text-zinc-100 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Squad</label>
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-xs text-zinc-100 focus:outline-none"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.hackathon_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full h-9 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-xs text-zinc-100 focus:outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Assignee</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-xs text-zinc-100 focus:outline-none"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                type="date"
                label="Due Date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-3">
              <Button type="submit" variant="primary" size="md">
                Create Task
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}

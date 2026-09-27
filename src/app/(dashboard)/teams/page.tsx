'use client';

import * as React from "react";
import Link from "next/link";
import { Users, Shield, Plus, ArrowRight, FolderGit2, Pencil, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BuildStatusBadge } from "@/components/shared/status-badge";
import { MissingValueBadge } from "@/components/shared/empty-state";
import { useAppStore } from "@/lib/store/use-app-store";

export default function TeamsPage() {
  const { teams, teamMembers, hackathons, projects, users, currentUser, updateTeamName } = useAppStore();

  const [filterHackathon, setFilterHackathon] = React.useState("ALL");
  const [editingTeamId, setEditingTeamId] = React.useState<string | null>(null);
  const [editTeamNameInput, setEditTeamNameInput] = React.useState("");

  const filteredTeams = React.useMemo(() => {
    return teams.filter((t) => {
      if (filterHackathon !== "ALL" && t.hackathon_id !== filterHackathon) return false;
      return true;
    });
  }, [teams, filterHackathon]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Teams & Rosters</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {filteredTeams.length} Active Squads
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Dynamic squad configurations, member assignment rosters, and private workspaces.
          </p>
        </div>

        {/* Hackathon filter */}
        <select
          value={filterHackathon}
          onChange={(e) => setFilterHackathon(e.target.value)}
          className="h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-300 focus:outline-none"
        >
          <option value="ALL">All Competitions</option>
          {hackathons.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      {/* Grid of teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeams.map((team) => {
          const hack = hackathons.find((h) => h.id === team.hackathon_id);
          const project = projects.find((p) => p.team_id === team.id);
          const members = teamMembers
            .filter((tm) => tm.team_id === team.id)
            .map((tm) => ({ ...tm, profile: users.find((u) => u.id === tm.user_id) }));

          const isUserInTeam = currentUser ? members.some((m) => m.user_id === currentUser.id) : false;
          const isAdmin = currentUser?.role === "admin";
          const hasAccess = isAdmin || isUserInTeam;

          return (
            <Card
              key={team.id}
              className="bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col justify-between p-5"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                    {hack?.name || "Hackathon"}
                  </span>
                  <BuildStatusBadge status={project?.build_status || "NOT_STARTED"} />
                </div>

                <div className="flex items-center gap-2">
                  {editingTeamId === team.id ? (
                    <div className="flex items-center gap-1.5 w-full">
                      <input
                        type="text"
                        value={editTeamNameInput}
                        onChange={(e) => setEditTeamNameInput(e.target.value)}
                        className="h-7 px-2 text-xs bg-zinc-950 border border-indigo-500 rounded text-zinc-100 focus:outline-none flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editTeamNameInput.trim()) {
                              updateTeamName(team.id, editTeamNameInput.trim());
                            }
                            setEditingTeamId(null);
                          } else if (e.key === 'Escape') {
                            setEditingTeamId(null);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (editTeamNameInput.trim()) {
                            updateTeamName(team.id, editTeamNameInput.trim());
                          }
                          setEditingTeamId(null);
                        }}
                        className="p-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs cursor-pointer"
                      >
                        <Check size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTeamId(null)}
                        className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-base font-bold text-zinc-100">{team.name}</h3>
                      {hasAccess && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTeamId(team.id);
                            setEditTeamNameInput(team.name);
                          }}
                          className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-white/10 rounded transition-colors cursor-pointer"
                          title="Rename Team"
                        >
                          <Pencil size={12} />
                        </button>
                      )}
                      {isUserInTeam && (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono border border-indigo-500/30">
                          Your Squad
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Project preview */}
                <div className="mt-3 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-xs">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold mb-1">
                    Project Spec
                  </span>
                  {project ? (
                    <div>
                      <p className="font-semibold text-zinc-200 line-clamp-1">{project.name}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {project.description || "No description provided."}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <MissingValueBadge type="project" />
                      <span className="text-[11px] text-zinc-500">Unconfigured</span>
                    </div>
                  )}
                </div>

                {/* Members list */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block">
                    Roster ({members.length} Members)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {members.map((m) => (
                      <span
                        key={m.id}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                          currentUser && m.user_id === currentUser.id
                            ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/30"
                            : "bg-zinc-800/60 text-zinc-300 border-zinc-700/50"
                        }`}
                      >
                        {m.profile?.full_name || "Member"}
                        {m.role === "lead" && (
                          <span className="text-[9px] text-amber-400 font-mono">★</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-800/70 flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-500">
                  {hasAccess ? "Access Authorized" : "Private Workspace"}
                </span>

                <Link href={`/teams/${team.id}`}>
                  <Button
                    variant={hasAccess ? "primary" : "secondary"}
                    size="sm"
                    className="text-xs h-8"
                  >
                    {hasAccess ? "Open Workspace →" : "View Team Profile"}
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

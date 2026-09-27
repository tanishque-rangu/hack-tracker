'use client';

import * as React from "react";
import Link from "next/link";
import { Users, FolderGit2, ArrowRight, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BuildStatusBadge } from "@/components/shared/status-badge";
import { MissingValueBadge } from "@/components/shared/empty-state";
import { useAppStore } from "@/lib/store/use-app-store";

export function MyTeams() {
  const { teams, teamMembers, hackathons, projects, users, currentUser } = useAppStore();

  const userTeams = currentUser?.role === "admin"
    ? teams
    : teams.filter((t) => teamMembers.some((tm) => tm.team_id === t.id && tm.user_id === currentUser?.id));

  return (
    <Card className="border-zinc-800/90 bg-zinc-950/60 p-0 overflow-hidden shadow-lg">
      <div className="px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">
            {currentUser?.role === "admin" ? "All Active Squads (Admin View)" : "My Squads & Rosters"}
          </h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {userTeams.length} Teams
          </span>
        </div>
        <Link
          href="/teams"
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {userTeams.slice(0, 4).map((team) => {
          const hack = hackathons.find((h) => h.id === team.hackathon_id);
          const project = projects.find((p) => p.team_id === team.id);
          const membersInTeam = teamMembers
            .filter((tm) => tm.team_id === team.id)
            .map((tm) => {
              const u = users.find((usr) => usr.id === tm.user_id);
              return { ...tm, profile: u };
            });

          return (
            <div
              key={team.id}
              className="p-4 rounded-xl border border-zinc-800/70 bg-zinc-900/40 hover:border-zinc-700/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400">
                      {hack?.name || "Hackathon"}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-100">{team.name}</h4>
                  </div>
                  <BuildStatusBadge status={project?.build_status || "NOT_STARTED"} />
                </div>

                {/* Project display */}
                <div className="mt-3 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-xs">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold mb-1">
                    Active Build
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
                      <span className="text-[11px] text-zinc-500">Workspace uninitialized</span>
                    </div>
                  )}
                </div>

                {/* Team roster avatars */}
                <div className="mt-3">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold mb-1.5">
                    Roster ({membersInTeam.length} Members)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {membersInTeam.map((m) => (
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

              <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 font-mono">Platform: {hack?.platform}</span>
                <Link href={`/teams/${team.id}`}>
                  <Button variant="ghost" size="sm" className="text-xs text-indigo-400 hover:text-indigo-300 h-7 px-2">
                    Team Workspace →
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

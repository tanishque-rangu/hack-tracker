'use client';

import * as React from "react";
import Link from "next/link";
import { FolderGit2, GitFork, ExternalLink, Globe, ArrowRight, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BuildStatusBadge } from "@/components/shared/status-badge";
import { MissingValueBadge, EmptyState } from "@/components/shared/empty-state";
import { useAppStore } from "@/lib/store/use-app-store";

export default function ProjectsPage() {
  const { projects, teams, hackathons, users, currentUser } = useAppStore();

  const [filterStatus, setFilterStatus] = React.useState("ALL");

  const filteredProjects = React.useMemo(() => {
    return projects.filter((p) => {
      if (filterStatus !== "ALL" && p.build_status !== filterStatus) return false;
      return true;
    });
  }, [projects, filterStatus]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Projects & MVPs</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {filteredProjects.length} Repositories
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Build status tracking, technical stacks, repositories, and prototype links.
          </p>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-300 focus:outline-none"
        >
          <option value="ALL">All Build Statuses</option>
          <option value="NOT_STARTED">Not Started</option>
          <option value="PLANNING">Planning</option>
          <option value="BUILDING">Building / In Progress</option>
          <option value="READY_FOR_SUBMISSION">Ready for Submission</option>
          <option value="SUBMITTED">Submitted</option>
        </select>
      </div>

      {filteredProjects.length === 0 ? (
        <EmptyState
          title="No Projects Matching Filters"
          description="Initialize a project from a hackathon or team workspace."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((proj) => {
            const team = teams.find((t) => t.id === proj.team_id);
            const hack = hackathons.find((h) => h.id === team?.hackathon_id);
            const owner = users.find((u) => u.id === proj.owner_id);

            return (
              <Card
                key={proj.id}
                className="bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col justify-between p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                      {hack?.name || "Hackathon"} · {team?.name}
                    </span>
                    <BuildStatusBadge status={proj.build_status} />
                  </div>

                  <Link href={`/projects/${proj.id}`} className="group">
                    <h3 className="text-base font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">
                      {proj.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {proj.description || "No description provided."}
                  </p>

                  {/* Tech stack */}
                  {proj.tech_stack && proj.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {proj.tech_stack.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60"
                        >
                          {t}
                        </span>
                      ))}
                      {proj.tech_stack.length > 4 && (
                        <span className="text-[10px] text-zinc-500 font-mono py-0.5">
                          +{proj.tech_stack.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Links and owner */}
                  <div className="mt-4 pt-3 border-t border-zinc-800/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Project Owner:</span>
                      <span className="text-zinc-300 font-medium">
                        {owner ? owner.full_name : <MissingValueBadge type="assigned" />}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Repository:</span>
                      {proj.repository_url ? (
                        <a
                          href={proj.repository_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                        >
                          <GitFork className="h-3 w-3" />
                          <span>Linked</span>
                        </a>
                      ) : (
                        <MissingValueBadge type="repo" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-800/70 flex justify-end">
                  <Link href={`/projects/${proj.id}`}>
                    <Button variant="outline" size="sm" className="text-xs h-8">
                      Project Workspace →
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

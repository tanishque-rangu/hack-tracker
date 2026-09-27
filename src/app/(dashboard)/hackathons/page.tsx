'use client';

import * as React from "react";
import Link from "next/link";
import { Search, Filter, Trophy, ArrowUpDown, ExternalLink, Calendar, Users, FolderGit2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UrgencyBadge } from "@/components/shared/urgency-badge";
import { BuildStatusBadge, RegistrationStatusBadge } from "@/components/shared/status-badge";
import { MissingValueBadge } from "@/components/shared/empty-state";
import { useAppStore } from "@/lib/store/use-app-store";
import { calculateDeadlineUrgency } from "@/lib/utils/deadlines";
import { format, parseISO, isValid } from "date-fns";

export default function HackathonsPage() {
  const { hackathons, teams, teamMembers, projects, registrations, submissions, currentUser } = useAppStore();

  const [search, setSearch] = React.useState("");
  const [platformFilter, setPlatformFilter] = React.useState("ALL");
  const [sortBy, setSortBy] = React.useState<"reg" | "sub" | "name">("reg");
  const [viewMode, setViewMode] = React.useState<"cards" | "table">("cards");

  // Get distinct platforms
  const platforms = React.useMemo(() => {
    return Array.from(new Set(hackathons.map((h) => h.platform)));
  }, [hackathons]);

  // Filter and sort hackathons
  const filteredHackathons = React.useMemo(() => {
    return hackathons
      .filter((h) => {
        const matchesSearch =
          h.name.toLowerCase().includes(search.toLowerCase()) ||
          h.platform.toLowerCase().includes(search.toLowerCase()) ||
          h.format.toLowerCase().includes(search.toLowerCase());
        const matchesPlatform = platformFilter === "ALL" || h.platform === platformFilter;
        return matchesSearch && matchesPlatform;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "reg") {
          if (!a.registration_deadline) return 1;
          if (!b.registration_deadline) return -1;
          return new Date(a.registration_deadline).getTime() - new Date(b.registration_deadline).getTime();
        }
        if (sortBy === "sub") {
          if (!a.submission_deadline) return 1;
          if (!b.submission_deadline) return -1;
          return new Date(a.submission_deadline).getTime() - new Date(b.submission_deadline).getTime();
        }
        return 0;
      });
  }, [hackathons, search, platformFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Hackathons</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {filteredHackathons.length} Tracked
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Complete schedule, assigned squads, build statuses, and platform registration pipelines.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("cards")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              viewMode === "cards"
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              viewMode === "table"
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
            }`}
          >
            Table View
          </button>
        </div>
      </div>

      {/* Filter and search bar */}
      <Card className="p-3.5 bg-zinc-900/40 border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by hackathon name, platform, format..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="ALL">All Platforms</option>
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "reg" | "sub" | "name")}
            className="h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="reg">Sort: Registration Deadline</option>
            <option value="sub">Sort: Submission Deadline</option>
            <option value="name">Sort: Hackathon Name</option>
          </select>
        </div>
      </Card>

      {/* Grid View */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHackathons.map((h) => {
            const regCalc = calculateDeadlineUrgency(h.registration_deadline);
            const subCalc = calculateDeadlineUrgency(h.submission_deadline);

            const associatedTeams = teams.filter((t) => t.hackathon_id === h.id);
            const associatedTeamIds = associatedTeams.map((t) => t.id);

            const hackProjects = projects.filter((p) => associatedTeamIds.includes(p.team_id));
            const hackRegistrations = registrations.filter((r) => associatedTeamIds.includes(r.team_id));
            const hackSubmissions = submissions.filter((s) => associatedTeamIds.includes(s.team_id));

            return (
              <Card
                key={h.id}
                className="bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col justify-between p-5"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                      {h.platform}
                    </span>
                    <UrgencyBadge urgency={regCalc.urgency} customLabel={`Reg: ${regCalc.urgency}`} />
                  </div>

                  <Link href={`/hackathons/${h.id}`} className="group">
                    <h3 className="text-base font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">
                      {h.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{h.format}</p>

                  {/* Dates & Milestones */}
                  <div className="mt-4 space-y-2 text-xs border-t border-zinc-800/60 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Reg. Deadline:</span>
                      <span className="font-mono text-zinc-300">
                        {h.registration_deadline ? format(parseISO(h.registration_deadline), "MMM d, yyyy") : "TBD"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Sub. Deadline:</span>
                      <span className="font-mono text-zinc-300">
                        {h.submission_deadline ? format(parseISO(h.submission_deadline), "MMM d, yyyy") : "TBD"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Event Dates:</span>
                      <span className="font-mono text-zinc-400 text-[11px] truncate max-w-[170px]" title={h.event_dates_label || "TBD"}>
                        {h.event_dates_label || "TBD"}
                      </span>
                    </div>
                  </div>

                  {/* Teams & Build Status */}
                  <div className="mt-4 space-y-2 border-t border-zinc-800/60 pt-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Assigned Teams:</span>
                      <div className="flex items-center gap-1">
                        {associatedTeams.map((t) => (
                          <span key={t.id} className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-mono">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Build Status:</span>
                      {hackProjects.length > 0 ? (
                        <BuildStatusBadge status={hackProjects[0].build_status} />
                      ) : (
                        <MissingValueBadge type="project" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-800/70 flex items-center justify-between">
                  {h.registration_url ? (
                    <a
                      href={h.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-mono"
                    >
                      <span>Portal</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-600 font-mono">No External URL</span>
                  )}

                  <Link href={`/hackathons/${h.id}`}>
                    <Button variant="outline" size="sm" className="text-xs h-8">
                      Workspace Details →
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <Card className="p-0 overflow-x-auto border-zinc-800/90 bg-zinc-950/60 shadow-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
                <th className="p-3.5 font-semibold">Hackathon</th>
                <th className="p-3.5 font-semibold">Platform</th>
                <th className="p-3.5 font-semibold">Reg Deadline</th>
                <th className="p-3.5 font-semibold">Sub Deadline</th>
                <th className="p-3.5 font-semibold">Teams</th>
                <th className="p-3.5 font-semibold">Project Build</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredHackathons.map((h) => {
                const regCalc = calculateDeadlineUrgency(h.registration_deadline);
                const associatedTeams = teams.filter((t) => t.hackathon_id === h.id);
                const associatedTeamIds = associatedTeams.map((t) => t.id);
                const hackProjects = projects.filter((p) => associatedTeamIds.includes(p.team_id));

                return (
                  <tr key={h.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-3.5">
                      <Link href={`/hackathons/${h.id}`} className="font-semibold text-zinc-200 hover:text-indigo-400">
                        {h.name}
                      </Link>
                      <p className="text-[11px] text-zinc-500">{h.format}</p>
                    </td>
                    <td className="p-3.5">
                      <Badge variant="outline">{h.platform}</Badge>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-zinc-300">
                          {h.registration_deadline ? format(parseISO(h.registration_deadline), "MMM d, yyyy") : "TBD"}
                        </span>
                        <UrgencyBadge urgency={regCalc.urgency} />
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-zinc-300">
                      {h.submission_deadline ? format(parseISO(h.submission_deadline), "MMM d, yyyy") : "TBD"}
                    </td>
                    <td className="p-3.5">
                      <div className="flex gap-1">
                        {associatedTeams.map((t) => (
                          <span key={t.id} className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-mono">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5">
                      {hackProjects.length > 0 ? (
                        <BuildStatusBadge status={hackProjects[0].build_status} />
                      ) : (
                        <MissingValueBadge type="project" />
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link href={`/hackathons/${h.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-400">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

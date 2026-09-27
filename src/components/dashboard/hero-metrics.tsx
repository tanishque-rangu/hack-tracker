'use client';

import * as React from "react";
import { Trophy, Calendar, Users, FolderGit2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/lib/store/use-app-store";
import { calculateDeadlineUrgency } from "@/lib/utils/deadlines";

export function HeroMetrics() {
  const { hackathons, teams, teamMembers, projects, currentUser } = useAppStore();

  const userTeams = currentUser?.role === "admin"
    ? teams
    : teams.filter((t) => teamMembers.some((tm) => tm.team_id === t.id && tm.user_id === currentUser?.id));

  const userProjects = currentUser?.role === "admin"
    ? projects
    : projects.filter((p) => userTeams.some((t) => t.id === p.team_id));

  // Count active hackathons (where deadlines are not far in the past)
  const activeHackathonsCount = hackathons.length;

  // Count upcoming deadlines within 7 days
  const upcomingDeadlinesCount = hackathons.reduce((acc, h) => {
    let count = 0;
    if (h.registration_deadline) {
      const reg = calculateDeadlineUrgency(h.registration_deadline);
      if (reg.urgency === "CRITICAL" || reg.urgency === "DUE_SOON" || reg.urgency === "TODAY") count++;
    }
    if (h.submission_deadline) {
      const sub = calculateDeadlineUrgency(h.submission_deadline);
      if (sub.urgency === "CRITICAL" || sub.urgency === "DUE_SOON" || sub.urgency === "TODAY") count++;
    }
    return acc + count;
  }, 0);

  // Active projects building
  const inProgressProjectsCount = userProjects.filter(
    (p) => p.build_status === "BUILDING" || p.build_status === "PLANNING"
  ).length;

  const metrics = [
    {
      title: "Active Hackathons",
      value: activeHackathonsCount,
      icon: Trophy,
      desc: "Tracked across 6 platforms",
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Critical / Due Soon",
      value: upcomingDeadlinesCount,
      icon: Calendar,
      desc: "Within the next 72 hours",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: currentUser?.role === "admin" ? "All Active Teams" : "My Active Squads",
      value: userTeams.length,
      icon: Users,
      desc: `${currentUser?.role === "admin" ? "Across all divisions" : "Assigned hackathon rosters"}`,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      title: "Active Projects",
      value: inProgressProjectsCount,
      icon: FolderGit2,
      desc: `${userProjects.length} total repositories/specs`,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <Card
            key={m.title}
            className="p-4 bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">{m.title}</span>
              <div className={`p-2 rounded-lg border ${m.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-zinc-100 tracking-tight">{m.value}</div>
              <p className="text-[11px] text-zinc-500 mt-0.5">{m.desc}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

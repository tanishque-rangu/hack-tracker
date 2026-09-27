'use client';

import * as React from "react";
import Link from "next/link";
import { format, parseISO, isValid } from "date-fns";
import { Calendar, ArrowUpRight, Clock, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UrgencyBadge } from "@/components/shared/urgency-badge";
import { useAppStore } from "@/lib/store/use-app-store";
import { calculateDeadlineUrgency } from "@/lib/utils/deadlines";
import { CalculatedDeadline } from "@/lib/types";

export function UpcomingDeadlines() {
  const { hackathons, teams, teamMembers, currentUser } = useAppStore();

  const deadlines: CalculatedDeadline[] = React.useMemo(() => {
    const list: CalculatedDeadline[] = [];

    // Find teams user belongs to (or all if admin)
    const userTeams = currentUser?.role === "admin"
      ? teams
      : teams.filter((t) => teamMembers.some((tm) => tm.team_id === t.id && tm.user_id === currentUser?.id));

    const userTeamMap = new Map(userTeams.map((t) => [t.hackathon_id, t]));

    for (const h of hackathons) {
      const associatedTeam = userTeamMap.get(h.id);

      // Registration deadline
      if (h.registration_deadline) {
        const calc = calculateDeadlineUrgency(h.registration_deadline);
        list.push({
          id: `${h.id}-reg`,
          hackathon_id: h.id,
          hackathon_name: h.name,
          team_id: associatedTeam?.id,
          team_name: associatedTeam?.name || "Unassigned",
          deadline_type: "REGISTRATION",
          label: "Registration Closes",
          date: h.registration_deadline,
          relative_time: calc.relativeTime,
          urgency: calc.urgency,
          action_url: `/hackathons/${h.id}`,
          action_label: "View Portal",
        });
      }

      // Submission deadline
      if (h.submission_deadline) {
        const calc = calculateDeadlineUrgency(h.submission_deadline);
        list.push({
          id: `${h.id}-sub`,
          hackathon_id: h.id,
          hackathon_name: h.name,
          team_id: associatedTeam?.id,
          team_name: associatedTeam?.name || "Unassigned",
          deadline_type: "SUBMISSION",
          label: "Final Submission Due",
          date: h.submission_deadline,
          relative_time: calc.relativeTime,
          urgency: calc.urgency,
          action_url: `/hackathons/${h.id}`,
          action_label: "Submission Workspace",
        });
      }

      // If submission deadline is null (like iQOO), list it as TBD
      if (h.submission_deadline === null) {
        list.push({
          id: `${h.id}-sub-tbd`,
          hackathon_id: h.id,
          hackathon_name: h.name,
          team_id: associatedTeam?.id,
          team_name: associatedTeam?.name || "Unassigned",
          deadline_type: "SUBMISSION",
          label: "Final Submission Due",
          date: null,
          relative_time: "Date TBD",
          urgency: "TBD",
          action_url: `/hackathons/${h.id}`,
          action_label: "Check Schedule",
        });
      }
    }

    // Sort deadlines: CRITICAL / TODAY first, then DUE_SOON, UPCOMING, TBD, OVERDUE
    const urgencyOrder = {
      CRITICAL: 1,
      TODAY: 2,
      DUE_SOON: 3,
      UPCOMING: 4,
      TBD: 5,
      OVERDUE: 6,
      COMPLETED: 7,
    };

    return list.sort((a, b) => {
      const orderA = urgencyOrder[a.urgency] ?? 8;
      const orderB = urgencyOrder[b.urgency] ?? 8;
      if (orderA !== orderB) return orderA - orderB;

      if (a.date && b.date) {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return 0;
    });
  }, [hackathons, teams, teamMembers, currentUser]);

  return (
    <Card className="border-zinc-800/90 bg-zinc-950/60 p-0 overflow-hidden shadow-lg">
      <div className="px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">Upcoming Deadlines</h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {deadlines.length} Milestones
          </span>
        </div>
        <Link
          href="/calendar"
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
        >
          <span>Full Calendar</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-zinc-800/50">
        {deadlines.slice(0, 6).map((dl) => {
          let dateStr = "TBD";
          if (dl.date) {
            try {
              const d = parseISO(dl.date);
              if (isValid(d)) {
                dateStr = format(d, "MMM d, yyyy · HH:mm 'UTC'");
              }
            } catch {
              dateStr = dl.date;
            }
          }

          return (
            <div
              key={dl.id}
              className="p-4 hover:bg-zinc-900/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xs font-semibold text-zinc-100 truncate">
                    {dl.hackathon_name}
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    [{dl.team_name}]
                  </span>
                  <UrgencyBadge urgency={dl.urgency} />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                  <span className="font-medium text-zinc-300">{dl.label}</span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-zinc-500" />
                    {dl.relative_time}
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-500 font-mono text-[11px]">{dateStr}</span>
                </div>
              </div>

              <div className="shrink-0 self-end md:self-center">
                <Link href={dl.action_url || `/hackathons/${dl.hackathon_id}`}>
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    {dl.action_label || "Workspace"}
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

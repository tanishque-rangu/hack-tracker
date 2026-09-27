'use client';

import * as React from "react";
import Link from "next/link";
import { Activity, Clock, ShieldCheck, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store/use-app-store";
import { canUserAccessTeam } from "@/lib/utils/permissions";
import { formatDistanceToNowStrict, parseISO, isValid } from "date-fns";

export default function ActivityPage() {
  const { activityLogs, teams, teamMembers, hackathons, users, currentUser } = useAppStore();

  const [filterTeam, setFilterTeam] = React.useState("ALL");

  const scopedLogs = React.useMemo(() => {
    return activityLogs.filter((log) => {
      // If admin, see all
      if (currentUser?.role === "admin") {
        if (filterTeam !== "ALL" && log.team_id !== filterTeam) return false;
        return true;
      }

      // If global hackathon log
      if (!log.team_id) return true;

      // Check team authorization
      const authorized = canUserAccessTeam(currentUser, log.team_id, teamMembers);
      if (!authorized) return false;

      if (filterTeam !== "ALL" && log.team_id !== filterTeam) return false;
      return true;
    });
  }, [activityLogs, currentUser, teamMembers, filterTeam]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Activity Feed</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Audit Trail
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Scoped chronological audit trail. Team A cannot inspect Team B private updates.
          </p>
        </div>

        {/* Team filter */}
        <select
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
          className="h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-300 focus:outline-none"
        >
          <option value="ALL">All Authorized Squads</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.hackathon_id})
            </option>
          ))}
        </select>
      </div>

      {/* Activity stream */}
      <Card className="p-0 overflow-hidden border-zinc-800/90 bg-zinc-950/60 shadow-lg">
        <div className="divide-y divide-zinc-800/60">
          {scopedLogs.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-12">No activity logged.</p>
          ) : (
            scopedLogs.map((log) => {
              const author = users.find((u) => u.id === log.user_id);
              const team = teams.find((t) => t.id === log.team_id);
              const hack = hackathons.find((h) => h.id === log.hackathon_id);

              let timeStr = "recently";
              try {
                const d = parseISO(log.created_at);
                if (isValid(d)) {
                  timeStr = formatDistanceToNowStrict(d, { addSuffix: true });
                }
              } catch {
                timeStr = log.created_at;
              }

              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-zinc-900/40 transition-colors flex items-start gap-3.5 text-xs"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {author?.full_name?.charAt(0) || "S"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-100">{author?.full_name || "System"}</span>
                        <span className="text-zinc-500">·</span>
                        <span className="font-semibold text-zinc-300">{log.action}</span>
                        {team && (
                          <Badge variant="outline" size="sm">
                            {team.name}
                          </Badge>
                        )}
                        {hack && (
                          <span className="text-[10px] font-mono text-zinc-500">
                            [{hack.name}]
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 shrink-0">
                        <Clock className="h-3 w-3" />
                        {timeStr}
                      </span>
                    </div>

                    {log.details && (
                      <p className="text-zinc-400 mt-1 leading-relaxed">{log.details}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

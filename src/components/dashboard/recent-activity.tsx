'use client';

import * as React from "react";
import Link from "next/link";
import { formatDistanceToNowStrict, parseISO, isValid } from "date-fns";
import { Activity, Clock, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/lib/store/use-app-store";

export function RecentActivity() {
  const { activityLogs, teams, teamMembers, users, currentUser } = useAppStore();

  const userTeams = currentUser?.role === "admin"
    ? teams
    : teams.filter((t) => teamMembers.some((tm) => tm.team_id === t.id && tm.user_id === currentUser?.id));

  const allowedTeamIds = new Set(userTeams.map((t) => t.id));

  // Scoped activity filter: Admin sees all; User only sees activity from their teams or global (team_id === null)
  const scopedLogs = activityLogs.filter((log) => {
    if (currentUser?.role === "admin") return true;
    if (!log.team_id) return true;
    return allowedTeamIds.has(log.team_id);
  });

  return (
    <Card className="border-zinc-800/90 bg-zinc-950/60 p-0 overflow-hidden shadow-lg">
      <div className="px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">Recent Activity Feed</h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Real-time
          </span>
        </div>
        <Link
          href="/activity"
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
        >
          <span>All Logs</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-zinc-800/50">
        {scopedLogs.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6">No recent scoped activity recorded.</p>
        ) : (
          scopedLogs.slice(0, 5).map((log) => {
            const author = users.find((u) => u.id === log.user_id);
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
              <div key={log.id} className="p-3.5 hover:bg-zinc-900/40 transition-colors flex items-start gap-3">
                <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0 mt-0.5">
                  {author?.full_name?.charAt(0) || "S"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-zinc-200 truncate">
                      <span className="font-semibold text-zinc-100">{author?.full_name || "System"}</span>{" "}
                      <span className="text-zinc-400">· {log.action}</span>
                    </p>
                    <span className="text-[10px] text-zinc-500 shrink-0 flex items-center gap-1 font-mono">
                      <Clock className="h-2.5 w-2.5" />
                      {timeStr}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{log.details}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

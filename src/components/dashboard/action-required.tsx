'use client';

import * as React from "react";
import Link from "next/link";
import { AlertCircle, AlertTriangle, GitFork, Video, ShieldCheck, UserX, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/use-app-store";
import { calculateDeadlineUrgency } from "@/lib/utils/deadlines";

interface ActionItem {
  id: string;
  type: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  description: string;
  link: string;
  actionText: string;
  icon: React.ReactNode;
}

export function ActionRequired() {
  const { hackathons, teams, teamMembers, projects, submissions, registrations, users, currentUser } = useAppStore();

  const userTeams = currentUser?.role === "admin"
    ? teams
    : teams.filter((t) => teamMembers.some((tm) => tm.team_id === t.id && tm.user_id === currentUser?.id));

  const userTeamIds = new Set(userTeams.map((t) => t.id));

  const actionItems: ActionItem[] = [];

  // 1. Check critical registration deadlines
  for (const h of hackathons) {
    if (h.registration_deadline) {
      const urgency = calculateDeadlineUrgency(h.registration_deadline);
      if (urgency.urgency === "CRITICAL" || urgency.urgency === "TODAY") {
        // Find user team in this hackathon
        const teamInHack = userTeams.find((t) => t.hackathon_id === h.id);
        const reg = registrations.find((r) => r.team_id === teamInHack?.id);
        if (reg?.status !== "FULLY_REGISTERED") {
          actionItems.push({
            id: `reg-deadline-${h.id}`,
            type: "CRITICAL",
            title: `Registration Closing: ${h.name}`,
            description: `Registration closes ${urgency.relativeTime}. Ensure team verification and credentials are submitted on ${h.platform}.`,
            link: `/hackathons/${h.id}`,
            actionText: "Verify Registration",
            icon: <AlertCircle className="h-4 w-4 text-rose-400" />,
          });
        }
      }
    }
  }

  // 2. Check unverified platform accounts
  const unverifiedUsers = users.filter((u) => u.platform_accounts && !u.platform_accounts.allVerified);
  for (const u of unverifiedUsers) {
    if (currentUser?.role === "admin" || currentUser?.id === u.id) {
      actionItems.push({
        id: `unverified-${u.id}`,
        type: "WARNING",
        title: `${u.full_name} has pending platform verification`,
        description: `External handles on Unstop, Devpost, or Centle need confirmation to avoid team disqualification.`,
        link: "/settings",
        actionText: "Complete Verification",
        icon: <ShieldCheck className="h-4 w-4 text-amber-400" />,
      });
    }
  }

  // 3. Check projects missing GitHub repository
  for (const p of projects) {
    if (userTeamIds.has(p.team_id) || currentUser?.role === "admin") {
      if (!p.repository_url) {
        const team = teams.find((t) => t.id === p.team_id);
        actionItems.push({
          id: `repo-missing-${p.id}`,
          type: "WARNING",
          title: `GitHub Repository Missing: ${p.name}`,
          description: `Team "${team?.name}" does not have an attached development repository. Create a private repository for MVP build.`,
          link: `/projects/${p.id}`,
          actionText: "Attach Repository",
          icon: <GitFork className="h-4 w-4 text-cyan-400" />,
        });
      }
    }
  }

  // 4. Check demo video requirements for online competitions
  for (const sub of submissions) {
    if (sub.demo_video_required && (userTeamIds.has(sub.team_id) || currentUser?.role === "admin")) {
      const demoItem = sub.checklist_items?.find((i) => i.item_key === "demo_video");
      if (!demoItem?.is_completed) {
        const team = teams.find((t) => t.id === sub.team_id);
        const hack = hackathons.find((h) => h.id === team?.hackathon_id);
        actionItems.push({
          id: `demo-required-${sub.id}`,
          type: "INFO",
          title: `Demo Video Required: ${hack?.name || "Competition"}`,
          description: `Team "${team?.name}" requires a 2-3 minute demo walkthrough recording prior to final submission.`,
          link: `/submissions`,
          actionText: "Review Checklist",
          icon: <Video className="h-4 w-4 text-indigo-400" />,
        });
      }
    }
  }

  // 5. Check projects without assigned owners
  for (const p of projects) {
    if ((userTeamIds.has(p.team_id) || currentUser?.role === "admin") && !p.owner_id) {
      actionItems.push({
        id: `no-owner-${p.id}`,
        type: "INFO",
        title: `Project Has No Assigned Lead: ${p.name}`,
        description: `Assign a project owner to coordinate task dispatch and submission responsibilities.`,
        link: `/projects/${p.id}`,
        actionText: "Assign Lead",
        icon: <UserX className="h-4 w-4 text-zinc-400" />,
      });
    }
  }

  if (actionItems.length === 0) {
    return (
      <Card className="bg-zinc-900/30 border-zinc-800/80 p-5">
        <div className="flex items-center gap-3 text-emerald-400">
          <ShieldCheck className="h-5 w-5" />
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">All Immediate Actions Cleared</h3>
            <p className="text-xs text-zinc-500">No urgent blocker or missing repository requirements flagged right now.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-zinc-800/90 bg-zinc-950/60 p-0 overflow-hidden shadow-lg">
      <div className="px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">Action Required</h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            {actionItems.length} Urgent Items
          </span>
        </div>
        <span className="text-[11px] text-zinc-500 hidden sm:inline">Priority triage for active squads</span>
      </div>

      <div className="divide-y divide-zinc-800/60 max-h-[380px] overflow-y-auto">
        {actionItems.map((item) => (
          <div
            key={item.id}
            className="p-4 hover:bg-zinc-900/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-zinc-800/80 shrink-0 mt-0.5 sm:mt-0">
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-zinc-200">{item.title}</h4>
                  {item.type === "CRITICAL" && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-rose-500/20 text-rose-400 rounded">
                      Critical
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{item.description}</p>
              </div>
            </div>

            <Link href={item.link} className="shrink-0 self-end sm:self-center">
              <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5 h-8">
                <span>{item.actionText}</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
}

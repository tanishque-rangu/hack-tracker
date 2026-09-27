'use client';

import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Settings2,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  GitPullRequest,
  BarChart3,
  Sparkles,
  Lock,
  UserPlus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { useAppStore } from "@/lib/store/use-app-store";
import {
  calculatePairCollaborationHistory,
  suggestTeamCombinations,
  validateTeamAssignmentAgainstRules,
} from "@/lib/utils/team-rules";
import { AssignmentRuleType, TeamAssignmentRule } from "@/lib/types";

export default function AdminPage() {
  const {
    currentUser,
    users,
    teams,
    hackathons,
    rules,
    changeRequests,
    toggleRule,
    deleteRule,
    createRule,
    reviewTeamChangeRequest,
    createTeam,
    addUser,
    resetToSeedData,
  } = useAppStore();

  const [activeTab, setActiveTab] = React.useState<"rules" | "history" | "generator" | "requests" | "users">("rules");

  // Generator state
  const [targetHackathonId, setTargetHackathonId] = React.useState(hackathons[0]?.id || "");
  const [numTeamsToGenerate, setNumTeamsToGenerate] = React.useState(2);
  const [suggestedTeams, setSuggestedTeams] = React.useState<{ name: string; members: typeof users }[] | null>(null);

  // New rule state
  const [newRuleTitle, setNewRuleTitle] = React.useState("");
  const [newRuleDesc, setNewRuleDesc] = React.useState("");
  const [newRuleType, setNewRuleType] = React.useState<AssignmentRuleType>("SEPARATE_MEMBERS");
  const [newRuleUser1, setNewRuleUser1] = React.useState(users[0]?.id || "");
  const [newRuleUser2, setNewRuleUser2] = React.useState(users[1]?.id || "");

  // New user state
  const [newUserName, setNewUserName] = React.useState("");
  const [newUserEmail, setNewUserEmail] = React.useState("");
  const [newUserRole, setNewUserRole] = React.useState<"member" | "coordinator">("member");

  // =========================================================================
  // STRICT ADMIN AUTHORIZATION CHECK
  // =========================================================================
  if (currentUser?.role !== "admin") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="border-amber-900/50 bg-amber-950/20 p-8 text-center space-y-4 shadow-2xl">
          <div className="h-14 w-14 rounded-full bg-amber-900/40 text-amber-400 border border-amber-800/50 flex items-center justify-center mx-auto">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-amber-200">Admin Authorization Required (403)</h2>
          <p className="text-xs text-amber-300/80 max-w-md mx-auto leading-relaxed">
            You are logged in as <strong>{currentUser?.full_name || "Guest"}</strong> (Role: {currentUser?.role || "None"}).
            Only system administrators have permission to access team assignment configuration, rule engines, and review workflows.
          </p>
          <div className="pt-2 flex justify-center">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
              >
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Calculate pair collaboration history
  const pairHistory = calculatePairCollaborationHistory(teams, users);

  const handleGenerate = () => {
    const result = suggestTeamCombinations(users, numTeamsToGenerate, rules, pairHistory);
    setSuggestedTeams(result.teams);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleTitle.trim()) return;

    createRule({
      rule_type: newRuleType,
      title: newRuleTitle.trim(),
      description: newRuleDesc.trim(),
      member_ids: newRuleType === "SEPARATE_MEMBERS" ? [newRuleUser1, newRuleUser2] : [],
      is_active: true,
    });

    setNewRuleTitle("");
    setNewRuleDesc("");
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    addUser({
      full_name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      platform_accounts: {
        allVerified: true,
      },
    });

    setNewUserName("");
    setNewUserEmail("");
  };

  const pendingRequests = changeRequests.filter((r) => r.status === "PENDING");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Admin Console</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Root Level
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Configurable assignment rules, collaboration history matrices, and partner change workflow reviews.
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm("Reset all store data back to initial seed state?")) {
              resetToSeedData();
            }
          }}
          className="text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 bg-zinc-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset Clean Seed</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800 flex gap-2 pb-1 overflow-x-auto">
        {[
          { id: "rules", label: "Assignment Rules", count: rules.length },
          { id: "generator", label: "Smart Team Generator" },
          { id: "history", label: "Pair Collaboration History", count: pairHistory.length },
          { id: "requests", label: "Change Requests Workflow", count: pendingRequests.length },
          { id: "users", label: "Manage Members & Scale", count: users.length },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                isActive
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="ml-1.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: RULES CONFIGURATION */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          <Card className="p-6 bg-zinc-950/70 border-zinc-800/90 shadow-xl space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Configured Team Assignment Rules</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Rules are configurable algorithmic constraints, never permanently hard-coded assumptions.
              </p>
            </div>

            <div className="space-y-3">
              {rules.map((rule) => {
                const memberNames = rule.member_ids
                  .map((id) => users.find((u) => u.id === id)?.full_name)
                  .filter(Boolean)
                  .join(" & ");

                return (
                  <div
                    key={rule.id}
                    className="p-4 rounded-xl border border-zinc-800/70 bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-100">{rule.title}</span>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {rule.rule_type}
                        </Badge>
                        {rule.is_active ? (
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.2 rounded border border-emerald-500/30">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.2 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400">{rule.description}</p>
                      {memberNames && (
                        <p className="text-[11px] text-amber-400 font-mono">
                          Target Members: {memberNames}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant={rule.is_active ? "outline" : "primary"}
                        size="sm"
                        onClick={() => toggleRule(rule.id)}
                        className="text-xs h-7"
                      >
                        {rule.is_active ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Add New Rule Form */}
          <Card className="p-6 bg-zinc-950/70 border-zinc-800/90 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100">Add Custom Assignment Rule</h3>
            <form onSubmit={handleCreateRule} className="space-y-4 max-w-xl text-xs">
              <Input
                label="Rule Title"
                placeholder="e.g. Separate Frontend Specialists"
                value={newRuleTitle}
                onChange={(e) => setNewRuleTitle(e.target.value)}
                required
              />

              <Input
                label="Description"
                placeholder="e.g. Ensure balanced distribution of designers"
                value={newRuleDesc}
                onChange={(e) => setNewRuleDesc(e.target.value)}
                required
              />

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Rule Type</label>
                <select
                  value={newRuleType}
                  onChange={(e) => setNewRuleType(e.target.value as AssignmentRuleType)}
                  className="w-full h-9 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-zinc-200 focus:outline-none"
                >
                  <option value="SEPARATE_MEMBERS">SEPARATE_MEMBERS (Do not put together)</option>
                  <option value="PREFER_UNIQUE_COMBINATIONS">PREFER_UNIQUE_COMBINATIONS (Diversity)</option>
                  <option value="BALANCE_TEAM_SIZES">BALANCE_TEAM_SIZES (Equal division)</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
              </div>

              {newRuleType === "SEPARATE_MEMBERS" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Member 1</label>
                    <select
                      value={newRuleUser1}
                      onChange={(e) => setNewRuleUser1(e.target.value)}
                      className="w-full h-9 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-zinc-200 focus:outline-none"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Member 2</label>
                    <select
                      value={newRuleUser2}
                      onChange={(e) => setNewRuleUser2(e.target.value)}
                      className="w-full h-9 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-zinc-200 focus:outline-none"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <Button type="submit" variant="primary" size="sm">
                Add Rule
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* TAB 2: SMART GENERATOR */}
      {activeTab === "generator" && (
        <Card className="p-6 bg-zinc-950/70 border-zinc-800/90 shadow-xl space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-zinc-100">Algorithmic Team Combinations Generator</h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Computes optimal squad distributions by balancing sizes, respecting separation rules, and minimizing repeat collaborations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400">Number of Split Squads:</span>
              <select
                value={numTeamsToGenerate}
                onChange={(e) => setNumTeamsToGenerate(Number(e.target.value))}
                className="h-8 px-3 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 focus:outline-none"
              >
                <option value={1}>1 (Unified Squad)</option>
                <option value={2}>2 (Divided Squads)</option>
                <option value={3}>3 (Tri-Squad Split)</option>
              </select>
            </div>

            <Button variant="primary" size="sm" onClick={handleGenerate} className="text-xs flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generate Combinations</span>
            </Button>
          </div>

          {suggestedTeams && (
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Algorithm Output Proposal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestedTeams.map((team, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-zinc-100">{team.name}</h4>
                      <span className="text-[11px] font-mono text-indigo-400">{team.members.length} Members</span>
                    </div>

                    <div className="space-y-1.5">
                      {team.members.map((m) => (
                        <div
                          key={m.id}
                          className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs flex items-center justify-between"
                        >
                          <span className="font-medium text-zinc-200">{m.full_name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{m.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* TAB 3: PAIR COLLABORATION HISTORY */}
      {activeTab === "history" && (
        <Card className="p-6 bg-zinc-950/70 border-zinc-800/90 shadow-xl space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Pair Collaboration Matrix</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Tracks how many times each pair of members has worked together across all competitions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-900/60">
                  <th className="p-3 font-semibold">Member Pair</th>
                  <th className="p-3 font-semibold text-center">Co-Work Frequency</th>
                  <th className="p-3 font-semibold">Shared Hackathons</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {pairHistory.map((ph, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-3 font-medium text-zinc-200">
                      {ph.user_a_name} & {ph.user_b_name}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`font-mono px-2 py-0.5 rounded text-xs font-bold ${
                          ph.count > 2
                            ? "bg-indigo-500/20 text-indigo-300"
                            : ph.count > 0
                            ? "bg-zinc-800 text-zinc-300"
                            : "bg-zinc-900 text-zinc-500"
                        }`}
                      >
                        {ph.count} {ph.count === 1 ? "time" : "times"}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-400">
                      {ph.hackathon_names.length > 0 ? (
                        ph.hackathon_names.join(", ")
                      ) : (
                        <span className="italic text-zinc-600">None yet</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 4: CHANGE REQUESTS WORKFLOW */}
      {activeTab === "requests" && (
        <Card className="p-6 bg-zinc-950/70 border-zinc-800/90 shadow-xl space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Team Change Workflow Approvals</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Review and approve/reject partner reassignments submitted by squad members.
            </p>
          </div>

          <div className="space-y-3">
            {changeRequests.length === 0 ? (
              <EmptyState
                title="No Change Requests"
                description="Squad members have not submitted any team change workflows."
              />
            ) : (
              changeRequests.map((req) => {
                const requester = users.find((u) => u.id === req.requester_id);
                const hack = hackathons.find((h) => h.id === req.hackathon_id);
                const currentTeam = teams.find((t) => t.id === req.current_team_id);

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-zinc-800/70 bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-100">{requester?.full_name}</span>
                        <span className="text-zinc-500">requests transfer from</span>
                        <span className="font-semibold text-indigo-400">{currentTeam?.name}</span>
                        <span className="text-[10px] font-mono text-zinc-500">[{hack?.name}]</span>
                      </div>
                      <p className="text-zinc-400">"{req.reason}"</p>
                      <span className="text-[10px] text-zinc-500 font-mono block">
                        Status: {req.status}
                      </span>
                    </div>

                    {req.status === "PENDING" && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => reviewTeamChangeRequest(req.id, "APPROVED")}
                          className="text-xs h-7"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => reviewTeamChangeRequest(req.id, "REJECTED")}
                          className="text-xs h-7"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

      {/* TAB 5: USERS & SCALE */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <Card className="p-6 bg-zinc-950/70 border-zinc-800/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h2 className="text-sm font-semibold text-zinc-100">All Registered Members ({users.length})</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  SquadSync supports arbitrary users, arbitrary team sizes, and arbitrary hackathons.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-semibold text-zinc-200">{u.full_name}</h4>
                    <p className="text-[11px] text-zinc-500 font-mono">{u.email}</p>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {u.role}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Add Member Form */}
          <Card className="p-6 bg-zinc-950/70 border-zinc-800/90 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100">Add New Team Member</h3>
            <form onSubmit={handleCreateUser} className="space-y-4 max-w-xl text-xs">
              <Input
                label="Full Name"
                placeholder="e.g. Aditya Sharma"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. aditya@squadsync.internal"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
              />
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-zinc-200 focus:outline-none"
                >
                  <option value="member">Member</option>
                  <option value="coordinator">Team Coordinator</option>
                </select>
              </div>
              <Button type="submit" variant="primary" size="sm">
                Add Member
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

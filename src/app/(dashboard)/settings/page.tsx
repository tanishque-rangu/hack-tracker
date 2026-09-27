'use client';

import * as React from "react";
import { User, ShieldCheck, ExternalLink, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store/use-app-store";
import { UserProfile } from "@/lib/types";

export default function SettingsPage() {
  const { currentUser, users, switchUser } = useAppStore();

  const [fullName, setFullName] = React.useState(currentUser?.full_name || "");
  const [email, setEmail] = React.useState(currentUser?.email || "");
  const [unstop, setUnstop] = React.useState(currentUser?.platform_accounts?.unstop || "");
  const [devpost, setDevpost] = React.useState(currentUser?.platform_accounts?.devpost || "");
  const [centle, setCentle] = React.useState(currentUser?.platform_accounts?.centle || "");
  const [reskilll, setReskilll] = React.useState(currentUser?.platform_accounts?.reskilll || "");
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name);
      setEmail(currentUser.email);
      setUnstop(currentUser.platform_accounts?.unstop || "");
      setDevpost(currentUser.platform_accounts?.devpost || "");
      setCentle(currentUser.platform_accounts?.centle || "");
      setReskilll(currentUser.platform_accounts?.reskilll || "");
    }
  }, [currentUser]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const isAllVerified = Boolean(unstop && devpost && centle && reskilll);

    useAppStore.setState((state) => {
      if (!state.currentUser) return state;
      const updatedUser: UserProfile = {
        ...state.currentUser,
        full_name: fullName,
        email,
        platform_accounts: {
          unstop,
          devpost,
          centle,
          reskilll,
          allVerified: isAllVerified,
        },
      };
      return {
        currentUser: updatedUser,
        users: state.users.map((u) => (u.id === state.currentUser?.id ? updatedUser : u)),
      };
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const isVerified = currentUser?.platform_accounts?.allVerified;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Account & Platform Handles</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Verify external hackathon credentials across Unstop, Devpost, Centle, and Reskilll.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <Card className="p-6 bg-zinc-950/70 border-zinc-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-100">User Profile</h2>
            <Badge variant="outline" className="font-mono text-xs">
              Role: {currentUser?.role?.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Platform Handles Card */}
        <Card className="p-6 bg-zinc-950/70 border-zinc-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Platform Accounts Verification</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Required for cross-platform team invite acceptance and eligibility validation.
              </p>
            </div>
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full font-mono">
                <CheckCircle2 className="h-3.5 w-3.5" />
                All 4 Platforms Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-full font-mono">
                <AlertCircle className="h-3.5 w-3.5" />
                Pending Verification
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Unstop Username"
              placeholder="e.g. your_unstop_handle"
              value={unstop}
              onChange={(e) => setUnstop(e.target.value)}
            />
            <Input
              label="Devpost Profile Handle"
              placeholder="e.g. devpost-user"
              value={devpost}
              onChange={(e) => setDevpost(e.target.value)}
            />
            <Input
              label="Centle Username"
              placeholder="e.g. centle_handle"
              value={centle}
              onChange={(e) => setCentle(e.target.value)}
            />
            <Input
              label="Reskilll User ID"
              placeholder="e.g. reskilll_handle"
              value={reskilll}
              onChange={(e) => setReskilll(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-mono">
              Auto-verifies team eligibility for upcoming hackathons
            </span>
            <Button type="submit" variant="primary" size="sm" className="flex items-center gap-1.5">
              <Save className="h-3.5 w-3.5" />
              <span>{saved ? "Saved Successfully!" : "Save Changes"}</span>
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

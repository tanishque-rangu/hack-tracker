'use client';

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  Users,
  FolderGit2,
  CheckSquare,
  Calendar,
  Send,
  Files,
  Activity,
  Settings,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAppStore } from "@/lib/store/use-app-store";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { currentUser } = useAppStore();

  const navigation = [
    { name: "Command Center", href: "/dashboard", icon: LayoutDashboard },
    { name: "Squad Chat", href: "/chat", icon: MessageSquare },
    { name: "Hackathons", href: "/hackathons", icon: Trophy },
    { name: "Teams", href: "/teams", icon: Users },
    { name: "Projects", href: "/projects", icon: FolderGit2 },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Calendar & Deadlines", href: "/calendar", icon: Calendar },
    { name: "Submissions", href: "/submissions", icon: Send },
    { name: "File Vault", href: "/files", icon: Files },
    { name: "Activity Feed", href: "/activity", icon: Activity },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const isAdmin = currentUser?.role === "admin";

  return (
    <aside
      className={cn(
        "flex flex-col w-64 border-r border-zinc-800/80 bg-zinc-950/90 text-zinc-300 h-screen sticky top-0 select-none z-30",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-zinc-800/80">
        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 font-black text-sm tracking-wider font-mono">
          HT
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-zinc-100 tracking-tight">HackTrack</span>
            <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.2 rounded font-mono font-medium border border-indigo-500/30">
              v1.0
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Command Center</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Core Workspaces
        </div>
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all",
                isActive
                  ? "bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/25"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"
                  )}
                />
                <span>{item.name}</span>
              </div>
              {isActive && (
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              )}
            </Link>
          );
        })}

        {/* Admin Navigation */}
        {isAdmin && (
          <div className="pt-5 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
              <span>Administration</span>
              <ShieldAlert className="h-3 w-3 text-amber-500" />
            </div>
            <Link
              href="/admin"
              className={cn(
                "group flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all",
                pathname.startsWith("/admin")
                  ? "bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30"
                  : "text-zinc-400 hover:text-amber-200 hover:bg-zinc-900/60"
              )}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert
                  className={cn(
                    "h-4 w-4",
                    pathname.startsWith("/admin") ? "text-amber-400" : "text-zinc-500 group-hover:text-amber-400"
                  )}
                />
                <span>Admin Console</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                Root
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* User Status Footer */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60">
        {currentUser ? (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/60">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              {currentUser.full_name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-zinc-200 truncate">
                  {currentUser.full_name}
                </p>
                {currentUser.role === "admin" && (
                  <span className="text-[9px] font-mono px-1 py-0.2 bg-amber-500/20 text-amber-400 rounded">
                    ADM
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 truncate">{currentUser.email}</p>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 transition-colors"
          >
            <span className="text-xs font-semibold">Sign In (Email OTP)</span>
            <span className="text-xs">→</span>
          </Link>
        )}
      </div>
    </aside>
  );
}

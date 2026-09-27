'use client';

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Bell, Plus, Menu, User, Shield, Check, RefreshCw, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/use-app-store";
import { createClient } from "@/lib/supabase/client";
import { QuickAddModal } from "./quick-add-modal";

export function TopNav({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const router = useRouter();
  const { currentUser, users, switchUser, notifications, markNotificationAsRead, resetToSeedData } = useAppStore();
  const [quickAddOpen, setQuickAddOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);

  const handleLogout = async () => {
    document.cookie = "squadsync_session=; path=/; max-age=0";
    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    router.push("/login");
  };

  const unreadNotifications = notifications.filter((n) => !n.is_read);
  const formattedDate = format(new Date(), "EEEE, MMM d, yyyy");

  return (
    <>
      <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Left section: mobile hamburger & greeting */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800"
              aria-label="Toggle Navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-semibold text-zinc-100 tracking-tight">
                Hey, {currentUser?.full_name?.split(" ")[0]}
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/60 hidden sm:inline-block">
                {currentUser?.role?.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 hidden sm:block">{formattedDate}</p>
          </div>
        </div>

        {/* Right Section: Quick Add, User Switcher, Notifications, Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick-Add Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setQuickAddOpen(true)}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Quick Add</span>
          </Button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-900 border border-zinc-800/80 cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl p-3 z-50 animate-in fade-in-0 zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-200">Notifications</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {unreadNotifications.length} Unread
                  </span>
                </div>
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4">No notifications.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                          n.is_read
                            ? "bg-zinc-950/40 border-zinc-800/50 text-zinc-400"
                            : "bg-indigo-950/20 border-indigo-500/30 text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-zinc-200">{n.title}</p>
                          {!n.is_read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account / Sign In */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 cursor-pointer"
              >
                <div className="h-7 w-7 rounded-md bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                  {currentUser.full_name?.charAt(0) || "U"}
                </div>
                <span className="text-xs font-medium text-zinc-200 hidden md:inline">
                  {currentUser.full_name}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl p-2 z-50 animate-in fade-in-0 zoom-in-95">
                  <div className="px-2.5 py-2 border-b border-zinc-800 mb-1 space-y-0.5">
                    <p className="text-xs font-semibold text-zinc-100 truncate">
                      {currentUser.full_name}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate font-mono">
                      {currentUser.email}
                    </p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/60 inline-block mt-1">
                      Role: {currentUser.role}
                    </span>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </header>

      {/* Global Quick Add Dialog */}
      <QuickAddModal open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </>
  );
}

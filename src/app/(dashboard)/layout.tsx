'use client';

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { useAppStore } from "@/lib/store/use-app-store";
import { X } from "lucide-react";

import { DeveloperFooter } from "@/components/developer-footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const { currentUser, users, switchUser, isHydrated, setHydrated } = useAppStore();

  React.useEffect(() => {
    setHydrated();
  }, [setHydrated]);

  return (
    <div className="flex min-h-screen bg-[#090d16] text-zinc-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-zinc-950 shadow-2xl flex flex-col z-50">
            <div className="absolute right-3 top-4">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content body */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav onToggleSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
        <DeveloperFooter />
      </div>
    </div>
  );
}

'use client';

import * as React from "react";
import { HeroMetrics } from "@/components/dashboard/hero-metrics";
import { ActionRequired } from "@/components/dashboard/action-required";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { MyTeams } from "@/components/dashboard/my-teams";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Metric Counters */}
      <HeroMetrics />

      {/* Action Required Alert Section */}
      <ActionRequired />

      {/* Upcoming Deadlines (Dynamic calculation) */}
      <UpcomingDeadlines />

      {/* Split grid: My Teams & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MyTeams />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}

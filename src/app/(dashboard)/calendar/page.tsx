'use client';

import * as React from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Trophy,
  CheckSquare,
  AlertCircle,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UrgencyBadge } from "@/components/shared/urgency-badge";
import { useAppStore } from "@/lib/store/use-app-store";
import { calculateDeadlineUrgency } from "@/lib/utils/deadlines";
import {
  format,
  parseISO,
  isValid,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";

export default function CalendarPage() {
  const { hackathons, teams, tasks, currentUser } = useAppStore();

  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date(2026, 8, 1)); // Default to Sep 2026 where the seed events occur
  const [viewMode, setViewMode] = React.useState<"month" | "timeline">("month");
  const [filterHackathon, setFilterHackathon] = React.useState("ALL");

  // Collect all events (registration, submission, event start, tasks)
  const allEvents = React.useMemo(() => {
    const events: {
      id: string;
      title: string;
      date: string | null;
      type: "REGISTRATION" | "SUBMISSION" | "EVENT" | "TASK";
      hackathonName: string;
      urgency?: string;
      link: string;
    }[] = [];

    for (const h of hackathons) {
      if (filterHackathon !== "ALL" && h.id !== filterHackathon) continue;

      if (h.registration_deadline) {
        const u = calculateDeadlineUrgency(h.registration_deadline);
        events.push({
          id: `${h.id}-reg`,
          title: `Reg Due: ${h.name}`,
          date: h.registration_deadline,
          type: "REGISTRATION",
          hackathonName: h.name,
          urgency: u.urgency,
          link: `/hackathons/${h.id}`,
        });
      }

      if (h.submission_deadline) {
        const u = calculateDeadlineUrgency(h.submission_deadline);
        events.push({
          id: `${h.id}-sub`,
          title: `Submission Due: ${h.name}`,
          date: h.submission_deadline,
          type: "SUBMISSION",
          hackathonName: h.name,
          urgency: u.urgency,
          link: `/hackathons/${h.id}`,
        });
      }

      if (h.event_start_date) {
        events.push({
          id: `${h.id}-event`,
          title: `Event Starts: ${h.name}`,
          date: h.event_start_date,
          type: "EVENT",
          hackathonName: h.name,
          link: `/hackathons/${h.id}`,
        });
      }
    }

    for (const t of tasks) {
      if (t.due_date) {
        const team = teams.find((tm) => tm.id === t.team_id);
        const hack = hackathons.find((h) => h.id === team?.hackathon_id);
        if (filterHackathon !== "ALL" && hack?.id !== filterHackathon) continue;

        events.push({
          id: `task-${t.id}`,
          title: `Task: ${t.title}`,
          date: t.due_date,
          type: "TASK",
          hackathonName: hack?.name || "Task",
          link: `/tasks`,
        });
      }
    }

    return events;
  }, [hackathons, teams, tasks, filterHackathon]);

  // Calendar dates generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // TBD events
  const tbdEvents = hackathons.filter((h) => !h.submission_deadline);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Deadlines & Calendar</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {allEvents.length} Scheduled
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Dynamic milestone countdowns, exact deadlines, and schedule synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("month")}
              className={`p-1.5 rounded-md text-xs cursor-pointer ${
                viewMode === "month" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`p-1.5 rounded-md text-xs cursor-pointer ${
                viewMode === "timeline" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <Card className="p-3.5 bg-zinc-900/40 border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="font-semibold text-xs text-zinc-200 min-w-[140px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
            className="text-xs h-8 text-indigo-400"
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-zinc-500" />
          <select
            value={filterHackathon}
            onChange={(e) => setFilterHackathon(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="ALL">All Competitions</option>
            {hackathons.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* MONTH GRID VIEW */}
      {viewMode === "month" && (
        <Card className="p-4 bg-zinc-950/70 border-zinc-800/90 shadow-xl overflow-hidden">
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-zinc-400 pb-2 border-b border-zinc-800">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 pt-1">
            {calendarDays.map((day) => {
              const isCurrentMonthDay = isSameMonth(day, currentMonth);
              const isCurrentDate = isSameDay(day, new Date());

              // Find events on this day
              const dayEvents = allEvents.filter((ev) => {
                if (!ev.date) return false;
                try {
                  const d = parseISO(ev.date);
                  return isValid(d) && isSameDay(d, day);
                } catch {
                  return false;
                }
              });

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[100px] p-1.5 rounded-lg border flex flex-col justify-between transition-colors ${
                    isCurrentDate
                      ? "bg-indigo-950/20 border-indigo-500/40"
                      : isCurrentMonthDay
                      ? "bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-900/70"
                      : "bg-zinc-950/30 border-transparent opacity-30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-medium ${
                        isCurrentDate ? "text-indigo-400 font-bold" : "text-zinc-400"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-mono px-1 rounded bg-zinc-800 text-zinc-300">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event pills */}
                  <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <Link
                        key={ev.id}
                        href={ev.link}
                        className={`block text-[10px] p-1 rounded font-medium truncate leading-none border transition-opacity hover:opacity-80 ${
                          ev.type === "REGISTRATION"
                            ? "bg-rose-950/50 text-rose-300 border-rose-800/40"
                            : ev.type === "SUBMISSION"
                            ? "bg-cyan-950/50 text-cyan-300 border-cyan-800/40"
                            : "bg-indigo-950/50 text-indigo-300 border-indigo-800/40"
                        }`}
                        title={ev.title}
                      >
                        {ev.title}
                      </Link>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-zinc-500 font-mono block pl-1">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* TIMELINE LIST VIEW */}
      {viewMode === "timeline" && (
        <Card className="p-0 border-zinc-800/90 bg-zinc-950/60 shadow-lg overflow-hidden">
          <div className="divide-y divide-zinc-800/60">
            {allEvents
              .sort((a, b) => {
                if (!a.date) return 1;
                if (!b.date) return -1;
                return new Date(a.date).getTime() - new Date(b.date).getTime();
              })
              .map((ev) => {
                const u = ev.date ? calculateDeadlineUrgency(ev.date) : null;
                return (
                  <div
                    key={ev.id}
                    className="p-4 hover:bg-zinc-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-100">{ev.title}</span>
                        {u && <UrgencyBadge urgency={u.urgency} />}
                      </div>
                      <div className="flex items-center gap-3 text-zinc-500 font-mono text-[11px]">
                        <span>{ev.date ? format(parseISO(ev.date), "EEEE, MMM d, yyyy · HH:mm") : "TBD"}</span>
                        {u && <span>({u.relativeTime})</span>}
                      </div>
                    </div>

                    <Link href={ev.link}>
                      <Button variant="outline" size="sm" className="text-xs h-7">
                        Workspace →
                      </Button>
                    </Link>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* TBD Milestones section */}
      {tbdEvents.length > 0 && (
        <Card className="p-5 bg-zinc-900/40 border-zinc-800/80">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-zinc-400" />
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Milestones With Dates Pending (TBD)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tbdEvents.map((h) => (
              <div
                key={h.id}
                className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-semibold text-zinc-200">{h.name}</h4>
                  <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                    Submission date pending host announcement
                  </p>
                </div>
                <UrgencyBadge urgency="TBD" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

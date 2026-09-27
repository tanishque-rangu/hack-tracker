'use client';

import * as React from "react";
import { SquadChatView } from "@/components/chat/squad-chat-view";

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <span>Squad Communications</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time multi-device chat · All 6 collegiate members lounge and dedicated hackathon squad channels
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-[#18181b] border border-white/5 text-zinc-300 font-medium flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Supabase Realtime WebSockets Active</span>
          </span>
        </div>
      </div>

      <SquadChatView />
    </div>
  );
}

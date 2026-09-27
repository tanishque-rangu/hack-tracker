'use client';

import * as React from "react";
import {
  X,
  Users,
  Eye,
  EyeOff,
  FileText,
  Check,
  RotateCcw,
  Layers,
  Settings2,
  CheckSquare,
  FolderKanban,
  Link as LinkIcon,
  MessageSquare,
  Shield,
} from "lucide-react";
import { useAppStore } from "@/lib/store/use-app-store";

interface EditState {
  footer_visible: boolean;
  description: string;
}

export interface AdminMemberPanelProps {
  onClose: () => void;
  hiddenTabs: Set<string>;
  allTabIds: string[];
  allTabLabels: Record<string, string>;
  onToggleTab: (tabId: string) => void;
  hackathons?: { id: string; name: string }[];
  onOpenEditHackathon?: (hackathonId: string) => void;
}

export function AdminMemberPanel({
  onClose,
  hiddenTabs,
  allTabIds,
  allTabLabels,
  onToggleTab,
  hackathons = [],
  onOpenEditHackathon,
}: AdminMemberPanelProps) {
  const { users, currentUser, updateUser } = useAppStore();
  const [activeSubTab, setActiveSubTab] = React.useState<"pages" | "members">("pages");

  const [edits, setEdits] = React.useState<Record<string, EditState>>(() => {
    const init: Record<string, EditState> = {};
    users.forEach((u) => {
      init[u.id] = { footer_visible: u.footer_visible ?? false, description: u.description ?? "" };
    });
    return init;
  });

  const [saved, setSaved] = React.useState<Record<string, boolean>>({});

  const handleToggleFooter = (userId: string) => {
    setEdits((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], footer_visible: !prev[userId]?.footer_visible },
    }));
  };

  const handleDescChange = (userId: string, val: string) => {
    setEdits((prev) => ({ ...prev, [userId]: { ...prev[userId], description: val } }));
  };

  const handleSave = (userId: string) => {
    const edit = edits[userId];
    if (!edit) return;
    updateUser(userId, { footer_visible: edit.footer_visible, description: edit.description.trim() });
    setSaved((prev) => ({ ...prev, [userId]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [userId]: false })), 1800);
  };

  const handleReset = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setEdits((prev) => ({
      ...prev,
      [userId]: { footer_visible: user.footer_visible ?? false, description: user.description ?? "" },
    }));
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (a.id === currentUser?.id) return 1;
    if (b.id === currentUser?.id) return -1;
    return (a.full_name || "").localeCompare(b.full_name || "");
  });

  const tabDescriptions: Record<string, string> = {
    registration: "Registration tracking matrix across all members",
    teams: "Collegiate squads and roster distribution",
    projects: "Project progress, repositories, and slide decks",
    links: "Submission links, resources, and custom bookmarks",
    chat: "Squad channels, direct messages, and groups",
  };

  const tabIcons: Record<string, React.ReactNode> = {
    registration: <CheckSquare size={15} className="text-emerald-400" />,
    teams: <Users size={15} className="text-blue-400" />,
    projects: <FolderKanban size={15} className="text-purple-400" />,
    links: <LinkIcon size={15} className="text-cyan-400" />,
    chat: <MessageSquare size={15} className="text-amber-400" />,
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in-0"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#141418] border border-white/10 shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Settings2 size={14} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Configuration</h2>
              <p className="text-[10px] text-zinc-500 leading-tight">Pages & Member Settings</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Sub-nav Tabs */}
        <div className="flex border-b border-white/10 px-4 pt-2 gap-2 shrink-0 bg-black/20">
          <button
            type="button"
            onClick={() => setActiveSubTab("pages")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${
              activeSubTab === "pages"
                ? "border-blue-500 text-blue-400 bg-blue-500/10"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Layers size={13} />
            <span>Page Visibility</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("members")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${
              activeSubTab === "members"
                ? "border-blue-500 text-blue-400 bg-blue-500/10"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Users size={13} />
            <span>Member Profiles</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-3">
          {activeSubTab === "pages" && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-zinc-300">
                <p className="font-semibold text-zinc-100 mb-0.5">Navigation Control</p>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Toggle which pages appear in the navigation bar. Removing a page hides it for members.
                </p>
              </div>

              <div className="space-y-2">
                {allTabIds
                  .filter((id) => id !== "dashboard")
                  .map((tabId) => {
                    const isHidden = hiddenTabs.has(tabId);
                    const label = allTabLabels[tabId] || tabId;
                    const desc = tabDescriptions[tabId] || "Section";
                    const icon = tabIcons[tabId] || <Layers size={14} className="text-zinc-400" />;

                    return (
                      <div
                        key={tabId}
                        className="rounded-xl bg-zinc-900/80 border border-white/[0.08] p-3 flex items-center justify-between gap-3 hover:border-white/15 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-lg bg-black/40 border border-white/5 shrink-0">
                            {icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5 truncate">
                              <span>{label} Page</span>
                              {tabId === "registration" && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                  Reg
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-zinc-500 truncate leading-relaxed">{desc}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onToggleTab(tabId)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer shrink-0 ${
                            !isHidden
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                              : "bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25"
                          }`}
                        >
                          {!isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                          <span>{!isHidden ? "Visible" : "Removed"}</span>
                        </button>
                      </div>
                    );
                  })}
              </div>

              {hackathons.length > 0 && onOpenEditHackathon && (
                <div className="pt-2">
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.08] space-y-2">
                    <p className="text-xs font-semibold text-zinc-200">Quick Edit Competitions</p>
                    <div className="space-y-1.5">
                      {hackathons.map((h) => (
                        <div
                          key={h.id}
                          className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <span className="text-zinc-300 truncate font-medium">{h.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenEditHackathon(h.id);
                            }}
                            className="px-2.5 py-1 rounded-md bg-blue-600/20 text-blue-300 border border-blue-500/30 text-[10px] font-semibold hover:bg-blue-600/30 transition-colors cursor-pointer shrink-0"
                          >
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSubTab === "members" && (
            <div className="space-y-3">
              {sortedUsers.map((user) => {
                const edit = edits[user.id] ?? { footer_visible: false, description: "" };
                const isSaved = saved[user.id];
                return (
                  <div key={user.id} className="rounded-xl bg-zinc-900/80 border border-white/[0.08] p-3.5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-100 truncate">{user.full_name}</p>
                        <p className="text-[11px] text-zinc-500 truncate font-mono">{user.email}</p>
                        <span
                          className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                            user.role === "admin"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleFooter(user.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer shrink-0 ${
                          edit.footer_visible
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                            : "bg-zinc-800 border-white/[0.08] text-zinc-500 hover:text-zinc-300 hover:border-white/15"
                        }`}
                      >
                        {edit.footer_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                        <span>{edit.footer_visible ? "Footer On" : "Footer Off"}</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                        <FileText size={10} className="text-zinc-500" />
                        Bio / Description
                      </label>
                      <textarea
                        value={edit.description}
                        onChange={(e) => handleDescChange(user.id, e.target.value)}
                        placeholder="Optional bio or note for this member..."
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 resize-none transition-colors leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleReset(user.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.08] transition-colors cursor-pointer"
                        title="Reset to saved"
                      >
                        <RotateCcw size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(user.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          isSaved
                            ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-400"
                            : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25"
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <Check size={12} />
                            <span>Saved</span>
                          </>
                        ) : (
                          <span>Apply</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-white/[0.08] text-[10px] text-zinc-600 text-center shrink-0">
          Preferences persist automatically across sessions.
        </div>
      </div>
    </div>
  );
}

'use client';

import * as React from "react";
import Link from "next/link";
import {
  Hash,
  Send,
  Users,
  Paperclip,
  GitBranch,
  Presentation,
  Video,
  ExternalLink,
  Search,
  MessageSquare,
  ShieldCheck,
  LogOut,
  LogIn,
  UserX,
  Sparkles,
  Lock,
  Trash2,
  Plus,
  Pencil,
  X,
  MessageCircle,
  Check,
} from "lucide-react";
import {
  CHAT_CHANNELS,
  realtimeChatService,
  COLLEGIATE_MEMBERS,
  getCollegiateMember,
  getCanonicalDmChannelId,
} from "@/lib/realtime/chat-service";
import { ChatMessage, ChatAttachment, ChatChannel } from "@/lib/types";
import { useAppStore } from "@/lib/store/use-app-store";

const SQUAD_COLORS: Record<string, string> = {
  "varshini": "from-rose-500 to-pink-500",
  "vyshnavi": "from-purple-500 to-indigo-500",
  "koushik": "from-blue-500 to-cyan-500",
  "tanishque": "from-emerald-500 to-teal-500",
  "shivaram": "from-amber-500 to-orange-500",
  "nivedan": "from-cyan-500 to-blue-500",
};

export function SquadChatView({ initialChannelId }: { initialChannelId?: string }) {
  const { currentUser, logout, switchUser, users } = useAppStore();
  const [activeChannelId, setActiveChannelId] = React.useState<string>(initialChannelId || "all-members");
  const [channelFilter, setChannelFilter] = React.useState<'all' | 'all-members' | 'team-squad' | 'private-group' | 'direct-message'>('all');
  const [searchQuery, setSearchQuery] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [customGroups, setCustomGroups] = React.useState<ChatChannel[]>([]);
  const [displayNames, setDisplayNames] = React.useState<Record<string, string>>({});
  const [inputText, setInputText] = React.useState("");
  const [connectionStatus, setConnectionStatus] = React.useState<'CONNECTED' | 'CONNECTING' | 'OFFLINE'>('CONNECTING');
  const [showAttachMenu, setShowAttachMenu] = React.useState(false);
  const [attachmentDraft, setAttachmentDraft] = React.useState<{ name: string; url: string; type: ChatAttachment['type'] } | null>(null);
  const [mobileView, setMobileView] = React.useState<'channels' | 'messages'>('messages');

  // Modals state
  const [showNewGroupModal, setShowNewGroupModal] = React.useState(false);
  const [newGroupName, setNewGroupName] = React.useState("");
  const [newGroupDesc, setNewGroupDesc] = React.useState("");
  const [newGroupMembers, setNewGroupMembers] = React.useState<string[]>([]);

  const [showEditNameModal, setShowEditNameModal] = React.useState(false);
  const [editNameInput, setEditNameInput] = React.useState("");

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Identity helpers
  const currentUserMember = React.useMemo(() => {
    if (!currentUser?.email) return null;
    return getCollegiateMember(currentUser.email);
  }, [currentUser]);

  const currentUserUsername = React.useMemo(() => {
    if (currentUserMember) return currentUserMember.username;
    if (currentUser?.email) return currentUser.email.split('@')[0].toLowerCase();
    return null;
  }, [currentUserMember, currentUser]);

  const isKoushikAdmin = React.useMemo(() => {
    if (!currentUser) return false;
    return (
      currentUser.role === 'admin' ||
      currentUser.email?.toLowerCase() === 'koushikkatkam@gmail.com' ||
      currentUserUsername === 'koushik'
    );
  }, [currentUser, currentUserUsername]);

  const effectiveCurrentUserDisplayName = React.useMemo(() => {
    if (!currentUser) return "";
    if (currentUserUsername) {
      return realtimeChatService.getDisplayName(currentUserUsername, currentUser.full_name);
    }
    return currentUser.full_name;
  }, [currentUser, currentUserUsername, displayNames]);

  // Subscribe to real-time chat messages and updates
  React.useEffect(() => {
    setCustomGroups(realtimeChatService.getCustomGroups());
    setDisplayNames(realtimeChatService.getCustomDisplayNames());

    const unsubscribe = realtimeChatService.subscribe((allMsgs) => {
      setMessages([...allMsgs]);
      setConnectionStatus(realtimeChatService.connectionStatus);
      setCustomGroups(realtimeChatService.getCustomGroups());
      setDisplayNames(realtimeChatService.getCustomDisplayNames());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Auto-scroll to bottom of messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannelId]);

  // Resolve active channel info
  const currentChannel = React.useMemo<ChatChannel>(() => {
    // 1. Direct message channel check
    if (activeChannelId.startsWith("dm-")) {
      const parts = activeChannelId.replace("dm-", "").split("-");
      const u1 = parts[0] || "";
      const u2 = parts[1] || "";
      const otherUsername = currentUserUsername === u1 ? u2 : u1;
      const otherMember = getCollegiateMember(otherUsername);
      const otherName = otherMember
        ? realtimeChatService.getDisplayName(otherMember.username)
        : otherUsername;

      return {
        id: activeChannelId,
        name: `@${otherName}`,
        description: `Direct 1-on-1 private conversation between @${u1} and @${u2}`,
        type: 'direct-message',
        members: [u1, u2],
        dm_participants: [u1, u2],
      };
    }

    // 2. Custom private group check
    const foundGroup = customGroups.find((g) => g.id === activeChannelId);
    if (foundGroup) return foundGroup;

    // 3. Static squad channels
    const foundStatic = CHAT_CHANNELS.find((c) => c.id === activeChannelId);
    if (foundStatic) return foundStatic;

    return CHAT_CHANNELS[0];
  }, [activeChannelId, customGroups, currentUserUsername, displayNames]);

  // Channel authorization check
  const isUserAuthorizedForChannel = React.useCallback(
    (channel: ChatChannel): boolean => {
      if (channel.type === 'all-members') return true;
      if (!currentUser) return false;
      // Administrator oversight behind the scenes
      if (isKoushikAdmin) return true;

      const email = (currentUser.email || '').toLowerCase();
      const uname = (currentUserUsername || '').toLowerCase();

      if (channel.type === 'direct-message') {
        if (!channel.dm_participants) return false;
        return channel.dm_participants.includes(uname);
      }

      if (channel.type === 'private-group') {
        return channel.members.some((m) => {
          const mLow = m.toLowerCase();
          return mLow === uname || mLow === email;
        });
      }

      // team-squad
      return channel.members.some((m) => {
        const mLower = m.toLowerCase();
        return (
          email.includes(mLower) ||
          (currentUser.full_name || '').toLowerCase().includes(mLower) ||
          uname.includes(mLower)
        );
      });
    },
    [currentUser, currentUserUsername, isKoushikAdmin]
  );

  const isAuthorizedForCurrentChannel = isUserAuthorizedForChannel(currentChannel);

  // Filter messages for current channel:
  // Regular members do NOT see deleted messages.
  // Koushik can see deleted messages seamlessly (with no mentions).
  const channelMessages = React.useMemo(() => {
    if (!isAuthorizedForCurrentChannel) return [];
    const msgs = messages.filter((m) => m.channel_id === currentChannel.id);
    if (isKoushikAdmin) {
      return msgs;
    }
    return msgs.filter((m) => !m.is_deleted);
  }, [messages, currentChannel.id, isAuthorizedForCurrentChannel, isKoushikAdmin]);

  // Channel lists by categories
  const allMembersChannels = CHAT_CHANNELS.filter((c) => c.type === 'all-members');
  const teamSquadChannels = CHAT_CHANNELS.filter(
    (c) => c.type === 'team-squad' && isUserAuthorizedForChannel(c)
  );
  const userPrivateGroups = customGroups.filter((g) => isUserAuthorizedForChannel(g));

  // Direct message contacts
  const directMessageContacts = React.useMemo(() => {
    if (!currentUserUsername) return [];
    return COLLEGIATE_MEMBERS.filter((m) => m.username !== currentUserUsername);
  }, [currentUserUsername]);

  // All active DM conversations for Koushik's oversight
  const allAdminActiveDms = React.useMemo(() => {
    if (!isKoushikAdmin) return [];
    const dmIds = Array.from(
      new Set(
        messages
          .filter((m) => m.channel_id.startsWith('dm-'))
          .map((m) => m.channel_id)
      )
    );

    return dmIds.map((dmId) => {
      const parts = dmId.replace('dm-', '').split('-');
      const u1 = parts[0];
      const u2 = parts[1];
      const name1 = realtimeChatService.getDisplayName(u1);
      const name2 = realtimeChatService.getDisplayName(u2);
      return {
        id: dmId,
        label: `${name1} ↔ ${name2}`,
        u1,
        u2,
        unreadCount: messages.filter((m) => m.channel_id === dmId).length,
      };
    });
  }, [isKoushikAdmin, messages, displayNames]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) return;
    if (!inputText.trim() && !attachmentDraft) return;

    const attachments: ChatAttachment[] = [];
    if (attachmentDraft && attachmentDraft.url) {
      attachments.push({ ...attachmentDraft });
    }

    realtimeChatService.sendMessage(
      currentChannel.id,
      currentUser.email,
      effectiveCurrentUserDisplayName,
      inputText.trim() || (attachmentDraft ? `Shared: ${attachmentDraft.name}` : ""),
      attachments.length > 0 ? attachments : undefined,
      currentUserUsername || undefined
    );

    setInputText("");
    setAttachmentDraft(null);
    setShowAttachMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!currentUser) return;
    realtimeChatService.deleteMessage(messageId, currentUser.email);
  };

  const toggleReaction = (messageId: string, emoji: string) => {
    if (!currentUser) return;
    const userName = effectiveCurrentUserDisplayName.split(" ")[0];
    realtimeChatService.toggleReaction(messageId, emoji, userName);
  };

  const handleSaveDisplayName = () => {
    if (!currentUserUsername || !editNameInput.trim()) return;
    realtimeChatService.setCustomDisplayName(currentUserUsername, editNameInput.trim());
    setDisplayNames(realtimeChatService.getCustomDisplayNames());
    setShowEditNameModal(false);
  };

  const handleCreateGroup = () => {
    if (!currentUserUsername || !newGroupName.trim()) return;
    const created = realtimeChatService.createPrivateGroup(
      newGroupName,
      newGroupDesc,
      newGroupMembers,
      currentUserUsername
    );
    setNewGroupName("");
    setNewGroupDesc("");
    setNewGroupMembers([]);
    setShowNewGroupModal(false);
    setActiveChannelId(created.id);
    setMobileView('messages');
  };

  const getMemberInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getMemberColor = (nameOrUsername: string) => {
    const clean = (nameOrUsername || '').toLowerCase();
    for (const [key, color] of Object.entries(SQUAD_COLORS)) {
      if (clean.includes(key)) {
        return color;
      }
    }
    return "from-zinc-600 to-zinc-700";
  };

  return (
    <div className="flex flex-col lg:flex-row h-[620px] sm:h-[720px] lg:h-[780px] bg-[#121215] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* ================= LEFT SIDEBAR: CHANNELS, GROUPS, DMS ================= */}
      <div
        className={`w-full lg:w-80 bg-[#16161a] border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col shrink-0 ${
          mobileView === 'messages' ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {/* Header / Brand */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <MessageSquare size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <span>Squad Communications</span>
              </h2>
              <p className="text-[11px] text-zinc-400">Lounges, Squads & DMs</p>
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
              connectionStatus === 'CONNECTED'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
            title={connectionStatus === 'CONNECTED' ? 'Supabase Realtime Active' : 'Connecting to Realtime'}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connectionStatus === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{connectionStatus === 'CONNECTED' ? 'Live' : 'Connecting'}</span>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="px-3 pt-3 flex gap-1 text-[11px] overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setChannelFilter('all')}
            className={`py-1.5 px-2 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
              channelFilter === 'all'
                ? 'bg-white/10 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setChannelFilter('all-members')}
            className={`py-1.5 px-2 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
              channelFilter === 'all-members'
                ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            Lounges
          </button>
          <button
            type="button"
            onClick={() => setChannelFilter('team-squad')}
            className={`py-1.5 px-2 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
              channelFilter === 'team-squad'
                ? 'bg-purple-600 text-white font-semibold shadow-sm shadow-purple-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            Squads
          </button>
          <button
            type="button"
            onClick={() => setChannelFilter('private-group')}
            className={`py-1.5 px-2 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
              channelFilter === 'private-group'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            Groups ({userPrivateGroups.length})
          </button>
          <button
            type="button"
            onClick={() => setChannelFilter('direct-message')}
            className={`py-1.5 px-2 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
              channelFilter === 'direct-message'
                ? 'bg-cyan-600 text-white font-semibold shadow-sm shadow-cyan-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            DMs
          </button>
        </div>

        {/* Channel Search Input */}
        <div className="p-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search rooms, teammates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111114] border border-white/5 rounded-xl pl-8 pr-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 pb-4">
          {/* Section 1: All Members Lounges */}
          {(channelFilter === 'all' || channelFilter === 'all-members') && allMembersChannels.length > 0 && (
            <div className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                <span>All Members Lounge</span>
                <span className="text-[10px] font-normal text-blue-400">6 Members</span>
              </div>
              {allMembersChannels.map((channel) => {
                const isActive = activeChannelId === channel.id;
                const unreadCount = messages.filter((m) => m.channel_id === channel.id && !m.is_deleted).length;

                return (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setActiveChannelId(channel.id);
                      setMobileView('messages');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/25'
                        : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Hash size={14} className={isActive ? 'text-white' : 'text-blue-400'} />
                      <span className="truncate">{channel.name}</span>
                    </div>
                    {unreadCount > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-400'
                        }`}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Section 2: Team Squad Channels */}
          {(channelFilter === 'all' || channelFilter === 'team-squad') && teamSquadChannels.length > 0 && (
            <div className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                <span>Team Squad Channels</span>
                <span className="text-[10px] font-normal text-purple-400">By Hackathon</span>
              </div>
              {teamSquadChannels.map((channel) => {
                const isActive = activeChannelId === channel.id;
                const unreadCount = messages.filter((m) => m.channel_id === channel.id && !m.is_deleted).length;

                return (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setActiveChannelId(channel.id);
                      setMobileView('messages');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/25'
                        : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-2">
                        <Users size={13} className={isActive ? 'text-white' : 'text-purple-400'} />
                        <span className="truncate">{channel.name}</span>
                      </div>
                      <div className={`text-[10px] truncate pl-5 mt-0.5 ${isActive ? 'text-purple-200' : 'text-zinc-500'}`}>
                        {channel.members.join(", ")}
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-400'
                        }`}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Section 3: Custom Private Groups */}
          {(channelFilter === 'all' || channelFilter === 'private-group') && (
            <div className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                <span>Private Groups</span>
                {currentUser && (
                  <button
                    type="button"
                    onClick={() => setShowNewGroupModal(true)}
                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                  >
                    <Plus size={11} />
                    <span>New Group</span>
                  </button>
                )}
              </div>

              {userPrivateGroups.length === 0 ? (
                <div className="px-3 py-2 text-[11px] text-zinc-500 italic">
                  No private groups yet.
                </div>
              ) : (
                userPrivateGroups.map((group) => {
                  const isActive = activeChannelId === group.id;
                  const unreadCount = messages.filter((m) => m.channel_id === group.id && !m.is_deleted).length;

                  return (
                    <button
                      key={group.id}
                      onClick={() => {
                        setActiveChannelId(group.id);
                        setMobileView('messages');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer group ${
                        isActive
                          ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/25'
                          : 'text-zinc-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="min-w-0 pr-1">
                        <div className="flex items-center gap-2">
                          <Users size={13} className={isActive ? 'text-white' : 'text-emerald-400'} />
                          <span className="truncate">{group.name}</span>
                        </div>
                        <div className={`text-[10px] truncate pl-5 mt-0.5 ${isActive ? 'text-emerald-200' : 'text-zinc-500'}`}>
                          {group.members.join(", ")}
                        </div>
                      </div>
                      {unreadCount > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                            isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-400'
                          }`}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Section 4: Direct Messages (1-on-1 Personal) */}
          {(channelFilter === 'all' || channelFilter === 'direct-message') && (
            <div className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                <span>Direct Messages</span>
                <span className="text-[10px] font-normal text-cyan-400">1-on-1</span>
              </div>

              {!currentUser ? (
                <div className="px-3 py-2 text-[11px] text-zinc-500 italic">
                  Sign in to message teammates personally.
                </div>
              ) : (
                <>
                  {directMessageContacts.map((contact) => {
                    if (!currentUserUsername) return null;
                    const dmId = getCanonicalDmChannelId(currentUserUsername, contact.username);
                    const isActive = activeChannelId === dmId;
                    const unreadCount = messages.filter((m) => m.channel_id === dmId && !m.is_deleted).length;
                    const contactDisplayName = realtimeChatService.getDisplayName(contact.username);

                    return (
                      <button
                        key={contact.username}
                        onClick={() => {
                          setActiveChannelId(dmId);
                          setMobileView('messages');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                          isActive
                            ? 'bg-cyan-600 text-white font-semibold shadow-md shadow-cyan-600/25'
                            : 'text-zinc-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-full bg-gradient-to-tr ${getMemberColor(
                              contact.username
                            )} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}
                          >
                            {contactDisplayName[0]}
                          </div>
                          <div className="min-w-0">
                            <span className="truncate block font-medium">{contactDisplayName}</span>
                            <span className={`text-[10px] block truncate ${isActive ? 'text-cyan-200' : 'text-zinc-500'}`}>
                              @{contact.username}
                            </span>
                          </div>
                        </div>
                        {unreadCount > 0 && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                              isActive ? 'bg-white/20 text-white' : 'bg-cyan-500/20 text-cyan-300'
                            }`}
                          >
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Koushik Administrator Oversight View of other 1-on-1 DMs (No UI mentions) */}
                  {isKoushikAdmin && allAdminActiveDms.length > 0 && (
                    <div className="pt-2 border-t border-white/5 space-y-1">
                      <div className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                        Active Peer Chats
                      </div>
                      {allAdminActiveDms.map((conv) => {
                        const isActive = activeChannelId === conv.id;
                        return (
                          <button
                            key={conv.id}
                            onClick={() => {
                              setActiveChannelId(conv.id);
                              setMobileView('messages');
                            }}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                              isActive
                                ? 'bg-zinc-800 text-white font-semibold'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                            }`}
                          >
                            <span className="truncate">{conv.label}</span>
                            {conv.unreadCount > 0 && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-zinc-400">
                                {conv.unreadCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Profile Status & Display Name Editor Bar */}
        <div className="p-3 border-t border-white/5 bg-[#111114]">
          {currentUser ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${getMemberColor(
                    currentUserUsername || currentUser.full_name
                  )} flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0`}
                >
                  {getMemberInitials(effectiveCurrentUserDisplayName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-zinc-200 truncate">
                      {effectiveCurrentUserDisplayName}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditNameInput(effectiveCurrentUserDisplayName);
                        setShowEditNameModal(true);
                      }}
                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Edit Display Name"
                    >
                      <Pencil size={11} />
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500 truncate">
                    @{currentUserUsername || 'member'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-rose-400 transition-colors text-xs cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-400">
                <UserX size={15} className="text-zinc-500 shrink-0" />
                <span className="text-[11px]">Not signed in</span>
              </div>
              <Link
                href="/login"
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] transition-colors flex items-center gap-1 shadow-sm"
              >
                <LogIn size={12} />
                <span>Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ================= RIGHT MAIN AREA: LIVE CHAT STREAM ================= */}
      <div className={`flex-1 flex flex-col bg-[#121215] overflow-hidden ${mobileView === 'channels' ? 'hidden lg:flex' : 'flex'}`}>
        {/* Channel Header Bar */}
        <div className="p-3.5 sm:p-4 border-b border-white/5 bg-[#16161a]/60 backdrop-blur-md flex items-center justify-between gap-2">
          <div className="flex items-center min-w-0">
            {/* Mobile Back To Channels Button */}
            <button
              type="button"
              onClick={() => setMobileView('channels')}
              className="lg:hidden p-1.5 -ml-1 mr-2 rounded-xl bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer active:scale-95 transition-all shadow-sm"
              title="View Squad Channels"
            >
              <Hash size={14} className="text-blue-400" />
              <span>Channels</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-bold text-base hidden sm:inline">
                  {currentChannel.type === 'direct-message' ? '@' : '#'}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-zinc-100 truncate">
                  {currentChannel.type === 'direct-message'
                    ? currentChannel.name.replace('@', '')
                    : currentChannel.name}
                </h3>
                <span
                  className={`text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                    currentChannel.type === 'all-members'
                      ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
                      : currentChannel.type === 'direct-message'
                      ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
                      : currentChannel.type === 'private-group'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                      : 'text-purple-400 bg-purple-500/10 border-purple-500/30'
                  }`}
                >
                  {currentChannel.type === 'all-members'
                    ? 'Global'
                    : currentChannel.type === 'direct-message'
                    ? 'Direct Message'
                    : currentChannel.type === 'private-group'
                    ? 'Private Group'
                    : currentChannel.team_label || 'Squad'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 truncate">{currentChannel.description}</p>
            </div>
          </div>

          {/* Members Avatars in this Room */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0 pl-3">
            <span className="text-[11px] text-zinc-400 mr-1 flex items-center gap-1">
              <Users size={13} /> {currentChannel.members.length}
            </span>
            <div className="flex -space-x-1.5 overflow-hidden">
              {currentChannel.members.map((memberName) => (
                <div
                  key={memberName}
                  className={`inline-block h-6 w-6 rounded-full ring-2 ring-[#16161a] bg-gradient-to-tr ${getMemberColor(
                    memberName
                  )} text-white text-[10px] font-bold flex items-center justify-center`}
                  title={realtimeChatService.getDisplayName(memberName)}
                >
                  {realtimeChatService.getDisplayName(memberName)[0]}
                </div>
              ))}
            </div>
          </div>
        </div>

        {!isAuthorizedForCurrentChannel ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-[#0e0e11]">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg">
              <Lock size={26} />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="text-base font-bold text-zinc-100">Private Channel</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                This channel is restricted to assigned members ({currentChannel.members.join(", ")}). You cannot view or post messages in another squad&apos;s private room.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveChannelId('all-members')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-md transition-all"
            >
              Return to Global Squad Lounge
            </button>
          </div>
        ) : (
          <>
            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Welcome Banner for the Channel */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/20 via-purple-950/20 to-transparent border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <Sparkles size={14} className="text-blue-400" />
                  <span>Welcome to {currentChannel.name}</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  This room is synchronized in real-time across all devices.
                  {currentChannel.type === 'direct-message'
                    ? " This is a direct 1-on-1 private conversation between you and your teammate."
                    : currentChannel.type === 'private-group'
                    ? ` Private squad group with ${currentChannel.members.length} members.`
                    : currentChannel.type === 'all-members'
                    ? " All 6 collegiate squad members participate here."
                    : ` Dedicated to ${currentChannel.members.join(", ")}.`}
                </p>
              </div>

              {channelMessages.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <MessageSquare size={32} className="mx-auto text-zinc-600" />
                  <p className="text-sm font-semibold text-zinc-400">No messages in {currentChannel.name} yet.</p>
                  <p className="text-xs text-zinc-500">
                    {currentUser
                      ? "Send the first message or share a link!"
                      : "Sign in with your authorized email to start the conversation."}
                  </p>
                </div>
              ) : (
                channelMessages.map((msg) => {
                  const senderUsername =
                    msg.sender_username || getCollegiateMember(msg.sender_email)?.username;
                  const effectiveSenderName = senderUsername
                    ? realtimeChatService.getDisplayName(senderUsername, msg.sender_name)
                    : msg.sender_name;

                  const senderInitials = getMemberInitials(effectiveSenderName);
                  const senderColor = getMemberColor(senderUsername || effectiveSenderName);
                  const isCurrentUser =
                    currentUser?.email &&
                    msg.sender_email.toLowerCase() === currentUser.email.toLowerCase();

                  const canDelete = isCurrentUser || isKoushikAdmin;

                  const formattedTime = new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 group p-2 rounded-2xl transition-colors ${
                        msg.is_deleted
                          ? 'bg-red-950/10 border border-red-500/10 opacity-75'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      {/* Sender Avatar */}
                      <div
                        className={`h-9 w-9 rounded-xl bg-gradient-to-tr ${senderColor} flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0`}
                      >
                        {senderInitials}
                      </div>

                      {/* Message Bubble Body */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-zinc-200">
                            {effectiveSenderName}
                          </span>
                          {senderUsername && (
                            <span className="text-[10px] text-zinc-500 font-mono">
                              @{senderUsername}
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-500">{formattedTime}</span>
                          {isCurrentUser && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                              You
                            </span>
                          )}
                          {msg.is_deleted && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-medium italic">
                              (deleted)
                            </span>
                          )}
                        </div>

                        {msg.is_deleted ? (
                          <p className="text-xs text-zinc-400 line-through italic leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        ) : (
                          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap selection:bg-blue-500/30">
                            {msg.content}
                          </p>
                        )}

                        {/* Attachments if any */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {msg.attachments.map((att, idx) => (
                              <a
                                key={idx}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1b1b22] hover:bg-[#22222a] border border-white/10 text-xs text-blue-300 hover:text-blue-200 transition-colors shadow-sm"
                              >
                                {att.type === 'github' && <GitBranch size={13} className="text-purple-400" />}
                                {att.type === 'deck' && <Presentation size={13} className="text-orange-400" />}
                                {att.type === 'demo' && <Video size={13} className="text-rose-400" />}
                                {!['github', 'deck', 'demo'].includes(att.type) && (
                                  <ExternalLink size={13} className="text-blue-400" />
                                )}
                                <span className="font-medium truncate max-w-[200px]">{att.name}</span>
                                <ExternalLink size={11} className="text-zinc-500" />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Reactions and Delete Action Bar */}
                        <div className="flex items-center gap-2 pt-1">
                          {msg.reactions &&
                            Object.entries(msg.reactions).map(([emoji, userList]) => (
                              <button
                                key={emoji}
                                onClick={() => toggleReaction(msg.id, emoji)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-zinc-300 transition-colors cursor-pointer"
                                title={userList.join(", ")}
                              >
                                <span>{emoji}</span>
                                <span className="text-[10px] font-semibold text-zinc-400">
                                  {userList.length}
                                </span>
                              </button>
                            ))}

                          {/* Quick Actions Toolbar on Hover */}
                          {currentUser && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              {["👍", "🚀", "🔥", "👀"].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => toggleReaction(msg.id, emoji)}
                                  className="p-1 hover:bg-white/10 rounded text-xs transition-colors cursor-pointer"
                                >
                                  {emoji}
                                </button>
                              ))}

                              {/* Message Deletion Button */}
                              {canDelete && !msg.is_deleted && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="p-1 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 rounded text-xs transition-colors cursor-pointer ml-1"
                                  title="Delete message"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar or Auth Callout */}
            <div className="p-3 sm:p-4 border-t border-white/5 bg-[#16161a]">
              {!currentUser ? (
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <ShieldCheck size={16} className="text-blue-400 shrink-0" />
                    <span>Sign in with your authorized squad account to participate in chats and direct messages.</span>
                  </div>
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shrink-0 shadow-md shadow-blue-600/30 transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Active Attachment Pill Preview */}
                  {attachmentDraft && (
                    <div className="flex items-center justify-between px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Paperclip size={13} /> Attached: {attachmentDraft.name} ({attachmentDraft.url})
                      </span>
                      <button
                        type="button"
                        onClick={() => setAttachmentDraft(null)}
                        className="text-zinc-400 hover:text-white ml-2 text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Attachment Quick Presets Menu */}
                  {showAttachMenu && (
                    <div className="p-3 rounded-2xl bg-[#1b1b22] border border-white/10 space-y-2 text-xs animate-in fade-in-0">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Quick Link / Resource
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAttachmentDraft({
                              name: "GitHub Repository",
                              url: "https://github.com/squadsync/repo",
                              type: "github",
                            });
                            setShowAttachMenu(false);
                          }}
                          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 flex items-center gap-2 text-left cursor-pointer transition-colors"
                        >
                          <GitBranch size={15} className="text-purple-400 shrink-0" />
                          <div>
                            <p className="font-semibold text-zinc-200">GitHub Repo</p>
                            <p className="text-[10px] text-zinc-500">Code repository</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAttachmentDraft({
                              name: "Pitch Deck & Presentation",
                              url: "https://pitch.com/deck",
                              type: "deck",
                            });
                            setShowAttachMenu(false);
                          }}
                          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 flex items-center gap-2 text-left cursor-pointer transition-colors"
                        >
                          <Presentation size={15} className="text-orange-400 shrink-0" />
                          <div>
                            <p className="font-semibold text-zinc-200">Pitch Deck</p>
                            <p className="text-[10px] text-zinc-500">Slides & presentation</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAttachmentDraft({
                              name: "Demo Video Submission",
                              url: "https://youtube.com/watch?v=demo",
                              type: "demo",
                            });
                            setShowAttachMenu(false);
                          }}
                          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 flex items-center gap-2 text-left cursor-pointer transition-colors"
                        >
                          <Video size={15} className="text-rose-400 shrink-0" />
                          <div>
                            <p className="font-semibold text-zinc-200">Demo Video</p>
                            <p className="text-[10px] text-zinc-500">3-min walkthrough</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Form with Input */}
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAttachMenu((prev) => !prev)}
                      className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        showAttachMenu
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-white/10 hover:border-white/20'
                      }`}
                      title="Add Resource / Link"
                    >
                      <Paperclip size={16} />
                    </button>

                    <input
                      type="text"
                      placeholder={`Message ${currentChannel.name} as ${effectiveCurrentUserDisplayName.split(" ")[0]}...`}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-colors"
                    />

                    <button
                      type="submit"
                      disabled={!inputText.trim() && !attachmentDraft}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 text-white font-bold cursor-pointer shadow-md shadow-blue-600/30 transition-all shrink-0"
                      title="Send message (Enter)"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ================= MODAL: EDIT DISPLAY NAME ================= */}
      {showEditNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-0">
          <div className="w-full max-w-sm rounded-2xl bg-[#18181c] border border-white/10 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Pencil size={14} className="text-blue-400" />
                <span>Change Display Name</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditNameModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Permanent Username
              </span>
              <p className="font-mono text-blue-400 font-semibold text-xs">
                @{currentUserUsername}
              </p>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Your collegiate username is permanent. Whatever display name you choose will appear across all live squad messages and channels.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Display Name</label>
              <input
                type="text"
                value={editNameInput}
                onChange={(e) => setEditNameInput(e.target.value)}
                placeholder="Enter your custom display name..."
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEditNameModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDisplayName}
                disabled={!editNameInput.trim()}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Save Name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE PRIVATE GROUP ================= */}
      {showNewGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-0">
          <div className="w-full max-w-md rounded-2xl bg-[#18181c] border border-white/10 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={15} className="text-purple-400" />
                <span>Create Private Squad Group</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewGroupModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-zinc-300">Group Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. ai-pitch-prep, fintech-core"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-zinc-300">Description (Optional)</label>
                <input
                  type="text"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Brief purpose of this private channel"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-zinc-300">Select Teammates to Include</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-1">
                  {COLLEGIATE_MEMBERS.map((m) => {
                    const isSelf = m.username === currentUserUsername;
                    const isSelected = isSelf || newGroupMembers.includes(m.username);
                    return (
                      <label
                        key={m.username}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-200'
                            : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isSelf}
                          onChange={(e) => {
                            if (isSelf) return;
                            if (e.target.checked) {
                              setNewGroupMembers((prev) => [...prev, m.username]);
                            } else {
                              setNewGroupMembers((prev) => prev.filter((u) => u !== m.username));
                            }
                          }}
                          className="rounded border-zinc-700 text-purple-600 focus:ring-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold truncate">
                            {realtimeChatService.getDisplayName(m.username)}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-mono">
                            @{m.username}{isSelf ? ' (You)' : ''}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewGroupModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim()}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-md shadow-purple-600/30 cursor-pointer"
              >
                Create Private Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { createClient } from "@/lib/supabase/client";
import { ChatMessage, ChatChannel } from "@/lib/types";

export interface CollegiateMember {
  username: string; // Permanent fixed username e.g. "varshini", "vyshnavi", "koushik", "tanishque", "shivaram", "nivedan"
  defaultDisplayName: string;
  email: string;
  role: 'admin' | 'coordinator' | 'member';
}

export const COLLEGIATE_MEMBERS: CollegiateMember[] = [
  {
    username: "koushik",
    defaultDisplayName: "Koushik Katkam",
    email: "koushikkatkam@gmail.com",
    role: "admin",
  },
  {
    username: "varshini",
    defaultDisplayName: "Varshini Akula",
    email: "varshiniakula6@gmail.com",
    role: "member",
  },
  {
    username: "vyshnavi",
    defaultDisplayName: "Vyshnavi Nagavelli",
    email: "nagavellivyshnavi3@gmail.com",
    role: "member",
  },
  {
    username: "tanishque",
    defaultDisplayName: "Tanishque Rangu",
    email: "tanishque1959@gmail.com",
    role: "member",
  },
  {
    username: "shivaram",
    defaultDisplayName: "Shivaram Pidugu",
    email: "pidugushivaram@gmail.com",
    role: "member",
  },
  {
    username: "nivedan",
    defaultDisplayName: "Nivedan Katkam",
    email: "nivedankatkam@gmail.com",
    role: "coordinator",
  },
];

export function getCollegiateMember(usernameOrEmail: string): CollegiateMember | undefined {
  if (!usernameOrEmail) return undefined;
  const q = usernameOrEmail.toLowerCase().trim();
  return COLLEGIATE_MEMBERS.find(
    (m) => m.username.toLowerCase() === q || m.email.toLowerCase() === q
  );
}

export function getCanonicalDmChannelId(userA: string, userB: string): string {
  const cleanA = userA.toLowerCase().trim();
  const cleanB = userB.toLowerCase().trim();
  const sorted = [cleanA, cleanB].sort();
  return `dm-${sorted[0]}-${sorted[1]}`;
}

export const CHAT_CHANNELS: ChatChannel[] = [
  // All Members Channels
  {
    id: "all-members",
    name: "all-squads",
    description: "General squad lounge for all 6 collegiate team members.",
    type: "all-members",
    members: ["Varshini", "Vyshnavi", "Koushik", "Tanishque", "Shivaram", "Nivedan"],
  },
  {
    id: "announcements",
    name: "announcements",
    description: "Important cutoffs, registration deadlines, and logistics alerts.",
    type: "all-members",
    members: ["Varshini", "Vyshnavi", "Koushik", "Tanishque", "Shivaram", "Nivedan"],
  },

  // Team Squad Channels
  {
    id: "sankalp-team-a",
    name: "sankalp-squad-a",
    description: "SANKALP by Satin Finserv · Team A: Climate credit & risk scoring.",
    type: "team-squad",
    hackathon_id: "sankalp",
    team_label: "Team A",
    members: ["Varshini", "Koushik", "Shivaram"],
  },
  {
    id: "sankalp-team-b",
    name: "sankalp-squad-b",
    description: "SANKALP by Satin Finserv · Team B: Climate fintech & sustainability.",
    type: "team-squad",
    hackathon_id: "sankalp",
    team_label: "Team B",
    members: ["Vyshnavi", "Tanishque", "Nivedan"],
  },
  {
    id: "vnr-team-a",
    name: "vnr-vjiet-squad-a",
    description: "VNR VJIET CSI 2026 · Team A: 24-hr build & abstract submission.",
    type: "team-squad",
    hackathon_id: "vnr-vjiet",
    team_label: "Team A",
    members: ["Varshini", "Koushik", "Nivedan"],
  },
  {
    id: "vnr-team-b",
    name: "vnr-vjiet-squad-b",
    description: "VNR VJIET CSI 2026 · Team B: 24-hr build & abstract submission.",
    type: "team-squad",
    hackathon_id: "vnr-vjiet",
    team_label: "Team B",
    members: ["Vyshnavi", "Tanishque", "Shivaram"],
  },
  {
    id: "iqoo-team-a",
    name: "iqoo-grand-finale-a",
    description: "iQOO 2026 Grand Finale (Bengaluru) · Team A: Mobile AI track.",
    type: "team-squad",
    hackathon_id: "iqoo",
    team_label: "Team A",
    members: ["Vyshnavi", "Koushik", "Nivedan"],
  },
  {
    id: "iqoo-team-b",
    name: "iqoo-grand-finale-b",
    description: "iQOO 2026 Grand Finale (Bengaluru) · Team B: Onsite Grand Finale track.",
    type: "team-squad",
    hackathon_id: "iqoo",
    team_label: "Team B",
    members: ["Varshini", "Tanishque", "Shivaram"],
  },
  {
    id: "tricity-team-a",
    name: "tricity-duo-a",
    description: "Tricity AI (KITS Warangal) · 2-Member Core Pair.",
    type: "team-squad",
    hackathon_id: "tricity",
    team_label: "Team A (2)",
    members: ["Koushik", "Vyshnavi"],
  },
  {
    id: "tricity-team-b",
    name: "tricity-quad-b",
    description: "Tricity AI (KITS Warangal) · 4-Member Hardware/AI Squad.",
    type: "team-squad",
    hackathon_id: "tricity",
    team_label: "Team B (4)",
    members: ["Varshini", "Tanishque", "Shivaram", "Nivedan"],
  },
  {
    id: "hack-hyd",
    name: "hack-with-hyderabad",
    description: "Hack With Hyderabad 3.0 · Microsoft Office Onsite Unified Build.",
    type: "team-squad",
    hackathon_id: "hack-hyd",
    team_label: "Unified Team",
    members: ["Varshini", "Vyshnavi", "Koushik", "Tanishque", "Shivaram", "Nivedan"],
  },
  {
    id: "hackindia",
    name: "hackindia-ai-first",
    description: "HackIndia AI-First Startup Hackathon · Ongoing Online Build.",
    type: "team-squad",
    hackathon_id: "hackindia",
    team_label: "Unified Team",
    members: ["Varshini", "Vyshnavi", "Koushik", "Tanishque", "Shivaram", "Nivedan"],
  },
  {
    id: "opencv",
    name: "opencv-ai-comp",
    description: "OpenCV AI Competition 2026 · Computer Vision Pipeline.",
    type: "team-squad",
    hackathon_id: "opencv",
    team_label: "Unified Team",
    members: ["Varshini", "Vyshnavi", "Koushik", "Tanishque", "Shivaram", "Nivedan"],
  },
  {
    id: "nebius",
    name: "nebius-nvidia-ai",
    description: "Nebius x NVIDIA Global AI · High-performance LLM / TensorRT.",
    type: "team-squad",
    hackathon_id: "nebius",
    team_label: "Unified Team",
    members: ["Varshini", "Vyshnavi", "Koushik", "Tanishque", "Shivaram", "Nivedan"],
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [];

const STORAGE_KEY = "hacktrack_live_messages_v5";
const GROUPS_STORAGE_KEY = "hacktrack_custom_groups_v1";
const DISPLAY_NAMES_STORAGE_KEY = "hacktrack_display_names_v1";

class RealtimeChatService {
  private messages: ChatMessage[] = [];
  private customGroups: ChatChannel[] = [];
  private customDisplayNames: Record<string, string> = {};
  private listeners: Set<(messages: ChatMessage[]) => void> = new Set();
  private supabaseChannel: any = null;
  private broadcastChannel: BroadcastChannel | null = null;
  public connectionStatus: 'CONNECTED' | 'CONNECTING' | 'OFFLINE' = 'CONNECTING';

  constructor() {
    this.initStorage();
    if (typeof window !== "undefined") {
      this.initBroadcastChannel();
      this.initSupabaseRealtime();
    }
  }

  private initStorage() {
    if (typeof window !== "undefined") {
      try {
        const storedMsgs = localStorage.getItem(STORAGE_KEY);
        if (storedMsgs) {
          const parsed = JSON.parse(storedMsgs);
          if (Array.isArray(parsed)) {
            this.messages = parsed;
          }
        }
      } catch (e) {
        console.warn("Could not load stored messages:", e);
      }

      try {
        const storedGroups = localStorage.getItem(GROUPS_STORAGE_KEY);
        if (storedGroups) {
          const parsed = JSON.parse(storedGroups);
          if (Array.isArray(parsed)) {
            this.customGroups = parsed;
          }
        }
      } catch (e) {
        console.warn("Could not load stored custom groups:", e);
      }

      try {
        const storedNames = localStorage.getItem(DISPLAY_NAMES_STORAGE_KEY);
        if (storedNames) {
          const parsed = JSON.parse(storedNames);
          if (parsed && typeof parsed === "object") {
            this.customDisplayNames = parsed;
          }
        }
      } catch (e) {
        console.warn("Could not load stored display names:", e);
      }
    }
    if (this.messages.length === 0) {
      this.messages = [...INITIAL_MESSAGES];
    }
  }

  private persist() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.messages));
      } catch (e) {
        console.warn("Could not persist messages:", e);
      }
    }
  }

  private persistGroups() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(this.customGroups));
      } catch (e) {
        console.warn("Could not persist custom groups:", e);
      }
    }
  }

  private persistDisplayNames() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(DISPLAY_NAMES_STORAGE_KEY, JSON.stringify(this.customDisplayNames));
      } catch (e) {
        console.warn("Could not persist display names:", e);
      }
    }
  }

  private initBroadcastChannel() {
    try {
      this.broadcastChannel = new BroadcastChannel("hacktrack_chat_sync");
      this.broadcastChannel.onmessage = (event) => {
        if (!event.data) return;
        const { type, payload } = event.data;
        if (type === "NEW_MESSAGE" && payload) {
          this.handleIncomingMessage(payload, false);
        } else if (type === "REACTION" && payload) {
          this.handleIncomingReaction(payload, false);
        } else if (type === "DELETE_MESSAGE" && payload) {
          this.handleIncomingDelete(payload, false);
        } else if (type === "GROUP_CREATED" && payload) {
          this.handleIncomingGroupCreated(payload, false);
        } else if (type === "GROUP_DELETED" && payload) {
          this.handleIncomingGroupDeleted(payload, false);
        } else if (type === "DISPLAY_NAME_UPDATED" && payload) {
          this.handleIncomingDisplayName(payload, false);
        }
      };
    } catch {
      // Fallback for older browsers
    }
  }

  private initSupabaseRealtime() {
    const supabase = createClient();
    if (!supabase) {
      this.connectionStatus = 'OFFLINE';
      return;
    }

    try {
      this.supabaseChannel = supabase.channel("hacktrack-global-chat", {
        config: { broadcast: { self: false } },
      });

      this.supabaseChannel
        .on("broadcast", { event: "new-message" }, (payload: any) => {
          if (payload?.payload) {
            this.handleIncomingMessage(payload.payload, false);
          }
        })
        .on("broadcast", { event: "reaction" }, (payload: any) => {
          if (payload?.payload) {
            this.handleIncomingReaction(payload.payload, false);
          }
        })
        .on("broadcast", { event: "delete-message" }, (payload: any) => {
          if (payload?.payload) {
            this.handleIncomingDelete(payload.payload, false);
          }
        })
        .on("broadcast", { event: "group-created" }, (payload: any) => {
          if (payload?.payload) {
            this.handleIncomingGroupCreated(payload.payload, false);
          }
        })
        .on("broadcast", { event: "group-deleted" }, (payload: any) => {
          if (payload?.payload) {
            this.handleIncomingGroupDeleted(payload.payload, false);
          }
        })
        .on("broadcast", { event: "display-name-updated" }, (payload: any) => {
          if (payload?.payload) {
            this.handleIncomingDisplayName(payload.payload, false);
          }
        })
        .subscribe((status: string) => {
          if (status === "SUBSCRIBED") {
            this.connectionStatus = "CONNECTED";
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            this.connectionStatus = "OFFLINE";
          } else {
            this.connectionStatus = "CONNECTING";
          }
          this.notifyListeners();
        });
    } catch (e) {
      console.warn("Supabase realtime subscription error:", e);
      this.connectionStatus = "OFFLINE";
    }
  }

  private handleIncomingMessage(msg: ChatMessage, broadcastLocal = true) {
    if (this.messages.some((m) => m.id === msg.id)) return;
    this.messages.push(msg);
    this.persist();
    this.notifyListeners();

    if (broadcastLocal && this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: "NEW_MESSAGE", payload: msg });
    }
  }

  private handleIncomingReaction(
    { messageId, emoji, userName }: { messageId: string; emoji: string; userName: string },
    broadcastLocal = true
  ) {
    const msg = this.messages.find((m) => m.id === messageId);
    if (!msg) return;

    if (!msg.reactions) msg.reactions = {};
    if (!msg.reactions[emoji]) msg.reactions[emoji] = [];

    const idx = msg.reactions[emoji].indexOf(userName);
    if (idx >= 0) {
      msg.reactions[emoji].splice(idx, 1);
      if (msg.reactions[emoji].length === 0) {
        delete msg.reactions[emoji];
      }
    } else {
      msg.reactions[emoji].push(userName);
    }

    this.persist();
    this.notifyListeners();

    if (broadcastLocal && this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: "REACTION",
        payload: { messageId, emoji, userName },
      });
    }
  }

  private handleIncomingDelete(
    { messageId, deleted_by, deleted_at }: { messageId: string; deleted_by?: string; deleted_at?: string },
    broadcastLocal = true
  ) {
    const msg = this.messages.find((m) => m.id === messageId);
    if (!msg) return;

    msg.is_deleted = true;
    msg.deleted_at = deleted_at || new Date().toISOString();
    msg.deleted_by = deleted_by || null;

    this.persist();
    this.notifyListeners();

    if (broadcastLocal && this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: "DELETE_MESSAGE",
        payload: { messageId, deleted_by, deleted_at },
      });
    }
  }

  private handleIncomingGroupCreated(group: ChatChannel, broadcastLocal = true) {
    if (this.customGroups.some((g) => g.id === group.id)) return;
    this.customGroups.push(group);
    this.persistGroups();
    this.notifyListeners();

    if (broadcastLocal && this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: "GROUP_CREATED", payload: group });
    }
  }

  private handleIncomingGroupDeleted({ groupId }: { groupId: string }, broadcastLocal = true) {
    const idx = this.customGroups.findIndex((g) => g.id === groupId);
    if (idx === -1) return;
    this.customGroups.splice(idx, 1);
    this.persistGroups();
    this.notifyListeners();

    if (broadcastLocal && this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: "GROUP_DELETED", payload: { groupId } });
    }
  }

  private handleIncomingDisplayName(
    { username, displayName }: { username: string; displayName: string },
    broadcastLocal = true
  ) {
    const cleanU = username.toLowerCase().trim();
    this.customDisplayNames[cleanU] = displayName.trim();
    this.persistDisplayNames();
    this.notifyListeners();

    if (broadcastLocal && this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: "DISPLAY_NAME_UPDATED",
        payload: { username: cleanU, displayName },
      });
    }
  }

  public getMessages(channelId: string): ChatMessage[] {
    return this.messages.filter((m) => m.channel_id === channelId);
  }

  public getAllMessages(): ChatMessage[] {
    return [...this.messages];
  }

  public sendMessage(
    channelId: string,
    senderEmail: string,
    senderName: string,
    content: string,
    attachments?: ChatMessage["attachments"],
    senderUsername?: string
  ): ChatMessage {
    const member = getCollegiateMember(senderEmail);
    const username = senderUsername || (member ? member.username : undefined);
    const effectiveName = username ? this.getDisplayName(username, senderName) : senderName;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      channel_id: channelId,
      sender_email: senderEmail,
      sender_name: effectiveName,
      sender_username: username,
      content: content.trim(),
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
      created_at: new Date().toISOString(),
      is_deleted: false,
    };

    this.handleIncomingMessage(newMsg, true);

    // Broadcast across Supabase Realtime WebSockets to all connected peers
    if (this.supabaseChannel && this.connectionStatus === "CONNECTED") {
      this.supabaseChannel.send({
        type: "broadcast",
        event: "new-message",
        payload: newMsg,
      });
    }

    return newMsg;
  }

  public deleteMessage(messageId: string, userEmail: string): boolean {
    const msg = this.messages.find((m) => m.id === messageId);
    if (!msg) return false;

    const deleted_at = new Date().toISOString();
    msg.is_deleted = true;
    msg.deleted_at = deleted_at;
    msg.deleted_by = userEmail;

    this.persist();
    this.notifyListeners();

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: "DELETE_MESSAGE",
        payload: { messageId, deleted_by: userEmail, deleted_at },
      });
    }

    if (this.supabaseChannel && this.connectionStatus === "CONNECTED") {
      this.supabaseChannel.send({
        type: "broadcast",
        event: "delete-message",
        payload: { messageId, deleted_by: userEmail, deleted_at },
      });
    }

    return true;
  }

  public toggleReaction(messageId: string, emoji: string, userName: string) {
    this.handleIncomingReaction({ messageId, emoji, userName }, true);

    if (this.supabaseChannel && this.connectionStatus === "CONNECTED") {
      this.supabaseChannel.send({
        type: "broadcast",
        event: "reaction",
        payload: { messageId, emoji, userName },
      });
    }
  }

  // ================= DISPLAY NAMES API =================
  public getCustomDisplayNames(): Record<string, string> {
    return { ...this.customDisplayNames };
  }

  public getDisplayName(usernameOrEmail: string, fallbackName?: string): string {
    if (!usernameOrEmail) return fallbackName || "";
    const member = getCollegiateMember(usernameOrEmail);
    const username = member ? member.username.toLowerCase() : usernameOrEmail.toLowerCase().trim();

    if (this.customDisplayNames[username]) {
      return this.customDisplayNames[username];
    }
    if (member) {
      return member.defaultDisplayName;
    }
    return fallbackName || usernameOrEmail;
  }

  public setCustomDisplayName(username: string, displayName: string): void {
    const cleanU = username.toLowerCase().trim();
    const cleanName = displayName.trim();
    if (!cleanName) return;

    this.customDisplayNames[cleanU] = cleanName;
    this.persistDisplayNames();
    this.notifyListeners();

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: "DISPLAY_NAME_UPDATED",
        payload: { username: cleanU, displayName: cleanName },
      });
    }

    if (this.supabaseChannel && this.connectionStatus === "CONNECTED") {
      this.supabaseChannel.send({
        type: "broadcast",
        event: "display-name-updated",
        payload: { username: cleanU, displayName: cleanName },
      });
    }
  }

  // ================= CUSTOM PRIVATE GROUPS API =================
  public getCustomGroups(): ChatChannel[] {
    return [...this.customGroups];
  }

  public createPrivateGroup(
    name: string,
    description: string,
    memberUsernames: string[],
    createdBy: string
  ): ChatChannel {
    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const newGroup: ChatChannel = {
      id: `group-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      description: description.trim() || `Private squad group`,
      type: "private-group",
      members: Array.from(new Set([createdBy, ...memberUsernames])),
      created_by: createdBy,
      created_at: new Date().toISOString(),
    };

    this.customGroups.push(newGroup);
    this.persistGroups();
    this.notifyListeners();

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: "GROUP_CREATED",
        payload: newGroup,
      });
    }

    if (this.supabaseChannel && this.connectionStatus === "CONNECTED") {
      this.supabaseChannel.send({
        type: "broadcast",
        event: "group-created",
        payload: newGroup,
      });
    }

    return newGroup;
  }

  public deletePrivateGroup(groupId: string): boolean {
    const idx = this.customGroups.findIndex((g) => g.id === groupId);
    if (idx === -1) return false;
    this.customGroups.splice(idx, 1);
    this.persistGroups();
    this.notifyListeners();

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: "GROUP_DELETED",
        payload: { groupId },
      });
    }

    if (this.supabaseChannel && this.connectionStatus === "CONNECTED") {
      this.supabaseChannel.send({
        type: "broadcast",
        event: "group-deleted",
        payload: { groupId },
      });
    }

    return true;
  }

  public subscribe(callback: (messages: ChatMessage[]) => void): () => void {
    this.listeners.add(callback);
    callback([...this.messages]);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    const copy = [...this.messages];
    this.listeners.forEach((cb) => cb(copy));
  }
}

export const realtimeChatService = new RealtimeChatService();

'use client';

import * as React from "react";
import Link from "next/link";
import { format, differenceInHours, isPast, parseISO } from "date-fns";
import {
  LayoutDashboard,
  CheckSquare,
  ArrowLeftRight,
  Palette,
  Settings,
  Users,
  FolderKanban,
  Link as LinkIcon,
  Calendar,
  AlertCircle,
  Clock,
  ExternalLink,
  Check,
  X,
  Minus,
  ShieldAlert,
  Send,
  MessageSquare,
  GitBranch,
  Presentation,
  Video,
  Code2,
  CheckCircle2,
  LogIn,
  LogOut,
  UserCheck,
  Trash2,
  Plus,
  Lock,
  Crown,
  Timer,
  Activity,
  Pencil,
} from "lucide-react";
import { DeveloperFooter } from "@/components/developer-footer";
import { SquadChatView } from "@/components/chat/squad-chat-view";
import { AdminMemberPanel } from "@/components/admin-member-panel";
import { useAppStore } from "@/lib/store/use-app-store";
import { canUserModifyRegistrationStatus, isUserAdmin } from "@/lib/utils/permissions";
import { calculateActiveCountdown } from "@/lib/utils/deadlines";
import { CHAT_CHANNELS } from "@/lib/realtime/chat-service";
import { OtpAuthCard } from "@/app/(auth)/login/page";

const isUserInTeamSquad = (user: any, members: string[]): boolean => {
  if (!user) return false;
  if (isUserAdmin(user)) return true;
  const email = (user.email || '').toLowerCase();
  const name = (user.full_name || '').toLowerCase();
  return members.some(m => {
    const mLower = m.toLowerCase();
    return email.includes(mLower) || name.includes(mLower);
  });
};

// Ground Truth Initial Hackathon Data from hacktrack
interface TeamSquad {
  teamLabel: string;
  members: string[];
}

interface ProjectItem {
  team: string;
  projectName: string;
  description?: string;
  buildStatus: 'Not Started' | 'Idea Stage' | 'In Progress' | 'Submitted' | 'Done';
  repoLink?: string;
  pptLink?: string;
  demoLink?: string;
}

interface HackathonItem {
  id: string;
  name: string;
  platform: string;
  format: string;
  registrationDeadline: string | null;
  submissionDeadline: string | null;
  eventDates: string;
  registrationLink?: string;
  submissionLink?: string;
  notes?: string;
  teams: TeamSquad[];
  projects?: ProjectItem[];
}

const MEMBERS = ["Varshini", "Vyshnavi", "Koushik", "Tanishque", "Shivaram", "Nivedan"];



const INITIAL_HACKATHONS: HackathonItem[] = [
  {
    id: "sankalp",
    name: "SANKALP by Satin Finserv",
    platform: "Unstop",
    format: "Idea Submission -> Shortlisting -> Finale (The Climate Edition)",
    registrationDeadline: "2026-09-27",
    submissionDeadline: "2026-10-04",
    eventDates: "TBD (Shortlisting & Final Build)",
    registrationLink: "https://unstop.com/competitions/crp-student-track-sankalp-by-satin-finserv",
    submissionLink: "https://unstop.com/competitions/crp-student-track-sankalp-by-satin-finserv",
    notes: "3-member split squads (Comb 1). Prize pool: ₹1.30 Lakhs",
    teams: [
      { teamLabel: "Team A", members: ["Varshini", "Koushik", "Shivaram"] },
      { teamLabel: "Team B", members: ["Vyshnavi", "Tanishque", "Nivedan"] }
    ],
    projects: [
      {
        team: "Team A",
        projectName: "",
        description: "",
        buildStatus: "Not Started"
      },
      {
        team: "Team B",
        projectName: "",
        description: "",
        buildStatus: "Not Started"
      }
    ]
  },
  {
    id: "vnr-vjiet",
    name: "VNR VJIET CSI Hackathon 2026",
    platform: "VNR VJIET CSI",
    format: "Abstract Submission -> Shortlisting -> 24-Hr Hackathon",
    registrationDeadline: "2026-09-30",
    submissionDeadline: "2026-09-30",
    eventDates: "2026-10-09 (Results) | 2026-10-14 to 2026-10-15 (Event)",
    registrationLink: "https://www.vnrvjietcsi.com",
    submissionLink: "https://www.vnrvjietcsi.com",
    notes: "3-member split squads (Comb 2)",
    teams: [
      { teamLabel: "Team A", members: ["Varshini", "Koushik", "Nivedan"] },
      { teamLabel: "Team B", members: ["Vyshnavi", "Tanishque", "Shivaram"] }
    ]
  },
  {
    id: "iqoo",
    name: "iQOO 2026 Grand Finale",
    platform: "Reskilll",
    format: "City Battles -> Grand Finale (Bengaluru)",
    registrationDeadline: "2026-10-05",
    submissionDeadline: null,
    eventDates: "2026-10-09 to 2026-10-11 (Grand Finale, Bengaluru)",
    registrationLink: "https://iqoo.reskilll.com/dashboard/iqoo-finale",
    submissionLink: "https://iqoo.reskilll.com/dashboard/iqoo-finale",
    notes: "3-member split squads (Comb 3). Hyd battle held Sep 26-27.",
    teams: [
      { teamLabel: "Team A", members: ["Vyshnavi", "Koushik", "Nivedan"] },
      { teamLabel: "Team B", members: ["Varshini", "Tanishque", "Shivaram"] }
    ],
    projects: [
      {
        team: "Team A",
        projectName: "",
        description: "",
        buildStatus: "Not Started"
      },
      {
        team: "Team B",
        projectName: "",
        description: "",
        buildStatus: "Not Started"
      }
    ]
  },
  {
    id: "tricity",
    name: "Tricity AI Hackathon (KITS Warangal)",
    platform: "Centle",
    format: "36-Hour Onsite Build (2 & 4 Member Split)",
    registrationDeadline: "2026-09-20",
    submissionDeadline: "2026-10-11",
    eventDates: "2026-10-10 to 2026-10-11",
    registrationLink: "https://centle.in/tricity/",
    submissionLink: "https://centle.in/tricity/",
    notes: "Focus: AI, Gen AI, Agentic AI. Hardware/mixed format. Problem statements released 03-Oct",
    teams: [
      { teamLabel: "Team A (2)", members: ["Koushik", "Vyshnavi"] },
      { teamLabel: "Team B (4)", members: ["Varshini", "Tanishque", "Shivaram", "Nivedan"] }
    ]
  },
  {
    id: "hack-hyd",
    name: "Hack With Hyderabad 3.0",
    platform: "Devnovate",
    format: "Direct Joining (8-Hour In-Person/Hybrid Build)",
    registrationDeadline: "2026-09-28",
    submissionDeadline: "2026-10-03",
    eventDates: "2026-10-03 at Microsoft Office, Hyderabad",
    registrationLink: "https://devnovate.co/event/hack-with-hyderabad-30",
    submissionLink: "https://devnovate.co/event/hack-with-hyderabad-30",
    notes: "Event confirmed for Oct 3. Prize pool up to $2000.",
    teams: [
      { teamLabel: "Unified Team", members: ["Varshini", "Vyshnavi", "Koushik", "Tanishque", "Shivaram", "Nivedan"] }
    ]
  },
  {
    id: "hackindia",
    name: "AI-First Startup Hackathon (HackIndia)",
    platform: "HackIndia",
    format: "Online Build (Build a Startup using AI only)",
    registrationDeadline: "2026-10-01",
    submissionDeadline: "2026-11-01",
    eventDates: "2026-09-02 to 2026-11-01 (Ongoing Build)",
    registrationLink: "https://hackindia.org/2026/ai-first-startup-hackathon",
    submissionLink: "https://hackindia.org/2026/ai-first-startup-hackathon",
    notes: "Long-running online build",
    teams: [
      { teamLabel: "Unified Team", members: ["Varshini", "Vyshnavi", "Koushik", "Tanishque", "Shivaram", "Nivedan"] }
    ]
  },
  {
    id: "opencv",
    name: "OpenCV AI Competition 2026",
    platform: "Devpost",
    format: "Direct Online Build Submission",
    registrationDeadline: "2026-10-26",
    submissionDeadline: "2026-10-26",
    eventDates: "Ongoing until 2026-10-26",
    registrationLink: "https://opencv26.devpost.com",
    submissionLink: "https://opencv26.devpost.com",
    notes: "Registration and final submission share the same deadline",
    teams: [
      { teamLabel: "Unified Team", members: ["Varshini", "Vyshnavi", "Koushik", "Tanishque", "Shivaram", "Nivedan"] }
    ]
  },
  {
    id: "nebius",
    name: "Nebius x NVIDIA Global AI Hackathon",
    platform: "Devpost",
    format: "Online Build (Must use Nebius Infra + NVIDIA Models)",
    registrationDeadline: "2026-10-30",
    submissionDeadline: "2026-10-30",
    eventDates: "2026-08-26 to 2026-10-30 (Ongoing Build)",
    registrationLink: "https://nebiusglobalaihackathon.devpost.com",
    submissionLink: "https://nebiusglobalaihackathon.devpost.com",
    notes: "Must use Nebius infra + NVIDIA models",
    teams: [
      { teamLabel: "Unified Team", members: ["Varshini", "Vyshnavi", "Koushik", "Tanishque", "Shivaram", "Nivedan"] }
    ]
  }
];

const SUBMISSION_CHECKLIST = [
  "Account Verification: every team member has an active, working account on Unstop, Devpost, Centle, and Reskilll before deadline day.",
  "Code Repositories: create private GitHub repos for development; switch to Public only upon final submission.",
  "Video Demos: for online submissions (e.g. Devpost), allocate the final 12 hours exclusively for recording the required 3-minute demo video."
];

type TabType = 'dashboard' | 'registration' | 'teams' | 'projects' | 'links' | 'chat';

export default function HackathonTrackerHome() {
  const { currentUser, users, switchUser, logout, isHydrated } = useAppStore();
  const [activeTab, setActiveTab] = React.useState<TabType>('dashboard');

  // Hidden admin panel state (not visible in UI, only activated by admin)
  const [showAdminPanel, setShowAdminPanel] = React.useState(false);
  const adminClickRef = React.useRef<{ count: number; timer: ReturnType<typeof setTimeout> | null }>({ count: 0, timer: null });

  // Hidden tabs config — admin can hide/show tabs for non-admin users (persisted, never shown in public UI)
  const [hiddenTabs, setHiddenTabs] = React.useState<Set<string>>(new Set());

  const handleLogoClick = () => {
    if (!isUserAdmin(currentUser)) return;
    adminClickRef.current.count += 1;
    if (adminClickRef.current.timer) clearTimeout(adminClickRef.current.timer);
    adminClickRef.current.timer = setTimeout(() => {
      adminClickRef.current.count = 0;
    }, 600);
    if (adminClickRef.current.count >= 3) {
      adminClickRef.current.count = 0;
      setShowAdminPanel(true);
    }
  };
  const [selectedChatChannelId, setSelectedChatChannelId] = React.useState<string>("all-members");

  const [mounted, setMounted] = React.useState(false);

  // Active Real-Time Clock (Ticking every second)
  const [currentTime, setCurrentTime] = React.useState<Date>(() => new Date());

  // Interactive Registration Status Store (deterministic SSR default)
  const [regStatus, setRegStatus] = React.useState<Record<string, Record<string, 'Registered' | 'Not Yet' | 'N/A'>>>(() => {
    const initial: Record<string, Record<string, 'Registered' | 'Not Yet' | 'N/A'>> = {};
    INITIAL_HACKATHONS.forEach(h => {
      initial[h.id] = {};
      MEMBERS.forEach(m => {
        const inTeam = h.teams.some(t => t.members.includes(m));
        initial[h.id][m] = inTeam ? 'Not Yet' : 'N/A';
      });
    });
    return initial;
  });

  // Interactive Project Tracker Store (deterministic SSR default)
  const [hackathons, setHackathons] = React.useState<HackathonItem[]>(INITIAL_HACKATHONS);

  // Chat / Discussion Notes Store (deterministic SSR default)
  const [chats, setChats] = React.useState<Record<string, { sender: string; text: string; time: string; team?: string }[]>>({});

  // Permission / Action Toast Notice
  const [permissionNotice, setPermissionNotice] = React.useState<string | null>(null);

  // Rename Team Modal State
  const [renamingTeam, setRenamingTeam] = React.useState<{
    hackathonId: string;
    oldLabel: string;
    currentMembers: string[];
  } | null>(null);
  const [newTeamNameInput, setNewTeamNameInput] = React.useState("");

  const handleSaveTeamName = () => {
    if (!renamingTeam || !newTeamNameInput.trim()) return;
    const { hackathonId, oldLabel, currentMembers } = renamingTeam;
    const newName = newTeamNameInput.trim();

    if (!isUserInTeamSquad(currentUser, currentMembers)) {
      setPermissionNotice("Permission Denied: Only assigned squad members can rename this team.");
      setRenamingTeam(null);
      return;
    }

    setHackathons(prev => prev.map(h => {
      if (h.id !== hackathonId) return h;

      const updatedTeams = h.teams.map(t =>
        t.teamLabel === oldLabel ? { ...t, teamLabel: newName } : t
      );

      const updatedProjects = (h.projects || []).map(p =>
        p.team === oldLabel ? { ...p, team: newName } : p
      );

      return {
        ...h,
        teams: updatedTeams,
        projects: updatedProjects,
      };
    }));

    setPermissionNotice(`Team renamed to "${newName}"`);
    setRenamingTeam(null);
  };

  // Add Hackathon Modal State
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [formName, setFormName] = React.useState("");
  const [formPlatform, setFormPlatform] = React.useState("Devpost");
  const [formFormat, setFormFormat] = React.useState("Online Build");
  const [formRegDeadline, setFormRegDeadline] = React.useState("");
  const [formSubDeadline, setFormSubDeadline] = React.useState("");
  const [formEventDates, setFormEventDates] = React.useState("");
  const [formRegLink, setFormRegLink] = React.useState("");
  const [formSubLink, setFormSubLink] = React.useState("");
  const [formNotes, setFormNotes] = React.useState("");
  // Squad formation state for adding a new hackathon
  const [formTeams, setFormTeams] = React.useState<TeamSquad[]>([
    { teamLabel: "Team A", members: ["Varshini", "Koushik", "Shivaram"] },
    { teamLabel: "Team B", members: ["Vyshnavi", "Tanishque", "Nivedan"] }
  ]);

  // Form new squad on existing hackathon state
  const [addingSquadHackathonId, setAddingSquadHackathonId] = React.useState<string | null>(null);
  const [newSquadNameInput, setNewSquadNameInput] = React.useState("");
  const [newSquadMembersInput, setNewSquadMembersInput] = React.useState<string[]>([]);

  // Edit squad membership state
  const [editingSquadMembers, setEditingSquadMembers] = React.useState<{
    hackathonId: string;
    teamLabel: string;
    currentMembers: string[];
  } | null>(null);

  // Link editing state (visible to authorized users only)
  const [editingLinkId, setEditingLinkId] = React.useState<string | null>(null);
  const [editRegLink, setEditRegLink] = React.useState("");
  const [editSubLink, setEditSubLink] = React.useState("");

  // Member swap state
  const [swapModal, setSwapModal] = React.useState<{ hackathonId: string; hackathonName: string } | null>(null);
  const [swapMember, setSwapMember] = React.useState("");
  const [swapFrom, setSwapFrom] = React.useState("");
  const [swapTo, setSwapTo] = React.useState("");

  // Theme customization state (persisted to localStorage)
  const [themeAccent, setThemeAccent] = React.useState("#3b82f6");
  const [themeBg, setThemeBg] = React.useState("#09090b");
  const [themeCardBg, setThemeCardBg] = React.useState("#18181b");
  const [isThemeOpen, setIsThemeOpen] = React.useState(false);

  // Custom links per hackathon stored as { [hackathonId]: { label: string; url: string }[] }
  const [customLinks, setCustomLinks] = React.useState<Record<string, { label: string; url: string }[]>>({});
  const [newLinkLabel, setNewLinkLabel] = React.useState("");
  const [newLinkUrl, setNewLinkUrl] = React.useState("");
  const [addingLinkForHackathon, setAddingLinkForHackathon] = React.useState<string | null>(null);

  // Edit Hackathon Modal State (Admin manual editing on any page)
  const [editingHackathon, setEditingHackathon] = React.useState<HackathonItem | null>(null);
  const [editFormName, setEditFormName] = React.useState("");
  const [editFormPlatform, setEditFormPlatform] = React.useState("");
  const [editFormFormat, setEditFormFormat] = React.useState("");
  const [editFormRegDeadline, setEditFormRegDeadline] = React.useState("");
  const [editFormSubDeadline, setEditFormSubDeadline] = React.useState("");
  const [editFormEventDates, setEditFormEventDates] = React.useState("");
  const [editFormRegLink, setEditFormRegLink] = React.useState("");
  const [editFormSubLink, setEditFormSubLink] = React.useState("");
  const [editFormNotes, setEditFormNotes] = React.useState("");

  const openEditHackathonModal = (h: HackathonItem) => {
    setEditingHackathon(h);
    setEditFormName(h.name);
    setEditFormPlatform(h.platform || "Devpost");
    setEditFormFormat(h.format || "Online Build");
    setEditFormRegDeadline(h.registrationDeadline || "");
    setEditFormSubDeadline(h.submissionDeadline || "");
    setEditFormEventDates(h.eventDates || "");
    setEditFormRegLink(h.registrationLink || "");
    setEditFormSubLink(h.submissionLink || "");
    setEditFormNotes(h.notes || "");
  };

  const handleSaveHackathonEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHackathon || !editFormName.trim()) return;

    setHackathons(prev => prev.map(h => {
      if (h.id !== editingHackathon.id) return h;
      return {
        ...h,
        name: editFormName.trim(),
        platform: editFormPlatform.trim() || "Devpost",
        format: editFormFormat.trim() || "Online Build",
        registrationDeadline: editFormRegDeadline || null,
        submissionDeadline: editFormSubDeadline || null,
        eventDates: editFormEventDates.trim() || "Dates TBA",
        registrationLink: editFormRegLink.trim() || undefined,
        submissionLink: editFormSubLink.trim() || undefined,
        notes: editFormNotes.trim() || undefined,
      };
    }));

    setPermissionNotice(`Updated: "${editFormName.trim()}"`);
    setEditingHackathon(null);
  };

  const isAdmin = isUserAdmin(currentUser);

  // Client-side hydration of local storage after initial render + 1s active clock interval
  React.useEffect(() => {
    setMounted(true);
    try {
      const savedReg = localStorage.getItem("hacktrack-reg-status");
      if (savedReg) setRegStatus(JSON.parse(savedReg));

      const savedProjects = localStorage.getItem("hacktrack-projects-data");
      if (savedProjects) {
        try {
          const parsed = JSON.parse(savedProjects);
          // Purge any stale mock EcoTrace or Before You Pay projects from previous session
          const cleansed = parsed.map((h: any) => {
            if (h.id === 'sankalp') {
              return {
                ...h,
                projects: [
                  { team: "Team A", projectName: "", description: "", buildStatus: "Not Started" },
                  { team: "Team B", projectName: "", description: "", buildStatus: "Not Started" },
                ]
              };
            }
            if (h.id === 'iqoo') {
              return {
                ...h,
                teams: [
                  { teamLabel: "Team A", members: ["Vyshnavi", "Koushik", "Nivedan"] },
                  { teamLabel: "Team B", members: ["Varshini", "Tanishque", "Shivaram"] }
                ],
                projects: [
                  { team: "Team A", projectName: "", description: "", buildStatus: "Not Started" },
                  { team: "Team B", projectName: "", description: "", buildStatus: "Not Started" },
                ]
              };
            }
            return h;
          });
          setHackathons(cleansed);
        } catch {
          setHackathons(INITIAL_HACKATHONS);
        }
      }

      if (localStorage.getItem("hacktrack-clean-v5") !== "true") {
        localStorage.removeItem("hacktrack-chats");
        localStorage.setItem("hacktrack-clean-v5", "true");
        setChats({});
      } else {
        const savedChats = localStorage.getItem("hacktrack-chats");
        if (savedChats) {
          try {
            setChats(JSON.parse(savedChats));
          } catch { /* ignore */ }
        }
      }

      const savedTheme = localStorage.getItem("hacktrack-theme");
      if (savedTheme) {
        try {
          const t = JSON.parse(savedTheme);
          if (t.themeAccent) setThemeAccent(t.themeAccent);
          if (t.themeBg) setThemeBg(t.themeBg);
          if (t.themeCardBg) setThemeCardBg(t.themeCardBg);
        } catch { /* ignore */ }
      }

      const savedCustomLinks = localStorage.getItem("hacktrack-custom-links");
      if (savedCustomLinks) {
        try { setCustomLinks(JSON.parse(savedCustomLinks)); } catch { /* ignore */ }
      }

      const savedHiddenTabs = localStorage.getItem("hacktrack-hidden-tabs");
      if (savedHiddenTabs) {
        try { setHiddenTabs(new Set(JSON.parse(savedHiddenTabs))); } catch { /* ignore */ }
      }
    } catch {
      // ignore parsing errors
    }

    // Active ticking clock every 1 second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Non-admin redirect if currently on a tab that admin removed/hid
  React.useEffect(() => {
    if (mounted && !isAdmin && hiddenTabs.has(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [mounted, isAdmin, hiddenTabs, activeTab]);

  // Auto-dismiss permission / success notice after 4 seconds
  React.useEffect(() => {
    if (permissionNotice) {
      const t = setTimeout(() => setPermissionNotice(null), 4000);
      return () => clearTimeout(t);
    }
  }, [permissionNotice]);

  // Modal State for Selected Hackathon
  const [selectedHackathonId, setSelectedHackathonId] = React.useState<string | null>(null);
  const [chatMessage, setChatMessage] = React.useState("");

  // Persist Registration Status once mounted
  React.useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      localStorage.setItem("hacktrack-reg-status", JSON.stringify(regStatus));
    }
  }, [regStatus, mounted]);

  // Persist Projects once mounted
  React.useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      localStorage.setItem("hacktrack-projects-data", JSON.stringify(hackathons));
    }
  }, [hackathons, mounted]);

  // Persist Chats once mounted
  React.useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      localStorage.setItem("hacktrack-chats", JSON.stringify(chats));
    }
  }, [chats, mounted]);

  /**
   * Cycle Registration Status with Role-Based Permission Enforced:
   * Each member can update their own cell.
   */
  const cycleStatus = (hackathonId: string, member: string) => {
    if (!canUserModifyRegistrationStatus(currentUser, member)) {
      const msg = currentUser
        ? `Access Denied: You are signed in as ${currentUser.full_name}. Only ${member} can modify ${member}'s registration status.`
        : `Sign-in Required: Only ${member} can update ${member}'s registration status. Please sign in.`;
      setPermissionNotice(msg);
      return;
    }

    const current = regStatus[hackathonId]?.[member] || 'N/A';
    const nextStatus: Record<'Registered' | 'Not Yet' | 'N/A', 'Registered' | 'Not Yet' | 'N/A'> = {
      'Registered': 'Not Yet',
      'Not Yet': 'N/A',
      'N/A': 'Registered'
    };
    setRegStatus(prev => ({
      ...prev,
      [hackathonId]: {
        ...(prev[hackathonId] || {}),
        [member]: nextStatus[current]
      }
    }));
  };

  /**
   * Add a new hackathon manually via the website without changing any code.
   * Squads formed by Koushik are preserved and dynamically allocated.
   */
  const handleCreateHackathon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newId = `hack-${Date.now()}`;
    const cleanTeams: TeamSquad[] = formTeams.length > 0
      ? formTeams.map(t => ({
          teamLabel: t.teamLabel.trim() || "Squad",
          members: t.members.length > 0 ? t.members : [...MEMBERS]
        }))
      : [
          { teamLabel: "Team A", members: ["Varshini", "Koushik", "Shivaram"] },
          { teamLabel: "Team B", members: ["Vyshnavi", "Tanishque", "Nivedan"] }
        ];

    const newHack: HackathonItem = {
      id: newId,
      name: formName.trim(),
      platform: formPlatform.trim() || "Devpost",
      format: formFormat.trim() || "Online Build",
      registrationDeadline: formRegDeadline || null,
      submissionDeadline: formSubDeadline || null,
      eventDates: formEventDates.trim() || "Dates TBA",
      registrationLink: formRegLink.trim() || undefined,
      submissionLink: formSubLink.trim() || undefined,
      notes: formNotes.trim() || undefined,
      teams: cleanTeams,
      projects: cleanTeams.map(t => ({
        team: t.teamLabel,
        projectName: "",
        buildStatus: "Not Started"
      }))
    };

    setHackathons(prev => [newHack, ...prev]);

    // Initialize registration status for all members
    setRegStatus(prev => ({
      ...prev,
      [newId]: MEMBERS.reduce((acc, m) => {
        acc[m] = 'Not Yet';
        return acc;
      }, {} as Record<string, 'Registered' | 'Not Yet' | 'N/A'>)
    }));

    // Reset form & close modal
    setFormName("");
    setFormPlatform("Devpost");
    setFormFormat("Online Build");
    setFormRegDeadline("");
    setFormSubDeadline("");
    setFormEventDates("");
    setFormRegLink("");
    setFormSubLink("");
    setFormNotes("");
    setFormTeams([
      { teamLabel: "Team A", members: ["Varshini", "Koushik", "Shivaram"] },
      { teamLabel: "Team B", members: ["Vyshnavi", "Tanishque", "Nivedan"] }
    ]);
    setIsAddModalOpen(false);

    setPermissionNotice(`Success: Hackathon "${newHack.name}" added with ${cleanTeams.length} formed squads.`);
  };

  /** Form a new squad for an existing hackathon */
  const handleAddSquadToHackathon = () => {
    if (!addingSquadHackathonId || !newSquadNameInput.trim()) return;
    const hackathonId = addingSquadHackathonId;
    const squadName = newSquadNameInput.trim();
    const members = newSquadMembersInput.length > 0 ? newSquadMembersInput : [...MEMBERS];

    setHackathons(prev => prev.map(h => {
      if (h.id !== hackathonId) return h;
      const existingSquad = h.teams.find(t => t.teamLabel.toLowerCase() === squadName.toLowerCase());
      if (existingSquad) return h;

      const updatedTeams = [...h.teams, { teamLabel: squadName, members }];
      const updatedProjects = [
        ...(h.projects || []),
        { team: squadName, projectName: "", buildStatus: "Not Started" as const }
      ];

      return {
        ...h,
        teams: updatedTeams,
        projects: updatedProjects,
      };
    }));

    setPermissionNotice(`Formed new squad "${squadName}" for team allocations.`);
    setAddingSquadHackathonId(null);
    setNewSquadNameInput("");
    setNewSquadMembersInput([]);
  };

  /** Update squad roster members */
  const handleSaveSquadMembers = () => {
    if (!editingSquadMembers) return;
    const { hackathonId, teamLabel, currentMembers } = editingSquadMembers;

    setHackathons(prev => prev.map(h => {
      if (h.id !== hackathonId) return h;
      const updatedTeams = h.teams.map(t =>
        t.teamLabel === teamLabel ? { ...t, members: currentMembers } : t
      );
      return { ...h, teams: updatedTeams };
    }));

    setPermissionNotice(`Updated squad members for "${teamLabel}".`);
    setEditingSquadMembers(null);
  };

  /** Remove squad from hackathon */
  const handleDeleteSquad = (hackathonId: string, teamLabel: string) => {
    if (!isUserAdmin(currentUser)) return;
    if (typeof window !== "undefined" && !window.confirm(`Remove squad "${teamLabel}" from this competition?`)) {
      return;
    }

    setHackathons(prev => prev.map(h => {
      if (h.id !== hackathonId) return h;
      return {
        ...h,
        teams: h.teams.filter(t => t.teamLabel !== teamLabel),
        projects: (h.projects || []).filter(p => p.team !== teamLabel),
      };
    }));

    setPermissionNotice(`Squad "${teamLabel}" removed.`);
  };

  /**
   * Delete a hackathon manually in website.
   */
  const handleDeleteHackathon = (hackathonId: string, hackathonName: string) => {
    if (!isUserAdmin(currentUser)) {
      setPermissionNotice("Permission Denied: Administrator access required to delete hackathons.");
      return;
    }

    if (typeof window !== "undefined" && !window.confirm(`Are you sure you want to delete "${hackathonName}"? This action removes it completely.`)) {
      return;
    }

    setHackathons(prev => prev.filter(h => h.id !== hackathonId));
    setRegStatus(prev => {
      const copy = { ...prev };
      delete copy[hackathonId];
      return copy;
    });
    if (selectedHackathonId === hackathonId) {
      setSelectedHackathonId(null);
    }
    setPermissionNotice(`Deleted: "${hackathonName}" successfully removed from active tracker.`);
  };

  const updateProjectField = (hackathonId: string, teamLabel: string, updates: Partial<ProjectItem>) => {
    const h = hackathons.find(x => x.id === hackathonId);
    const teamObj = h?.teams.find(t => t.teamLabel === teamLabel);
    if (!teamObj || !isUserInTeamSquad(currentUser, teamObj.members)) {
      setPermissionNotice(`Permission Denied: Only assigned squad members (${teamObj?.members.join(", ") || 'teammates'}) can update this project.`);
      return;
    }

    setHackathons(prev => prev.map(item => {
      if (item.id !== hackathonId) return item;
      const projects = item.projects ? [...item.projects] : [];
      const existingIdx = projects.findIndex(p => p.team === teamLabel);
      if (existingIdx >= 0) {
        projects[existingIdx] = { ...projects[existingIdx], ...updates };
      } else {
        projects.push({
          team: teamLabel,
          projectName: updates.projectName || "",
          buildStatus: updates.buildStatus || "Not Started",
          ...updates
        });
      }
      return { ...item, projects };
    }));
  };

  const cycleProjectStatus = (hackathonId: string, teamLabel: string) => {
    const h = hackathons.find(x => x.id === hackathonId);
    const teamObj = h?.teams.find(t => t.teamLabel === teamLabel);
    if (!teamObj || !isUserInTeamSquad(currentUser, teamObj.members)) {
      setPermissionNotice(`Permission Denied: Only assigned squad members (${teamObj?.members.join(", ") || 'teammates'}) can change build status.`);
      return;
    }

    const statusCycle: ProjectItem['buildStatus'][] = ['Not Started', 'Idea Stage', 'In Progress', 'Submitted', 'Done'];
    const p = h?.projects?.find(x => x.team === teamLabel);
    const currentStatus = p?.buildStatus || 'Not Started';
    const nextIdx = (statusCycle.indexOf(currentStatus) + 1) % statusCycle.length;
    updateProjectField(hackathonId, teamLabel, { buildStatus: statusCycle[nextIdx] });
  };

  const handleAddChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedHackathonId) return;
    const author = currentUser?.full_name?.split(" ")[0] || "Anonymous";
    const currentH = hackathons.find(h => h.id === selectedHackathonId);
    const authorTeam = currentH?.teams.find(t => isUserInTeamSquad(currentUser, t.members))?.teamLabel || "General";
    const newMsg = {
      sender: author,
      text: chatMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      team: authorTeam,
    };
    setChats(prev => ({
      ...prev,
      [selectedHackathonId]: [...(prev[selectedHackathonId] || []), newMsg]
    }));
    setChatMessage("");
  };

  /** Save edited links for a hackathon */
  const handleSaveLinks = (hackathonId: string) => {
    setHackathons(prev => prev.map(h => {
      if (h.id !== hackathonId) return h;
      return {
        ...h,
        registrationLink: editRegLink.trim() || undefined,
        submissionLink: editSubLink.trim() || undefined,
      };
    }));
    setEditingLinkId(null);
    setPermissionNotice("Links updated successfully.");
  };

  /** Swap a member from one team to another in a hackathon */
  const handleSwapMember = () => {
    if (!swapModal || !swapMember || !swapFrom || !swapTo || swapFrom === swapTo) return;

    setHackathons(prev => prev.map(h => {
      if (h.id !== swapModal.hackathonId) return h;
      const teams = h.teams.map(t => {
        if (t.teamLabel === swapFrom) {
          return { ...t, members: t.members.filter(m => m !== swapMember) };
        }
        if (t.teamLabel === swapTo) {
          if (!t.members.includes(swapMember)) {
            return { ...t, members: [...t.members, swapMember] };
          }
        }
        return t;
      });
      return { ...h, teams };
    }));

    setPermissionNotice(`${swapMember} moved from "${swapFrom}" to "${swapTo}" in ${swapModal.hackathonName}.`);
    setSwapModal(null);
    setSwapMember("");
    setSwapFrom("");
    setSwapTo("");
  };

  /** Add a custom link to a hackathon */
  const handleAddCustomLink = (hackathonId: string) => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    setCustomLinks(prev => ({
      ...prev,
      [hackathonId]: [
        ...(prev[hackathonId] || []),
        { label: newLinkLabel.trim(), url: newLinkUrl.trim() }
      ]
    }));
    setNewLinkLabel("");
    setNewLinkUrl("");
    setAddingLinkForHackathon(null);
    setPermissionNotice("Custom link added successfully.");
  };

  /** Delete a custom link */
  const handleDeleteCustomLink = (hackathonId: string, index: number) => {
    setCustomLinks(prev => ({
      ...prev,
      [hackathonId]: (prev[hackathonId] || []).filter((_, i) => i !== index)
    }));
  };

  // Persist theme & custom links
  React.useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      localStorage.setItem("hacktrack-theme", JSON.stringify({ themeAccent, themeBg, themeCardBg }));
    }
  }, [themeAccent, themeBg, themeCardBg, mounted]);

  React.useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      localStorage.setItem("hacktrack-custom-links", JSON.stringify(customLinks));
    }
  }, [customLinks, mounted]);

  // Apply theme via CSS custom properties
  React.useEffect(() => {
    if (mounted) {
      document.documentElement.style.setProperty('--theme-accent', themeAccent);
      document.documentElement.style.setProperty('--theme-bg', themeBg);
      document.documentElement.style.setProperty('--theme-card-bg', themeCardBg);
    }
  }, [themeAccent, themeBg, themeCardBg, mounted]);

  const getDeadlineStatus = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = parseISO(dateStr);
    if (dateStr.length === 10) date.setHours(23, 59, 59);

    if (isPast(date)) return { status: 'passed', color: 'text-zinc-500', bg: 'bg-zinc-800/40', label: 'Passed' };
    
    const hours = differenceInHours(date, new Date());
    if (hours <= 48) return { status: 'urgent', color: 'text-rose-400', bg: 'bg-rose-500/10 border border-rose-500/30', label: `<48h` };
    return { status: 'upcoming', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border border-emerald-500/30', label: 'Upcoming' };
  };

  const sortedHackathons = [...hackathons].sort((a, b) => {
    const getNextTime = (h: HackathonItem) => {
      const dates = [];
      if (h.registrationDeadline) dates.push(new Date(h.registrationDeadline).getTime());
      if (h.submissionDeadline) dates.push(new Date(h.submissionDeadline).getTime());
      const future = dates.filter(d => !isPast(d));
      return future.length > 0 ? Math.min(...future) : Math.max(...dates, 0);
    };
    return getNextTime(a) - getNextTime(b);
  });

  const selectedH = hackathons.find(h => h.id === selectedHackathonId);

  const getVisibleNotes = React.useCallback((hId: string | null) => {
    if (!hId) return [];
    const rawList = chats[hId] || [];
    if (isUserAdmin(currentUser)) return rawList;
    const currentH = hackathons.find(h => h.id === hId);
    if (!currentH) return rawList;
    const userTeam = currentH.teams.find(t => isUserInTeamSquad(currentUser, t.members));
    if (!userTeam) {
      return rawList.filter(m => !m.team || m.team === 'General' || m.team === 'Unified Team');
    }
    return rawList.filter(m => !m.team || m.team === 'General' || m.team === 'Unified Team' || m.team === userTeam.teamLabel);
  }, [chats, hackathons, currentUser]);

  const activeChats = getVisibleNotes(selectedHackathonId);

  const allNavItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dash' },
    { id: 'registration', icon: CheckSquare, label: 'Reg' },
    { id: 'teams', icon: Users, label: 'Teams' },
    { id: 'projects', icon: FolderKanban, label: 'Projects' },
    { id: 'links', icon: LinkIcon, label: 'Links' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
  ] as const;

  // Admin always sees all tabs; non-admins see only unhidden tabs
  const navItems = isAdmin
    ? allNavItems
    : allNavItems.filter((item) => !hiddenTabs.has(item.id));

  // Unauthenticated guard: users see NOTHING without logging in
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-500 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span>Authenticating HackTrack...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center p-4 selection:bg-blue-500/30 selection:text-white font-sans antialiased">
        <OtpAuthCard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col justify-between selection:bg-blue-500/30 selection:text-white font-sans antialiased">
      {/* Top Header */}
      <header className="px-4 sm:px-8 py-3 bg-[#18181b]/80 border-b border-white/5 backdrop-blur-lg sticky top-0 z-40 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20 cursor-pointer select-none"
            onClick={handleLogoClick}
          >
            H
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent tracking-tight">
              HackTrack
            </h1>
            <p className="text-[11px] text-zinc-400 hidden sm:block">Team coordination & deadline monitor</p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-white/5 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <Icon size={15} className={isActive ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Auth status & actions */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-zinc-200 font-semibold">{currentUser.full_name}</span>
                <span className="text-[10px] text-blue-400">{currentUser.email}</span>
              </div>
              <button
                onClick={() => logout()}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-rose-500/40 text-zinc-300 hover:text-rose-400 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={14} className="text-zinc-400" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/25 transition-all text-xs"
            >
              <LogIn size={14} />
              <span>Sign In (Email OTP)</span>
            </Link>
          )}
        </div>
      </header>

      {/* Mobile-First Tab Carousel (Fast thumb navigation sticky below header) */}
      <div className="flex md:hidden items-center gap-1.5 px-3 py-2 bg-[#121215]/95 border-b border-white/5 overflow-x-auto scrollbar-none sticky top-[57px] z-30 backdrop-blur-md">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer touch-manipulation active:scale-95 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-white/5'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : 'text-zinc-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3.5 sm:p-6 md:p-8 pb-32 sm:pb-36 md:pb-12">
        {/* ================= LIVE SYSTEM CLOCK & ROLE BANNER ================= */}
        {mounted && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#18181b] border border-white/5 shadow-xl mb-4 sm:mb-6 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-zinc-400 font-semibold tracking-wide flex items-center gap-1.5 shrink-0">
                <Activity size={13} className="text-emerald-400" />
                <span className="text-[11px] sm:text-xs">LIVE TIME:</span>
              </span>
              <span
                suppressHydrationWarning
                className="font-mono font-bold text-zinc-100 bg-black/40 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-white/5 tracking-wider text-[11px] sm:text-xs shadow-inner"
              >
                {format(currentTime, "EEE, MMM d, yyyy · HH:mm:ss")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {currentUser ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] sm:text-[11px]">
                  <UserCheck size={13} className="text-blue-400 shrink-0" />
                  <span>Logged in: {currentUser.full_name}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-zinc-500 text-[10px] sm:text-[11px]">
                  <Lock size={12} className="shrink-0" />
                  <span>Sign in to update your registration status</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 1: DASHBOARD / DEADLINES ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                  <Timer className="text-blue-400" size={22} />
                  <span>Upcoming Deadlines</span>
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                  Live hackathons with real-time countdowns updated every second
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95 touch-manipulation"
                >
                  <Plus size={15} />
                  <span>Add Hackathon</span>
                </button>
                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold shadow-[0_0_10px_rgba(59,130,246,0.15)] shrink-0">
                  {hackathons.length} Active
                </span>
              </div>
            </div>

            <div className="grid gap-3.5 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {sortedHackathons.map((h) => {
                const regCd = h.registrationDeadline ? calculateActiveCountdown(h.registrationDeadline, currentTime) : null;
                const subCd = h.submissionDeadline ? calculateActiveCountdown(h.submissionDeadline, currentTime) : null;
                const msgCount = getVisibleNotes(h.id).length;

                return (
                  <div
                    key={h.id}
                    onClick={() => setSelectedHackathonId(h.id)}
                    className="bg-[#18181b] rounded-2xl p-5 border border-white/5 shadow-xl hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all cursor-pointer hover:-translate-y-0.5 group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-base text-zinc-100 group-hover:text-blue-400 transition-colors leading-snug">
                            {h.name}
                          </h3>
                          <span className="text-[11px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded-md mt-1.5 inline-block border border-white/5">
                            {h.platform}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {mounted && msgCount > 0 && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">
                              <MessageSquare size={12} />
                              <span>{msgCount}</span>
                            </div>
                          )}

                          {/* Edit Hackathon (Admin only) */}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditHackathonModal(h);
                              }}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all cursor-pointer"
                              title="Edit Competition"
                            >
                              <Pencil size={14} />
                            </button>
                          )}

                          {/* Delete Hackathon (Admin only) */}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteHackathon(h.id, h.name);
                              }}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                              title="Delete Hackathon"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Dynamic Active Ticking Countdowns */}
                      <div className="space-y-2.5 mb-4">
                        {h.registrationDeadline && regCd && (
                          <div
                            suppressHydrationWarning
                            className={`p-2.5 rounded-xl text-xs border transition-colors ${regCd.badgeBg}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Clock size={13} className={regCd.badgeColor} />
                                <span className="text-zinc-200 font-medium truncate">
                                  Reg: {format(parseISO(h.registrationDeadline), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <span
                                suppressHydrationWarning
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${regCd.badgeColor} ${regCd.badgeBg} ${regCd.isCritical ? 'animate-pulse' : ''}`}
                              >
                                {regCd.badgeLabel}
                              </span>
                            </div>
                            <div className="mt-1.5 flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                              <span className="text-zinc-400">Countdown:</span>
                              <span
                                suppressHydrationWarning
                                className={`font-mono font-bold tracking-tight ${regCd.badgeColor}`}
                              >
                                {regCd.formattedString}
                              </span>
                            </div>
                          </div>
                        )}

                        {h.submissionDeadline && subCd && (
                          <div
                            suppressHydrationWarning
                            className={`p-2.5 rounded-xl text-xs border transition-colors ${subCd.badgeBg}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Calendar size={13} className={subCd.badgeColor} />
                                <span className="text-zinc-200 font-medium truncate">
                                  Sub: {format(parseISO(h.submissionDeadline), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <span
                                suppressHydrationWarning
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${subCd.badgeColor} ${subCd.badgeBg} ${subCd.isCritical ? 'animate-pulse' : ''}`}
                              >
                                {subCd.badgeLabel}
                              </span>
                            </div>
                            <div className="mt-1.5 flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                              <span className="text-zinc-400">Countdown:</span>
                              <span
                                suppressHydrationWarning
                                className={`font-mono font-bold tracking-tight ${subCd.badgeColor}`}
                              >
                                {subCd.formattedString}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                      <span>{h.teams.length} Squads</span>
                      <span className="text-blue-400 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>Details &amp; Notes</span>
                        <span>→</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 2: REGISTRATION STATUS MATRIX ================= */}
        {activeTab === 'registration' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                  <CheckSquare size={22} className="text-blue-400" />
                  <span>Registration Status</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Tap your cell to cycle: <span className="text-emerald-400 font-semibold">Registered</span> → <span className="text-amber-400 font-semibold">Not Yet</span> → <span className="text-zinc-500 font-semibold">N/A</span>
                </p>
              </div>
            </div>

            {/* Role-Based Permission Notice Banner */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
              <div className="flex items-center gap-2 text-zinc-300">
                <ShieldAlert size={16} className="text-blue-400 shrink-0" />
                <span>
                  <strong className="text-zinc-100">Self-Editing:</strong> Each member can update their own registration status.
                </span>
              </div>
            </div>

            {/* Desktop Full Table View */}
            <div className="hidden md:block rounded-2xl border border-white/5 bg-[#18181b] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/30 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-white/5">
                    <tr>
                      <th className="px-5 py-4">Hackathon</th>
                      {MEMBERS.map(m => (
                        <th key={m} className="px-4 py-4 text-center">{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {hackathons.map(h => (
                      <tr key={h.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-zinc-100">
                          <div className="flex items-center gap-2">
                            <div className="text-sm">{h.name}</div>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => openEditHackathonModal(h)}
                                className="p-1 rounded text-zinc-500 hover:text-blue-400 hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                                title="Edit Details"
                              >
                                <Pencil size={12} />
                              </button>
                            )}
                          </div>
                          <div className="text-xs text-zinc-500 font-normal mt-0.5">{h.platform}</div>
                        </td>
                        {MEMBERS.map(m => {
                          const status = regStatus[h.id]?.[m] || 'N/A';
                          const canEdit = canUserModifyRegistrationStatus(currentUser, m);

                          return (
                            <td key={m} className="px-4 py-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => cycleStatus(h.id, m)}
                                className={`inline-flex items-center justify-center transition-all ${
                                  canEdit
                                    ? "cursor-pointer hover:scale-110 active:scale-95"
                                    : "cursor-not-allowed opacity-40 hover:opacity-55"
                                }`}
                                title={
                                  canEdit
                                    ? `${m}: ${status} (Click to toggle)`
                                    : `Locked: Only ${m} can update this status`
                                }
                              >
                                {status === 'Registered' && (
                                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                                    <Check size={18} />
                                  </div>
                                )}
                                {status === 'Not Yet' && (
                                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                                    <X size={18} />
                                  </div>
                                )}
                                {status === 'N/A' && (
                                  <div className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-500 flex items-center justify-center border border-zinc-700">
                                    <Minus size={18} />
                                  </div>
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards View */}
            <div className="grid gap-3.5 md:hidden">
              {hackathons.map(h => (
                <div key={h.id} className="p-3.5 sm:p-4 rounded-2xl bg-[#18181b] border border-white/5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="font-bold text-sm text-zinc-100 truncate">{h.name}</h3>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => openEditHackathonModal(h)}
                          className="p-1 rounded text-zinc-500 hover:text-blue-400 hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                          title="Edit Details"
                        >
                          <Pencil size={12} />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 shrink-0">
                      {h.platform}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {MEMBERS.map(m => {
                      const status = regStatus[h.id]?.[m] || 'N/A';
                      const canEdit = canUserModifyRegistrationStatus(currentUser, m);

                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => cycleStatus(h.id, m)}
                          className={`relative p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all touch-manipulation min-h-[52px] ${
                            canEdit
                              ? "bg-zinc-900 border-white/10 hover:border-blue-500/40 active:scale-95 cursor-pointer shadow-sm"
                              : "bg-zinc-950/60 border-white/5 cursor-not-allowed opacity-40 hover:opacity-50"
                          }`}
                          title={
                            canEdit
                              ? `${m}: ${status} (Click to toggle)`
                              : `Locked: Only ${m} can update this status`
                          }
                        >
                          {!canEdit && (
                            <Lock size={10} className="absolute top-1.5 right-1.5 text-zinc-500" />
                          )}
                          <span className="text-[11px] text-zinc-300 font-medium truncate max-w-full">{m}</span>
                          {status === 'Registered' && (
                            <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                              <Check size={13} /> Yes
                            </span>
                          )}
                          {status === 'Not Yet' && (
                            <span className="text-amber-400 font-bold text-[11px] flex items-center gap-1">
                              <X size={13} /> No
                            </span>
                          )}
                          {status === 'N/A' && (
                            <span className="text-zinc-500 font-bold text-[11px]">N/A</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: TEAM ALLOCATIONS ================= */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Team Allocations</h2>
              <p className="text-xs text-zinc-400 mt-1">Collegiate hackathon rosters and assigned squads</p>
            </div>

            {/* Squads Breakdown */}
            <div className="grid gap-4 md:grid-cols-2">
              {hackathons.map(h => (
                <div key={h.id} className="p-5 rounded-2xl bg-[#18181b] border border-white/5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-base text-zinc-100">{h.name}</h4>
                      <p className="text-xs text-zinc-400 mt-1">{h.notes || h.format}</p>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setAddingSquadHackathonId(h.id);
                            setNewSquadNameInput(`Team ${String.fromCharCode(65 + h.teams.length)}`);
                            setNewSquadMembersInput([]);
                          }}
                          className="px-2 py-1 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Form New Squad"
                        >
                          <Plus size={11} />
                          <span>Add Squad</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditHackathonModal(h)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-white/10 transition-colors cursor-pointer"
                          title="Edit Details"
                        >
                          <Pencil size={13} />
                        </button>
                        {h.teams.length >= 2 && (
                          <button
                            type="button"
                            onClick={() => setSwapModal({ hackathonId: h.id, hackathonName: h.name })}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-white/10 transition-colors cursor-pointer"
                            title="Move Members"
                          >
                            <ArrowLeftRight size={13} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {h.teams.map((t, idx) => {
                      const canEdit = isAdmin || isUserInTeamSquad(currentUser, t.members);
                      return (
                        <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-blue-400">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="flex items-center gap-1.5 truncate">
                                <Users size={14} /> {t.teamLabel}
                              </span>
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRenamingTeam({ hackathonId: h.id, oldLabel: t.teamLabel, currentMembers: t.members });
                                    setNewTeamNameInput(t.teamLabel);
                                  }}
                                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                  title="Rename Team"
                                >
                                  <Pencil size={11} />
                                </button>
                              )}
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => setEditingSquadMembers({ hackathonId: h.id, teamLabel: t.teamLabel, currentMembers: [...t.members] })}
                                  className="p-1 rounded text-zinc-400 hover:text-blue-300 hover:bg-white/10 transition-colors cursor-pointer"
                                  title="Edit Members"
                                >
                                  <Users size={11} />
                                </button>
                              )}
                              {isAdmin && h.teams.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSquad(h.id, t.teamLabel)}
                                  className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  title="Remove Squad"
                                >
                                  <Trash2 size={11} />
                                </button>
                              )}
                            </div>
                            <span className="text-[11px] text-zinc-500 font-normal shrink-0">{t.members.length} members</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {t.members.map(m => (
                              <span key={m} className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 text-xs border border-zinc-700/60 font-medium">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: PROJECT TRACKER ================= */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Project Tracker</h2>
              <p className="text-xs text-zinc-400 mt-1">Tap fields to edit inline · Click status button to cycle progress</p>
            </div>

            <div className="space-y-6">
              {hackathons.map(h => (
                <div key={h.id} className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-lg text-zinc-100 flex items-center gap-2">
                      <Code2 size={18} className="text-blue-400" />
                      <span>{h.name}</span>
                    </h3>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => openEditHackathonModal(h)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-white/10 transition-colors cursor-pointer"
                        title="Edit Competition"
                      >
                        <Pencil size={13} />
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {h.teams.map(team => {
                      const project = h.projects?.find(p => p.team === team.teamLabel) || {
                        team: team.teamLabel,
                        projectName: "",
                        description: "",
                        buildStatus: "Not Started"
                      };

                      const canEdit = isAdmin || isUserInTeamSquad(currentUser, team.members);

                      const statusColors: Record<ProjectItem['buildStatus'], string> = {
                        'Not Started': 'bg-zinc-800 text-zinc-400 border-zinc-700',
                        'Idea Stage': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                        'In Progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                        'Submitted': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                        'Done': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(34,197,94,0.2)]'
                      };

                      return (
                        <div
                          key={team.teamLabel}
                          className="p-5 rounded-2xl bg-[#18181b] border border-white/5 space-y-3 relative overflow-hidden shadow-xl group hover:border-blue-500/30 transition-all"
                        >
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-purple-500" />

                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 truncate">
                                {team.teamLabel} ({team.members.join(", ")})
                              </span>
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRenamingTeam({ hackathonId: h.id, oldLabel: team.teamLabel, currentMembers: team.members });
                                    setNewTeamNameInput(team.teamLabel);
                                  }}
                                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                                  title="Rename Team"
                                >
                                  <Pencil size={11} />
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {!canEdit && (
                                <span className="text-[10px] font-medium text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Lock size={10} className="text-zinc-500" />
                                  <span>View Only</span>
                                </span>
                              )}

                              {canEdit ? (
                                <button
                                  type="button"
                                  onClick={() => cycleProjectStatus(h.id, team.teamLabel)}
                                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${statusColors[project.buildStatus]}`}
                                  title="Click to cycle build status"
                                >
                                  {project.buildStatus}
                                </button>
                              ) : (
                                <span
                                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border cursor-default select-none ${statusColors[project.buildStatus]}`}
                                  title={`Build Status: ${project.buildStatus} (Only teammates can change)`}
                                >
                                  {project.buildStatus}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Project Name */}
                          {canEdit ? (
                            <input
                              type="text"
                              placeholder="Project Name / Idea..."
                              value={project.projectName}
                              onChange={(e) => updateProjectField(h.id, team.teamLabel, { projectName: e.target.value })}
                              className="w-full bg-transparent text-base font-bold text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 border-b border-transparent pb-1 transition-colors"
                            />
                          ) : (
                            <div className="border-b border-transparent pb-1">
                              {project.projectName ? (
                                <h4 className="text-base font-bold text-zinc-100">{project.projectName}</h4>
                              ) : (
                                <p className="text-sm italic text-zinc-600">No project title set yet</p>
                              )}
                            </div>
                          )}

                          {/* Description */}
                          {canEdit ? (
                            <textarea
                              placeholder="Brief description..."
                              value={project.description || ""}
                              onChange={(e) => updateProjectField(h.id, team.teamLabel, { description: e.target.value })}
                              className="w-full bg-transparent text-xs text-zinc-400 placeholder:text-zinc-600 focus:outline-none resize-none h-12 border-b border-transparent focus:border-blue-500/30 transition-colors"
                            />
                          ) : (
                            <div className="h-12 overflow-y-auto">
                              <p className="text-xs text-zinc-400 leading-relaxed">
                                {project.description || <span className="text-zinc-600 italic">No description provided yet</span>}
                              </p>
                            </div>
                          )}

                          {/* Links: Teammates can edit, Other teams can view & click */}
                          <div className="space-y-2 pt-1 text-xs">
                            {/* GitHub Repo */}
                            {canEdit ? (
                              <div className="flex items-center gap-2 bg-black/30 rounded-xl p-2.5 border border-white/5 focus-within:ring-1 ring-blue-500/50 transition-all">
                                <GitBranch size={15} className="text-zinc-500 shrink-0" />
                                <input
                                  type="url"
                                  placeholder="GitHub Repo URL"
                                  value={project.repoLink || ""}
                                  onChange={(e) => updateProjectField(h.id, team.teamLabel, { repoLink: e.target.value })}
                                  className="w-full bg-transparent text-blue-400 placeholder:text-zinc-600 focus:outline-none"
                                />
                              </div>
                            ) : (
                              project.repoLink ? (
                                <a
                                  href={project.repoLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between gap-2 bg-black/30 hover:bg-black/50 rounded-xl p-2.5 border border-white/5 hover:border-blue-500/30 text-blue-400 transition-colors group"
                                  title="View GitHub Repository"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <GitBranch size={15} className="text-zinc-400 shrink-0" />
                                    <span className="truncate">{project.repoLink}</span>
                                  </div>
                                  <ExternalLink size={13} className="text-zinc-500 group-hover:text-blue-400 shrink-0" />
                                </a>
                              ) : (
                                <div className="flex items-center gap-2 bg-black/15 rounded-xl p-2.5 border border-white/5 text-zinc-600">
                                  <GitBranch size={15} className="shrink-0" />
                                  <span>No repository linked</span>
                                </div>
                              )
                            )}

                            {/* Deck / Presentation */}
                            {canEdit ? (
                              <div className="flex items-center gap-2 bg-black/30 rounded-xl p-2.5 border border-white/5 focus-within:ring-1 ring-blue-500/50 transition-all">
                                <Presentation size={15} className="text-zinc-500 shrink-0" />
                                <input
                                  type="url"
                                  placeholder="Deck / PPT URL"
                                  value={project.pptLink || ""}
                                  onChange={(e) => updateProjectField(h.id, team.teamLabel, { pptLink: e.target.value })}
                                  className="w-full bg-transparent text-orange-400 placeholder:text-zinc-600 focus:outline-none"
                                />
                              </div>
                            ) : (
                              project.pptLink ? (
                                <a
                                  href={project.pptLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between gap-2 bg-black/30 hover:bg-black/50 rounded-xl p-2.5 border border-white/5 hover:border-orange-500/30 text-orange-400 transition-colors group"
                                  title="View Presentation Deck"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <Presentation size={15} className="text-zinc-400 shrink-0" />
                                    <span className="truncate">{project.pptLink}</span>
                                  </div>
                                  <ExternalLink size={13} className="text-zinc-500 group-hover:text-orange-400 shrink-0" />
                                </a>
                              ) : (
                                <div className="flex items-center gap-2 bg-black/15 rounded-xl p-2.5 border border-white/5 text-zinc-600">
                                  <Presentation size={15} className="shrink-0" />
                                  <span>No presentation deck linked</span>
                                </div>
                              )
                            )}

                            {/* Demo Video */}
                            {canEdit ? (
                              <div className="flex items-center gap-2 bg-black/30 rounded-xl p-2.5 border border-white/5 focus-within:ring-1 ring-blue-500/50 transition-all">
                                <Video size={15} className="text-zinc-500 shrink-0" />
                                <input
                                  type="url"
                                  placeholder="Demo Video URL"
                                  value={project.demoLink || ""}
                                  onChange={(e) => updateProjectField(h.id, team.teamLabel, { demoLink: e.target.value })}
                                  className="w-full bg-transparent text-rose-400 placeholder:text-zinc-600 focus:outline-none"
                                />
                              </div>
                            ) : (
                              project.demoLink ? (
                                <a
                                  href={project.demoLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between gap-2 bg-black/30 hover:bg-black/50 rounded-xl p-2.5 border border-white/5 hover:border-rose-500/30 text-rose-400 transition-colors group"
                                  title="View Demo Video"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <Video size={15} className="text-zinc-400 shrink-0" />
                                    <span className="truncate">{project.demoLink}</span>
                                  </div>
                                  <ExternalLink size={13} className="text-zinc-500 group-hover:text-rose-400 shrink-0" />
                                </a>
                              ) : (
                                <div className="flex items-center gap-2 bg-black/15 rounded-xl p-2.5 border border-white/5 text-zinc-600">
                                  <Video size={15} className="shrink-0" />
                                  <span>No demo video linked</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: LINKS & CHECKLIST ================= */}
        {activeTab === 'links' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100 mb-4">Submission Checklist</h2>
              <div className="bg-gradient-to-br from-[#18181b] to-[#18181b]/60 rounded-2xl p-6 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] space-y-4">
                {SUBMISSION_CHECKLIST.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                    <CheckCircle2 size={20} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Quick Links</h2>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsThemeOpen(prev => !prev)}
                      className="p-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-blue-500/40 text-zinc-400 hover:text-blue-400 transition-all cursor-pointer"
                      title="Customization"
                    >
                      <Palette size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Theme Customization Panel (admin only, no admin label) */}
              {isAdmin && isThemeOpen && (
                <div className="mb-6 p-5 rounded-2xl bg-[#18181b] border border-white/10 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                      <Palette size={14} className="text-blue-400" />
                      <span>Appearance</span>
                    </h3>
                    <button
                      onClick={() => setIsThemeOpen(false)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-medium text-zinc-400">Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeAccent}
                          onChange={(e) => setThemeAccent(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={themeAccent}
                          onChange={(e) => setThemeAccent(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-200 text-xs font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-medium text-zinc-400">Background</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeBg}
                          onChange={(e) => setThemeBg(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={themeBg}
                          onChange={(e) => setThemeBg(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-200 text-xs font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-medium text-zinc-400">Card Background</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeCardBg}
                          onChange={(e) => setThemeCardBg(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={themeCardBg}
                          onChange={(e) => setThemeCardBg(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-200 text-xs font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => { setThemeAccent("#3b82f6"); setThemeBg("#09090b"); setThemeCardBg("#18181b"); }}
                      className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 border border-white/10 cursor-pointer transition-colors"
                    >
                      Reset to Default
                    </button>
                    <div className="flex-1" />
                    <div className="flex gap-2">
                      {["#3b82f6","#8b5cf6","#ec4899","#f97316","#10b981","#06b6d4"].map(c => (
                        <button
                          key={c}
                          onClick={() => setThemeAccent(c)}
                          className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${themeAccent === c ? 'border-white scale-110' : 'border-transparent'}`}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-[#18181b] rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden shadow-xl">
                {hackathons.map(h => {
                  const isEditing = editingLinkId === h.id;
                  const hCustomLinks = customLinks[h.id] || [];

                  return (
                    <div key={h.id} className="p-5 hover:bg-white/[0.02] transition-colors space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-base text-zinc-100">{h.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-0.5 rounded-md border border-white/5">{h.platform}</span>
                          {isAdmin && !isEditing && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingLinkId(h.id);
                                setEditRegLink(h.registrationLink || "");
                                setEditSubLink(h.submissionLink || "");
                              }}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-blue-400 transition-colors cursor-pointer"
                              title="Edit Links"
                            >
                              <Pencil size={13} />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => openEditHackathonModal(h)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
                              title="Edit Details"
                            >
                              <Settings size={13} />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => setSwapModal({ hackathonId: h.id, hackathonName: h.name })}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                              title="Move Members"
                            >
                              <ArrowLeftRight size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Inline editing mode */}
                      {isEditing ? (
                        <div className="space-y-3 text-xs animate-in fade-in-0 duration-200">
                          <div className="space-y-1.5">
                            <label className="font-medium text-zinc-400">Registration URL</label>
                            <input
                              type="url"
                              value={editRegLink}
                              onChange={(e) => setEditRegLink(e.target.value)}
                              placeholder="https://..."
                              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-medium text-zinc-400">Submission URL</label>
                            <input
                              type="url"
                              value={editSubLink}
                              onChange={(e) => setEditSubLink(e.target.value)}
                              placeholder="https://..."
                              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingLinkId(null)}
                              className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveLinks(h.id)}
                              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 cursor-pointer transition-all"
                            >
                              Save Links
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {h.registrationLink && (
                            <a
                              href={h.registrationLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 rounded-xl bg-black/20 hover:bg-black/40 border border-transparent hover:border-white/10 text-zinc-200 transition-colors group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                                  <LinkIcon size={16} />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-zinc-200 group-hover:text-blue-400 transition-colors">Registration Link</p>
                                  <p className="text-[11px] text-zinc-500 truncate">{h.registrationLink}</p>
                                </div>
                              </div>
                              <ExternalLink size={16} className="text-zinc-600 group-hover:text-blue-400 transition-colors shrink-0 ml-2" />
                            </a>
                          )}

                          {h.submissionLink && (
                            <a
                              href={h.submissionLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 rounded-xl bg-black/20 hover:bg-black/40 border border-transparent hover:border-white/10 text-zinc-200 transition-colors group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                                  <LinkIcon size={16} />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-zinc-200 group-hover:text-purple-400 transition-colors">Submission Link</p>
                                  <p className="text-[11px] text-zinc-500 truncate">{h.submissionLink}</p>
                                </div>
                              </div>
                              <ExternalLink size={16} className="text-zinc-600 group-hover:text-purple-400 transition-colors shrink-0 ml-2" />
                            </a>
                          )}

                          {/* Custom Links */}
                          {hCustomLinks.map((cl, clIdx) => (
                            <div key={clIdx} className="flex items-center gap-2">
                              <a
                                href={cl.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-between p-3 rounded-xl bg-black/20 hover:bg-black/40 border border-transparent hover:border-white/10 text-zinc-200 transition-colors group"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                    <LinkIcon size={16} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">{cl.label}</p>
                                    <p className="text-[11px] text-zinc-500 truncate">{cl.url}</p>
                                  </div>
                                </div>
                                <ExternalLink size={16} className="text-zinc-600 group-hover:text-emerald-400 transition-colors shrink-0 ml-2" />
                              </a>
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomLink(h.id, clIdx)}
                                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                                  title="Remove Link"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add custom link form (admin only) */}
                      {isAdmin && addingLinkForHackathon === h.id && (
                        <div className="flex flex-col sm:flex-row gap-2 text-xs animate-in fade-in-0 duration-200 pt-2 border-t border-white/5">
                          <input
                            type="text"
                            placeholder="Link label (e.g. Figma Design)"
                            value={newLinkLabel}
                            onChange={(e) => setNewLinkLabel(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                          <input
                            type="url"
                            placeholder="https://..."
                            value={newLinkUrl}
                            onChange={(e) => setNewLinkUrl(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => setAddingLinkForHackathon(null)}
                              className="px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddCustomLink(h.id)}
                              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 cursor-pointer transition-all"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      )}

                      {isAdmin && addingLinkForHackathon !== h.id && (
                        <button
                          type="button"
                          onClick={() => setAddingLinkForHackathon(h.id)}
                          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-blue-400 pt-1 transition-colors cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>Add custom link</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: SQUAD COMMS & REALTIME CHAT ================= */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
                  <span>Squad Communications</span>
                </h2>
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

            <SquadChatView initialChannelId={selectedChatChannelId} />
          </div>
        )}
      </main>

      {/* ================= MODAL: HACKATHON DETAILS & NOTES ================= */}
      {selectedHackathonId && selectedH && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-0"
          onClick={() => setSelectedHackathonId(null)}
        >
          <div
            className="bg-[#18181b] border border-white/10 rounded-2xl max-w-xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-zinc-100">{selectedH.name}</h3>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        const h = selectedH;
                        setSelectedHackathonId(null);
                        openEditHackathonModal(h);
                      }}
                      className="p-1 rounded-md text-zinc-400 hover:text-blue-400 hover:bg-white/10 transition-colors cursor-pointer"
                      title="Edit Details"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{selectedH.platform} · {selectedH.format}</p>
              </div>
              <button
                onClick={() => setSelectedHackathonId(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Squads in this hackathon */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Assigned Squads:</span>
              <div className="space-y-1.5">
                {selectedH.teams.map((t, idx) => {
                  const canEdit = isAdmin || isUserInTeamSquad(currentUser, t.members);
                  return (
                    <div key={idx} className="flex items-center justify-between text-zinc-300">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold text-zinc-200 truncate">{t.teamLabel}:</span>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => {
                              setRenamingTeam({ hackathonId: selectedH.id, oldLabel: t.teamLabel, currentMembers: t.members });
                              setNewTeamNameInput(t.teamLabel);
                            }}
                            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Rename Team"
                          >
                            <Pencil size={11} />
                          </button>
                        )}
                      </div>
                      <span className="text-zinc-400 truncate">{t.members.join(", ")}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team Notes / Discussion */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-blue-400" />
                  <span>Squad Notes & Updates ({activeChats.length})</span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    const userTeam = selectedH.teams.find(t => isUserInTeamSquad(currentUser, t.members));
                    const matchChannel = CHAT_CHANNELS.find(
                      c => c.hackathon_id === selectedH.id && (userTeam ? c.team_label === userTeam.teamLabel : true)
                    );
                    const targetChannel = matchChannel ? matchChannel.id : 'all-members';
                    setSelectedChatChannelId(targetChannel);
                    setSelectedHackathonId(null);
                    setActiveTab('chat');
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Open Full Squad Chat</span>
                  <span>→</span>
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs">
                {activeChats.length === 0 ? (
                  <p className="text-zinc-500 text-center py-4 text-xs">No squad notes posted yet for your team in this competition.</p>
                ) : (
                  activeChats.map((msg, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-zinc-900 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-blue-300">{msg.sender}</span>
                          {msg.team && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-zinc-400 border border-white/5">
                              {msg.team}
                            </span>
                          )}
                        </div>
                        <span>{msg.time}</span>
                      </div>
                      <p className="text-zinc-200 leading-relaxed">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddChat} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Post a squad note / update..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!chatMessage.trim()}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/30 transition-all"
                >
                  <Send size={14} />
                  <span>Post</span>
                </button>
              </form>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedHackathonId(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 border border-white/10 cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD NEW HACKATHON MANUALLY ================= */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-0 overflow-y-auto"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-[#18181b] border border-white/10 rounded-2xl max-w-xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl my-auto max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  <Plus className="text-blue-400" size={20} />
                  <span>Add New Hackathon</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Manually track a new competition without editing any code
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateHackathon} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Hackathon Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google Cloud GenAI Hackathon 2026"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Platform</label>
                  <input
                    type="text"
                    placeholder="e.g. Devpost, Unstop, Centle, Reskilll"
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Format / Mode</label>
                  <input
                    type="text"
                    placeholder="e.g. Online Build, 24-Hr Onsite"
                    value={formFormat}
                    onChange={(e) => setFormFormat(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Registration Deadline</label>
                  <input
                    type="date"
                    value={formRegDeadline}
                    onChange={(e) => setFormRegDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Submission Deadline</label>
                  <input
                    type="date"
                    value={formSubDeadline}
                    onChange={(e) => setFormSubDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Event Dates &amp; Venue</label>
                <input
                  type="text"
                  placeholder="e.g. Oct 14 - Oct 16, 2026 · Microsoft Office, Hyderabad"
                  value={formEventDates}
                  onChange={(e) => setFormEventDates(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Registration URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formRegLink}
                    onChange={(e) => setFormRegLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Submission URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formSubLink}
                    onChange={(e) => setFormSubLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Team Allocations / Squad Formation Section */}
              <div className="space-y-3 pt-1 border-t border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
                      <Users size={14} className="text-blue-400" />
                      <span>Team Allocations &amp; Squad Formation</span>
                    </label>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Form teams and assign members for this competition</p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setFormTeams([
                        { teamLabel: "Team A", members: ["Varshini", "Koushik", "Shivaram"] },
                        { teamLabel: "Team B", members: ["Vyshnavi", "Tanishque", "Nivedan"] }
                      ])}
                      className="px-2 py-1 rounded-lg bg-zinc-900 border border-white/10 hover:border-blue-500/40 text-[10px] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      Split Preset
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormTeams([
                        { teamLabel: "Unified Team", members: [...MEMBERS] }
                      ])}
                      className="px-2 py-1 rounded-lg bg-zinc-900 border border-white/10 hover:border-blue-500/40 text-[10px] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      Unified Preset
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormTeams(prev => [
                        ...prev,
                        { teamLabel: `Team ${String.fromCharCode(65 + prev.length)}`, members: [] }
                      ])}
                      className="px-2 py-1 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus size={11} />
                      <span>Add Squad</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {formTeams.map((team, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={team.teamLabel}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormTeams(prev => prev.map((t, i) => i === idx ? { ...t, teamLabel: val } : t));
                            }}
                            placeholder={`Squad ${idx + 1} Name`}
                            className="bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-semibold text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 w-36 sm:w-44"
                          />
                          <span className="text-[10px] text-zinc-400">
                            {team.members.length} members
                          </span>
                        </div>
                        {formTeams.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFormTeams(prev => prev.filter((_, i) => i !== idx))}
                            className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Remove Squad"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>

                      {/* Member Assignment Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {MEMBERS.map(m => {
                          const isAssigned = team.members.includes(m);
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => {
                                setFormTeams(prev => prev.map((t, i) => {
                                  if (i !== idx) return t;
                                  const nextMembers = isAssigned
                                    ? t.members.filter(mem => mem !== m)
                                    : [...t.members, m];
                                  return { ...t, members: nextMembers };
                                }));
                              }}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all cursor-pointer ${
                                isAssigned
                                  ? "bg-blue-600/25 border-blue-500/50 text-blue-300 font-semibold shadow-sm"
                                  : "bg-zinc-900/80 border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/15"
                              }`}
                            >
                              {m} {isAssigned ? "✓" : "+"}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Notes &amp; Prize Pool</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Prize pool ₹1.5 Lakhs. Requires hardware prototype or agentic workflow."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 resize-none transition-colors"
                />
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer transition-all"
                >
                  <Plus size={14} />
                  <span>Create Hackathon</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT HACKATHON MANUALLY ================= */}
      {editingHackathon && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-0 overflow-y-auto"
          onClick={() => setEditingHackathon(null)}
        >
          <div
            className="bg-[#18181b] border border-white/10 rounded-2xl max-w-xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl my-auto max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  <Pencil className="text-blue-400" size={18} />
                  <span>Edit Competition Details</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Update dates, links, platform, or notes manually
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingHackathon(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveHackathonEdit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Hackathon Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google Cloud GenAI Hackathon 2026"
                  value={editFormName}
                  onChange={(e) => setEditFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Platform</label>
                  <input
                    type="text"
                    placeholder="e.g. Devpost, Unstop, Centle, Reskilll"
                    value={editFormPlatform}
                    onChange={(e) => setEditFormPlatform(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Format / Mode</label>
                  <input
                    type="text"
                    placeholder="e.g. Online Build, 24-Hr Onsite"
                    value={editFormFormat}
                    onChange={(e) => setEditFormFormat(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Registration Deadline</label>
                  <input
                    type="date"
                    value={editFormRegDeadline}
                    onChange={(e) => setEditFormRegDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Submission Deadline</label>
                  <input
                    type="date"
                    value={editFormSubDeadline}
                    onChange={(e) => setEditFormSubDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Event Dates &amp; Venue</label>
                <input
                  type="text"
                  placeholder="e.g. Oct 14 - Oct 16, 2026 · Microsoft Office, Hyderabad"
                  value={editFormEventDates}
                  onChange={(e) => setEditFormEventDates(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Registration URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editFormRegLink}
                    onChange={(e) => setEditFormRegLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Submission URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editFormSubLink}
                    onChange={(e) => setEditFormSubLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Notes &amp; Details</label>
                <textarea
                  rows={2}
                  placeholder="Notes, prize pool, requirements..."
                  value={editFormNotes}
                  onChange={(e) => setEditFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 resize-none transition-colors"
                />
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingHackathon(null)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer transition-all"
                >
                  <Check size={14} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RENAME TEAM SQUAD ================= */}
      {renamingTeam && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0"
          onClick={() => setRenamingTeam(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#18181c] border border-white/10 p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Pencil size={14} className="text-blue-400" />
                <span>Rename Team Squad</span>
              </h3>
              <button
                type="button"
                onClick={() => setRenamingTeam(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Team Name</label>
              <input
                type="text"
                value={newTeamNameInput}
                onChange={(e) => setNewTeamNameInput(e.target.value)}
                placeholder="e.g. ByteForce, Fintech Titans"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveTeamName();
                  }
                }}
              />
              <p className="text-[11px] text-zinc-500">
                Current teammates: {renamingTeam.currentMembers.join(", ")}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRenamingTeam(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTeamName}
                disabled={!newTeamNameInput.trim() || newTeamNameInput.trim() === renamingTeam.oldLabel}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Save Name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: FORM NEW SQUAD FOR HACKATHON ================= */}
      {addingSquadHackathonId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0"
          onClick={() => setAddingSquadHackathonId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#18181c] border border-white/10 p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={14} className="text-blue-400" />
                <span>Form New Squad</span>
              </h3>
              <button
                type="button"
                onClick={() => setAddingSquadHackathonId(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Squad Name</label>
              <input
                type="text"
                value={newSquadNameInput}
                onChange={(e) => setNewSquadNameInput(e.target.value)}
                placeholder="e.g. Team C, Innovators"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Assign Members</label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {MEMBERS.map(m => {
                  const isAssigned = newSquadMembersInput.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setNewSquadMembersInput(prev =>
                          isAssigned ? prev.filter(x => x !== m) : [...prev, m]
                        );
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        isAssigned
                          ? "bg-blue-600/25 border-blue-500/50 text-blue-300 font-semibold"
                          : "bg-zinc-900 border-white/10 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {m} {isAssigned ? "✓" : "+"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddingSquadHackathonId(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSquadToHackathon}
                disabled={!newSquadNameInput.trim()}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Form Squad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT SQUAD MEMBERS ================= */}
      {editingSquadMembers && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0"
          onClick={() => setEditingSquadMembers(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#18181c] border border-white/10 p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={14} className="text-blue-400" />
                <span>Edit Squad Roster ({editingSquadMembers.teamLabel})</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingSquadMembers(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300">Toggle Assigned Teammates</label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {MEMBERS.map(m => {
                  const isAssigned = editingSquadMembers.currentMembers.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setEditingSquadMembers(prev => {
                          if (!prev) return null;
                          const nextMembers = isAssigned
                            ? prev.currentMembers.filter(x => x !== m)
                            : [...prev.currentMembers, m];
                          return { ...prev, currentMembers: nextMembers };
                        });
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        isAssigned
                          ? "bg-blue-600/25 border-blue-500/50 text-blue-300 font-semibold"
                          : "bg-zinc-900 border-white/10 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {m} {isAssigned ? "✓" : "+"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingSquadMembers(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSquadMembers}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Save Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SWAP / MOVE MEMBER BETWEEN TEAMS ================= */}
      {swapModal && (() => {
        const hackathon = hackathons.find(h => h.id === swapModal.hackathonId);
        if (!hackathon || hackathon.teams.length < 2) return null;
        const allMembers = hackathon.teams.flatMap(t => t.members.map(m => ({ name: m, team: t.teamLabel })));

        return (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0"
            onClick={() => setSwapModal(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-[#18181c] border border-white/10 p-5 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ArrowLeftRight size={14} className="text-amber-400" />
                  <span>Move Member — {swapModal.hackathonName}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setSwapModal(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Current roster view */}
              <div className="grid grid-cols-2 gap-3">
                {hackathon.teams.map(t => (
                  <div key={t.teamLabel} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                    <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{t.teamLabel}</p>
                    <div className="space-y-1">
                      {t.members.map(m => (
                        <span key={m} className="text-xs text-zinc-400 block">{m}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1.5">
                  <label className="font-medium text-zinc-300">Member to Move</label>
                  <select
                    value={swapMember}
                    onChange={(e) => {
                      setSwapMember(e.target.value);
                      const found = allMembers.find(m => m.name === e.target.value);
                      if (found) setSwapFrom(found.team);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select a member...</option>
                    {allMembers.map(m => (
                      <option key={m.name} value={m.name}>{m.name} (currently in {m.team})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-zinc-300">Move To</label>
                  <select
                    value={swapTo}
                    onChange={(e) => setSwapTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select destination team...</option>
                    {hackathon.teams
                      .filter(t => t.teamLabel !== swapFrom)
                      .map(t => (
                        <option key={t.teamLabel} value={t.teamLabel}>{t.teamLabel}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSwapModal(null)}
                  className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSwapMember}
                  disabled={!swapMember || !swapFrom || !swapTo || swapFrom === swapTo}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-md shadow-amber-600/30 cursor-pointer"
                >
                  Move Member
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= TOAST: ACCESS RESTRICTION & STATUS NOTICE ================= */}
      {permissionNotice && (
        <div className="fixed bottom-16 md:bottom-6 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md bg-zinc-900/95 backdrop-blur-md border border-white/15 text-zinc-100 p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-3 duration-200">
          <ShieldAlert size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-semibold text-zinc-100">Notice</p>
            <p className="mt-0.5 text-zinc-300 leading-relaxed">{permissionNotice}</p>
          </div>
          <button
            type="button"
            onClick={() => setPermissionNotice(null)}
            className="text-zinc-500 hover:text-zinc-200 p-1 cursor-pointer transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Role-Based Developer Footer (Visible only for Varshini, Nivedan, Vyshnavi, Tester) */}
      <DeveloperFooter />

      {/* Hidden admin member configuration panel */}
      {showAdminPanel && isAdmin && (
        <AdminMemberPanel
          onClose={() => setShowAdminPanel(false)}
          hiddenTabs={hiddenTabs}
          allTabIds={allNavItems.map((n) => n.id)}
          allTabLabels={Object.fromEntries(allNavItems.map((n) => [n.id, n.label]))}
          onToggleTab={(tabId: string) => {
            setHiddenTabs((prev) => {
              const next = new Set(prev);
              if (next.has(tabId)) {
                next.delete(tabId);
              } else {
                // Never hide dashboard for anyone
                if (tabId !== 'dashboard') next.add(tabId);
              }
              // Persist to localStorage
              if (typeof window !== 'undefined') {
                localStorage.setItem('hacktrack-hidden-tabs', JSON.stringify([...next]));
              }
              return next;
            });
          }}
          hackathons={hackathons.map((h) => ({ id: h.id, name: h.name }))}
          onOpenEditHackathon={(id: string) => {
            const h = hackathons.find((x) => x.id === id);
            if (h) openEditHackathonModal(h);
          }}
        />
      )}

      {/* Mobile Bottom Navigation Bar (Mobile-first with safe-area support & touch-manipulation) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#18181b]/90 backdrop-blur-xl border-t border-white/10 px-1 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] md:hidden z-50">
        <div className="flex justify-between items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 min-w-0 flex flex-col items-center py-1 px-0.5 rounded-xl transition-all duration-200 cursor-pointer touch-manipulation select-none active:scale-95 ${
                  isActive ? 'text-blue-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-blue-500/15' : ''}`}>
                  <Icon size={19} className={isActive ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''} />
                </div>
                <span className="text-[10px] font-medium tracking-tight mt-0.5 truncate w-full text-center">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}



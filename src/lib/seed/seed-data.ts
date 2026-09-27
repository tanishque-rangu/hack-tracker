import {
  UserProfile,
  Hackathon,
  Team,
  TeamAssignmentRule,
  Project,
  Task,
  Registration,
  Submission,
  TeamFile,
  AppNotification,
  ActivityLog,
} from "@/lib/types";

export const INITIAL_MEMBERS: UserProfile[] = [
  {
    id: "user-varshini",
    email: "varshiniakula6@gmail.com",
    full_name: "Varshini Akula",
    role: "member",
    footer_visible: true,
    platform_accounts: {
      unstop: "varshini_u",
      devpost: "varshini-dev",
      centle: "varshini_c",
      reskilll: "varshini_r",
      allVerified: true,
    },
  },
  {
    id: "user-vyshnavi",
    email: "nagavellivyshnavi3@gmail.com",
    full_name: "Vyshnavi Nagavelli",
    role: "member",
    footer_visible: true,
    platform_accounts: {
      unstop: "vyshnavi_u",
      devpost: "vyshnavi-dev",
      centle: "vyshnavi_c",
      reskilll: "vyshnavi_r",
      allVerified: true,
    },
  },
  {
    id: "user-koushik",
    email: "koushikkatkam@gmail.com",
    full_name: "Koushik Katkam",
    role: "admin",
    footer_visible: false,
    platform_accounts: {
      unstop: "koushik_u",
      devpost: "koushik-tech",
      centle: "koushik_c",
      reskilll: "koushik_r",
      allVerified: true,
    },
  },
  {
    id: "user-tanishque",
    email: "tanishque1959@gmail.com",
    full_name: "Tanishque Rangu",
    role: "member",
    footer_visible: true,
    platform_accounts: {
      unstop: "tanishque_u",
      devpost: "tanishque-dev",
      centle: "tanishque_c",
      reskilll: "tanishque_r",
      allVerified: false,
    },
  },
  {
    id: "user-shivaram",
    email: "pidugushivaram@gmail.com",
    full_name: "Shivaram Pidugu",
    role: "member",
    footer_visible: false,
    platform_accounts: {
      unstop: "shivaram_u",
      devpost: "shivaram-code",
      centle: "shivaram_c",
      reskilll: "shivaram_r",
      allVerified: true,
    },
  },
  {
    id: "user-nivedan",
    email: "nivedankatkam@gmail.com",
    full_name: "Nivedan Katkam",
    role: "coordinator",
    footer_visible: true,
    platform_accounts: {
      unstop: "nivedan_u",
      devpost: "nivedan-build",
      centle: "nivedan_c",
      reskilll: "nivedan_r",
      allVerified: true,
    },
  },
  {
    id: "user-tester",
    email: "nothingonlyforsaving@gmail.com",
    full_name: "Tester Persona",
    role: "member",
    footer_visible: true,
    platform_accounts: {
      unstop: "tester_u",
      devpost: "tester-dev",
      centle: "tester_c",
      reskilll: "tester_r",
      allVerified: true,
    },
  },
];

export const INITIAL_RULES: TeamAssignmentRule[] = [
  {
    id: "rule-1",
    rule_type: "SEPARATE_MEMBERS",
    title: "Separate Varshini and Vyshnavi",
    description: "Varshini and Vyshnavi should not be placed in the same divided team.",
    member_ids: ["user-varshini", "user-vyshnavi"],
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
  },
  {
    id: "rule-2",
    rule_type: "SEPARATE_MEMBERS",
    title: "Separate Koushik and Tanishque",
    description: "Koushik and Tanishque should be separated across divided teams.",
    member_ids: ["user-koushik", "user-tanishque"],
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
  },
  {
    id: "rule-3",
    rule_type: "PREFER_UNIQUE_COMBINATIONS",
    title: "Unique Collaboration Preference",
    description: "Prefer unique member combinations across divided hackathons.",
    member_ids: [],
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
  },
  {
    id: "rule-4",
    rule_type: "BALANCE_TEAM_SIZES",
    title: "Balance Team Sizes",
    description: "Keep team sizes as equal as possible across divided divisions.",
    member_ids: [],
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
  },
];

export const INITIAL_HACKATHONS: Hackathon[] = [
  {
    id: "sankalp",
    name: "Sankalp by Satin Finserv",
    platform: "Unstop",
    format: "Idea Submission -> Shortlisting -> Finale",
    registration_deadline: "2026-09-27T23:59:59Z",
    submission_deadline: "2026-10-04T23:59:59Z",
    event_start_date: null,
    event_end_date: null,
    event_dates_label: "TBD (Shortlisting & Final Build)",
    registration_url: "https://unstop.com/competitions/crp-student-track-sankalp-by-satin-finserv",
    submission_url: "https://unstop.com/competitions/crp-student-track-sankalp-by-satin-finserv",
    notes: "Financial inclusion track. Idea phase submission required first.",
    created_at: "2026-09-01T00:00:00Z",
  },
  {
    id: "vnr-vjiet",
    name: "VNR VJIET CSI Hackathon 2026",
    platform: "VNR VJIET CSI",
    format: "Abstract Submission -> Shortlisting -> 24-Hr Hackathon",
    registration_deadline: "2026-09-30T23:59:59Z",
    submission_deadline: "2026-09-30T23:59:59Z",
    event_start_date: "2026-10-14T09:00:00Z",
    event_end_date: "2026-10-15T09:00:00Z",
    event_dates_label: "2026-10-09 (Results) | 2026-10-14 to 2026-10-15 (Event)",
    registration_url: "https://www.vnrvjietcsi.com",
    submission_url: "https://www.vnrvjietcsi.com",
    notes: "Abstract submission due by end of month. Onsite event at Hyderabad.",
    created_at: "2026-09-02T00:00:00Z",
  },
  {
    id: "iqoo",
    name: "iQOO 2026 Grand Finale",
    platform: "Reskilll",
    format: "City Battles -> Grand Finale (Bengaluru)",
    registration_deadline: "2026-10-05T23:59:59Z",
    submission_deadline: null,
    event_start_date: "2026-10-09T08:00:00Z",
    event_end_date: "2026-10-11T18:00:00Z",
    event_dates_label: "2026-10-09 to 2026-10-11",
    registration_url: "https://iqoo.reskilll.com/dashboard/iqoo-finale",
    submission_url: "https://iqoo.reskilll.com/dashboard/iqoo-finale",
    notes: "Grand Finale held in Bengaluru. High-performance gaming and AI device utilities.",
    created_at: "2026-09-03T00:00:00Z",
  },
  {
    id: "tricity",
    name: "Tricity AI Hackathon (KITS Warangal)",
    platform: "Centle",
    format: "36-Hour Onsite Build (2 & 4 Member Split)",
    registration_deadline: "2026-09-20T23:59:59Z",
    submission_deadline: "2026-10-11T12:00:00Z",
    event_start_date: "2026-10-10T08:00:00Z",
    event_end_date: "2026-10-11T12:00:00Z",
    event_dates_label: "2026-10-10 08:00 to 2026-10-11 Noon",
    registration_url: "https://centle.in/tricity/",
    submission_url: "https://centle.in/tricity/",
    notes: "Hardware/mixed format. Problem statements released 03-Oct.",
    created_at: "2026-09-04T00:00:00Z",
  },
  {
    id: "hack-hyd",
    name: "Hack with Hyderabad 3.0",
    platform: "Devnovate",
    format: "Direct Joining (8-Hour In-Person/Hybrid Build)",
    registration_deadline: "2026-09-28T23:59:59Z",
    submission_deadline: "2026-10-05T23:59:59Z",
    event_start_date: "2026-10-03T09:00:00Z",
    event_end_date: "2026-10-05T18:00:00Z",
    event_dates_label: "2026-10-03 or 2026-10-05 (TBC)",
    registration_url: "https://devnovate.co/event/hack-with-hyderabad-30",
    submission_url: "https://devnovate.co/event/hack-with-hyderabad-30",
    notes: "Unified squad entry. 8-hour sprint build.",
    created_at: "2026-09-05T00:00:00Z",
  },
  {
    id: "hackindia",
    name: "AI-First Startup Hackathon",
    platform: "HackIndia",
    format: "Online Build (Build a Startup using AI only)",
    registration_deadline: "2026-10-01T23:59:59Z",
    submission_deadline: "2026-11-01T23:59:59Z",
    event_start_date: "2026-09-02T00:00:00Z",
    event_end_date: "2026-11-01T23:59:59Z",
    event_dates_label: "2026-09-02 to 2026-11-01",
    registration_url: "https://hackindia.org/2026/ai-first-startup-hackathon",
    submission_url: "https://hackindia.org/2026/ai-first-startup-hackathon",
    notes: "Entire product must leverage AI models natively. Long online window.",
    created_at: "2026-09-06T00:00:00Z",
  },
  {
    id: "opencv",
    name: "OpenCV AI Competition 2026",
    platform: "Devpost",
    format: "Direct Online Build Submission",
    registration_deadline: "2026-10-26T23:59:59Z",
    submission_deadline: "2026-10-26T23:59:59Z",
    event_start_date: "2026-09-01T00:00:00Z",
    event_end_date: "2026-10-26T23:59:59Z",
    event_dates_label: "Ongoing until 2026-10-26",
    registration_url: "https://opencv26.devpost.com",
    submission_url: "https://opencv26.devpost.com",
    notes: "Computer vision and edge AI solutions using OpenCV SDK.",
    created_at: "2026-09-07T00:00:00Z",
  },
  {
    id: "nebius",
    name: "Nebius x NVIDIA Global AI Hackathon",
    platform: "Devpost",
    format: "Online Build (Must use Nebius Infra + NVIDIA Models)",
    registration_deadline: "2026-10-30T23:59:59Z",
    submission_deadline: "2026-10-30T23:59:59Z",
    event_start_date: "2026-08-26T00:00:00Z",
    event_end_date: "2026-10-30T23:59:59Z",
    event_dates_label: "2026-08-26 to 2026-10-30",
    registration_url: "https://nebiusglobalaihackathon.devpost.com",
    submission_url: "https://nebiusglobalaihackathon.devpost.com",
    notes: "Must use Nebius infrastructure + NVIDIA models.",
    created_at: "2026-09-08T00:00:00Z",
  },
];

export const INITIAL_TEAMS: Team[] = [
  // Sankalp
  {
    id: "team-sankalp-a",
    hackathon_id: "sankalp",
    name: "Team A",
    created_at: "2026-09-10T10:00:00Z",
  },
  {
    id: "team-sankalp-b",
    hackathon_id: "sankalp",
    name: "Team B",
    created_at: "2026-09-10T10:00:00Z",
  },
  // VNR VJIET
  {
    id: "team-vnr-a",
    hackathon_id: "vnr-vjiet",
    name: "Team A",
    created_at: "2026-09-11T10:00:00Z",
  },
  {
    id: "team-vnr-b",
    hackathon_id: "vnr-vjiet",
    name: "Team B",
    created_at: "2026-09-11T10:00:00Z",
  },
  // iQOO
  {
    id: "team-iqoo-a",
    hackathon_id: "iqoo",
    name: "Team A",
    created_at: "2026-09-12T10:00:00Z",
  },
  {
    id: "team-iqoo-b",
    hackathon_id: "iqoo",
    name: "Team B",
    created_at: "2026-09-12T10:00:00Z",
  },
  // Tricity (KITS Warangal: 2 & 4 Member Split)
  {
    id: "team-tricity-a",
    hackathon_id: "tricity",
    name: "Team A",
    created_at: "2026-09-13T10:00:00Z",
  },
  {
    id: "team-tricity-b",
    hackathon_id: "tricity",
    name: "Team B",
    created_at: "2026-09-13T10:00:00Z",
  },
  // Hack with Hyderabad (Unified Team)
  {
    id: "team-hyd-unified",
    hackathon_id: "hack-hyd",
    name: "Unified Team",
    created_at: "2026-09-14T10:00:00Z",
  },
  // AI-First Startup Hackathon (Unified Team)
  {
    id: "team-hackindia-unified",
    hackathon_id: "hackindia",
    name: "Unified Team",
    created_at: "2026-09-15T10:00:00Z",
  },
  // OpenCV AI Competition (Unified Team)
  {
    id: "team-opencv-unified",
    hackathon_id: "opencv",
    name: "Unified Team",
    created_at: "2026-09-16T10:00:00Z",
  },
  // Nebius x NVIDIA (Unified Team)
  {
    id: "team-nebius-unified",
    hackathon_id: "nebius",
    name: "Unified Team",
    created_at: "2026-09-17T10:00:00Z",
  },
];

export const INITIAL_TEAM_MEMBERS = [
  // Sankalp Team A: Varshini, Koushik, Shivaram
  { team_id: "team-sankalp-a", user_id: "user-varshini", role: "lead" },
  { team_id: "team-sankalp-a", user_id: "user-koushik", role: "member" },
  { team_id: "team-sankalp-a", user_id: "user-shivaram", role: "member" },
  // Sankalp Team B: Vyshnavi, Tanishque, Nivedan
  { team_id: "team-sankalp-b", user_id: "user-vyshnavi", role: "lead" },
  { team_id: "team-sankalp-b", user_id: "user-tanishque", role: "member" },
  { team_id: "team-sankalp-b", user_id: "user-nivedan", role: "member" },

  // VNR VJIET Team A: Varshini, Koushik, Nivedan
  { team_id: "team-vnr-a", user_id: "user-varshini", role: "lead" },
  { team_id: "team-vnr-a", user_id: "user-koushik", role: "member" },
  { team_id: "team-vnr-a", user_id: "user-nivedan", role: "member" },
  // VNR VJIET Team B: Vyshnavi, Tanishque, Shivaram
  { team_id: "team-vnr-b", user_id: "user-vyshnavi", role: "lead" },
  { team_id: "team-vnr-b", user_id: "user-tanishque", role: "member" },
  { team_id: "team-vnr-b", user_id: "user-shivaram", role: "member" },

  // iQOO Team A: Vyshnavi, Koushik, Nivedan
  { team_id: "team-iqoo-a", user_id: "user-vyshnavi", role: "lead" },
  { team_id: "team-iqoo-a", user_id: "user-koushik", role: "member" },
  { team_id: "team-iqoo-a", user_id: "user-nivedan", role: "member" },
  // iQOO Team B: Varshini, Tanishque, Shivaram
  { team_id: "team-iqoo-b", user_id: "user-varshini", role: "lead" },
  { team_id: "team-iqoo-b", user_id: "user-tanishque", role: "member" },
  { team_id: "team-iqoo-b", user_id: "user-shivaram", role: "member" },

  // Tricity Team A: Koushik, Vyshnavi
  { team_id: "team-tricity-a", user_id: "user-koushik", role: "lead" },
  { team_id: "team-tricity-a", user_id: "user-vyshnavi", role: "member" },
  // Tricity Team B: Varshini, Tanishque, Shivaram, Nivedan
  { team_id: "team-tricity-b", user_id: "user-varshini", role: "lead" },
  { team_id: "team-tricity-b", user_id: "user-tanishque", role: "member" },
  { team_id: "team-tricity-b", user_id: "user-shivaram", role: "member" },
  { team_id: "team-tricity-b", user_id: "user-nivedan", role: "member" },

  // Hack with Hyderabad: Unified Team
  { team_id: "team-hyd-unified", user_id: "user-varshini", role: "member" },
  { team_id: "team-hyd-unified", user_id: "user-vyshnavi", role: "member" },
  { team_id: "team-hyd-unified", user_id: "user-koushik", role: "lead" },
  { team_id: "team-hyd-unified", user_id: "user-tanishque", role: "member" },
  { team_id: "team-hyd-unified", user_id: "user-shivaram", role: "member" },
  { team_id: "team-hyd-unified", user_id: "user-nivedan", role: "member" },

  // AI-First: Unified Team
  { team_id: "team-hackindia-unified", user_id: "user-varshini", role: "member" },
  { team_id: "team-hackindia-unified", user_id: "user-vyshnavi", role: "member" },
  { team_id: "team-hackindia-unified", user_id: "user-koushik", role: "lead" },
  { team_id: "team-hackindia-unified", user_id: "user-tanishque", role: "member" },
  { team_id: "team-hackindia-unified", user_id: "user-shivaram", role: "member" },
  { team_id: "team-hackindia-unified", user_id: "user-nivedan", role: "member" },

  // OpenCV: Unified Team
  { team_id: "team-opencv-unified", user_id: "user-varshini", role: "member" },
  { team_id: "team-opencv-unified", user_id: "user-vyshnavi", role: "member" },
  { team_id: "team-opencv-unified", user_id: "user-koushik", role: "lead" },
  { team_id: "team-opencv-unified", user_id: "user-tanishque", role: "member" },
  { team_id: "team-opencv-unified", user_id: "user-shivaram", role: "member" },
  { team_id: "team-opencv-unified", user_id: "user-nivedan", role: "member" },

  // Nebius: Unified Team
  { team_id: "team-nebius-unified", user_id: "user-varshini", role: "member" },
  { team_id: "team-nebius-unified", user_id: "user-vyshnavi", role: "member" },
  { team_id: "team-nebius-unified", user_id: "user-koushik", role: "lead" },
  { team_id: "team-nebius-unified", user_id: "user-tanishque", role: "member" },
  { team_id: "team-nebius-unified", user_id: "user-shivaram", role: "member" },
  { team_id: "team-nebius-unified", user_id: "user-nivedan", role: "member" },
];

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_CHECKLIST_TEMPLATE = [
  { item_key: "registration", title: "Team Registration on Platform", is_completed: false },
  { item_key: "abstract", title: "Project Abstract / Proposal", is_completed: false },
  { item_key: "problem_statement", title: "Problem Statement & Target Audience", is_completed: false },
  { item_key: "github_repo", title: "Private GitHub Repository Created", is_completed: false },
  { item_key: "deployment", title: "Live Working Prototype Deployment", is_completed: false },
  { item_key: "demo_video", title: "Demo Video Recording (2-3 min)", is_completed: false },
  { item_key: "screenshots", title: "High-Resolution Product Screenshots", is_completed: false },
  { item_key: "presentation", title: "Pitch Deck / Slide Presentation", is_completed: false },
  { item_key: "documentation", title: "README & Architecture Documentation", is_completed: false },
  { item_key: "final_submission", title: "Final Platform Form Submitted", is_completed: false },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

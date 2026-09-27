# Hackathon Tracker · Command Center for Student Hackathon Squads

Hackathon Tracker is a production-quality mission control system built for collegiate builder squads and student developers who participate in multiple hackathons with dynamically changing team combinations.

It answers the 10 core questions immediately:
1. **What hackathons are we participating in?** Tracked across Unstop, Devpost, Centle, Reskilll, Devnovate, and HackIndia.
2. **What deadlines are approaching?** Dynamic countdown urgency states (`UPCOMING`, `DUE_SOON`, `CRITICAL`, `TODAY`, `OVERDUE`, `COMPLETED`, `TBD`).
3. **Who is working with whom?** Relational team rosters and pair collaboration history matrix.
4. **What team am I currently on?** Strict team assignments with team-level workspace privacy (Row Level Security).
5. **What needs to be registered?** Registration pipelines and platform handle verification (Unstop, Devpost, Centle, Reskilll).
6. **What are we building?** Project specifications, problem statements, and MVP scopes.
7. **What is the current build status?** Real-time build state from `PLANNING` to `READY_FOR_SUBMISSION`.
8. **Where is the GitHub repository?** Private repository telemetry and deployment links.
9. **What still needs to be submitted?** Truthful deliverable checklists and mandatory demo video requirements.
10. **What should the team do next?** Priority-queued Kanban boards and actionable alerts.

---

## 1. Project Structure

```
squadsync-app/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx         # Persona switcher & auth
│   │   │   └── signup/page.tsx        # New user creation
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx             # Responsive App Shell (Sidebar + TopNav + Mobile Drawer)
│   │   │   ├── dashboard/page.tsx     # Mission Control Command Center
│   │   │   ├── hackathons/
│   │   │   │   ├── page.tsx           # Search, filter, and sort all hackathons (Grid & Table)
│   │   │   │   └── [id]/page.tsx      # 10-tab hackathon workspace
│   │   │   ├── teams/
│   │   │   │   ├── page.tsx           # Squad rosters & team overview
│   │   │   │   └── [id]/page.tsx      # Private team workspace (RLS-protected)
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx           # Project specs & build status
│   │   │   │   └── [id]/page.tsx      # Project MVP workspace
│   │   │   ├── tasks/page.tsx         # Compact Kanban board (TODO, IN_PROGRESS, BLOCKED, DONE)
│   │   │   ├── calendar/page.tsx      # Month grid and milestone countdowns
│   │   │   ├── submissions/page.tsx   # Verified deliverables checklist & demo video flag
│   │   │   ├── files/page.tsx         # Team-isolated Supabase storage vault
│   │   │   ├── activity/page.tsx      # Scoped audit trail (Team A cannot see Team B)
│   │   │   ├── settings/page.tsx      # Platform account handles (Unstop, Devpost, Centle, Reskilll)
│   │   │   └── admin/page.tsx         # Configurable rules, pair history matrix, team generator
│   │   ├── globals.css                # Obsidian & cyan dark technical SaaS palette
│   │   ├── layout.tsx                 # Root layout with metadata
│   │   └── page.tsx                   # Polished marketing & overview landing page
│   ├── components/
│   │   ├── ui/                        # Button, Input, Modal, Card, Badge primitives
│   │   ├── layout/                    # Sidebar, TopNav, QuickAddModal
│   │   ├── dashboard/                 # HeroMetrics, ActionRequired, UpcomingDeadlines, MyTeams, RecentActivity
│   │   └── shared/                    # BuildStatusBadge, UrgencyBadge, EmptyState, MissingValueBadge
│   └── lib/
│       ├── types/index.ts             # Complete TypeScript interfaces
│       ├── supabase/
│       │   ├── schema.sql             # PostgreSQL DDL with Row Level Security (RLS)
│       │   ├── client.ts              # Browser Supabase client
│       │   └── server.ts              # Server Supabase client
│       ├── store/use-app-store.ts     # Reactive state store with localStorage persistence & full seed data
│       ├── seed/seed-data.ts          # Exact 8 hackathons, 6 members, 12 teams, and rules
│       └── utils/
│           ├── deadlines.ts           # Dynamic urgency calculation without hard-coded IDs
│           ├── permissions.ts         # Authorization & RLS policy enforcement
│           ├── progress.ts            # Non-fake checklist percentage calculator
│           └── team-rules.ts          # Algorithmic team combinations and co-work tracking
├── tests/
│   └── business-logic.test.ts         # Unit test suite (13 passing tests)
└── scripts/
    └── verify-routes.mjs              # Automated HTTP verification script for all 17 routes
```

---

## 2. Database Schema Summary

The normalized PostgreSQL schema is defined in [`src/lib/supabase/schema.sql`](file:///c:/Users/Thrish/Downloads/website%20tracker/squadsync-app/src/lib/supabase/schema.sql):
- **`profiles`**: User accounts with platform credentials (Unstop, Devpost, Centle, Reskilll handles) and role (`admin`, `coordinator`, `member`).
- **`hackathons`**: Competitions with external platforms, formats, deadlines, and dates.
- **`teams`**: Relational entity belonging to a hackathon (supports arbitrary team sizes, split teams, and unified teams).
- **`team_members`**: Relational join table mapping users to teams with roles (`lead`, `member`).
- **`team_assignment_rules`**: Configurable preferences and constraints (`SEPARATE_MEMBERS`, `PREFER_UNIQUE_COMBINATIONS`, `BALANCE_TEAM_SIZES`, `CUSTOM`).
- **`team_change_requests`**: Workflow table where members request team reassignments with approval/rejection audit.
- **`projects`**: MVP specifications, problem statements, tech stacks, repository URLs, and build statuses.
- **`tasks`**: Task entity with priority, status, assignee, creator, team, and due dates.
- **`registrations` & `registration_checklist_items`**: Checklists tracking platform account creation, portal team creation, and student ID verification.
- **`submissions` & `submission_checklist_items`**: Deliverables tracking abstract, repository, demo video, presentation, and final platform submission.
- **`files`**: Supabase storage metadata records with team-level authorization.
- **`notifications` & `activity_logs`**: In-app notifications and scoped activity logs.

---

## 3. RLS & Security Summary

Row Level Security is enabled on all private tables in `schema.sql`:
- **Team Isolation**: Team A cannot select, insert, update, or delete Team B's private tasks, files, notes, or submissions (`is_member_of_team(team_id)`).
- **User Activity Isolation**: Activity logs with `team_id` are only visible to members of that specific team.
- **URL Tampering Protection**: Accessing `/teams/[id]` directly without team membership returns HTTP 403 Forbidden with strict access denial.

---

## 4. Website Developer

- **Lead Developer**: **Tanishque Rangu**
- **GitHub**: [https://github.com/tanishque-rangu](https://github.com/tanishque-rangu)
- **Instagram**: [https://instagram.com/tanishque_rangu](https://instagram.com/tanishque_rangu) (`@tanishque_rangu`)

---

## 5. Team & Competitions Summary

- **6 Initial Members**:
  - `Varshini` (Member)
  - `Vyshnavi` (Member)
  - `Koushik` (Member)
  - `Tanishque` (Developer)
  - `Shivaram` (Member)
  - `Nivedan` (Member)
- **8 Competitions**:
  1. `Sankalp by Satin Finserv` (Unstop) - Divided into Team A & Team B.
  2. `VNR VJIET CSI Hackathon 2026` (VNR VJIET CSI) - Divided into Team A & Team B.
  3. `iQOO 2026 Grand Finale` (Reskilll) - Divided into Team A & Team B.
  4. `Tricity AI Hackathon (KITS Warangal)` (Centle) - 2 & 4 Member Split.
  5. `Hack with Hyderabad 3.0` (Devnovate) - Unified Team (all 6).
  6. `AI-First Startup Hackathon` (HackIndia) - Unified Team (all 6).
  7. `OpenCV AI Competition 2026` (Devpost) - Unified Team (all 6).
  8. `Nebius x NVIDIA Global AI Hackathon` (Devpost) - Unified Team (all 6).

---

## 6. Local Setup & Commands

### Prerequisites
- Node.js 20+ (Node 24 recommended)
- npm or pnpm

### Run Locally
```bash
# 1. Install dependencies
npm install

# 2. Run unit test suite
npm test

# 3. Start local development server
npm run dev

# 4. Verify all 17 application routes
node scripts/verify-routes.mjs

# 5. Build production bundle
npm run build
```

### Environment Variables & Vercel Deployment
To deploy Hackathon Tracker to **Vercel**:

1. Push your repository to **GitHub**:
```bash
git add .
git commit -m "feat: Hackathon Tracker - Email OTP auth & role-based footer"
git push origin main
```

2. Import the project in the [Vercel Dashboard](https://vercel.com/new).
3. Set the Framework Preset to **Next.js**.
4. Configure the following **Environment Variables** in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (e.g. `https://xyzproject.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous public key (`eyJhbGciOi...`)
   - `SUPABASE_SERVICE_ROLE_KEY`: *(Optional)* Secret service role key for administrative database actions.
5. Click **Deploy**.

*Note: Hackathon Tracker includes a robust offline/fallback authentication and state engine. If deployed without Supabase keys, it automatically functions with the built-in state engine, allowing team members to test and verify without setup blockers.*


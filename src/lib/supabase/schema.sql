-- SquadSync Production PostgreSQL Schema with Row Level Security (RLS)
-- Enables strict multi-team isolation and authorization

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'coordinator', 'member')),
  platform_accounts JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Hackathons Table
CREATE TABLE IF NOT EXISTS public.hackathons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  format TEXT NOT NULL,
  registration_deadline TIMESTAMPTZ,
  submission_deadline TIMESTAMPTZ,
  event_start_date TIMESTAMPTZ,
  event_end_date TIMESTAMPTZ,
  event_dates_label TEXT,
  registration_url TEXT,
  submission_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id TEXT NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Team Members Table (Relational entity - arbitrary users, team sizes, and hackathons)
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('lead', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (team_id, user_id)
);

-- 5. Team Assignment Rules Table (Configurable rules)
CREATE TABLE IF NOT EXISTS public.team_assignment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type TEXT NOT NULL CHECK (rule_type IN ('SEPARATE_MEMBERS', 'PREFER_UNIQUE_COMBINATIONS', 'BALANCE_TEAM_SIZES', 'CUSTOM')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  member_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Team Change Requests Table (Workflow, NOT a database constraint)
CREATE TABLE IF NOT EXISTS public.team_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id TEXT NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  target_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL UNIQUE REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  problem_statement TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  build_status TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (build_status IN ('NOT_STARTED', 'PLANNING', 'BUILDING', 'READY_FOR_SUBMISSION', 'SUBMITTED')),
  repository_url TEXT,
  demo_url TEXT,
  deployment_url TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE')),
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 9. Registrations & Checklist Items
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL UNIQUE REFERENCES public.teams(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'PENDING', 'PARTIALLY_REGISTERED', 'FULLY_REGISTERED')),
  registration_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.registration_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  order_index INT DEFAULT 0
);

-- 10. Submissions & Checklist Items
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL UNIQUE REFERENCES public.teams(id) ON DELETE CASCADE,
  demo_video_required BOOLEAN DEFAULT FALSE,
  submission_url TEXT,
  abstract TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.submission_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  order_index INT DEFAULT 0
);

-- 11. Files Table (Supabase Storage Metadata)
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  category TEXT NOT NULL DEFAULT 'DOC' CHECK (category IN ('PPT', 'PDF', 'SCREENSHOT', 'VIDEO', 'DOC', 'DIAGRAM')),
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'SYSTEM' CHECK (type IN ('DEADLINE', 'TASK', 'TEAM_CHANGE', 'SUBMISSION', 'REGISTRATION', 'SYSTEM')),
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  hackathon_id TEXT REFERENCES public.hackathons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_teams_hackathon_id ON public.teams(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON public.tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_files_team_id ON public.files(team_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_team_id ON public.activity_logs(team_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_hackathon_id ON public.activity_logs(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Helper functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_member_of_team(p_team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_assignment_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Authenticated users can read any profile; users can edit own profile; admins can edit all
CREATE POLICY "Profiles read by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profiles update by owner or admin" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin());

-- 2. Hackathons: Public read for authenticated; write only by admin
CREATE POLICY "Hackathons read by authenticated" ON public.hackathons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Hackathons manage by admin" ON public.hackathons FOR ALL TO authenticated USING (public.is_admin());

-- 3. Teams: Public structure readable, but private data protected
CREATE POLICY "Teams read by authenticated" ON public.teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teams manage by admin" ON public.teams FOR ALL TO authenticated USING (public.is_admin());

-- 4. Team Members: Readable by authenticated; managed by admins
CREATE POLICY "Team members read by authenticated" ON public.team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team members manage by admin" ON public.team_members FOR ALL TO authenticated USING (public.is_admin());

-- 5. Projects: Private to team members and admins!
CREATE POLICY "Projects select by team member or admin" ON public.projects FOR SELECT TO authenticated
  USING (public.is_admin() OR public.is_member_of_team(team_id));
CREATE POLICY "Projects update by team member or admin" ON public.projects FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.is_member_of_team(team_id));
CREATE POLICY "Projects insert by team member or admin" ON public.projects FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.is_member_of_team(team_id));

-- 6. Tasks: Strictly private to team members and admins!
CREATE POLICY "Tasks select by team member or admin" ON public.tasks FOR SELECT TO authenticated
  USING (public.is_admin() OR public.is_member_of_team(team_id));
CREATE POLICY "Tasks insert by team member or admin" ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.is_member_of_team(team_id));
CREATE POLICY "Tasks update by team member or admin" ON public.tasks FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.is_member_of_team(team_id));
CREATE POLICY "Tasks delete by team member or admin" ON public.tasks FOR DELETE TO authenticated
  USING (public.is_admin() OR public.is_member_of_team(team_id));

-- 7. Files: Strictly private to team members and admins!
CREATE POLICY "Files select by team member or admin" ON public.files FOR SELECT TO authenticated
  USING (public.is_admin() OR public.is_member_of_team(team_id));
CREATE POLICY "Files insert by team member or admin" ON public.files FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.is_member_of_team(team_id));
CREATE POLICY "Files delete by team member or admin" ON public.files FOR DELETE TO authenticated
  USING (public.is_admin() OR public.is_member_of_team(team_id));

-- 8. Submissions & Checklists: Strictly private to team members and admins!
CREATE POLICY "Submissions select by team member or admin" ON public.submissions FOR SELECT TO authenticated
  USING (public.is_admin() OR public.is_member_of_team(team_id));
CREATE POLICY "Submissions update by team member or admin" ON public.submissions FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.is_member_of_team(team_id));

-- 9. Notifications: Strictly private to the user
CREATE POLICY "Notifications select by recipient" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Notifications update by recipient" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- 10. Activity Logs: Scoped to team or public hackathon
CREATE POLICY "Activity logs select policy" ON public.activity_logs FOR SELECT TO authenticated
  USING (team_id IS NULL OR public.is_admin() OR public.is_member_of_team(team_id));

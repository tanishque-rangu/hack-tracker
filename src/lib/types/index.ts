export type UserRole = 'admin' | 'coordinator' | 'member';

export interface PlatformAccounts {
  unstop?: string;
  devpost?: string;
  centle?: string;
  reskilll?: string;
  devnovate?: string;
  hackindia?: string;
  allVerified?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  platform_accounts?: PlatformAccounts;
  footer_visible?: boolean;
  description?: string;
  created_at?: string;
}

export interface Hackathon {
  id: string; // e.g. 'sankalp', 'vnr-vjiet', 'iqoo', 'tricity', 'hack-hyd', 'hackindia', 'opencv', 'nebius'
  name: string;
  platform: string;
  format: string;
  registration_deadline: string | null; // ISO string
  submission_deadline: string | null; // ISO string
  event_start_date: string | null;
  event_end_date: string | null;
  event_dates_label?: string | null;
  registration_url: string | null;
  submission_url: string | null;
  notes: string | null;
  created_at?: string;
}

export interface Team {
  id: string;
  hackathon_id: string;
  name: string;
  created_at?: string;
  hackathon?: Hackathon;
  members?: TeamMember[];
  project?: Project | null;
  registration?: Registration | null;
  submission?: Submission | null;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'lead' | 'member';
  joined_at?: string;
  profile?: UserProfile;
}

export type BuildStatus =
  | 'NOT_STARTED'
  | 'PLANNING'
  | 'BUILDING'
  | 'READY_FOR_SUBMISSION'
  | 'SUBMITTED';

export interface Project {
  id: string;
  team_id: string;
  name: string;
  description: string | null;
  problem_statement: string | null;
  tech_stack: string[];
  build_status: BuildStatus;
  repository_url: string | null;
  demo_url: string | null;
  deployment_url: string | null;
  owner_id: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  owner?: UserProfile | null;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  team_id: string;
  project_id?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: string | null;
  creator_id?: string | null;
  due_date?: string | null;
  created_at: string;
  completed_at?: string | null;
  assignee?: UserProfile | null;
  creator?: UserProfile | null;
  team?: Team;
}

export type RegistrationStatus =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'PARTIALLY_REGISTERED'
  | 'FULLY_REGISTERED';

export interface RegistrationChecklistItem {
  id: string;
  registration_id: string;
  title: string;
  is_completed: boolean;
  completed_by?: string | null;
  completed_at?: string | null;
  order_index: number;
}

export interface Registration {
  id: string;
  team_id: string;
  status: RegistrationStatus;
  registration_url: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  checklist_items?: RegistrationChecklistItem[];
}

export interface SubmissionChecklistItem {
  id: string;
  submission_id: string;
  item_key: string;
  title: string;
  is_completed: boolean;
  notes?: string | null;
  completed_by?: string | null;
  completed_at?: string | null;
  order_index: number;
}

export interface Submission {
  id: string;
  team_id: string;
  demo_video_required: boolean;
  submission_url: string | null;
  abstract: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  checklist_items?: SubmissionChecklistItem[];
}

export type FileCategory = 'PPT' | 'PDF' | 'SCREENSHOT' | 'VIDEO' | 'DOC' | 'DIAGRAM';

export interface TeamFile {
  id: string;
  team_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  public_url?: string | null;
  category: FileCategory;
  uploaded_by?: string | null;
  created_at: string;
  uploader?: UserProfile | null;
}

export type NotificationType =
  | 'DEADLINE'
  | 'TASK'
  | 'TEAM_CHANGE'
  | 'SUBMISSION'
  | 'REGISTRATION'
  | 'SYSTEM';

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  team_id?: string | null;
  hackathon_id?: string | null;
  user_id?: string | null;
  action: string;
  details?: string | null;
  created_at: string;
  user?: UserProfile | null;
  hackathon?: Hackathon | null;
  team?: Team | null;
}

export type AssignmentRuleType =
  | 'SEPARATE_MEMBERS'
  | 'PREFER_UNIQUE_COMBINATIONS'
  | 'BALANCE_TEAM_SIZES'
  | 'CUSTOM';

export interface TeamAssignmentRule {
  id: string;
  rule_type: AssignmentRuleType;
  title: string;
  description: string;
  member_ids: string[];
  is_active: boolean;
  created_at: string;
}

export type ChangeRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface TeamChangeRequest {
  id: string;
  hackathon_id: string;
  requester_id: string;
  current_team_id: string;
  target_team_id?: string | null;
  reason: string;
  status: ChangeRequestStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  requester?: UserProfile | null;
  current_team?: Team | null;
  target_team?: Team | null;
  hackathon?: Hackathon | null;
}

export type DeadlineUrgency =
  | 'UPCOMING'
  | 'DUE_SOON'
  | 'CRITICAL'
  | 'TODAY'
  | 'OVERDUE'
  | 'COMPLETED'
  | 'TBD';

export interface CalculatedDeadline {
  id: string;
  hackathon_id: string;
  hackathon_name: string;
  team_id?: string;
  team_name?: string;
  deadline_type: 'REGISTRATION' | 'SUBMISSION' | 'EVENT_START' | 'TASK' | 'CUSTOM';
  label: string;
  date: string | null; // ISO date string or null
  relative_time: string;
  urgency: DeadlineUrgency;
  action_url?: string | null;
  action_label?: string;
  is_completed?: boolean;
}

export interface PairCollaborationHistory {
  user_a_id: string;
  user_a_name: string;
  user_b_id: string;
  user_b_name: string;
  count: number;
  hackathon_names: string[];
  last_collaboration: string | null;
}

export interface ChatAttachment {
  name: string;
  url: string;
  type: 'github' | 'deck' | 'demo' | 'link' | 'file';
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  sender_email: string;
  sender_name: string;
  sender_username?: string;
  sender_avatar?: string;
  content: string;
  attachments?: ChatAttachment[];
  reactions?: Record<string, string[]>; // emoji -> array of user names
  created_at: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
  deleted_by?: string | null;
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  type: 'all-members' | 'team-squad' | 'direct-message' | 'private-group';
  hackathon_id?: string;
  team_label?: string;
  members: string[]; // member names or usernames
  dm_participants?: [string, string]; // [username1, username2] for DMs
  created_by?: string; // username of creator
  created_at?: string;
}

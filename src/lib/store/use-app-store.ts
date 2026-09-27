'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  UserProfile,
  Hackathon,
  Team,
  TeamAssignmentRule,
  TeamChangeRequest,
  Project,
  Task,
  Registration,
  Submission,
  TeamFile,
  AppNotification,
  ActivityLog,
  TaskStatus,
  TaskPriority,
  BuildStatus,
  RegistrationStatus,
} from '@/lib/types';
import {
  INITIAL_MEMBERS,
  INITIAL_RULES,
  INITIAL_HACKATHONS,
  INITIAL_TEAMS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_CHECKLIST_TEMPLATE,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_NOTIFICATIONS,
} from '@/lib/seed/seed-data';
import { canUserAccessTeam } from '@/lib/utils/permissions';

export interface AppState {
  currentUser: UserProfile | null;
  users: UserProfile[];
  hackathons: Hackathon[];
  teams: Team[];
  teamMembers: { id: string; team_id: string; user_id: string; role: 'lead' | 'member' }[];
  rules: TeamAssignmentRule[];
  changeRequests: TeamChangeRequest[];
  projects: Project[];
  tasks: Task[];
  registrations: Registration[];
  submissions: Submission[];
  files: TeamFile[];
  notifications: AppNotification[];
  activityLogs: ActivityLog[];
  isHydrated: boolean;

  // Actions
  setHydrated: () => void;
  switchUser: (userId: string | null) => void;
  logout: () => void;
  addUser: (user: Omit<UserProfile, 'id'>) => UserProfile;
  updateUser: (userId: string, updates: Partial<UserProfile>) => void;

  // Hackathons
  addHackathon: (hackathon: Hackathon) => void;
  updateHackathon: (id: string, updates: Partial<Hackathon>) => void;
  deleteHackathon: (id: string) => void;

  // Teams & Members
  createTeam: (hackathonId: string, teamName: string, memberIds: string[]) => Team;
  updateTeamMembers: (teamId: string, memberIds: string[]) => void;
  updateTeamName: (teamId: string, name: string) => void;
  requestTeamChange: (data: { hackathonId: string; requesterId: string; currentTeamId: string; targetTeamId?: string; reason: string }) => void;
  reviewTeamChangeRequest: (requestId: string, status: 'APPROVED' | 'REJECTED') => void;

  // Rules
  createRule: (rule: Omit<TeamAssignmentRule, 'id' | 'created_at'>) => void;
  toggleRule: (ruleId: string) => void;
  deleteRule: (ruleId: string) => void;

  // Projects
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;

  // Tasks
  createTask: (task: Omit<Task, 'id' | 'created_at'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Registrations & Submissions
  updateRegistrationStatus: (teamId: string, status: RegistrationStatus) => void;
  toggleRegistrationChecklistItem: (registrationId: string, itemId: string) => void;
  updateSubmission: (teamId: string, updates: Partial<Submission>) => void;
  toggleSubmissionChecklistItem: (submissionId: string, itemId: string) => void;
  setDemoVideoRequired: (teamId: string, required: boolean) => void;

  // Files
  addFile: (file: Omit<TeamFile, 'id' | 'created_at'>) => TeamFile;
  deleteFile: (fileId: string) => void;

  // Notifications & Activity
  markNotificationAsRead: (id: string) => void;
  addActivity: (activity: Omit<ActivityLog, 'id' | 'created_at'>) => void;

  // Seed Reset
  resetToSeedData: () => void;
}

// Initial registrations and submissions generation for all initial teams
function generateInitialRegistrations(teams: Team[]): Registration[] {
  return teams.map((team, idx) => ({
    id: `reg-${team.id}`,
    team_id: team.id,
    status: idx === 0 ? 'PARTIALLY_REGISTERED' : 'NOT_STARTED',
    registration_url: null,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    checklist_items: [
      { id: `reg-chk-1-${team.id}`, registration_id: `reg-${team.id}`, title: 'Platform Account Created for All Members', is_completed: idx === 0, order_index: 0 },
      { id: `reg-chk-2-${team.id}`, registration_id: `reg-${team.id}`, title: 'Team Created on Portal', is_completed: idx === 0, order_index: 1 },
      { id: `reg-chk-3-${team.id}`, registration_id: `reg-${team.id}`, title: 'All Members Added & Invitations Accepted', is_completed: false, order_index: 2 },
      { id: `reg-chk-4-${team.id}`, registration_id: `reg-${team.id}`, title: 'Student Identity Verification Completed', is_completed: false, order_index: 3 },
    ],
  }));
}

function generateInitialSubmissions(teams: Team[]): Submission[] {
  return teams.map((team) => {
    const isOnline = ['hackindia', 'opencv', 'nebius', 'iqoo'].includes(team.hackathon_id);
    return {
      id: `sub-${team.id}`,
      team_id: team.id,
      demo_video_required: isOnline,
      submission_url: null,
      abstract: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      checklist_items: INITIAL_CHECKLIST_TEMPLATE.map((item, index) => ({
        id: `sub-item-${team.id}-${index}`,
        submission_id: `sub-${team.id}`,
        item_key: item.item_key,
        title: item.title,
        is_completed: false,
        order_index: index,
      })),
    };
  });
}

const initialRegistrations = generateInitialRegistrations(INITIAL_TEAMS);
const initialSubmissions = generateInitialSubmissions(INITIAL_TEAMS);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null, // Strictly null by default until user signs in via OTP
      users: INITIAL_MEMBERS,
      hackathons: INITIAL_HACKATHONS,
      teams: INITIAL_TEAMS,
      teamMembers: INITIAL_TEAM_MEMBERS.map((tm, i) => ({
        id: `tm-${i + 1}`,
        team_id: tm.team_id,
        user_id: tm.user_id,
        role: tm.role as 'lead' | 'member',
      })),
      rules: INITIAL_RULES,
      changeRequests: [],
      projects: INITIAL_PROJECTS,
      tasks: INITIAL_TASKS,
      registrations: initialRegistrations,
      submissions: initialSubmissions,
      files: [],
      notifications: INITIAL_NOTIFICATIONS,
      activityLogs: INITIAL_ACTIVITY_LOGS,
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),

      switchUser: (userId: string | null) => {
        if (!userId) {
          set({ currentUser: null });
          return;
        }
        const found = get().users.find((u) => u.id === userId);
        if (found) {
          set({ currentUser: found });
        }
      },

      logout: () => {
        set({ currentUser: null });
        if (typeof document !== 'undefined') {
          document.cookie = 'squadsync_session=; path=/; max-age=0';
        }
      },

      addUser: (userData) => {
        const newUser: UserProfile = {
          ...userData,
          id: `user-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        set((state) => ({ users: [...state.users, newUser] }));
        return newUser;
      },

      updateUser: (userId, updates) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
          // Also update currentUser if it's the same person
          currentUser:
            state.currentUser?.id === userId
              ? { ...state.currentUser, ...updates }
              : state.currentUser,
        }));
      },

      addHackathon: (hackathon) => {
        set((state) => ({
          hackathons: [hackathon, ...state.hackathons],
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              hackathon_id: hackathon.id,
              user_id: state.currentUser?.id || 'system',
              action: 'Hackathon Created',
              details: `Added new hackathon "${hackathon.name}"`,
              created_at: new Date().toISOString(),
            },
            ...state.activityLogs,
          ],
        }));
      },

      updateHackathon: (id, updates) => {
        set((state) => ({
          hackathons: state.hackathons.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        }));
      },

      deleteHackathon: (id) => {
        set((state) => ({
          hackathons: state.hackathons.filter((h) => h.id !== id),
          teams: state.teams.filter((t) => t.hackathon_id !== id),
        }));
      },

      createTeam: (hackathonId, teamName, memberIds) => {
        const teamId = `team-${Date.now()}`;
        const newTeam: Team = {
          id: teamId,
          hackathon_id: hackathonId,
          name: teamName,
          created_at: new Date().toISOString(),
        };

        const newMemberships = memberIds.map((userId, idx) => ({
          id: `tm-${Date.now()}-${idx}`,
          team_id: teamId,
          user_id: userId,
          role: idx === 0 ? ('lead' as const) : ('member' as const),
        }));

        const newReg: Registration = {
          id: `reg-${teamId}`,
          team_id: teamId,
          status: 'NOT_STARTED',
          registration_url: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          checklist_items: [
            { id: `reg-chk-1-${teamId}`, registration_id: `reg-${teamId}`, title: 'Platform Account Created for All Members', is_completed: false, order_index: 0 },
            { id: `reg-chk-2-${teamId}`, registration_id: `reg-${teamId}`, title: 'Team Created on Portal', is_completed: false, order_index: 1 },
            { id: `reg-chk-3-${teamId}`, registration_id: `reg-${teamId}`, title: 'All Members Added & Invitations Accepted', is_completed: false, order_index: 2 },
            { id: `reg-chk-4-${teamId}`, registration_id: `reg-${teamId}`, title: 'Student Identity Verification Completed', is_completed: false, order_index: 3 },
          ],
        };

        const newSub: Submission = {
          id: `sub-${teamId}`,
          team_id: teamId,
          demo_video_required: false,
          submission_url: null,
          abstract: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          checklist_items: INITIAL_CHECKLIST_TEMPLATE.map((item, index) => ({
            id: `sub-item-${teamId}-${index}`,
            submission_id: `sub-${teamId}`,
            item_key: item.item_key,
            title: item.title,
            is_completed: false,
            order_index: index,
          })),
        };

        set((state) => ({
          teams: [...state.teams, newTeam],
          teamMembers: [...state.teamMembers, ...newMemberships],
          registrations: [...state.registrations, newReg],
          submissions: [...state.submissions, newSub],
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              team_id: teamId,
              hackathon_id: hackathonId,
              user_id: state.currentUser?.id || 'system',
              action: 'Team Formed',
              details: `Created team "${teamName}" with ${memberIds.length} members`,
              created_at: new Date().toISOString(),
            },
            ...state.activityLogs,
          ],
        }));

        return newTeam;
      },

      updateTeamMembers: (teamId, memberIds) => {
        set((state) => {
          const filtered = state.teamMembers.filter((tm) => tm.team_id !== teamId);
          const added = memberIds.map((userId, idx) => ({
            id: `tm-${Date.now()}-${idx}`,
            team_id: teamId,
            user_id: userId,
            role: idx === 0 ? ('lead' as const) : ('member' as const),
          }));
          return { teamMembers: [...filtered, ...added] };
        });
      },

      updateTeamName: (teamId, name) => {
        set((state) => ({
          teams: state.teams.map((t) => (t.id === teamId ? { ...t, name } : t)),
        }));
      },

      requestTeamChange: (data) => {
        const req: TeamChangeRequest = {
          id: `req-${Date.now()}`,
          hackathon_id: data.hackathonId,
          requester_id: data.requesterId,
          current_team_id: data.currentTeamId,
          target_team_id: data.targetTeamId || null,
          reason: data.reason,
          status: 'PENDING',
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          changeRequests: [req, ...state.changeRequests],
          notifications: [
            {
              id: `notif-${Date.now()}`,
              user_id: state.users.find((u) => u.role === 'admin')?.id || '',
              title: 'Team Change Request Submitted',
              message: state.currentUser ? `${state.currentUser.full_name} requested a team switch.` : 'Team switch requested.',
              type: 'TEAM_CHANGE',
              link: '/admin',
              is_read: false,
              created_at: new Date().toISOString(),
            },
            ...state.notifications,
          ],
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              team_id: data.currentTeamId,
              hackathon_id: data.hackathonId,
              user_id: data.requesterId,
              action: 'Team Change Requested',
              details: `Requested reassignment: ${data.reason}`,
              created_at: new Date().toISOString(),
            },
            ...state.activityLogs,
          ],
        }));
      },

      reviewTeamChangeRequest: (requestId, status) => {
        set((state) => {
          const req = state.changeRequests.find((r) => r.id === requestId);
          if (!req) return state;

          let updatedMembers = state.teamMembers;
          if (status === 'APPROVED' && req.target_team_id) {
            // Move user from current to target
            updatedMembers = state.teamMembers.filter(
              (tm) => !(tm.team_id === req.current_team_id && tm.user_id === req.requester_id)
            );
            updatedMembers.push({
              id: `tm-${Date.now()}`,
              team_id: req.target_team_id,
              user_id: req.requester_id,
              role: 'member',
            });
          }

          return {
            changeRequests: state.changeRequests.map((r) =>
              r.id === requestId
                ? {
                    ...r,
                    status,
                    reviewed_by: state.currentUser?.id || 'system',
                    reviewed_at: new Date().toISOString(),
                  }
                : r
            ),
            teamMembers: updatedMembers,
            notifications: [
              {
                id: `notif-${Date.now()}`,
                user_id: req.requester_id,
                title: `Team Change Request ${status}`,
                message: `Your request was reviewed and ${status.toLowerCase()} by an admin.`,
                type: 'TEAM_CHANGE',
                link: `/hackathons/${req.hackathon_id}`,
                is_read: false,
                created_at: new Date().toISOString(),
              },
              ...state.notifications,
            ],
          };
        });
      },

      createRule: (ruleData) => {
        const newRule: TeamAssignmentRule = {
          ...ruleData,
          id: `rule-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        set((state) => ({ rules: [...state.rules, newRule] }));
      },

      toggleRule: (ruleId) => {
        set((state) => ({
          rules: state.rules.map((r) => (r.id === ruleId ? { ...r, is_active: !r.is_active } : r)),
        }));
      },

      deleteRule: (ruleId) => {
        set((state) => ({
          rules: state.rules.filter((r) => r.id !== ruleId),
        }));
      },

      createProject: (projectData) => {
        const newProj: Project = {
          ...projectData,
          id: `proj-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((state) => ({
          projects: [...state.projects, newProj],
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              team_id: projectData.team_id,
              user_id: state.currentUser?.id || 'system',
              action: 'Project Workspace Initialized',
              details: `Created project "${projectData.name}"`,
              created_at: new Date().toISOString(),
            },
            ...state.activityLogs,
          ],
        }));
        return newProj;
      },

      updateProject: (id, updates) => {
        set((state) => {
          const project = state.projects.find((p) => p.id === id);
          if (!project) return state;

          return {
            projects: state.projects.map((p) =>
              p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
            ),
            activityLogs: [
              {
                id: `act-${Date.now()}`,
                team_id: project.team_id,
                user_id: state.currentUser?.id || 'system',
                action: 'Project Updated',
                details: `Updated project "${project.name}" build status to ${updates.build_status || project.build_status}`,
                created_at: new Date().toISOString(),
              },
              ...state.activityLogs,
            ],
          };
        });
      },

      createTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: `task-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        set((state) => ({
          tasks: [newTask, ...state.tasks],
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              team_id: taskData.team_id,
              user_id: state.currentUser?.id || 'system',
              action: 'Task Created',
              details: `Created task "${taskData.title}"`,
              created_at: new Date().toISOString(),
            },
            ...state.activityLogs,
          ],
        }));
        return newTask;
      },

      updateTask: (id, updates) => {
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task) return state;

          const isNowCompleted = updates.status === 'DONE' && task.status !== 'DONE';
          const completedAt = isNowCompleted ? new Date().toISOString() : updates.status ? null : task.completed_at;

          return {
            tasks: state.tasks.map((t) =>
              t.id === id ? { ...t, ...updates, completed_at: completedAt } : t
            ),
            activityLogs: updates.status
              ? [
                  {
                    id: `act-${Date.now()}`,
                    team_id: task.team_id,
                    user_id: state.currentUser?.id || 'system',
                    action: 'Task Updated',
                    details: `Moved task "${task.title}" to ${updates.status}`,
                    created_at: new Date().toISOString(),
                  },
                  ...state.activityLogs,
                ]
              : state.activityLogs,
          };
        });
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },

      updateRegistrationStatus: (teamId, status) => {
        set((state) => ({
          registrations: state.registrations.map((r) =>
            r.team_id === teamId ? { ...r, status, updated_at: new Date().toISOString() } : r
          ),
        }));
      },

      toggleRegistrationChecklistItem: (registrationId, itemId) => {
        set((state) => ({
          registrations: state.registrations.map((r) => {
            if (r.id !== registrationId) return r;
            const updatedItems = (r.checklist_items || []).map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    is_completed: !item.is_completed,
                    completed_by: !item.is_completed ? (state.currentUser?.id || 'system') : null,
                    completed_at: !item.is_completed ? new Date().toISOString() : null,
                  }
                : item
            );
            const allDone = updatedItems.every((it) => it.is_completed);
            const anyDone = updatedItems.some((it) => it.is_completed);
            const status: RegistrationStatus = allDone
              ? 'FULLY_REGISTERED'
              : anyDone
              ? 'PARTIALLY_REGISTERED'
              : 'NOT_STARTED';

            return {
              ...r,
              status,
              checklist_items: updatedItems,
              updated_at: new Date().toISOString(),
            };
          }),
        }));
      },

      updateSubmission: (teamId, updates) => {
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.team_id === teamId ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
          ),
        }));
      },

      toggleSubmissionChecklistItem: (submissionId, itemId) => {
        set((state) => ({
          submissions: state.submissions.map((s) => {
            if (s.id !== submissionId) return s;
            const updatedItems = (s.checklist_items || []).map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    is_completed: !item.is_completed,
                    completed_by: !item.is_completed ? (state.currentUser?.id || 'system') : null,
                    completed_at: !item.is_completed ? new Date().toISOString() : null,
                  }
                : item
            );

            return {
              ...s,
              checklist_items: updatedItems,
              updated_at: new Date().toISOString(),
            };
          }),
        }));
      },

      setDemoVideoRequired: (teamId, required) => {
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.team_id === teamId ? { ...s, demo_video_required: required } : s
          ),
        }));
      },

      addFile: (fileData) => {
        const newFile: TeamFile = {
          ...fileData,
          id: `file-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        set((state) => ({
          files: [newFile, ...state.files],
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              team_id: fileData.team_id,
              user_id: state.currentUser?.id || 'system',
              action: 'File Uploaded',
              details: `Uploaded asset "${fileData.file_name}"`,
              created_at: new Date().toISOString(),
            },
            ...state.activityLogs,
          ],
        }));
        return newFile;
      },

      deleteFile: (fileId) => {
        set((state) => ({
          files: state.files.filter((f) => f.id !== fileId),
        }));
      },

      markNotificationAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, is_read: true } : n
          ),
        }));
      },

      addActivity: (activityData) => {
        const newAct: ActivityLog = {
          ...activityData,
          id: `act-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        set((state) => ({
          activityLogs: [newAct, ...state.activityLogs],
        }));
      },

      resetToSeedData: () => {
        const freshRegistrations = generateInitialRegistrations(INITIAL_TEAMS);
        const freshSubmissions = generateInitialSubmissions(INITIAL_TEAMS);

        set({
          currentUser: null,
          users: INITIAL_MEMBERS,
          hackathons: INITIAL_HACKATHONS,
          teams: INITIAL_TEAMS,
          teamMembers: INITIAL_TEAM_MEMBERS.map((tm, i) => ({
            id: `tm-${i + 1}`,
            team_id: tm.team_id,
            user_id: tm.user_id,
            role: tm.role as 'lead' | 'member',
          })),
          rules: INITIAL_RULES,
          changeRequests: [],
          projects: INITIAL_PROJECTS,
          tasks: INITIAL_TASKS,
          registrations: freshRegistrations,
          submissions: freshSubmissions,
          files: [],
          notifications: INITIAL_NOTIFICATIONS,
          activityLogs: INITIAL_ACTIVITY_LOGS,
        });
      },
    }),
    {
      name: 'hacktrack_live_store_v5',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // CRITICAL: currentUser is strictly excluded from localStorage persistence.
        // Authentication must originate purely from verified Supabase Auth sessions.
        users: state.users,
        hackathons: state.hackathons,
        teams: state.teams,
        teamMembers: state.teamMembers,
        rules: state.rules,
        changeRequests: state.changeRequests,
        projects: state.projects,
        tasks: state.tasks,
        registrations: state.registrations,
        submissions: state.submissions,
        files: state.files,
        notifications: state.notifications,
        activityLogs: state.activityLogs,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

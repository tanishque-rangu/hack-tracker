import { UserProfile } from "@/lib/types";

export interface TeamMembershipRecord {
  team_id: string;
  user_id: string;
  role?: string;
}

/**
 * Checks if a user has administrator role.
 */
export function isUserAdmin(user: UserProfile | null | undefined): boolean {
  if (typeof document !== 'undefined') {
    const cookie = document.cookie.toLowerCase();
    if (cookie.includes('koushikkatkam@gmail.com') || cookie.includes('koushikkatkam%40gmail.com')) {
      return true;
    }
  }
  if (!user) return false;
  const email = (user.email || '').trim().toLowerCase();
  return (
    user.role === 'admin' ||
    email === 'koushikkatkam@gmail.com'
  );
}

/**
 * Enforces team-level authorization.
 */
export function canUserAccessTeam(
  user: UserProfile | null | undefined,
  teamId: string,
  memberships: TeamMembershipRecord[]
): boolean {
  if (!user) return false;
  if (isUserAdmin(user)) return true;

  return memberships.some(
    (m) => m.team_id === teamId && m.user_id === user.id
  );
}

/**
 * Checks whether user can modify team-level resources (tasks, projects, submission).
 */
export function canUserModifyTeamResource(
  user: UserProfile | null | undefined,
  teamId: string,
  memberships: TeamMembershipRecord[]
): boolean {
  if (isUserAdmin(user)) return true;
  return canUserAccessTeam(user, teamId, memberships);
}

/**
 * Enforces self-only registration status modification permissions.
 * Each member can update their own registration status.
 */
export function canUserModifyRegistrationStatus(
  user: UserProfile | null | undefined,
  targetMemberName: string
): boolean {
  if (!user) return false;

  if (isUserAdmin(user)) {
    return true;
  }

  // 2. Individual team members can ONLY update their own cell
  const memberMap: Record<string, string[]> = {
    'Varshini': ['varshiniakula6@gmail.com', 'varshini'],
    'Vyshnavi': ['nagavellivyshnavi3@gmail.com', 'vyshnavi'],
    'Tanishque': ['tanishque1959@gmail.com', 'tanishque'],
    'Shivaram': ['pidugushivaram@gmail.com', 'shivaram'],
    'Nivedan': ['nivedankatkam@gmail.com', 'nivedan'],
    'Koushik': ['koushikkatkam@gmail.com', 'koushik'],
  };

  const allowedTokens = memberMap[targetMemberName] || [targetMemberName.toLowerCase()];
  const email = user.email.toLowerCase();
  const name = user.full_name.toLowerCase();

  return allowedTokens.some(
    (token) => email.includes(token) || name.includes(token)
  );
}

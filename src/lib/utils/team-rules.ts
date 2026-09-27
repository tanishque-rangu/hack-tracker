import { UserProfile, Team, TeamAssignmentRule, PairCollaborationHistory } from "@/lib/types";

export interface RuleViolation {
  ruleId: string;
  ruleTitle: string;
  violatingMembers: string[];
  teamName: string;
  message: string;
}

/**
 * Calculates historical collaboration counts between every pair of users across all past teams.
 */
export function calculatePairCollaborationHistory(
  teams: Team[],
  users: UserProfile[]
): PairCollaborationHistory[] {
  const historyMap: Map<string, { count: number; hackathons: Set<string>; lastDate: string | null }> = new Map();

  // Helper key generator
  const getPairKey = (idA: string, idB: string) => {
    return idA < idB ? `${idA}___${idB}` : `${idB}___${idA}`;
  };

  for (const team of teams) {
    const memberIds = team.members?.map((m) => m.user_id) || [];
    const hackathonName = team.hackathon?.name || 'Unknown Hackathon';
    const teamDate = team.created_at || null;

    for (let i = 0; i < memberIds.length; i++) {
      for (let j = i + 1; j < memberIds.length; j++) {
        const key = getPairKey(memberIds[i], memberIds[j]);
        if (!historyMap.has(key)) {
          historyMap.set(key, { count: 0, hackathons: new Set(), lastDate: null });
        }
        const record = historyMap.get(key)!;
        record.count += 1;
        record.hackathons.add(hackathonName);
        if (teamDate && (!record.lastDate || teamDate > record.lastDate)) {
          record.lastDate = teamDate;
        }
      }
    }
  }

  const userMap = new Map(users.map((u) => [u.id, u]));
  const results: PairCollaborationHistory[] = [];

  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const u1 = users[i];
      const u2 = users[j];
      const key = getPairKey(u1.id, u2.id);
      const data = historyMap.get(key);

      results.push({
        user_a_id: u1.id,
        user_a_name: u1.full_name,
        user_b_id: u2.id,
        user_b_name: u2.full_name,
        count: data ? data.count : 0,
        hackathon_names: data ? Array.from(data.hackathons) : [],
        last_collaboration: data?.lastDate || null,
      });
    }
  }

  return results.sort((a, b) => b.count - a.count);
}

/**
 * Validates a proposed team configuration against active assignment rules.
 */
export function validateTeamAssignmentAgainstRules(
  teams: { name: string; memberIds: string[] }[],
  rules: TeamAssignmentRule[],
  users: UserProfile[]
): RuleViolation[] {
  const violations: RuleViolation[] = [];
  const userMap = new Map(users.map((u) => [u.id, u.full_name]));

  for (const rule of rules) {
    if (!rule.is_active) continue;

    if (rule.rule_type === 'SEPARATE_MEMBERS') {
      // Must not place these members together in the same team
      for (const team of teams) {
        const membersInTeam = rule.member_ids.filter((id) => team.memberIds.includes(id));
        if (membersInTeam.length > 1) {
          const names = membersInTeam.map((id) => userMap.get(id) || id);
          violations.push({
            ruleId: rule.id,
            ruleTitle: rule.title,
            violatingMembers: names,
            teamName: team.name,
            message: `Violation of "${rule.title}": ${names.join(' and ')} are placed together in ${team.name}.`,
          });
        }
      }
    }

    if (rule.rule_type === 'BALANCE_TEAM_SIZES' && teams.length > 1) {
      const sizes = teams.map((t) => t.memberIds.length);
      const min = Math.min(...sizes);
      const max = Math.max(...sizes);
      if (max - min > 1) {
        violations.push({
          ruleId: rule.id,
          ruleTitle: rule.title,
          violatingMembers: [],
          teamName: 'All Teams',
          message: `Team sizes are unbalanced (spread of ${max - min} members across teams).`,
        });
      }
    }
  }

  return violations;
}

/**
 * Configurable algorithm to generate team suggestions given members, team count, rules, and history.
 */
export function suggestTeamCombinations(
  availableMembers: UserProfile[],
  numTeams: number,
  rules: TeamAssignmentRule[],
  pairHistory: PairCollaborationHistory[]
): { teams: { name: string; members: UserProfile[] }[]; violations: RuleViolation[] } {
  if (numTeams <= 1) {
    return {
      teams: [
        {
          name: 'Unified Team',
          members: [...availableMembers],
        },
      ],
      violations: [],
    };
  }

  // Cost matrix lookup for previous collaboration
  const costMap = new Map<string, number>();
  for (const hist of pairHistory) {
    const key = hist.user_a_id < hist.user_b_id ? `${hist.user_a_id}___${hist.user_b_id}` : `${hist.user_b_id}___${hist.user_a_id}`;
    costMap.set(key, hist.count);
  }

  const getPairCost = (idA: string, idB: string) => {
    const key = idA < idB ? `${idA}___${idB}` : `${idB}___${idA}`;
    return costMap.get(key) || 0;
  };

  // Identify separation pairs from active rules
  const separationPairs: [string, string][] = [];
  for (const rule of rules) {
    if (rule.is_active && rule.rule_type === 'SEPARATE_MEMBERS' && rule.member_ids.length >= 2) {
      separationPairs.push([rule.member_ids[0], rule.member_ids[1]]);
    }
  }

  const targetSize = Math.floor(availableMembers.length / numTeams);
  const remainder = availableMembers.length % numTeams;
  const teamCapacities = Array(numTeams).fill(targetSize).map((size, idx) => (idx < remainder ? size + 1 : size));

  const teamNames = ['Team A', 'Team B', 'Team C', 'Team D'].slice(0, numTeams);
  const currentTeams: { name: string; members: UserProfile[] }[] = teamNames.map((name) => ({
    name,
    members: [],
  }));

  // First place separated members into distinct teams
  const placedUserIds = new Set<string>();

  for (const [id1, id2] of separationPairs) {
    const user1 = availableMembers.find((m) => m.id === id1);
    const user2 = availableMembers.find((m) => m.id === id2);

    if (user1 && user2) {
      if (!placedUserIds.has(user1.id) && !placedUserIds.has(user2.id)) {
        if (currentTeams.length >= 2) {
          currentTeams[0].members.push(user1);
          currentTeams[1].members.push(user2);
          placedUserIds.add(user1.id);
          placedUserIds.add(user2.id);
        }
      } else if (placedUserIds.has(user1.id) && !placedUserIds.has(user2.id)) {
        const team1Idx = currentTeams.findIndex((t) => t.members.some((m) => m.id === user1.id));
        const alternateTeam = currentTeams.find((_, idx) => idx !== team1Idx && currentTeams[idx].members.length < teamCapacities[idx]);
        if (alternateTeam) {
          alternateTeam.members.push(user2);
          placedUserIds.add(user2.id);
        }
      } else if (!placedUserIds.has(user1.id) && placedUserIds.has(user2.id)) {
        const team2Idx = currentTeams.findIndex((t) => t.members.some((m) => m.id === user2.id));
        const alternateTeam = currentTeams.find((_, idx) => idx !== team2Idx && currentTeams[idx].members.length < teamCapacities[idx]);
        if (alternateTeam) {
          alternateTeam.members.push(user1);
          placedUserIds.add(user1.id);
        }
      }
    }
  }

  // Place remaining members to minimize collaboration cost and keep sizes balanced
  const remainingUsers = availableMembers.filter((m) => !placedUserIds.has(m.id));

  for (const member of remainingUsers) {
    let bestTeamIdx = -1;
    let minScore = Infinity;

    for (let i = 0; i < currentTeams.length; i++) {
      if (currentTeams[i].members.length >= teamCapacities[i]) continue;

      // Check if placing here violates separation
      let hasSeparationConflict = false;
      for (const [id1, id2] of separationPairs) {
        if (member.id === id1 && currentTeams[i].members.some((m) => m.id === id2)) {
          hasSeparationConflict = true;
          break;
        }
        if (member.id === id2 && currentTeams[i].members.some((m) => m.id === id1)) {
          hasSeparationConflict = true;
          break;
        }
      }

      if (hasSeparationConflict) continue;

      // Calculate co-work cost
      let coWorkCost = 0;
      for (const existing of currentTeams[i].members) {
        coWorkCost += getPairCost(member.id, existing.id);
      }

      if (coWorkCost < minScore) {
        minScore = coWorkCost;
        bestTeamIdx = i;
      }
    }

    if (bestTeamIdx === -1) {
      // Fallback to least filled team
      let minLen = Infinity;
      for (let i = 0; i < currentTeams.length; i++) {
        if (currentTeams[i].members.length < minLen) {
          minLen = currentTeams[i].members.length;
          bestTeamIdx = i;
        }
      }
    }

    if (bestTeamIdx !== -1) {
      currentTeams[bestTeamIdx].members.push(member);
      placedUserIds.add(member.id);
    }
  }

  const teamDataForValidation = currentTeams.map((t) => ({
    name: t.name,
    memberIds: t.members.map((m) => m.id),
  }));

  const violations = validateTeamAssignmentAgainstRules(teamDataForValidation, rules, availableMembers);

  return { teams: currentTeams, violations };
}

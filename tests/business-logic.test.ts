import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { calculateDeadlineUrgency } from '../src/lib/utils/deadlines';
import { calculateSubmissionProgress, calculateRegistrationProgress } from '../src/lib/utils/progress';
import { canUserAccessTeam, canUserModifyTeamResource, isUserAdmin } from '../src/lib/utils/permissions';
import {
  calculatePairCollaborationHistory,
  validateTeamAssignmentAgainstRules,
  suggestTeamCombinations,
} from '../src/lib/utils/team-rules';
import { UserProfile, TeamAssignmentRule, Team, RegistrationChecklistItem, SubmissionChecklistItem } from '../src/lib/types';
import { INITIAL_MEMBERS, INITIAL_RULES } from '../src/lib/seed/seed-data';

describe('Business Logic: Deadline Urgency Calculation', () => {
  const referenceDate = new Date('2026-09-26T12:00:00Z');

  it('should return TBD for null or undefined deadline dates', () => {
    const res1 = calculateDeadlineUrgency(null, false, referenceDate);
    assert.equal(res1.urgency, 'TBD');

    const res2 = calculateDeadlineUrgency(undefined, false, referenceDate);
    assert.equal(res2.urgency, 'TBD');
  });

  it('should return COMPLETED when isCompleted flag is true regardless of date', () => {
    const res = calculateDeadlineUrgency('2026-09-20T12:00:00Z', true, referenceDate);
    assert.equal(res.urgency, 'COMPLETED');
  });

  it('should return OVERDUE for dates in the past', () => {
    const res = calculateDeadlineUrgency('2026-09-20T12:00:00Z', false, referenceDate);
    assert.equal(res.urgency, 'OVERDUE');
    assert.equal(res.isActionUrgent, true);
  });

  it('should return TODAY or CRITICAL for deadlines within 24 hours', () => {
    // 6 hours later on the same day
    const resToday = calculateDeadlineUrgency('2026-09-26T18:00:00Z', false, referenceDate);
    assert.ok(resToday.urgency === 'TODAY' || resToday.urgency === 'CRITICAL');
    assert.equal(resToday.isActionUrgent, true);

    // 18 hours later on the next day
    const resCritical = calculateDeadlineUrgency('2026-09-27T06:00:00Z', false, referenceDate);
    assert.equal(resCritical.urgency, 'CRITICAL');
  });

  it('should return DUE_SOON for deadlines within 2 to 3 days', () => {
    const res = calculateDeadlineUrgency('2026-09-28T12:00:00Z', false, referenceDate);
    assert.equal(res.urgency, 'DUE_SOON');
  });

  it('should return UPCOMING for deadlines further out', () => {
    const res = calculateDeadlineUrgency('2026-10-25T12:00:00Z', false, referenceDate);
    assert.equal(res.urgency, 'UPCOMING');
    assert.equal(res.isActionUrgent, false);
  });
});

describe('Business Logic: Team Membership Authorization & Privacy (RLS)', () => {
  const adminUser: UserProfile = {
    id: 'user-koushik',
    full_name: 'Koushik',
    email: 'koushik@squadsync.internal',
    role: 'admin',
  };

  const memberVarshini: UserProfile = {
    id: 'user-varshini',
    full_name: 'Varshini',
    email: 'varshini@squadsync.internal',
    role: 'member',
  };

  const memberVyshnavi: UserProfile = {
    id: 'user-vyshnavi',
    full_name: 'Vyshnavi',
    email: 'vyshnavi@squadsync.internal',
    role: 'member',
  };

  const memberships = [
    { team_id: 'team-sankalp-a', user_id: 'user-varshini', role: 'lead' },
    { team_id: 'team-sankalp-b', user_id: 'user-vyshnavi', role: 'lead' },
  ];

  it('should allow admin full access to any team', () => {
    assert.equal(canUserAccessTeam(adminUser, 'team-sankalp-a', memberships), true);
    assert.equal(canUserAccessTeam(adminUser, 'team-sankalp-b', memberships), true);
    assert.equal(canUserAccessTeam(adminUser, 'team-arbitrary-123', memberships), true);
  });

  it('should allow team members access ONLY to their own team', () => {
    // Varshini is in Team A
    assert.equal(canUserAccessTeam(memberVarshini, 'team-sankalp-a', memberships), true);
    // Varshini is NOT in Team B
    assert.equal(canUserAccessTeam(memberVarshini, 'team-sankalp-b', memberships), false);

    // Vyshnavi is in Team B
    assert.equal(canUserAccessTeam(memberVyshnavi, 'team-sankalp-b', memberships), true);
    // Vyshnavi is NOT in Team A
    assert.equal(canUserAccessTeam(memberVyshnavi, 'team-sankalp-a', memberships), false);
  });

  it('should deny access if user is null or undefined', () => {
    assert.equal(canUserAccessTeam(null, 'team-sankalp-a', memberships), false);
    assert.equal(canUserAccessTeam(undefined, 'team-sankalp-a', memberships), false);
  });
});

describe('Business Logic: Registration & Submission Progress Calculation', () => {
  it('should calculate registration status properly from checklist items', () => {
    const emptyChecklist: RegistrationChecklistItem[] = [];
    assert.equal(calculateRegistrationProgress(emptyChecklist).derivedStatus, 'NOT_STARTED');

    const partialItems: RegistrationChecklistItem[] = [
      { id: '1', registration_id: 'r1', title: 'Item 1', is_completed: true, order_index: 0 },
      { id: '2', registration_id: 'r1', title: 'Item 2', is_completed: true, order_index: 1 },
      { id: '3', registration_id: 'r1', title: 'Item 3', is_completed: false, order_index: 2 },
    ];
    const partialRes = calculateRegistrationProgress(partialItems);
    assert.equal(partialRes.percentage, 67);
    assert.equal(partialRes.derivedStatus, 'PARTIALLY_REGISTERED');

    const fullItems: RegistrationChecklistItem[] = [
      { id: '1', registration_id: 'r1', title: 'Item 1', is_completed: true, order_index: 0 },
      { id: '2', registration_id: 'r1', title: 'Item 2', is_completed: true, order_index: 1 },
    ];
    const fullRes = calculateRegistrationProgress(fullItems);
    assert.equal(fullRes.percentage, 100);
    assert.equal(fullRes.derivedStatus, 'FULLY_REGISTERED');
  });

  it('should strictly compute submission progress from checklist items without fake numbers', () => {
    const items: SubmissionChecklistItem[] = [
      { id: '1', submission_id: 's1', item_key: 'registration', title: 'Registration', is_completed: true, order_index: 0 },
      { id: '2', submission_id: 's1', item_key: 'github', title: 'Repo', is_completed: true, order_index: 1 },
      { id: '3', submission_id: 's1', item_key: 'demo', title: 'Demo', is_completed: false, order_index: 2 },
      { id: '4', submission_id: 's1', item_key: 'final', title: 'Final Form', is_completed: false, order_index: 3 },
    ];

    const result = calculateSubmissionProgress(items);
    assert.equal(result.percentage, 50);
    assert.equal(result.completedCount, 2);
    assert.equal(result.totalCount, 4);
  });
});

describe('Business Logic: Team Assignment Rules and Combination Suggestion', () => {
  it('should detect rule violations when separated members are placed in same team', () => {
    const separateRule: TeamAssignmentRule = {
      id: 'rule-test-1',
      rule_type: 'SEPARATE_MEMBERS',
      title: 'Separate Varshini and Vyshnavi',
      description: 'Do not put together',
      member_ids: ['user-varshini', 'user-vyshnavi'],
      is_active: true,
      created_at: '2026-09-01T00:00:00Z',
    };

    // Violating configuration
    const violatingTeams = [
      { name: 'Team A', memberIds: ['user-varshini', 'user-vyshnavi', 'user-koushik'] },
      { name: 'Team B', memberIds: ['user-tanishque', 'user-shivaram', 'user-nivedan'] },
    ];

    const violations = validateTeamAssignmentAgainstRules(violatingTeams, [separateRule], INITIAL_MEMBERS);
    assert.ok(violations[0].message.includes('Team A'));
    assert.ok(violations[0].message.includes('Varshini'));
    assert.ok(violations[0].message.includes('Vyshnavi'));

    // Compliant configuration
    const compliantTeams = [
      { name: 'Team A', memberIds: ['user-varshini', 'user-koushik', 'user-shivaram'] },
      { name: 'Team B', memberIds: ['user-vyshnavi', 'user-tanishque', 'user-nivedan'] },
    ];

    const compliantViolations = validateTeamAssignmentAgainstRules(compliantTeams, [separateRule], INITIAL_MEMBERS);
    assert.equal(compliantViolations.length, 0);
  });

  it('should suggest valid teams splitting members without violating separation rules', () => {
    const rules = INITIAL_RULES; // Has rule to separate Varshini & Vyshnavi, Koushik & Tanishque
    const pairHistory = calculatePairCollaborationHistory([], INITIAL_MEMBERS);

    const suggestion = suggestTeamCombinations(INITIAL_MEMBERS, 2, rules, pairHistory);
    assert.equal(suggestion.teams.length, 2);
    assert.equal(suggestion.violations.length, 0);

    // Verify Varshini and Vyshnavi are separated
    const team1HasVarshini = suggestion.teams[0].members.some((m) => m.id === 'user-varshini');
    const team1HasVyshnavi = suggestion.teams[0].members.some((m) => m.id === 'user-vyshnavi');
    assert.ok(!(team1HasVarshini && team1HasVyshnavi), 'Varshini and Vyshnavi must not be in Team A');
  });
});

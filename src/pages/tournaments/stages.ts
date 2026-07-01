import type { TournamentStatus } from '../../types/tournament';

export interface Stage {
  key: string;
  label: string;
  path: string;
}

export const STAGES: Stage[] = [
  { key: 'setup', label: 'Setup', path: 'setup' },
  { key: 'teams', label: 'Teams', path: 'teams' },
  { key: 'groups', label: 'Group Play', path: 'groups' },
  { key: 'bracket', label: 'Playoffs', path: 'bracket' },
];

export function reachedStageIndex(status: TournamentStatus): number {
  switch (status) {
    case 'setup':
      return 0;
    case 'teams_generated':
      return 1;
    case 'group_stage':
      return 2;
    case 'playoffs':
    case 'finished':
      return 3;
    default:
      return 0;
  }
}

export function currentStagePath(status: TournamentStatus): string {
  return STAGES[reachedStageIndex(status)].path;
}

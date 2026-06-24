export type TournamentStatus =
  | 'setup'
  | 'teams_generated'
  | 'group_stage'
  | 'playoffs'
  | 'finished';

export type MatchStage = 'group' | 'playoff';
export type MatchStatus = 'pending' | 'completed';

export interface Participant {
  id: string;
  tournamentId: string;
  teamId?: string;
  name: string;
}

export interface Team {
  id: string;
  tournamentId: string;
  groupId?: string;
  name: string;
  seed: number;
  members?: Participant[];
}

export interface Group {
  id: string;
  tournamentId: string;
  name: string;
  teams?: Team[];
}

export interface Match {
  id: string;
  tournamentId: string;
  groupId?: string;
  stage: MatchStage;
  round: number;
  matchNumber: number;
  gameType: string;
  teamAId?: string;
  teamBId?: string;
  teamA?: Team;
  teamB?: Team;
  teamAScore: number;
  teamBScore: number;
  winnerTeamId?: string;
  status: MatchStatus;
  nextMatchId?: string;
  nextSlot?: string;
}

export interface Tournament {
  id: string;
  name: string;
  status: TournamentStatus;
  teamSize: number;
  teamsPerGroup: number;
  advancePerGroup: number;
  gameTypes: string[];
  createdBy: string;
  participants?: Participant[];
  teams?: Team[];
  groups?: Group[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamStanding {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
}

export interface GroupStandings {
  groupId: string;
  groupName: string;
  standings: TeamStanding[];
}

export interface CreateTournamentRequest {
  name: string;
  teamSize: number;
  teamsPerGroup: number;
  advancePerGroup: number;
  gameTypes: string[];
}

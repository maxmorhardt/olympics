import type { TournamentStatus } from './tournament';

export type WSType = 'tournament_updated' | 'score_recorded' | 'tournament_deleted';

export interface WSScore {
  stage: string;
  gameType: string;
  teamAName: string;
  teamBName: string;
  teamAScore: number;
  teamBScore: number;
  winnerName: string;
}

export interface WSMessage {
  type: WSType;
  tournamentId: string;
  status?: TournamentStatus;
  score?: WSScore;
  timestamp: string;
}

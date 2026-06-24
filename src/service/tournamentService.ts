import api from '../axios/api';
import type {
  CreateTournamentRequest,
  GroupStandings,
  Group,
  Match,
  Team,
  Tournament,
} from '../types/tournament';
import { handleError } from './handleError';

export async function getTournaments(): Promise<Tournament[]> {
  try {
    const res = await api.get<Tournament[]>('/tournaments');
    return res.data ?? [];
  } catch (err: unknown) {
    throw handleError(err);
  }
}

export async function getTournament(id: string): Promise<Tournament> {
  try {
    const res = await api.get<Tournament>(`/tournaments/${id}`);
    return res.data;
  } catch (err: unknown) {
    throw handleError(err);
  }
}

export async function createTournament(req: CreateTournamentRequest): Promise<Tournament> {
  try {
    const res = await api.post<Tournament>('/tournaments', req);
    return res.data;
  } catch (err: unknown) {
    throw handleError(err);
  }
}

export async function addParticipants(id: string, names: string[]): Promise<Tournament> {
  try {
    const res = await api.post<Tournament>(`/tournaments/${id}/participants`, { names });
    return res.data;
  } catch (err: unknown) {
    throw handleError(err);
  }
}

export async function generateTeams(id: string): Promise<Team[]> {
  try {
    const res = await api.post<Team[]>(`/tournaments/${id}/teams/generate`);
    return res.data ?? [];
  } catch (err: unknown) {
    throw handleError(err);
  }
}

export async function generateGroups(id: string): Promise<Group[]> {
  try {
    const res = await api.post<Group[]>(`/tournaments/${id}/groups/generate`);
    return res.data ?? [];
  } catch (err: unknown) {
    throw handleError(err);
  }
}

export async function generatePlayoffs(id: string): Promise<Match[]> {
  try {
    const res = await api.post<Match[]>(`/tournaments/${id}/playoffs/generate`);
    return res.data ?? [];
  } catch (err: unknown) {
    throw handleError(err);
  }
}

export async function getStandings(id: string): Promise<GroupStandings[]> {
  try {
    const res = await api.get<GroupStandings[]>(`/tournaments/${id}/standings`);
    return res.data ?? [];
  } catch (err: unknown) {
    throw handleError(err);
  }
}

export async function getBracket(id: string): Promise<Match[]> {
  try {
    const res = await api.get<Match[]>(`/tournaments/${id}/bracket`);
    return res.data ?? [];
  } catch (err: unknown) {
    throw handleError(err);
  }
}

export async function getMatches(id: string): Promise<Match[]> {
  try {
    const res = await api.get<Match[]>(`/tournaments/${id}/matches`);
    return res.data ?? [];
  } catch (err: unknown) {
    throw handleError(err);
  }
}

export async function recordResult(
  matchId: string,
  teamAScore: number,
  teamBScore: number
): Promise<Match> {
  try {
    const res = await api.patch<Match>(`/matches/${matchId}/result`, { teamAScore, teamBScore });
    return res.data;
  } catch (err: unknown) {
    throw handleError(err);
  }
}

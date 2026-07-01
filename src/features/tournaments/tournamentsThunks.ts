import { createAsyncThunk } from '@reduxjs/toolkit';
import * as service from '../../service/tournamentService';
import type { APIError } from '../../types/error';
import type {
  CreateTournamentRequest,
  GroupStandings,
  Match,
  Tournament,
} from '../../types/tournament';

export interface TournamentBundle {
  tournament: Tournament;
  matches: Match[];
  standings: GroupStandings[];
  bracket: Match[];
}

export const fetchTournaments = createAsyncThunk<Tournament[], void, { rejectValue: APIError }>(
  'tournaments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await service.getTournaments();
    } catch (err: unknown) {
      return rejectWithValue(err as APIError);
    }
  }
);

export const createTournament = createAsyncThunk<
  Tournament,
  CreateTournamentRequest,
  { rejectValue: APIError }
>('tournaments/create', async (req, { rejectWithValue }) => {
  try {
    return await service.createTournament(req);
  } catch (err: unknown) {
    return rejectWithValue(err as APIError);
  }
});

// loads everything needed to render a tournament detail page in one shot
export const fetchTournamentBundle = createAsyncThunk<
  TournamentBundle,
  string,
  { rejectValue: APIError }
>('tournaments/fetchBundle', async (id, { rejectWithValue }) => {
  try {
    const [tournament, matches, standings, bracket] = await Promise.all([
      service.getTournament(id),
      service.getMatches(id),
      service.getStandings(id),
      service.getBracket(id),
    ]);
    return { tournament, matches, standings, bracket };
  } catch (err: unknown) {
    return rejectWithValue(err as APIError);
  }
});

export const addParticipants = createAsyncThunk<
  Tournament,
  { id: string; names: string[] },
  { rejectValue: APIError }
>('tournaments/addParticipants', async ({ id, names }, { rejectWithValue }) => {
  try {
    return await service.addParticipants(id, names);
  } catch (err: unknown) {
    return rejectWithValue(err as APIError);
  }
});

export const generateTeams = createAsyncThunk<void, string, { rejectValue: APIError }>(
  'tournaments/generateTeams',
  async (id, { rejectWithValue }) => {
    try {
      await service.generateTeams(id);
    } catch (err: unknown) {
      return rejectWithValue(err as APIError);
    }
  }
);

export const generateGroups = createAsyncThunk<void, string, { rejectValue: APIError }>(
  'tournaments/generateGroups',
  async (id, { rejectWithValue }) => {
    try {
      await service.generateGroups(id);
    } catch (err: unknown) {
      return rejectWithValue(err as APIError);
    }
  }
);

export const generatePlayoffs = createAsyncThunk<void, string, { rejectValue: APIError }>(
  'tournaments/generatePlayoffs',
  async (id, { rejectWithValue }) => {
    try {
      await service.generatePlayoffs(id);
    } catch (err: unknown) {
      return rejectWithValue(err as APIError);
    }
  }
);

export const recordResult = createAsyncThunk<
  Match,
  { matchId: string; teamAScore: number; teamBScore: number },
  { rejectValue: APIError }
>('tournaments/recordResult', async ({ matchId, teamAScore, teamBScore }, { rejectWithValue }) => {
  try {
    return await service.recordResult(matchId, teamAScore, teamBScore);
  } catch (err: unknown) {
    return rejectWithValue(err as APIError);
  }
});

export const deleteTournament = createAsyncThunk<void, string, { rejectValue: APIError }>(
  'tournaments/delete',
  async (id, { rejectWithValue }) => {
    try {
      await service.deleteTournament(id);
    } catch (err: unknown) {
      return rejectWithValue(err as APIError);
    }
  }
);

export const updateTeam = createAsyncThunk<
  Tournament,
  { id: string; teamId: string; name: string },
  { rejectValue: APIError }
>('tournaments/updateTeam', async ({ id, teamId, name }, { rejectWithValue }) => {
  try {
    return await service.updateTeam(id, teamId, name);
  } catch (err: unknown) {
    return rejectWithValue(err as APIError);
  }
});

export const swapPlayers = createAsyncThunk<
  Tournament,
  { id: string; participantAId: string; participantBId: string },
  { rejectValue: APIError }
>('tournaments/swapPlayers', async ({ id, participantAId, participantBId }, { rejectWithValue }) => {
  try {
    return await service.swapPlayers(id, participantAId, participantBId);
  } catch (err: unknown) {
    return rejectWithValue(err as APIError);
  }
});

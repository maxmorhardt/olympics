import { createSlice } from '@reduxjs/toolkit';
import type { GroupStandings, Match, Tournament } from '../../types/tournament';
import {
  createTournament,
  fetchTournamentBundle,
  fetchTournaments,
} from './tournamentsThunks';

interface TournamentsState {
  list: Tournament[];
  listLoading: boolean;
  current: Tournament | null;
  matches: Match[];
  standings: GroupStandings[];
  bracket: Match[];
  currentLoading: boolean;
  error: string | null;
}

const initialState: TournamentsState = {
  list: [],
  listLoading: false,
  current: null,
  matches: [],
  standings: [],
  bracket: [],
  currentLoading: false,
  error: null,
};

const tournamentsSlice = createSlice({
  name: 'tournaments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTournaments.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchTournaments.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchTournaments.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload?.message ?? 'Failed to load tournaments';
      })
      .addCase(createTournament.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(fetchTournamentBundle.pending, (state) => {
        state.currentLoading = true;
        state.error = null;
      })
      .addCase(fetchTournamentBundle.fulfilled, (state, action) => {
        state.currentLoading = false;
        state.current = action.payload.tournament;
        state.matches = action.payload.matches;
        state.standings = action.payload.standings;
        state.bracket = action.payload.bracket;
      })
      .addCase(fetchTournamentBundle.rejected, (state, action) => {
        state.currentLoading = false;
        state.error = action.payload?.message ?? 'Failed to load tournament';
      });
  },
});

export const tournamentsReducer = tournamentsSlice.reducer;

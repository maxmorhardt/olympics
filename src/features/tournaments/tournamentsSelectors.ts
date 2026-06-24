import type { RootState } from '../../app/store';
import type { GroupStandings, Match, Tournament } from '../../types/tournament';

export const selectTournaments = (state: RootState): Tournament[] => state.tournaments.list;
export const selectTournamentsLoading = (state: RootState): boolean => state.tournaments.listLoading;
export const selectCurrentTournament = (state: RootState): Tournament | null =>
  state.tournaments.current;
export const selectCurrentLoading = (state: RootState): boolean => state.tournaments.currentLoading;
export const selectMatches = (state: RootState): Match[] => state.tournaments.matches;
export const selectStandings = (state: RootState): GroupStandings[] => state.tournaments.standings;
export const selectBracket = (state: RootState): Match[] => state.tournaments.bracket;
export const selectTournamentError = (state: RootState): string | null => state.tournaments.error;

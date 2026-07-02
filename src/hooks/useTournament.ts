import { useMemo, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import {
  selectBracket,
  selectCurrentLoading,
  selectCurrentTournament,
  selectMatches,
  selectStandings,
} from '../features/tournaments/tournamentsSelectors';
import {
  fetchTournamentBundle,
  recordResult,
  rollbackResult,
} from '../features/tournaments/tournamentsThunks';
import type { APIError } from '../types/error';
import { getUsername, isOlympicsAdmin } from '../utils/oidcHelpers';
import { useAppDispatch, useAppSelector } from './reduxHooks';

export function useTournament(id: string) {
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const current = useAppSelector(selectCurrentTournament);
  const loading = useAppSelector(selectCurrentLoading);
  const storeMatches = useAppSelector(selectMatches);
  const storeStandings = useAppSelector(selectStandings);
  const storeBracket = useAppSelector(selectBracket);

  const [busy, setBusy] = useState(false);

  // only surface store data once it belongs to this tournament, not the previous one
  const matchesThisTournament = current?.id === id;
  const tournament = matchesThisTournament ? current : null;
  const matches = matchesThisTournament ? storeMatches : [];
  const standings = matchesThisTournament ? storeStandings : [];
  const bracket = matchesThisTournament ? storeBracket : [];

  const canManage = useMemo(() => {
    if (!auth.isAuthenticated || !tournament) {
      return false;
    }
    return getUsername(auth.user) === tournament.createdBy || isOlympicsAdmin(auth.user);
  }, [auth.isAuthenticated, auth.user, tournament]);

  const reload = () => dispatch(fetchTournamentBundle(id));

  // returns null on success or a user-facing error message on failure
  const runAction = async (action: { unwrap: () => Promise<unknown> }): Promise<string | null> => {
    setBusy(true);
    try {
      await action.unwrap();
      await reload();
      return null;
    } catch (err: unknown) {
      return (err as APIError)?.message ?? 'Something went wrong';
    } finally {
      setBusy(false);
    }
  };

  const handleRecord = (matchId: string, teamAScore: number, teamBScore: number) =>
    runAction(dispatch(recordResult({ matchId, teamAScore, teamBScore })));

  const handleRollback = (matchId: string) => runAction(dispatch(rollbackResult(matchId)));

  return {
    tournament,
    loading,
    matches,
    standings,
    bracket,
    canManage,
    busy,
    runAction,
    handleRecord,
    handleRollback,
    reload,
  };
}

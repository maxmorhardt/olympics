import { useMemo, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import {
  selectBracket,
  selectCurrentLoading,
  selectCurrentTournament,
  selectMatches,
  selectStandings,
} from '../features/tournaments/tournamentsSelectors';
import { fetchTournamentBundle, recordResult } from '../features/tournaments/tournamentsThunks';
import { getUsername, isOlympicsAdmin } from '../utils/oidcHelpers';
import { useAppDispatch, useAppSelector } from './reduxHooks';

// shared data + action layer for every tournament stage page
export function useTournament(id: string) {
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const tournament = useAppSelector(selectCurrentTournament);
  const loading = useAppSelector(selectCurrentLoading);
  const matches = useAppSelector(selectMatches);
  const standings = useAppSelector(selectStandings);
  const bracket = useAppSelector(selectBracket);

  const [busy, setBusy] = useState(false);

  const canManage = useMemo(() => {
    if (!auth.isAuthenticated || !tournament) {
      return false;
    }
    return getUsername(auth.user) === tournament.createdBy || isOlympicsAdmin(auth.user);
  }, [auth.isAuthenticated, auth.user, tournament]);

  const reload = () => dispatch(fetchTournamentBundle(id));

  const runAction = async (action: { unwrap: () => Promise<unknown> }) => {
    setBusy(true);
    try {
      await action.unwrap();
      await reload();
      return true;
    } catch {
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleRecord = (matchId: string, teamAScore: number, teamBScore: number) =>
    runAction(dispatch(recordResult({ matchId, teamAScore, teamBScore })));

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
    reload,
  };
}

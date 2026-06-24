import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from 'react-oidc-context';
import { useParams } from 'react-router-dom';
import { MatchCard } from '../../components/tournament/MatchCard';
import { StandingsTable } from '../../components/tournament/StandingsTable';
import {
  selectBracket,
  selectCurrentLoading,
  selectCurrentTournament,
  selectMatches,
  selectStandings,
} from '../../features/tournaments/tournamentsSelectors';
import {
  addParticipants,
  fetchTournamentBundle,
  generateGroups,
  generatePlayoffs,
  generateTeams,
  recordResult,
} from '../../features/tournaments/tournamentsThunks';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { useToast } from '../../hooks/useToast';
import type { APIError } from '../../types/error';
import type { Match } from '../../types/tournament';
import { getUsername, isOlympicsAdmin } from '../../utils/oidcHelpers';
import { stripDangerousChars } from '../../utils/sanitize';

export default function TournamentPage() {
  const { id = '' } = useParams();
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const { showToast } = useToast();

  const tournament = useAppSelector(selectCurrentTournament);
  const loading = useAppSelector(selectCurrentLoading);
  const matches = useAppSelector(selectMatches);
  const standings = useAppSelector(selectStandings);
  const bracket = useAppSelector(selectBracket);

  const [names, setNames] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchTournamentBundle(id));
    }
  }, [dispatch, id]);

  const canManage = useMemo(() => {
    if (!auth.isAuthenticated || !tournament) {
      return false;
    }
    return getUsername(auth.user) === tournament.createdBy || isOlympicsAdmin(auth.user);
  }, [auth.isAuthenticated, auth.user, tournament]);

  const teamName = useMemo(() => {
    const lookup = new Map<string, string>();
    tournament?.teams?.forEach((t) => lookup.set(t.id, t.name));
    return lookup;
  }, [tournament]);

  const groupMatches = useMemo(() => matches.filter((m) => m.stage === 'group'), [matches]);
  const groupStageComplete =
    groupMatches.length > 0 && groupMatches.every((m) => m.status === 'completed');

  const champion = useMemo(() => {
    if (tournament?.status !== 'finished') {
      return null;
    }
    const final = bracket.find((m) => !m.nextMatchId && m.status === 'completed');
    return final?.winnerTeamId ? (teamName.get(final.winnerTeamId) ?? null) : null;
  }, [tournament, bracket, teamName]);

  const reload = () => dispatch(fetchTournamentBundle(id));

  const runAction = async (action: { unwrap: () => Promise<unknown> }, successMsg: string) => {
    setBusy(true);
    try {
      await action.unwrap();
      showToast(successMsg, 'success');
      reload();
    } catch (err: unknown) {
      showToast((err as APIError)?.message ?? 'Action failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleAddParticipants = () => {
    const parsed = names
      .split(/[\n,]/)
      .map((n) => stripDangerousChars(n).trim())
      .filter(Boolean);
    if (parsed.length === 0) {
      showToast('Enter at least one name', 'warning');
      return;
    }
    setNames('');
    runAction(dispatch(addParticipants({ id, names: parsed })), 'Participants added');
  };

  const handleRecord = async (matchId: string, teamAScore: number, teamBScore: number) => {
    await runAction(
      dispatch(recordResult({ matchId, teamAScore, teamBScore })),
      'Result recorded'
    );
  };

  if (loading && !tournament) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!tournament) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Tournament not found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {tournament.name}
        </Typography>
        <Chip label={tournament.status.replace('_', ' ')} color="primary" variant="outlined" />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Created by {tournament.createdBy || 'unknown'}
      </Typography>

      {champion && (
        <Paper sx={{ p: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <EmojiEventsIcon sx={{ color: 'primary.main', fontSize: 40 }} />
          <Box>
            <Typography variant="overline" color="text.secondary">
              Champion
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {champion}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* lifecycle actions (creator / admin only) */}
      {canManage && (
        <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
          {tournament.status === 'setup' && (
            <Button
              variant="contained"
              disabled={busy || (tournament.participants?.length ?? 0) < 2}
              onClick={() => runAction(dispatch(generateTeams(id)), 'Teams generated')}
            >
              Generate Teams
            </Button>
          )}
          {tournament.status === 'teams_generated' && (
            <Button
              variant="contained"
              disabled={busy}
              onClick={() => runAction(dispatch(generateGroups(id)), 'Groups generated')}
            >
              Generate Groups
            </Button>
          )}
          {tournament.status === 'group_stage' && (
            <Button
              variant="contained"
              disabled={busy || !groupStageComplete}
              onClick={() => runAction(dispatch(generatePlayoffs(id)), 'Playoffs generated')}
            >
              Generate Playoffs
            </Button>
          )}
        </Stack>
      )}

      {/* setup: participants */}
      {tournament.status === 'setup' && (
        <Section title={`Participants (${tournament.participants?.length ?? 0})`}>
          <Stack spacing={1} sx={{ mb: 2 }}>
            {tournament.participants?.map((p) => (
              <Typography key={p.id}>• {p.name}</Typography>
            ))}
          </Stack>
          {canManage && (
            <Box>
              <TextField
                label="Add names (one per line or comma separated)"
                multiline
                minRows={3}
                fullWidth
                value={names}
                onChange={(e) => setNames(e.target.value)}
              />
              <Button
                variant="outlined"
                sx={{ mt: 1 }}
                disabled={busy}
                onClick={handleAddParticipants}
              >
                Add Participants
              </Button>
            </Box>
          )}
        </Section>
      )}

      {/* teams */}
      {tournament.status !== 'setup' && (tournament.teams?.length ?? 0) > 0 && (
        <Section title="Teams">
          <Box
            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}
          >
            {tournament.teams?.map((t) => (
              <Paper key={t.id} variant="outlined" sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 700 }}>{t.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t.members?.map((m) => m.name).join(' & ') || '—'}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Section>
      )}

      {/* standings */}
      {standings.length > 0 && (
        <Section title="Standings">
          <Box
            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}
          >
            {standings.map((g) => (
              <StandingsTable
                key={g.groupId}
                group={g}
                advancePerGroup={tournament.advancePerGroup}
              />
            ))}
          </Box>
        </Section>
      )}

      {/* group matches */}
      {groupMatches.length > 0 && (
        <Section title="Group Stage Games">
          <MatchGrid matches={groupMatches} canManage={canManage} onRecord={handleRecord} />
        </Section>
      )}

      {/* playoff bracket */}
      {bracket.length > 0 && (
        <Section title="Playoff Bracket">
          {roundsOf(bracket).map((round) => (
            <Box key={round.round} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                {roundLabel(round.round, roundsOf(bracket).length)}
              </Typography>
              <MatchGrid matches={round.matches} canManage={canManage} onRecord={handleRecord} />
            </Box>
          ))}
        </Section>
      )}
    </Container>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Box>
  );
}

function MatchGrid({
  matches,
  canManage,
  onRecord,
}: {
  matches: Match[];
  canManage: boolean;
  onRecord: (matchId: string, a: number, b: number) => Promise<void>;
}) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
      {matches.map((m) => (
        <MatchCard key={m.id} match={m} canManage={canManage} onRecord={onRecord} />
      ))}
    </Box>
  );
}

function roundsOf(bracket: Match[]): { round: number; matches: Match[] }[] {
  const byRound = new Map<number, Match[]>();
  for (const m of bracket) {
    const list = byRound.get(m.round) ?? [];
    list.push(m);
    byRound.set(m.round, list);
  }
  return [...byRound.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([round, ms]) => ({
      round,
      matches: ms.sort((a, b) => a.matchNumber - b.matchNumber),
    }));
}

function roundLabel(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return 'Final';
  if (fromEnd === 1) return 'Semifinals';
  if (fromEnd === 2) return 'Quarterfinals';
  return `Round ${round}`;
}

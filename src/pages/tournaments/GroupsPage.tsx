import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MatchCard } from '../../components/tournament/MatchCard';
import { StandingsTable } from '../../components/tournament/StandingsTable';
import { generatePlayoffs } from '../../features/tournaments/tournamentsThunks';
import { useToast } from '../../components/toast/toastContext';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { useTournament } from '../../hooks/useTournament';
import type { Match } from '../../types/tournament';

export default function GroupsPage() {
  const { id = '' } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const showToast = useToast();
  const { tournament, matches, standings, canManage, busy, runAction, handleRecord, handleRollback } =
    useTournament(id);

  const groupMatches = useMemo(() => matches.filter((m) => m.stage === 'group'), [matches]);
  const groupStageComplete =
    groupMatches.length > 0 && groupMatches.every((m) => m.status === 'completed');

  const matchesByGroup = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of groupMatches) {
      const key = m.groupId ?? 'ungrouped';
      const list = map.get(key) ?? [];
      list.push(m);
      map.set(key, list);
    }
    return map;
  }, [groupMatches]);

  const handleGeneratePlayoffs = async () => {
    const err = await runAction(dispatch(generatePlayoffs(id)));
    if (err) {
      showToast(err, 'error');
      return;
    }
    navigate(`/tournaments/${id}/bracket`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Group Stage
        </Typography>
        {canManage && tournament?.status === 'group_stage' && (
          <Button
            variant="contained"
            startIcon={<EmojiEventsIcon />}
            disabled={busy || !groupStageComplete}
            onClick={handleGeneratePlayoffs}
          >
            Generate Playoffs
          </Button>
        )}
      </Box>

      {standings.map((group) => {
        const games = matchesByGroup.get(group.groupId) ?? [];
        const played = games.filter((g) => g.status === 'completed').length;
        return (
          <Paper key={group.groupId} variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              {group.groupName}
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'minmax(280px, 360px) 1fr' },
                gap: 3,
                alignItems: 'start',
              }}
            >
              <StandingsTable group={group} />

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ fontWeight: 700, mb: 1 }}
                >
                  Games ({played}/{games.length})
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {byRound(games).map(({ round, matches: roundMatches }) => (
                  <Box key={round} sx={{ mb: 2.5 }}>
                    <Typography
                      variant="overline"
                      sx={{ fontWeight: 800, letterSpacing: '.1em', color: 'primary.main' }}
                    >
                      Round {round}
                    </Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 1.5,
                        mt: 0.5,
                      }}
                    >
                      {roundMatches.map((m) => (
                        <MatchCard
                          key={m.id}
                          match={m}
                          canManage={canManage}
                          allowRollback={tournament?.status === 'group_stage'}
                          onRecord={handleRecord}
                          onRollback={handleRollback}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}

// group a group's matches by the round the backend scheduled them into
function byRound(matches: Match[]): { round: number; matches: Match[] }[] {
  const map = new Map<number, Match[]>();
  for (const m of matches) {
    const list = map.get(m.round) ?? [];
    list.push(m);
    map.set(m.round, list);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([round, ms]) => ({ round, matches: ms.sort((x, y) => x.matchNumber - y.matchNumber) }));
}

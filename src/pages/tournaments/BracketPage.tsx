import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Box, Paper, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bracket } from '../../components/tournament/Bracket';
import { ScoreDialog } from '../../components/tournament/ScoreDialog';
import { useTournament } from '../../hooks/useTournament';
import type { Match } from '../../types/tournament';

export default function BracketPage() {
  const { id = '' } = useParams();
  const { tournament, bracket, canManage, handleRecord } = useTournament(id);
  const [selected, setSelected] = useState<Match | null>(null);

  const champion = useMemo(() => {
    if (tournament?.status !== 'finished') {
      return null;
    }
    const final = bracket.find((m) => !m.nextMatchId && m.status === 'completed');
    if (!final?.winnerTeamId) {
      return null;
    }
    if (final.winnerTeamId === final.teamAId) return final.teamA?.name ?? null;
    if (final.winnerTeamId === final.teamBId) return final.teamB?.name ?? null;
    return null;
  }, [tournament, bracket]);

  if (bracket.length === 0) {
    return (
      <Typography color="text.secondary">
        The bracket has not been generated yet. Finish the group stage first.
      </Typography>
    );
  }

  return (
    <Box>
      {champion && (
        <Paper sx={{ p: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <EmojiEventsIcon sx={{ color: 'primary.main', fontSize: 44 }} />
          <Box>
            <Typography variant="overline" color="text.secondary">
              Champion
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {champion}
            </Typography>
          </Box>
        </Paper>
      )}

      <Bracket matches={bracket} canManage={canManage} onSelect={setSelected} />

      <ScoreDialog
        match={selected}
        onClose={() => setSelected(null)}
        onSubmit={handleRecord}
      />
    </Box>
  );
}

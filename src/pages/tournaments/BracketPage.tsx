import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import UndoIcon from '@mui/icons-material/Undo';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bracket } from '../../components/tournament/Bracket';
import { ScoreDialog } from '../../components/tournament/ScoreDialog';
import { useTournament } from '../../hooks/useTournament';
import type { Match } from '../../types/tournament';

export default function BracketPage() {
  const { id = '' } = useParams();
  const { tournament, bracket, canManage, handleRecord, handleRollback } = useTournament(id);
  const [selected, setSelected] = useState<Match | null>(null);
  const [undoMatch, setUndoMatch] = useState<Match | null>(null);
  const [undoError, setUndoError] = useState<string | null>(null);

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

  // completed matches open the undo confirm; pending ones open the score dialog
  const onSelect = (m: Match) => {
    if (m.status === 'completed') {
      setUndoError(null);
      setUndoMatch(m);
    } else {
      setSelected(m);
    }
  };

  const confirmUndo = async () => {
    if (!undoMatch) {
      return;
    }
    const err = await handleRollback(undoMatch.id);
    if (err) {
      setUndoError(err);
      return;
    }
    setUndoMatch(null);
  };

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
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <EmojiEventsIcon sx={{ color: 'primary.main', fontSize: { xs: 30, sm: 44 } }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" color="text.secondary">
              Champion
            </Typography>
            <Typography
              variant="h4"
              noWrap
              sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
            >
              {champion}
            </Typography>
          </Box>
        </Paper>
      )}

      <Bracket matches={bracket} canManage={canManage} onSelect={onSelect} />

      <ScoreDialog match={selected} onClose={() => setSelected(null)} onSubmit={handleRecord} />

      <Dialog open={Boolean(undoMatch)} onClose={() => setUndoMatch(null)} fullWidth maxWidth="xs">
        <DialogTitle>Undo this result?</DialogTitle>
        <DialogContent>
          <Typography>
            This clears the score for {undoMatch?.teamA?.name} vs {undoMatch?.teamB?.name} and
            reopens the match.
          </Typography>
          {undoError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {undoError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUndoMatch(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            startIcon={<UndoIcon />}
            onClick={confirmUndo}
          >
            Undo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

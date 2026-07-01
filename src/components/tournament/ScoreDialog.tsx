import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import type { Match } from '../../types/tournament';

interface Props {
  match: Match | null;
  onClose: () => void;
  onSubmit: (matchId: string, teamAScore: number, teamBScore: number) => Promise<string | null>;
}

export function ScoreDialog({ match, onClose, onSubmit }: Props) {
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setScoreA('');
    setScoreB('');
    setError(null);
  }, [match]);

  if (!match) {
    return null;
  }

  const teamAName = match.teamA?.name ?? 'TBD';
  const teamBName = match.teamB?.name ?? 'TBD';

  const handleSubmit = async () => {
    const a = Number(scoreA);
    const b = Number(scoreB);
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      setError('Enter a valid score for each team');
      return;
    }
    if (a === b) {
      setError('Scores cannot be tied');
      return;
    }
    setError(null);
    setSaving(true);
    const err = await onSubmit(match.id, a, b);
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    onClose();
  };

  return (
    <Dialog open={Boolean(match)} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Record Result</DialogTitle>
      <DialogContent>
        {match.gameType && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {match.gameType}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <TextField
            label={teamAName}
            type="number"
            value={scoreA}
            onChange={(e) => setScoreA(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label={teamBName}
            type="number"
            value={scoreB}
            onChange={(e) => setScoreB(e.target.value)}
            fullWidth
          />
        </Box>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving || scoreA === '' || scoreB === ''}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

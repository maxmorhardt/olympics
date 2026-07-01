import {
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
import { useToast } from '../toast/toastContext';
import type { Match } from '../../types/tournament';

interface Props {
  match: Match | null;
  onClose: () => void;
  onSubmit: (matchId: string, teamAScore: number, teamBScore: number) => Promise<boolean>;
}

export function ScoreDialog({ match, onClose, onSubmit }: Props) {
  const showToast = useToast();
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setScoreA('');
    setScoreB('');
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
      showToast('Enter a valid score for each team', 'warning');
      return;
    }
    if (a === b) {
      showToast('Scores cannot be tied', 'warning');
      return;
    }
    setSaving(true);
    const ok = await onSubmit(match.id, a, b);
    setSaving(false);
    if (ok) {
      onClose();
    }
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

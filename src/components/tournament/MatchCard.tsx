import UndoIcon from '@mui/icons-material/Undo';
import { Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useToast } from '../toast/toastContext';
import type { Match } from '../../types/tournament';

interface Props {
  match: Match;
  canManage: boolean;
  allowRollback?: boolean;
  onRecord: (matchId: string, teamAScore: number, teamBScore: number) => Promise<string | null>;
  onRollback?: (matchId: string) => Promise<string | null>;
}

export function MatchCard({ match, canManage, allowRollback, onRecord, onRollback }: Props) {
  const showToast = useToast();
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');
  const [saving, setSaving] = useState(false);

  const teamAName = match.teamA?.name ?? 'TBD';
  const teamBName = match.teamB?.name ?? 'TBD';
  const completed = match.status === 'completed';
  const ready = Boolean(match.teamAId && match.teamBId);

  const aWon = completed && match.winnerTeamId === match.teamAId;
  const bWon = completed && match.winnerTeamId === match.teamBId;

  const handleUndo = async () => {
    if (!onRollback) {
      return;
    }
    setSaving(true);
    try {
      const err = await onRollback(match.id);
      if (err) {
        showToast(err, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

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
    try {
      const err = await onRecord(match.id, a, b);
      if (err) {
        showToast(err, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {match.gameType && <Chip size="small" label={match.gameType} sx={{ mr: 1 }} />}
        <Box sx={{ flexGrow: 1 }} />
        <Chip
          size="small"
          variant="outlined"
          color={completed ? 'success' : 'default'}
          label={completed ? 'Final' : 'Pending'}
        />
      </Box>

      <Stack spacing={0.5}>
        <Box sx={{ display: 'flex' }}>
          <Typography sx={{ flexGrow: 1, fontWeight: aWon ? 700 : 400 }}>{teamAName}</Typography>
          {completed && <Typography sx={{ fontWeight: aWon ? 700 : 400 }}>{match.teamAScore}</Typography>}
        </Box>
        <Box sx={{ display: 'flex' }}>
          <Typography sx={{ flexGrow: 1, fontWeight: bWon ? 700 : 400 }}>{teamBName}</Typography>
          {completed && <Typography sx={{ fontWeight: bWon ? 700 : 400 }}>{match.teamBScore}</Typography>}
        </Box>
      </Stack>

      {canManage && !completed && ready && (
        <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            type="number"
            label={teamAName}
            value={scoreA}
            onChange={(e) => setScoreA(e.target.value)}
            sx={{ width: 90 }}
          />
          <TextField
            size="small"
            type="number"
            label={teamBName}
            value={scoreB}
            onChange={(e) => setScoreB(e.target.value)}
            sx={{ width: 90 }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleSubmit}
            disabled={saving || scoreA === '' || scoreB === ''}
            // tie is validated on submit so the user gets a toast
          >
            Save
          </Button>
        </Box>
      )}

      {canManage && completed && ready && allowRollback && onRollback && (
        <Box sx={{ mt: 1.5 }}>
          <Button
            size="small"
            color="inherit"
            startIcon={<UndoIcon fontSize="small" />}
            disabled={saving}
            onClick={handleUndo}
          >
            Undo
          </Button>
        </Box>
      )}
    </Paper>
  );
}

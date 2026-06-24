import { Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import type { Match } from '../../types/tournament';

interface Props {
  match: Match;
  canManage: boolean;
  onRecord: (matchId: string, teamAScore: number, teamBScore: number) => Promise<void>;
}

export function MatchCard({ match, canManage, onRecord }: Props) {
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');
  const [saving, setSaving] = useState(false);

  const teamAName = match.teamA?.name ?? 'TBD';
  const teamBName = match.teamB?.name ?? 'TBD';
  const completed = match.status === 'completed';
  const ready = Boolean(match.teamAId && match.teamBId);

  const aWon = completed && match.winnerTeamId === match.teamAId;
  const bWon = completed && match.winnerTeamId === match.teamBId;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onRecord(match.id, Number(scoreA), Number(scoreB));
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
          >
            Save
          </Button>
        </Box>
      )}
    </Paper>
  );
}

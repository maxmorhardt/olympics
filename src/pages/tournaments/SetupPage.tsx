import GroupsIcon from '@mui/icons-material/Groups';
import { Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addParticipants, generateTeams } from '../../features/tournaments/tournamentsThunks';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { useTournament } from '../../hooks/useTournament';
import { stripDangerousChars } from '../../utils/sanitize';

export default function SetupPage() {
  const { id = '' } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tournament, canManage, busy, runAction } = useTournament(id);

  const [names, setNames] = useState('');

  const participants = tournament?.participants ?? [];

  const handleAdd = () => {
    const parsed = names
      .split(/[\n,]/)
      .map((n) => stripDangerousChars(n).trim())
      .filter(Boolean);
    if (parsed.length === 0) {
      return;
    }
    setNames('');
    runAction(dispatch(addParticipants({ id, names: parsed })));
  };

  const handleGenerate = async () => {
    const ok = await runAction(dispatch(generateTeams(id)));
    if (ok) {
      navigate(`/tournaments/${id}/teams`);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Participants ({participants.length})
      </Typography>

      {participants.length === 0 ? (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          No participants yet.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, justifyContent: 'center' }}>
          {participants.map((p) => (
            <Chip key={p.id} label={p.name} />
          ))}
        </Box>
      )}

      {canManage && (
        <Paper variant="outlined" sx={{ p: 2, width: '100%', maxWidth: 480 }}>
          <TextField
            label="Add names (one per line or comma separated)"
            multiline
            minRows={3}
            fullWidth
            value={names}
            onChange={(e) => setNames(e.target.value)}
          />
          <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
            <Button variant="outlined" disabled={busy} onClick={handleAdd}>
              Add Participants
            </Button>
            <Button
              variant="contained"
              startIcon={<GroupsIcon />}
              disabled={busy || participants.length < 2}
              onClick={handleGenerate}
            >
              Generate Teams
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Need at least 2 participants. Teams are random pairs.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

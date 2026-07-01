import GroupsIcon from '@mui/icons-material/Groups';
import { Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addParticipants, generateTeams } from '../../features/tournaments/tournamentsThunks';
import { useToast } from '../../components/toast/toastContext';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { useTournament } from '../../hooks/useTournament';
import { stripDangerousChars } from '../../utils/sanitize';

export default function SetupPage() {
  const { id = '' } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const showToast = useToast();
  const { tournament, canManage, busy, runAction } = useTournament(id);

  const [names, setNames] = useState('');

  const participants = tournament?.participants ?? [];

  const handleAdd = async () => {
    const parsed = names
      .split(/[\n,]/)
      .map((n) => stripDangerousChars(n).trim())
      .filter(Boolean);
    if (parsed.length === 0) {
      return;
    }
    setNames('');
    const err = await runAction(dispatch(addParticipants({ id, names: parsed })));
    if (err) {
      showToast(err, 'error');
    }
  };

  const handleGenerate = async () => {
    const err = await runAction(dispatch(generateTeams(id)));
    if (err) {
      showToast(err, 'error');
      return;
    }
    navigate(`/tournaments/${id}/teams`);
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

      {canManage && tournament?.status === 'setup' && (
        <Paper variant="outlined" sx={{ p: 2, width: '100%', maxWidth: 480 }}>
          <TextField
            label="Participants"
            placeholder="Add names, one per line or comma separated"
            multiline
            minRows={3}
            fullWidth
            value={names}
            onChange={(e) => setNames(e.target.value)}
          />
          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              disabled={busy}
              onClick={handleAdd}
              sx={{ flex: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}
            >
              Add Participants
            </Button>
            <Button
              variant="contained"
              startIcon={<GroupsIcon />}
              disabled={busy || participants.length < 2}
              onClick={handleGenerate}
              sx={{
                flex: 1,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                whiteSpace: 'nowrap',
                '& .MuiButton-startIcon': { display: { xs: 'none', sm: 'inherit' } },
              }}
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

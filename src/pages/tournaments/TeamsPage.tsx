import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ReplayIcon from '@mui/icons-material/Replay';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { popIn } from '../../components/landing/animations';
import {
  generateGroups,
  swapPlayers,
  updateTeam,
} from '../../features/tournaments/tournamentsThunks';
import { useToast } from '../../components/toast/toastContext';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { useTournament } from '../../hooks/useTournament';
import { stripDangerousChars } from '../../utils/sanitize';

const REVEAL_INTERVAL_MS = 650;

export default function TeamsPage() {
  const { id = '' } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const showToast = useToast();
  const { tournament, canManage, busy, runAction } = useTournament(id);

  const teams = useMemo(() => tournament?.teams ?? [], [tournament]);
  const isRevealStage = tournament?.status === 'teams_generated';

  const [revealed, setRevealed] = useState(0);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [swapA, setSwapA] = useState('');
  const [swapB, setSwapB] = useState('');

  useEffect(() => {
    setRevealed(isRevealStage ? 0 : teams.length);
  }, [tournament?.id, isRevealStage, teams.length]);

  useEffect(() => {
    if (!isRevealStage || revealed >= teams.length) {
      return;
    }
    const t = setTimeout(() => setRevealed((n) => n + 1), REVEAL_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [isRevealStage, revealed, teams.length]);

  const done = revealed >= teams.length;

  const players = useMemo(
    () =>
      teams.flatMap((t) =>
        (t.members ?? []).map((m) => ({ id: m.id, label: `${m.name} (${t.name})`, teamId: t.id }))
      ),
    [teams]
  );

  const handleSaveTeamName = (teamId: string) => {
    const name = stripDangerousChars(editValue).trim();
    if (!name) {
      return;
    }
    setEditingTeamId(null);
    runAction(dispatch(updateTeam({ id, teamId, name })));
  };

  const handleSwap = async () => {
    const a = players.find((p) => p.id === swapA);
    const b = players.find((p) => p.id === swapB);
    if (!a || !b || a.teamId === b.teamId) {
      return;
    }
    const ok = await runAction(
      dispatch(swapPlayers({ id, participantAId: swapA, participantBId: swapB }))
    );
    if (ok) {
      setSwapA('');
      setSwapB('');
      showToast('Players swapped', 'success');
    }
  };

  const handleGenerateGroups = async () => {
    const ok = await runAction(dispatch(generateGroups(id)));
    if (ok) {
      navigate(`/tournaments/${id}/groups`);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {isRevealStage && !done ? 'Revealing teams...' : `${teams.length} Teams`}
        </Typography>
        {isRevealStage && done && (
          <Button size="small" startIcon={<ReplayIcon />} onClick={() => setRevealed(0)}>
            Replay
          </Button>
        )}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 2,
        }}
      >
        {teams.slice(0, revealed).map((team, idx) => {
          const isLatest = idx === revealed - 1 && isRevealStage && !done;
          const editing = editingTeamId === team.id;
          return (
            <Paper
              key={team.id}
              elevation={isLatest ? 8 : 1}
              sx={{
                p: 2,
                animation: isRevealStage ? `${popIn} 0.5s ease both` : undefined,
                border: '1px solid',
                borderColor: isLatest ? 'primary.main' : 'transparent',
                boxShadow: isLatest ? '0 0 24px 2px rgba(245,166,35,0.45)' : undefined,
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                <EmojiEventsIcon fontSize="small" sx={{ color: 'primary.main' }} />
                {editing ? (
                  <>
                    <TextField
                      size="small"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      fullWidth
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveTeamName(team.id)}
                    />
                    <IconButton size="small" color="primary" onClick={() => handleSaveTeamName(team.id)}>
                      <CheckIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setEditingTeamId(null)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Typography sx={{ fontWeight: 700, flexGrow: 1 }}>{team.name}</Typography>
                    {canManage && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingTeamId(team.id);
                          setEditValue(team.name);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                  </>
                )}
              </Stack>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {team.members?.map((m) => m.name).join(' & ') || 'No members'}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      {/* swap players (only before groups are drawn) */}
      {canManage && isRevealStage && done && players.length >= 2 && (
        <Paper variant="outlined" sx={{ p: 2, mt: 4, maxWidth: 640, mx: 'auto' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Swap Players
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
            <TextField
              select
              label="Player A"
              size="small"
              value={swapA}
              onChange={(e) => setSwapA(e.target.value)}
              sx={{ minWidth: 200, flex: 1 }}
            >
              {players.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.label}
                </MenuItem>
              ))}
            </TextField>
            <SwapHorizIcon color="primary" />
            <TextField
              select
              label="Player B"
              size="small"
              value={swapB}
              onChange={(e) => setSwapB(e.target.value)}
              sx={{ minWidth: 200, flex: 1 }}
            >
              {players.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.label}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              disabled={busy || !swapA || !swapB || swapA === swapB}
              onClick={handleSwap}
            >
              Swap
            </Button>
          </Stack>
        </Paper>
      )}

      {canManage && isRevealStage && done && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" disabled={busy} onClick={handleGenerateGroups}>
            Generate Groups
          </Button>
        </Box>
      )}
    </Box>
  );
}

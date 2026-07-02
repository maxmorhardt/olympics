import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GroupsIcon from '@mui/icons-material/Groups';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../components/toast/toastContext';
import {
  addParticipant,
  addParticipants,
  deleteParticipant,
  generateTeams,
  updateParticipant,
} from '../../features/tournaments/tournamentsThunks';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { useTournament } from '../../hooks/useTournament';
import type { Participant } from '../../types/tournament';
import { stripDangerousChars } from '../../utils/sanitize';

type PendingAction =
  | { type: 'add'; name: string }
  | { type: 'delete'; participant: Participant };

export default function SetupPage() {
  const { id = '' } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const showToast = useToast();
  const { tournament, canManage, busy, runAction } = useTournament(id);

  const [names, setNames] = useState('');
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [pending, setPending] = useState<PendingAction | null>(null);

  const participants = tournament?.participants ?? [];
  const isSetup = tournament?.status === 'setup';

  const handleBulkAdd = async () => {
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

  const handleSaveName = async (participantId: string) => {
    const name = stripDangerousChars(editValue).trim();
    if (!name) {
      return;
    }
    setEditingId(null);
    const err = await runAction(dispatch(updateParticipant({ id, participantId, name })));
    if (err) {
      showToast(err, 'error');
    }
  };

  // adding or removing a player after teams exist rewrites the roster, so confirm first
  const requestAdd = () => {
    const name = stripDangerousChars(newName).trim();
    if (!name) {
      return;
    }
    if (isSetup) {
      void runSingleAdd(name);
      return;
    }
    setPending({ type: 'add', name });
  };

  const requestDelete = (participant: Participant) => {
    if (isSetup) {
      void runDelete(participant.id);
      return;
    }
    setPending({ type: 'delete', participant });
  };

  const runSingleAdd = async (name: string) => {
    setNewName('');
    const err = await runAction(dispatch(addParticipant({ id, name })));
    if (err) {
      showToast(err, 'error');
    }
  };

  const runDelete = async (participantId: string) => {
    const err = await runAction(dispatch(deleteParticipant({ id, participantId })));
    if (err) {
      showToast(err, 'error');
    }
  };

  const confirmPending = async () => {
    if (!pending) {
      return;
    }
    const action = pending;
    setPending(null);
    if (action.type === 'add') {
      await runSingleAdd(action.name);
    } else {
      await runDelete(action.participant.id);
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
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            mb: 3,
            justifyContent: 'center',
            maxWidth: 640,
          }}
        >
          {participants.map((p) => {
            const editing = editingId === p.id;
            return (
              <Paper
                key={p.id}
                variant="outlined"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  pl: 1.75,
                  pr: canManage && !editing ? 0.75 : 1.75,
                  py: 0.5,
                  borderRadius: 999,
                }}
              >
                {editing ? (
                  <>
                    <TextField
                      variant="standard"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName(p.id)}
                      sx={{ width: 120 }}
                    />
                    <IconButton size="small" color="primary" onClick={() => handleSaveName(p.id)}>
                      <CheckIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setEditingId(null)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Typography sx={{ fontWeight: 500, mr: canManage ? 1 : 0 }}>{p.name}</Typography>
                    {canManage && (
                      <>
                        <IconButton
                          size="small"
                          color="info"
                          aria-label="Edit name"
                          sx={{ p: 0.375 }}
                          onClick={() => {
                            setEditingId(p.id);
                            setEditValue(p.name);
                          }}
                        >
                          <EditIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          aria-label="Remove participant"
                          sx={{ p: 0.375 }}
                          disabled={busy}
                          onClick={() => requestDelete(p)}
                        >
                          <DeleteIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </>
                    )}
                  </>
                )}
              </Paper>
            );
          })}
        </Box>
      )}

      {/* initial bulk entry while still in setup */}
      {canManage && isSetup && (
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
              onClick={handleBulkAdd}
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

      {/* single add once teams have already been drawn */}
      {canManage && !isSetup && tournament?.status !== 'finished' && (
        <Paper variant="outlined" sx={{ p: 2, width: '100%', maxWidth: 480 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <TextField
              label="Add a participant"
              size="small"
              fullWidth
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && requestAdd()}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled={busy || !newName.trim()}
              onClick={requestAdd}
            >
              Add
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Adding or removing a player reshuffles the roster and clears group and playoff progress.
          </Typography>
        </Paper>
      )}

      <Dialog open={Boolean(pending)} onClose={() => setPending(null)} fullWidth maxWidth="xs">
        <DialogTitle>{pending?.type === 'add' ? 'Add participant?' : 'Remove participant?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pending?.type === 'add'
              ? `Adding ${pending.name} rebuilds the teams and clears any group and playoff progress. This cannot be undone.`
              : `Removing ${pending?.type === 'delete' ? pending.participant.name : ''} rebuilds the teams and clears any group and playoff progress. This cannot be undone.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPending(null)}>Cancel</Button>
          <Button color="error" variant="contained" disabled={busy} onClick={confirmPending}>
            {pending?.type === 'add' ? 'Add and Reshuffle' : 'Remove and Reshuffle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

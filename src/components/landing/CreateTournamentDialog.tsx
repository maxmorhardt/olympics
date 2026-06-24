import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { createTournament } from '../../features/tournaments/tournamentsThunks';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { useToast } from '../../hooks/useToast';
import type { APIError } from '../../types/error';
import { stripDangerousChars } from '../../utils/sanitize';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}

export function CreateTournamentDialog({ open, onClose, onCreated }: Props) {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [teamsPerGroup, setTeamsPerGroup] = useState('4');
  const [advancePerGroup, setAdvancePerGroup] = useState('2');
  const [gameTypes, setGameTypes] = useState('Cornhole, Darts, Ladder Ball, Beer Pong');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      showToast('Tournament name is required', 'warning');
      return;
    }

    setSaving(true);
    try {
      const created = await dispatch(
        createTournament({
          name: stripDangerousChars(name).trim(),
          teamSize: 2,
          teamsPerGroup: Number(teamsPerGroup) || 4,
          advancePerGroup: Number(advancePerGroup) || 2,
          gameTypes: gameTypes
            .split(',')
            .map((g) => stripDangerousChars(g).trim())
            .filter(Boolean),
        })
      ).unwrap();

      showToast('The games have begun!', 'success');
      onCreated(created.id);
    } catch (err: unknown) {
      showToast((err as APIError)?.message ?? 'Failed to create tournament', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Start the Games</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="2026 Family Olympics"
            fullWidth
            autoFocus
          />
          <TextField
            label="Teams per group"
            type="number"
            value={teamsPerGroup}
            onChange={(e) => setTeamsPerGroup(e.target.value)}
            fullWidth
          />
          <TextField
            label="Teams advancing per group"
            type="number"
            value={advancePerGroup}
            onChange={(e) => setAdvancePerGroup(e.target.value)}
            fullWidth
          />
          <TextField
            label="Games (comma separated)"
            value={gameTypes}
            onChange={(e) => setGameTypes(e.target.value)}
            fullWidth
            helperText="Teams are random pairs. Games are cycled across matchups."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleCreate} disabled={saving}>
          {saving ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

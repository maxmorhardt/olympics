import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { createTournament } from '../../features/tournaments/tournamentsThunks';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { stripDangerousChars } from '../../utils/sanitize';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}

export function CreateTournamentDialog({ open, onClose, onCreated }: Props) {
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      return;
    }

    setSaving(true);
    try {
      const created = await dispatch(
        createTournament({ name: stripDangerousChars(name).trim() })
      ).unwrap();
      onCreated(created.id);
    } catch {
      // creation failed; leave the dialog open so the user can retry
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Start the Games</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="2026 Family Olympics"
          fullWidth
          autoFocus
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleCreate} disabled={saving || !name.trim()}>
          {saving ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

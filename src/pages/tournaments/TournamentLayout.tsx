import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Step,
  StepButton,
  Stepper,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChampionModal } from '../../components/tournament/ChampionModal';
import { ScorePopup, type ScoreEvent } from '../../components/tournament/ScorePopup';
import { deleteTournament, fetchTournamentBundle } from '../../features/tournaments/tournamentsThunks';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { useTournament } from '../../hooks/useTournament';
import { useTournamentSocket } from '../../hooks/useTournamentSocket';
import type { APIError } from '../../types/error';
import type { TournamentStatus } from '../../types/tournament';
import type { WSMessage } from '../../types/ws';
import { currentStagePath, reachedStageIndex, STAGES } from './stages';

export default function TournamentLayout() {
  const { id = '' } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { tournament: loaded, loading, canManage, bracket } = useTournament(id);
  
  const tournament = loaded && loaded.id === id ? loaded : null;

  const [scoreEvent, setScoreEvent] = useState<ScoreEvent | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [championDismissed, setChampionDismissed] = useState(false);
  const statusRef = useRef<TournamentStatus | null>(null);

  const champion = useMemo(() => {
    if (tournament?.status !== 'finished') {
      return null;
    }
    const final = bracket.find((m) => !m.nextMatchId && m.status === 'completed');
    if (!final?.winnerTeamId) {
      return null;
    }
    const team = tournament.teams?.find((t) => t.id === final.winnerTeamId);
    if (!team) {
      return null;
    }
    return { name: team.name, members: (team.members ?? []).map((m) => m.name) };
  }, [tournament, bracket]);

  useEffect(() => {
    setScoreEvent(null);
    setChampionDismissed(false);
    setConfirmDelete(false);
    statusRef.current = null;
  }, [id]);

  useEffect(() => {
    if (id) {
      dispatch(fetchTournamentBundle(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (tournament) {
      statusRef.current = tournament.status;
    }
  }, [tournament]);

  const onMessage = useCallback(
    (msg: WSMessage) => {
      if (msg.type === 'tournament_deleted') {
        navigate('/');
        return;
      }

      dispatch(fetchTournamentBundle(id));

      if (msg.type === 'score_recorded' && msg.score) {
        const isFinal = msg.status != null && msg.status === 'finished';
        if (!isFinal) {
          setScoreEvent({ ...msg.score, key: Date.now() });
        }
      }

      if (msg.status && msg.status !== statusRef.current) {
        statusRef.current = msg.status;
        navigate(`/tournaments/${id}/${currentStagePath(msg.status)}`);
      }
    },
    [dispatch, id, navigate]
  );

  useTournamentSocket(id, onMessage);

  const handleDelete = async () => {
    setDeleteError(null);
    try {
      await dispatch(deleteTournament(id)).unwrap();
      navigate('/');
    } catch (err: unknown) {
      setDeleteError((err as APIError)?.message ?? 'Failed to delete tournament');
    }
  };

  if (loading && !tournament) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!tournament) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Tournament not found.</Typography>
      </Container>
    );
  }

  const reached = reachedStageIndex(tournament.status);
  const currentSegment = location.pathname.split('/').pop();
  const activeStep = Math.max(
    0,
    STAGES.findIndex((s) => s.path === currentSegment)
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, fontSize: { xs: '1.6rem', sm: '2.125rem' } }}
        >
          {tournament.name}
        </Typography>
        <Chip label={statusLabel(tournament.status)} color="primary" variant="outlined" />
        <Box sx={{ flexGrow: 1 }} />
        {canManage && (
          <IconButton color="error" onClick={() => setConfirmDelete(true)} aria-label="Delete tournament">
            <DeleteIcon />
          </IconButton>
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Organized by {tournament.createdBy || 'unknown'}
      </Typography>

      <Stepper
        nonLinear
        activeStep={activeStep}
        alternativeLabel
        sx={{
          mb: { xs: 3, sm: 4 },
          '& .MuiStepLabel-label': { fontSize: { xs: '0.7rem', sm: '0.875rem' }, mt: { xs: 0.5, sm: 1 } },
          '& .MuiStepIcon-root': { fontSize: { xs: '1.35rem', sm: '1.75rem' } },
        }}
      >
        {STAGES.map((stage, idx) => (
          <Step key={stage.key} completed={idx < reached}>
            <StepButton
              color="inherit"
              disabled={idx > reached}
              onClick={() => navigate(`/tournaments/${id}/${stage.path}`)}
            >
              {stage.label}
            </StepButton>
          </Step>
        ))}
      </Stepper>

      <Outlet />

      <ScorePopup event={scoreEvent} />

      <ChampionModal
        open={Boolean(champion) && !championDismissed}
        championName={champion?.name ?? ''}
        members={champion?.members ?? []}
        onClose={() => setChampionDismissed(true)}
      />

      <Dialog
        open={confirmDelete}
        onClose={() => {
          setConfirmDelete(false);
          setDeleteError(null);
        }}
      >
        <DialogTitle>Delete this tournament?</DialogTitle>
        <DialogContent>
          <Typography>
            This permanently removes {tournament.name}, including all teams, games, and results.
          </Typography>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmDelete(false);
              setDeleteError(null);
            }}
          >
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

function statusLabel(status: string): string {
  const s = status.replace('_', ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

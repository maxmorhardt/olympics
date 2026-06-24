import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import { CreateTournamentDialog } from '../../components/landing/CreateTournamentDialog';
import { Emblem } from '../../components/landing/Emblem';
import { FloatingIcons } from '../../components/landing/FloatingIcons';
import { fadeInUp, gradientShift, shimmer } from '../../components/landing/animations';
import {
  selectTournaments,
  selectTournamentsLoading,
} from '../../features/tournaments/tournamentsSelectors';
import { fetchTournaments } from '../../features/tournaments/tournamentsThunks';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import type { Tournament } from '../../types/tournament';
import { isOlympicsAdmin } from '../../utils/oidcHelpers';

const DEFAULT_GAMES = ['Cornhole', 'Darts', 'Ladder Ball', 'Beer Pong'];

export default function LandingPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAuth();

  const tournaments = useAppSelector(selectTournaments);
  const loading = useAppSelector(selectTournamentsLoading);
  const [createOpen, setCreateOpen] = useState(false);

  const isAdmin = isOlympicsAdmin(auth.user);

  useEffect(() => {
    dispatch(fetchTournaments());
  }, [dispatch]);

  const latest: Tournament | null = tournaments[0] ?? null;
  const active = latest && latest.status !== 'finished' ? latest : null;
  const finished = latest && latest.status === 'finished' ? latest : null;

  const games = useMemo(() => {
    if (active?.gameTypes?.length) {
      return active.gameTypes;
    }
    return DEFAULT_GAMES;
  }, [active]);

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: 'calc(100dvh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 8,
        background: 'linear-gradient(120deg, #120f0a 0%, #1f1813 35%, #2a1c10 50%, #1f1813 65%, #120f0a 100%)',
        backgroundSize: '300% 300%',
        animation: `${gradientShift} 18s ease infinite`,
      }}
    >
      <FloatingIcons />

      <Stack spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1, maxWidth: 720 }}>
        <Box sx={{ animation: `${fadeInUp} 0.7s ease both` }}>
          <Emblem icon={finished ? '🥇' : '🏆'} />
        </Box>

        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            letterSpacing: '.05em',
            textAlign: 'center',
            fontSize: { xs: '2.5rem', md: '4rem' },
            backgroundImage: 'linear-gradient(90deg, #F5A623, #FFD27D, #FF7043, #F5A623)',
            backgroundSize: '200% auto',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            animation: `${shimmer} 5s linear infinite, ${fadeInUp} 0.7s ease both`,
            animationDelay: '0.1s',
          }}
        >
          THE OLYMPICS
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ textAlign: 'center', animation: `${fadeInUp} 0.7s ease both`, animationDelay: '0.2s' }}
        >
          {loading
            ? 'Loading the arena…'
            : active
              ? 'The games are live. Grab your partner and bring the heat.'
              : finished
                ? 'The champions have been crowned.'
                : 'Random teams. Backyard games. One champion. Let the games begin.'}
        </Typography>

        {/* state-dependent call to action */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            animation: `${fadeInUp} 0.7s ease both`,
            animationDelay: '0.3s',
          }}
        >
          {loading ? (
            <CircularProgress color="primary" />
          ) : active ? (
            <Paper
              sx={{
                p: 3,
                width: '100%',
                maxWidth: 480,
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'primary.main',
              }}
            >
              <Typography variant="overline" color="text.secondary">
                Now playing
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                {active.name}
              </Typography>
              <Button
                size="large"
                variant="contained"
                onClick={() => navigate(`/tournaments/${active.id}`)}
              >
                Enter the Arena
              </Button>
            </Paper>
          ) : finished ? (
            <Stack spacing={2} alignItems="center">
              <Button
                size="large"
                variant="contained"
                onClick={() => navigate(`/tournaments/${finished.id}`)}
              >
                View Results
              </Button>
              {isAdmin && (
                <Button variant="outlined" onClick={() => setCreateOpen(true)}>
                  Start New Games
                </Button>
              )}
            </Stack>
          ) : isAdmin ? (
            <Button size="large" variant="contained" onClick={() => setCreateOpen(true)}>
              Create the Games
            </Button>
          ) : auth.isAuthenticated ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
              No games scheduled yet. An organizer will kick things off soon — check back!
            </Typography>
          ) : (
            <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
              No games scheduled yet. Log in to follow along.
            </Typography>
          )}
        </Box>

        {/* games on the docket */}
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          justifyContent="center"
          useFlexGap
          sx={{ animation: `${fadeInUp} 0.7s ease both`, animationDelay: '0.4s' }}
        >
          {games.map((g) => (
            <Chip key={g} label={g} variant="outlined" color="primary" />
          ))}
        </Stack>
      </Stack>

      <CreateTournamentDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => {
          setCreateOpen(false);
          navigate(`/tournaments/${id}`);
        }}
      />
    </Box>
  );
}

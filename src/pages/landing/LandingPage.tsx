import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
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

const DEFAULT_GAMES = ['Darts', 'Bocce', 'Cornhole'];

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

  const games = DEFAULT_GAMES;

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: { xs: 3, md: 8 },
        background: 'linear-gradient(120deg, #120f0a 0%, #1f1813 35%, #2a1c10 50%, #1f1813 65%, #120f0a 100%)',
        backgroundSize: '300% 300%',
        animation: `${gradientShift} 18s ease infinite`,
      }}
    >
      <FloatingIcons />

      <Stack
        spacing={{ xs: 2, md: 4 }}
        sx={{ position: 'relative', zIndex: 1, maxWidth: 720, alignItems: 'center' }}
      >
        <Box sx={{ animation: `${fadeInUp} 0.7s ease both` }}>
          <Emblem icon={finished ? '🥇' : '🏆'} />
        </Box>

        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            letterSpacing: '.05em',
            textAlign: 'center',
            fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
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
          sx={{
            textAlign: 'center',
            fontSize: { xs: '0.95rem', md: '1.25rem' },
            animation: `${fadeInUp} 0.7s ease both`,
            animationDelay: '0.2s',
          }}
        >
          {loading
            ? 'Summoning the officials...'
            : active
              ? 'The Games are underway. Grown adults now stare down destiny, one beanbag at a time.'
              : finished
                ? 'It is finished. Champions have been crowned, and this lawn shall speak of them for generations.'
                : 'Behold the most hallowed backyard on Earth, where ordinary souls chase glory through darts, bocce, and cornhole. History is watching.'}
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
                p: { xs: 2, sm: 3 },
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
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, wordBreak: 'break-word' }}>
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
            <Stack spacing={2} sx={{ alignItems: 'center' }}>
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
          ) : (
            <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
              No games scheduled yet. Check back soon for the next event.
            </Typography>
          )}
        </Box>

        {/* games on the docket */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 1,
            animation: `${fadeInUp} 0.7s ease both`,
            animationDelay: '0.4s',
          }}
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

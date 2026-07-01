import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import { Box, Fade, Snackbar, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { bounceIn, floatY, popupGlow } from '../landing/animations';
import type { WSScore } from '../../types/ws';

export interface ScoreEvent extends WSScore {
  key: number;
}

const AUTO_HIDE_MS = 6000;

export function ScorePopup({ event }: { event: ScoreEvent | null }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ScoreEvent | null>(null);

  useEffect(() => {
    if (event) {
      setCurrent(event);
      setOpen(true);
    }
  }, [event]);

  if (!current) {
    return null;
  }

  const isPlayoff = current.stage === 'playoff';
  const winner = current.winnerName;
  const loser = winner === current.teamAName ? current.teamBName : current.teamAName;
  const winnerScore = Math.max(current.teamAScore, current.teamBScore);
  const loserScore = Math.min(current.teamAScore, current.teamBScore);

  return (
    <Snackbar
      open={open}
      autoHideDuration={AUTO_HIDE_MS}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      slots={{ transition: Fade }}
      sx={{ top: { xs: 80, sm: 96 } }}
    >
      <Box
        key={current.key}
        sx={{
          width: { xs: 340, sm: 460 },
          maxWidth: '92vw',
          p: 3.5,
          borderRadius: 4,
          textAlign: 'center',
          color: '#ffffff',
          background: 'linear-gradient(135deg, #2a1d09 0%, #140d04 100%)',
          border: '2px solid #F5A623',
          animation: `${bounceIn} 0.6s cubic-bezier(0.17, 0.89, 0.32, 1.28) both, ${popupGlow} 2.2s ease-in-out infinite`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ animation: `${floatY} 2.4s ease-in-out infinite`, display: 'flex' }}>
            {isPlayoff ? (
              <EmojiEventsIcon sx={{ color: '#FFD27D', fontSize: 30 }} />
            ) : (
              <SportsScoreIcon sx={{ color: '#FFD27D', fontSize: 28 }} />
            )}
          </Box>
          <Typography
            variant="overline"
            sx={{ fontWeight: 800, letterSpacing: '.18em', color: '#FFD27D' }}
          >
            {isPlayoff ? 'Playoff Result' : current.gameType || 'Result'}
          </Typography>
        </Box>

        <Typography
          sx={{
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.15,
            fontSize: isPlayoff ? { xs: '1.9rem', sm: '2.4rem' } : { xs: '1.5rem', sm: '1.9rem' },
            textShadow: '0 2px 18px rgba(255,112,67,0.55)',
          }}
        >
          {winner} beats {loser}
        </Typography>

        <Typography sx={{ mt: 1, fontWeight: 700, fontSize: '1.2rem', color: '#FFD27D' }}>
          ({winnerScore}, {loserScore})
        </Typography>
      </Box>
    </Snackbar>
  );
}

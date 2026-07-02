import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Box, Paper, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { fadeInUp, floatY, growUp, popIn, shimmer } from '../../components/landing/animations';
import { useTournament } from '../../hooks/useTournament';
import { computeResults, type PodiumEntry } from '../../utils/results';

const PLACE_META: Record<number, { medal: string; color: string; height: number; order: number }> = {
  1: { medal: '🥇', color: '#F5A623', height: 200, order: 2 },
  2: { medal: '🥈', color: '#C7CAD1', height: 150, order: 1 },
  3: { medal: '🥉', color: '#CD7F32', height: 110, order: 3 },
};

export default function ResultsPage() {
  const { id = '' } = useParams();
  const { tournament, bracket, matches, standings } = useTournament(id);

  const results = useMemo(
    () => computeResults(bracket, matches, standings, tournament?.teams ?? []),
    [bracket, matches, standings, tournament]
  );

  if (tournament?.status !== 'finished' || results.podium.length === 0) {
    return (
      <Typography color="text.secondary">
        The champions have not been crowned yet. Finish the playoffs to see the results.
      </Typography>
    );
  }

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ fontSize: { xs: 40, sm: 56 }, animation: `${fadeInUp} 0.6s ease both` }}>
        🎉🏆🎉
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 900,
          mb: 1,
          fontSize: { xs: '1.8rem', sm: '2.6rem' },
          backgroundImage: 'linear-gradient(90deg, #F5A623, #FFD27D, #FF7043, #F5A623)',
          backgroundSize: '200% auto',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          animation: `${shimmer} 5s linear infinite, ${fadeInUp} 0.6s ease both`,
        }}
      >
        The Games Are Won
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        History has been made. These names shall echo across the backyard forever.
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: { xs: 1, sm: 2 },
          mb: 5,
        }}
      >
        {results.podium.map((entry) => (
          <PodiumColumn key={entry.teamId} entry={entry} />
        ))}
      </Box>

      {results.stats.length > 0 && (
        <>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '.08em', mb: 2 }}>
            HALL OF FAME
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 2,
              maxWidth: 900,
              mx: 'auto',
            }}
          >
            {results.stats.map((s, i) => (
              <Paper
                key={s.label}
                variant="outlined"
                sx={{
                  p: 2,
                  textAlign: 'left',
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'center',
                  animation: `${fadeInUp} 0.5s ease both`,
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <Box sx={{ fontSize: 30 }}>{s.icon}</Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {s.label}
                  </Typography>
                  <Typography sx={{ fontWeight: 800 }} noWrap>
                    {s.teamName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.detail}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}

function PodiumColumn({ entry }: { entry: PodiumEntry }) {
  const meta = PLACE_META[entry.place];
  const isFirst = entry.place === 1;

  return (
    <Box sx={{ order: meta.order, width: { xs: 100, sm: 150 }, maxWidth: '32%' }}>
      <Box
        sx={{
          fontSize: { xs: 30, sm: 40 },
          animation: isFirst ? `${floatY} 3s ease-in-out infinite` : undefined,
        }}
      >
        {meta.medal}
      </Box>
      <Typography
        sx={{ fontWeight: 800, fontSize: { xs: '0.85rem', sm: '1rem' }, lineHeight: 1.2 }}
        noWrap
      >
        {entry.teamName}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mb: 1, minHeight: 16, px: 0.5, wordBreak: 'break-word' }}
      >
        {entry.members.join(' & ')}
      </Typography>
      <Box
        sx={{
          height: { xs: meta.height * 0.7, sm: meta.height },
          borderRadius: '8px 8px 0 0',
          background: `linear-gradient(180deg, ${meta.color}, rgba(0,0,0,0.2))`,
          border: '1px solid rgba(255,255,255,0.15)',
          borderBottom: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformOrigin: 'bottom',
          animation: `${growUp} 0.7s cubic-bezier(0.17,0.89,0.32,1.28) both`,
          animationDelay: `${(4 - entry.place) * 0.15}s`,
          boxShadow: isFirst ? '0 0 30px 2px rgba(245,166,35,0.5)' : undefined,
        }}
      >
        <Box sx={{ animation: `${popIn} 0.5s ease both`, animationDelay: '0.6s' }}>
          {isFirst ? (
            <EmojiEventsIcon sx={{ fontSize: { xs: 36, sm: 52 }, color: '#1a1207' }} />
          ) : (
            <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.6rem', sm: '2.2rem' }, color: '#1a1207' }}>
              {entry.place}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

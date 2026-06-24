import { Box } from '@mui/material';
import { useMemo } from 'react';
import { rise } from './animations';

const ICONS = ['🏆', '🥇', '🎯', '🌽', '🍺', '🔥', '🏅', '🎲'];

interface Floater {
  icon: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
}

// drifting game emojis behind the hero content
export function FloatingIcons({ count = 14 }: { count?: number }) {
  const floaters = useMemo<Floater[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        icon: ICONS[i % ICONS.length],
        left: Math.random() * 100,
        size: 18 + Math.random() * 26,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 8,
      })),
    [count]
  );

  return (
    <Box
      aria-hidden
      sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}
    >
      {floaters.map((f, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            bottom: -40,
            left: `${f.left}%`,
            fontSize: f.size,
            animation: `${rise} ${f.duration}s linear ${f.delay}s infinite`,
            filter: 'saturate(1.2)',
          }}
        >
          {f.icon}
        </Box>
      ))}
    </Box>
  );
}

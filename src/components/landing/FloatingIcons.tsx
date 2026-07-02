import { Box } from '@mui/material';
import { useMemo } from 'react';
import { rise } from './animations';

const ICONS = ['🏆', '🥇', '🎯', '🌽', '🎲', '🔥', '🏅', '🎉'];

interface Floater {
  icon: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
}

export function FloatingIcons({ count = 22 }: { count?: number }) {
  const floaters = useMemo<Floater[]>(
    () =>
      Array.from({ length: count }, (_, i) => {
        const duration = 24 + ((i * 5) % 14);
        const fraction = (i + 0.5) / count;
        return {
          icon: ICONS[i % ICONS.length],
          left: (i * 41 + 7) % 100,
          size: 22 + ((i * 13) % 30),
          duration,
          // negative delay starts the icon partway up, distributing the field
          delay: -(fraction * duration),
        };
      }),
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
            bottom: 0,
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

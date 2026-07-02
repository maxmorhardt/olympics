import { Box } from '@mui/material';
import { floatY, glowPulse, spin } from './animations';

export function Emblem({ icon = '🏆' }: { icon?: string }) {
  return (
    <Box sx={{ animation: `${floatY} 5s ease-in-out infinite`, display: 'inline-block' }}>
      <Box
        sx={{
          position: 'relative',
          width: { xs: 112, sm: 160 },
          height: { xs: 112, sm: 160 },
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: `${glowPulse} 3.5s ease-in-out infinite`,
          // rotating conic gold ring
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            background:
              'conic-gradient(from 0deg, #F5A623, #FF7043, #FFD27D, #F5A623)',
            animation: `${spin} 8s linear infinite`,
            zIndex: 0,
          },
          // dark inner disc
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 6,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 35%, #2a241a 0%, #141009 100%)',
            zIndex: 1,
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2, fontSize: { xs: 50, sm: 72 }, lineHeight: 1 }}>
          {icon}
        </Box>
      </Box>
    </Box>
  );
}

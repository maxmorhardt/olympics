import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Box, Button, Dialog, Typography } from '@mui/material';
import { bounceIn, floatY, popupGlow, shimmer } from '../landing/animations';

interface Props {
  open: boolean;
  championName: string;
  members: string[];
  onClose: () => void;
}

export function ChampionModal({ open, championName, members, onClose }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            overflow: 'visible',
            textAlign: 'center',
            p: { xs: 3, sm: 5 },
            color: '#fff',
            background: 'radial-gradient(circle at 50% 30%, #2a1d09 0%, #120c04 100%)',
            border: '2px solid #F5A623',
            animation: `${bounceIn} 0.7s cubic-bezier(0.17, 0.89, 0.32, 1.28) both, ${popupGlow} 2.4s ease-in-out infinite`,
          },
        },
      }}
    >
      <Box sx={{ fontSize: 56, mb: 1 }}>🎉🏆🎉</Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <EmojiEventsIcon
          sx={{ fontSize: 96, color: '#FFD27D', animation: `${floatY} 3s ease-in-out infinite` }}
        />
      </Box>

      <Typography
        variant="overline"
        sx={{ fontWeight: 800, letterSpacing: '.25em', color: '#FFD27D' }}
      >
        Olympic Champions
      </Typography>

      <Typography
        sx={{
          fontWeight: 900,
          fontSize: { xs: '2.4rem', sm: '3.2rem' },
          lineHeight: 1.1,
          my: 1,
          backgroundImage: 'linear-gradient(90deg, #F5A623, #FFD27D, #FF7043, #F5A623)',
          backgroundSize: '200% auto',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          animation: `${shimmer} 4s linear infinite`,
        }}
      >
        {championName}
      </Typography>

      {members.length > 0 && (
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem', mb: 0.5 }}>
          {members.join(' & ')}
        </Typography>
      )}

      <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
        Champions of the Games. Immortalized.
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={onClose}
        sx={{ background: '#F5A623', color: '#1a1207', fontWeight: 800, px: 4 }}
      >
        Let the celebration begin
      </Button>
    </Dialog>
  );
}

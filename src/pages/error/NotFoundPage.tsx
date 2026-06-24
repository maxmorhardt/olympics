import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minHeight: '60vh',
        textAlign: 'center',
      }}
    >
      <Typography variant="h2" sx={{ fontWeight: 700 }}>
        404
      </Typography>
      <Typography color="text.secondary">This page could not be found.</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Back to tournaments
      </Button>
    </Box>
  );
}

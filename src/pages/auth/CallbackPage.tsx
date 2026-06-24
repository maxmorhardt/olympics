import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';

export default function CallbackPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (auth.isLoading) {
      return;
    }

    const redirectPath = sessionStorage.getItem('auth_redirect_path') || '/';
    sessionStorage.removeItem('auth_redirect_path');

    if (auth.isAuthenticated) {
      navigate(redirectPath, { replace: true });
      return;
    }

    if (auth.error) {
      showToast('Authentication failed. Please try again', 'error');
      navigate('/', { replace: true });
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.error, navigate, showToast]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minHeight: '60vh',
      }}
    >
      <CircularProgress color="primary" />
      <Typography>Signing you in…</Typography>
    </Box>
  );
}

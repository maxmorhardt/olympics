import { Box } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useAuth } from 'react-oidc-context';
import { Outlet } from 'react-router-dom';
import Header from './components/header/Header';
import { useAxiosAuth } from './hooks/useAxiosAuth';
import { gradients } from './theme';

export default function App() {
  useAxiosAuth();

  const auth = useAuth();
  const hasAttemptedSilentSignin = useRef(false);

  useEffect(() => {
    if (
      auth.isAuthenticated ||
      auth.isLoading ||
      !auth.user?.refresh_token ||
      hasAttemptedSilentSignin.current
    ) {
      return;
    }

    hasAttemptedSilentSignin.current = true;
    auth.signinSilent().catch(() => {});
  }, [auth]);

  return (
    <Box
      sx={{
        background: gradients.background,
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header />
      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
}

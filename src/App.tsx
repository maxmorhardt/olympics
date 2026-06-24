import { Box } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useAuth } from 'react-oidc-context';
import { Outlet } from 'react-router-dom';
import Header from './components/header/Header';
import { ToastProvider } from './components/toast/ToastProvider';
import { useAxiosAuth } from './hooks/useAxiosAuth';
import { useToast } from './hooks/useToast';
import { gradients } from './theme';

export default function App() {
  useAxiosAuth();

  const auth = useAuth();
  const { showToast } = useToast();
  const hasAttemptedSilentSignin = useRef(false);

  // surface interactive sign-in failures
  useEffect(() => {
    if (!auth.isLoading && auth.error && auth.activeNavigator === undefined) {
      showToast('Authentication failed. Please try again', 'error');
    }
  }, [auth.error, auth.isLoading, auth.activeNavigator, showToast]);

  // silent signin on load if we have a refresh token but arent authenticated
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
    <>
      <ToastProvider />
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
    </>
  );
}

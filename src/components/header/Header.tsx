import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LogoutIcon from '@mui/icons-material/Logout';
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import { getUsername } from '../../utils/oidcHelpers';

export default function Header() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    sessionStorage.setItem('auth_redirect_path', window.location.pathname);
    auth.signinRedirect();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        background: 'rgba(18, 18, 18, 0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <Box
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <EmojiEventsIcon sx={{ color: 'primary.main', fontSize: { xs: 22, sm: 26 } }} />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontFamily: 'monospace',
                fontWeight: 800,
                letterSpacing: '.12em',
                color: 'primary.main',
                fontSize: { xs: '1.05rem', sm: '1.25rem' },
              }}
            >
              Olympics
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {auth.isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              <Typography
                variant="body2"
                noWrap
                sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600, color: 'text.secondary' }}
              >
                {getUsername(auth.user)}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<LogoutIcon />}
                onClick={() => auth.signoutSilent()}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Button variant="contained" color="primary" size="small" onClick={handleLogin}>
              Login
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

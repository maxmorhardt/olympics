import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LogoutIcon from '@mui/icons-material/Logout';
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import { gradients } from '../../theme';
import { getUsername } from '../../utils/oidcHelpers';

export default function Header() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    sessionStorage.setItem('auth_redirect_path', window.location.pathname);
    auth.signinRedirect();
  };

  const onGold = '#1a1207';

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ background: gradients.gold, color: onGold }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', flexGrow: 1 }}
            onClick={() => navigate('/')}
          >
            <EmojiEventsIcon sx={{ color: onGold }} />
            <Typography
              variant="h6"
              noWrap
              sx={{ fontFamily: 'monospace', fontWeight: 800, letterSpacing: '.1em', color: onGold }}
            >
              Olympics
            </Typography>
          </Box>

          {auth.isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography
                variant="body2"
                sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600, color: onGold }}
              >
                {getUsername(auth.user)}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={() => auth.signoutSilent()}
                sx={{
                  color: onGold,
                  borderColor: 'rgba(26,18,7,0.5)',
                  '&:hover': { borderColor: onGold, background: 'rgba(26,18,7,0.08)' },
                }}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              onClick={handleLogin}
              sx={{ background: '#1a1207', color: '#F5D7A1', '&:hover': { background: '#2a1f10' } }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

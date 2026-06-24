import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from '@mui/material';
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
    <AppBar position="static" color="transparent" enableColorOnDark elevation={0}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', flexGrow: 1 }}
            onClick={() => navigate('/')}
          >
            <EmojiEventsIcon sx={{ color: 'primary.main' }} />
            <Typography
              variant="h6"
              noWrap
              sx={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.1em' }}
            >
              Olympics
            </Typography>
          </Box>

          {auth.isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {getUsername(auth.user)}
              </Typography>
              <Button
                color="inherit"
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={() => auth.signoutSilent()}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Button color="primary" variant="contained" onClick={handleLogin}>
              Login
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

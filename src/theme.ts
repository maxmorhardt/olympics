import { createTheme } from '@mui/material';

// amber/gold dark theme, distinct from the blue (squares) and purple (maxstash) sites
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#F5A623',
      contrastText: '#1a1207',
    },
    secondary: {
      main: '#FF7043',
    },
    background: {
      default: '#121212',
      paper: '#1c1a16',
    },
  },
  shape: {
    borderRadius: 10,
  },
});

export const gradients = {
  background: 'linear-gradient(135deg, #121212 0%, #1f1a14 100%)',
  gold: 'linear-gradient(135deg, #F5A623 0%, #FF7043 100%)',
  card: 'linear-gradient(135deg, #1f1c17 0%, #17150f 100%)',
};

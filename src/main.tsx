import { CssBaseline, ThemeProvider } from '@mui/material';
import { WebStorageStateStore } from 'oidc-client-ts';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, type AuthProviderProps } from 'react-oidc-context';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { store } from './app/store';
import { ToastProvider } from './components/toast/ToastProvider';
import './index.css';
import CallbackPage from './pages/auth/CallbackPage';
import NotFoundPage from './pages/error/NotFoundPage';
import LandingPage from './pages/landing/LandingPage';
import BracketPage from './pages/tournaments/BracketPage';
import GroupsPage from './pages/tournaments/GroupsPage';
import ResultsPage from './pages/tournaments/ResultsPage';
import SetupPage from './pages/tournaments/SetupPage';
import StageRedirect from './pages/tournaments/StageRedirect';
import TeamsPage from './pages/tournaments/TeamsPage';
import TournamentLayout from './pages/tournaments/TournamentLayout';
import { theme } from './theme';

const oidcConfig: AuthProviderProps = {
  authority: 'https://login.maxstash.io/application/o/olympics/',
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID ?? 'Gty3sn0VrYjwt1FFEoUmuvpneaatjU9fTRNIUA2l',
  redirect_uri: import.meta.env.PROD
    ? 'https://olympics.maxstash.io/auth/callback'
    : 'http://localhost:3000/auth/callback',
  scope: 'openid profile email offline_access',
  userStore: new WebStorageStateStore({ store: window.localStorage }),
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        path: 'tournaments/:id',
        element: <TournamentLayout />,
        children: [
          { index: true, element: <StageRedirect /> },
          { path: 'setup', element: <SetupPage /> },
          { path: 'teams', element: <TeamsPage /> },
          { path: 'groups', element: <GroupsPage /> },
          { path: 'bracket', element: <BracketPage /> },
          { path: 'results', element: <ResultsPage /> },
        ],
      },
      { path: 'auth/callback', element: <CallbackPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AuthProvider {...oidcConfig}>
          <CssBaseline />
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>
);

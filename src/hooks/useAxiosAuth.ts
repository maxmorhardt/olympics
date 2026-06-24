import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { setupAxiosInterceptors } from '../axios/api';

// keeps the shared axios instance in sync with the current OIDC token; public
// GET routes still work when signed out (no auth header is attached)
export const useAxiosAuth = () => {
  const auth = useAuth();

  useEffect(() => {
    setupAxiosInterceptors(auth.isAuthenticated ? auth.user : null);
  }, [auth.user, auth.isAuthenticated]);
};

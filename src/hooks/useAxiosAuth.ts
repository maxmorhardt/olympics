import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { setupAxiosInterceptors } from '../axios/api';

export const useAxiosAuth = () => {
  const auth = useAuth();

  useEffect(() => {
    setupAxiosInterceptors(auth.isAuthenticated ? auth.user : null);
  }, [auth.user, auth.isAuthenticated]);
};

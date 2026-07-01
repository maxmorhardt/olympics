import axios from 'axios';
import type { User } from 'oidc-client-ts';

const api = axios.create({
  baseURL: import.meta.env.PROD ? 'https://olympics-api.maxstash.io' : 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 10000,
});

export const setupAxiosInterceptors = (user: User | null | undefined) => {
  api.interceptors.request.clear();

  if (!user || !user.access_token) {
    return;
  }

  const accessToken = user.access_token;
  api.interceptors.request.use(
    (config) => {
      config.headers.Authorization = `Bearer ${accessToken}`;
      return config;
    },
    (error) => Promise.reject(error)
  );
};

export default api;

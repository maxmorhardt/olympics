import type { User } from 'oidc-client-ts';

export const OLYMPICS_ADMIN_GROUP = 'olympics-admin';

// true only when a stored session has a refresh token but an expired/missing access token
export const isSilentRefreshNeeded = (): boolean => {
  try {
    const key = Object.keys(localStorage).find((k) => k.startsWith('oidc.user:'));
    if (!key) {
      return false;
    }

    const raw = localStorage.getItem(key);
    if (!raw) {
      return false;
    }

    const stored = JSON.parse(raw) as { expires_at?: number; refresh_token?: string };
    if (!stored.refresh_token) {
      return false;
    }

    const nowSeconds = Date.now() / 1000;
    return stored.expires_at === undefined || stored.expires_at <= nowSeconds;
  } catch {
    return false;
  }
};

interface ProfileWithGroups {
  preferred_username?: string;
  groups?: string[];
}

export const getUsername = (user: User | null | undefined): string => {
  const profile = user?.profile as ProfileWithGroups | undefined;
  return profile?.preferred_username ?? '';
};

export const isOlympicsAdmin = (user: User | null | undefined): boolean => {
  const profile = user?.profile as ProfileWithGroups | undefined;
  return profile?.groups?.includes(OLYMPICS_ADMIN_GROUP) ?? false;
};

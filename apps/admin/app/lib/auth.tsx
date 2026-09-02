/**
 * Auth context. Loads the current session (/auth/me), stores the role + CSRF token. The shell
 * redirects to /login when unauthenticated. Role gates hide modules a role can't use.
 */
import type { UserRole } from '@filtervoda/shared';
import { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, setCsrfToken } from './api';

interface Me {
  userId: string;
  role: UserRole;
}

interface AuthState {
  me: Me | null;
  loading: boolean;
  setMe: (me: Me | null) => void;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<{ userId: string; role: UserRole; csrfToken: string }>('/auth/me')
      .then((data) => {
        setCsrfToken(data.csrfToken);
        setMe({ userId: data.userId, role: data.role });
      })
      .catch(() => setMe(null))
      .finally(() => setLoading(false));
  }, []);

  return <Ctx.Provider value={{ me, loading, setMe }}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth outside provider');
  return ctx;
}

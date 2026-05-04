'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  getMe,
  sendEmailOtp,
  verifyEmailOtp,
  type HeySaladUser,
  type Tier,
  type VerifyOtpInput,
} from '@/lib/heysalad-auth';

const TOKEN_STORAGE_KEY = 'heysalad.auth.token';

interface AuthContextValue {
  user: HeySaladUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithEmailOtp: (email: string) => Promise<void>;
  verifyEmailOtp: (input: VerifyOtpInput) => Promise<HeySaladUser>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
  tier: Tier;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<HeySaladUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const bootstrappedRef = useRef(false);

  // Bootstrap from localStorage on mount
  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    const stored = typeof window !== 'undefined'
      ? window.localStorage.getItem(TOKEN_STORAGE_KEY)
      : null;

    if (!stored) {
      setIsLoading(false);
      return;
    }

    setToken(stored);
    getMe(stored)
      .then(({ user: me }) => setUser(me))
      .catch(() => {
        // Token invalid/expired - clear it
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persistToken = useCallback((next: string | null) => {
    if (typeof window === 'undefined') return;
    if (next) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, next);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, []);

  const handleSignInWithEmailOtp = useCallback(async (email: string) => {
    await sendEmailOtp(email);
  }, []);

  const handleVerifyEmailOtp = useCallback(
    async (input: VerifyOtpInput) => {
      const res = await verifyEmailOtp(input);
      setToken(res.token);
      setUser(res.user);
      persistToken(res.token);
      return res.user;
    },
    [persistToken]
  );

  const signOut = useCallback(() => {
    setToken(null);
    setUser(null);
    persistToken(null);
  }, [persistToken]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const { user: me } = await getMe(token);
      setUser(me);
    } catch {
      signOut();
    }
  }, [token, signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      signInWithEmailOtp: handleSignInWithEmailOtp,
      verifyEmailOtp: handleVerifyEmailOtp,
      signOut,
      refreshUser,
      tier: user?.tier ?? 'free',
    }),
    [user, token, isLoading, handleSignInWithEmailOtp, handleVerifyEmailOtp, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

/**
 * Feature gating hook.
 * - free: basic chat + preview
 * - pro: STL downloads, higher CAD usage
 * - max: printer control, deep research
 */
export function useFeatureAccess() {
  const { tier, isAuthenticated } = useAuth();
  const tierRank: Record<Tier, number> = { free: 0, pro: 1, max: 2 };
  const rank = tierRank[tier];

  return {
    tier,
    isAuthenticated,
    canChat: true,
    canPreview3D: true,
    canDownloadSTL: rank >= 1,
    canUseCAD: rank >= 1,
    canControlPrinter: rank >= 2,
    canUseDeepResearch: rank >= 2,
    requires: (minTier: Tier) => rank >= tierRank[minTier],
  };
}

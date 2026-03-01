import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabaseBrowser } from '../../lib/supabase-browser';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** False when used outside AuthProvider (e.g. in a separate Astro island). */
  hasProvider: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const noAuthValue: AuthContextValue = {
  user: null,
  session: null,
  loading: false,
  hasProvider: false,
  signInWithGoogle: async () => {},
  signInWithOtp: async () => ({ error: new Error('Auth not available') }),
  signOut: async () => {},
  getAccessToken: () => null,
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  return ctx ?? noAuthValue;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = supabaseBrowser;
    if (!supabase) {
      setLoading(false);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getCallbackUrl = () => {
    if (typeof window === 'undefined') return '';
    const base = `${window.location.origin}/auth/callback`;
    const next = new URLSearchParams(window.location.search).get('next');
    return next ? `${base}?next=${encodeURIComponent(next)}` : base;
  };

  const signInWithGoogle = async () => {
    const supabase = supabaseBrowser;
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getCallbackUrl() },
    });
    if (error) throw error;
  };

  const signInWithOtp = async (email: string): Promise<{ error: Error | null }> => {
    const supabase = supabaseBrowser;
    if (!supabase)
      return { error: new Error('Supabase not configured') };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: getCallbackUrl() },
    });
    return { error: error ?? null };
  };

  const signOut = async () => {
    const supabase = supabaseBrowser;
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    window.location.href = '/';
  };

  const getAccessToken = (): string | null => session?.access_token ?? null;

  const value: AuthContextValue = {
    user,
    session,
    loading,
    hasProvider: true,
    signInWithGoogle,
    signInWithOtp,
    signOut,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

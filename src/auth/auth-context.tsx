import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { loadKeepUpSnapshot, type KeepUpSnapshot } from '@/data/keepup-repository';
import { getErrorMessage } from '@/lib/errors';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { useKeepUpStore } from '@/store/keepup-store';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  dataError?: string;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (displayName: string, email: string, password: string) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function fallbackSnapshot(user: User): KeepUpSnapshot {
  const metadataName = typeof user.user_metadata.display_name === 'string' ? user.user_metadata.display_name.trim() : '';
  return { profile: { displayName: metadataName || user.email?.split('@')[0] || 'My profile', showNotificationDetails: false, sourceRetention: 'ask', themeMode: 'light' }, categories: [], trackers: [], actions: [] };
}

function recoveryCode(url: string) {
  try { return new URL(url).searchParams.get('code'); }
  catch { return null; }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const supabase = getSupabaseClient();
  const hydrate = useKeepUpStore((state) => state.hydrate);
  const clearUserData = useKeepUpStore((state) => state.clearUserData);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const [readyUserId, setReadyUserId] = useState<string>();
  const [dataError, setDataError] = useState<string>();

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) setSession(nextSession);
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setDataError(getErrorMessage(error));
      setSession(data.session);
      setAuthLoading(false);
    });
    return () => { active = false; authListener.subscription.unsubscribe(); };
  }, [supabase]);

  useEffect(() => {
    if (!supabase || Platform.OS === 'web') return;
    if (AppState.currentState === 'active') void supabase.auth.startAutoRefresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void supabase.auth.startAutoRefresh();
      else void supabase.auth.stopAutoRefresh();
    });
    return () => { subscription.remove(); void supabase.auth.stopAutoRefresh(); };
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    const handleUrl = ({ url }: { url: string }) => {
      const code = recoveryCode(url);
      if (code) void supabase.auth.exchangeCodeForSession(code);
    };
    void Linking.getInitialURL().then((url) => { if (url) handleUrl({ url }); });
    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
  }, [supabase]);

  useEffect(() => {
    let active = true;
    if (!session?.user) {
      clearUserData();
      return () => { active = false; };
    }
    const user = session.user;
    hydrate(user.id, fallbackSnapshot(user));
    void loadKeepUpSnapshot(user.id)
      .then((snapshot) => { if (active) { hydrate(user.id, snapshot); setDataError(undefined); } })
      .catch((error) => { if (active) setDataError(getErrorMessage(error, 'Your account opened, but KeepUp could not load your saved data.')); })
      .finally(() => { if (active) setReadyUserId(user.id); });
    return () => { active = false; };
  }, [clearUserData, hydrate, session?.user]);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    isLoading: authLoading || Boolean(session?.user && readyUserId !== session.user.id),
    dataError,
    isConfigured: isSupabaseConfigured,
    signIn: async (email, password) => {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) throw error;
    },
    signUp: async (displayName, email, password) => {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { data, error } = await supabase.auth.signUp({ email: email.trim().toLowerCase(), password, options: { data: { display_name: displayName.trim() } } });
      if (error) throw error;
      return !data.session;
    },
    sendPasswordReset: async (email) => {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: Linking.createURL('/reset-password') });
      if (error) throw error;
    },
    updatePassword: async (password) => {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    signOut: async () => {
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  }), [authLoading, dataError, readyUserId, session, supabase]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}

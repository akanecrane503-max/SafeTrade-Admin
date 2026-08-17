import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('error'); // 'error' | 'pending'

  const loadAdminForSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setAdminUser(null);
      setSessionLoading(false);
      return;
    }
    const { data } = await supabase
      .from('admins')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (data && data.status === 'active') {
      setAdminUser(data);
    } else {
      // Session exists (e.g. a Google sign-in) but there's no matching
      // active admin row — reject and sign them back out.
      setAdminUser(null);
      if (!data) {
        setError('This account is not registered as an admin. Contact your main admin for access.');
        setErrorType('error');
      } else if (data.status === 'pending') {
        setError("Your account is awaiting approval from a main admin. You'll be able to sign in once it's approved.");
        setErrorType('pending');
      } else {
        setError('Your admin account has been suspended.');
        setErrorType('error');
      }
      await supabase.auth.signOut();
    }
    setSessionLoading(false);
  }, []);

  useEffect(() => {
    loadAdminForSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadAdminForSession();
    });
    return () => subscription.unsubscribe();
  }, [loadAdminForSession]);

  const signIn = useCallback(async (email, password) => {
    setError('');
    setErrorType('error');
    setSigningIn(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const { data: adminRow } = await supabase
        .from('admins')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!adminRow) {
        await supabase.auth.signOut();
        throw new Error('This account is not registered as an administrator.');
      }
      if (adminRow.status === 'pending') {
        await supabase.auth.signOut();
        setErrorType('pending');
        throw new Error("Your account is awaiting approval from a main admin. You'll be able to sign in once it's approved.");
      }
      if (adminRow.status !== 'active') {
        await supabase.auth.signOut();
        throw new Error('Your admin account has been suspended.');
      }

      // last_login is still null only on the very first successful sign-in —
      // i.e., this is their first login right after being approved.
      const justApproved = !adminRow.last_login;

      await supabase.rpc('touch_admin_last_login');
      setAdminUser(adminRow);
      return { ...adminRow, justApproved };
    } catch (err) {
      setError(err.message || 'Sign in failed');
      throw err;
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError('');
    setErrorType('error');
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/' },
    });
    if (oauthError) {
      setError(oauthError.message || 'Google sign-in failed');
      throw oauthError;
    }
    // Browser navigates away to Google here; the rest is handled by
    // onAuthStateChange + loadAdminForSession when it redirects back.
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setAdminUser(null);
  }, []);

  const value = { adminUser, sessionLoading, signingIn, error, errorType, signIn, signInWithGoogle, signOut };
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider.');
  return ctx;
}

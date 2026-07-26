import { useState, useCallback } from 'react';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../utils/constants';

// There is no backend yet, so sign-in is a local check against a single
// hardcoded admin account. Replace MAIN_ADMIN_PASSWORD with your own password
// before using this anywhere someone else could open dev tools and read it —
// this is not secure, it's just enough to gate the panel for now.
const MAIN_ADMIN_EMAIL = 'ascendextradefunction@gmail.com';
const MAIN_ADMIN_PASSWORD = '021821';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    setError('');
    try {
      // Small delay so the button's loading state is visible; there's no
      // real network call to wait on.
      await new Promise((resolve) => setTimeout(resolve, 400));

      const normalizedEmail = email.trim().toLowerCase();
      const isMatch =
        normalizedEmail === MAIN_ADMIN_EMAIL.toLowerCase() && password === MAIN_ADMIN_PASSWORD;

      if (!isMatch) {
        throw new Error('Invalid email or password');
      }

      const localToken = `local-${Date.now()}`;
      localStorage.setItem(AUTH_TOKEN_KEY, localToken);
      localStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify({ email: MAIN_ADMIN_EMAIL, role: 'main_admin', name: 'Main Admin' })
      );

      return { email: MAIN_ADMIN_EMAIL, role: 'main_admin' };
    } catch (err) {
      setError(err.message || 'Sign in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }, []);

  const getCurrentUser = useCallback(() => {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }, []);

  return { signIn, signOut, getCurrentUser, loading, error };
}

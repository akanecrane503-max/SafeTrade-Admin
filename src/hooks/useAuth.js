import { useAdminAuth } from '../context/AdminAuthContext.jsx';

export function useAuth() {
  const { signIn, signingIn, error } = useAdminAuth();
  return { signIn, loading: signingIn, error };
}

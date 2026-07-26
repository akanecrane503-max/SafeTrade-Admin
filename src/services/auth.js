import api from './api';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../utils/constants';

// Wraps auth-related API calls and local token/user persistence.
// Swap the endpoint paths for your real backend routes.
export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });

  if (data?.token) {
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  }
  if (data?.user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  }

  return data;
}

export async function requestPasswordReset(email) {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
}

export function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

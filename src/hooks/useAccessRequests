import { useState, useEffect, useCallback } from 'react';
import { getAccessRequests, ACCESS_REQUESTS_UPDATE_EVENT } from '../lib/accessRequests';

export function useAccessRequests() {
  const [requests, setRequests] = useState(() => getAccessRequests());

  const refresh = useCallback(() => setRequests(getAccessRequests()), []);

  useEffect(() => {
    window.addEventListener(ACCESS_REQUESTS_UPDATE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(ACCESS_REQUESTS_UPDATE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  return { requests, refresh };
}

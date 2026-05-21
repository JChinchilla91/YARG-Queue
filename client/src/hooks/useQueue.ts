import { useCallback, useEffect, useState } from 'react';
import { fetchQueue } from '../api/client';
import type { QueueState } from '../api/types';

export function useQueue(pollMs = 2000) {
  const [queue, setQueue] = useState<QueueState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchQueue();
      setQueue(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, pollMs);
    return () => window.clearInterval(id);
  }, [refresh, pollMs]);

  return { queue, error, loading, refresh };
}

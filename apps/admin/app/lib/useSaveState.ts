import { useCallback, useEffect, useRef, useState } from 'react';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Shared save-status helper for admin editors. `run(fn)` executes an async save, flips the
 * status saving → saved/error, and auto-clears `saved` after a short delay so every editor
 * shows the same „Се зачувува… / ✓ Зачувано / ✗ грешка" feedback (CLAUDE.md admin UX layer).
 */
export function useSaveState() {
  const [state, setState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const run = useCallback(async (fn: () => Promise<unknown>) => {
    if (timer.current) clearTimeout(timer.current);
    setState('saving');
    setError(null);
    try {
      await fn();
      setState('saved');
      timer.current = setTimeout(() => setState('idle'), 2500);
    } catch (e) {
      setError((e as Error).message || 'Грешка при зачувување');
      setState('error');
    }
  }, []);

  return { state, error, run };
}

import { useState, useEffect, useRef } from 'react';
import { getToken } from '@/api/modules/http';

export function useProjectLogo(logo: string | null | undefined): string | null {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const loadedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!logo) {
      loadedRef.current = null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setObjectUrl((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return null;
      });
      return;
    }

    if (logo === loadedRef.current) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch('/api/v1/projects/logo', {
          headers: { Authorization: `Bearer ${getToken()}` },
          signal: controller.signal,
        });
        if (!res.ok || cancelled) return;
        const blob = await res.blob();
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        if (cancelled) return;
        loadedRef.current = logo;
        setObjectUrl((prevUrl) => {
          if (prevUrl) URL.revokeObjectURL(prevUrl);
          return url;
        });
      } catch {
        // ignore abort errors
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [logo]);

  return !logo ? null : objectUrl;
}

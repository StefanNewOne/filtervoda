import { useEffect, useRef, useState } from 'react';

/**
 * Cloudflare Turnstile widget. Renders only when a site key is present (window.__turnstileSiteKey,
 * injected by root in an inline <head> script before hydration). On success stores the token on
 * window.__turnstileToken, which LeadForm sends to the server for verification (ADR-005). With
 * TURNSTILE_DEV_BYPASS the server skips verification, so locally the widget is simply absent.
 *
 * The site key is read AFTER mount (not during render) so the server (no window) and the client's
 * first render agree on `null` — avoiding a hydration mismatch — and so the inline head script has
 * reliably set the global by the time we read it (an effect-set global would run too late for
 * inline forms that mount during hydration).
 */
declare global {
  interface Window {
    __turnstileSiteKey?: string;
    __turnstileToken?: string;
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => void };
  }
}

export function Turnstile() {
  const ref = useRef<HTMLDivElement>(null);
  const [siteKey, setSiteKey] = useState<string | undefined>(undefined);

  useEffect(() => {
    setSiteKey(typeof window !== 'undefined' ? window.__turnstileSiteKey : undefined);
  }, []);

  useEffect(() => {
    if (!siteKey || !ref.current) return;
    const render = () => {
      if (window.turnstile && ref.current) {
        window.turnstile.render(ref.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            window.__turnstileToken = token;
          },
        });
      }
    };
    if (window.turnstile) {
      render();
    } else if (!document.getElementById('cf-turnstile-script')) {
      const s = document.createElement('script');
      s.id = 'cf-turnstile-script';
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      s.async = true;
      s.onload = render;
      document.head.appendChild(s);
    }
  }, [siteKey]);

  if (!siteKey) return null;
  return <div ref={ref} className="mt-1" />;
}

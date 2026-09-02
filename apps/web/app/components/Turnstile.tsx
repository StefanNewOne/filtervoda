import { useEffect, useRef } from 'react';

/**
 * Cloudflare Turnstile widget. Renders only when a site key is present (window.__turnstileSiteKey,
 * injected by root from settings). On success stores the token on window.__turnstileToken, which
 * LeadForm sends to the server for verification (ADR-005). With TURNSTILE_DEV_BYPASS the server
 * skips verification, so locally the widget is simply absent.
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
  const siteKey = typeof window !== 'undefined' ? window.__turnstileSiteKey : undefined;

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

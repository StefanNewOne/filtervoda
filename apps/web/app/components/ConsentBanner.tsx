/**
 * Cookie consent banner with Consent Mode v2 (PRD §11.3). Nothing tracking fires before
 * consent. Choices: Прифати сè / Само неопходни / Поставки. GTM loads only after consent.
 */
import { useEffect, useState } from 'react';
import { Button } from './ui';

type Consent = { analytics: boolean; marketing: boolean } | null;
const KEY = 'fv-consent-v2';

function apply(consent: { analytics: boolean; marketing: boolean }, gtmId?: string) {
  const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  function gtag(...args: unknown[]) {
    w.dataLayer!.push(args);
  }
  gtag('consent', 'update', {
    ad_storage: consent.marketing ? 'granted' : 'denied',
    ad_user_data: consent.marketing ? 'granted' : 'denied',
    ad_personalization: consent.marketing ? 'granted' : 'denied',
    analytics_storage: consent.analytics ? 'granted' : 'denied',
  });
  if (gtmId && (consent.analytics || consent.marketing) && !document.getElementById('gtm-script')) {
    const s = document.createElement('script');
    s.id = 'gtm-script';
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    document.head.appendChild(s);
  }
}

export function ConsentBanner({ text, gtmId }: { text?: string; gtmId?: string }) {
  const [consent, setConsent] = useState<Consent>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { analytics: boolean; marketing: boolean };
      setConsent(parsed);
      apply(parsed, gtmId);
    }
    setReady(true);
  }, [gtmId]);

  function choose(c: { analytics: boolean; marketing: boolean }) {
    localStorage.setItem(KEY, JSON.stringify(c));
    setConsent(c);
    apply(c, gtmId);
  }

  if (!ready || consent) return null;

  return (
    <div className="fixed inset-x-0 bottom-14 z-[var(--z-toast)] mx-auto max-w-2xl rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-lg)] md:bottom-4">
      <p className="text-sm text-[var(--color-muted)]">
        {text ?? 'Користиме колачиња за да го подобриме сајтот и за мерење на рекламите. Изберете што дозволувате.'}
      </p>
      {settingsOpen && (
        <div className="mt-3 space-y-2 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked disabled /> Неопходни (секогаш активни)</label>
          <label className="flex items-center gap-2"><input type="checkbox" id="c-analytics" /> Статистика</label>
          <label className="flex items-center gap-2"><input type="checkbox" id="c-marketing" /> Маркетинг</label>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => choose({ analytics: true, marketing: true })}>Прифати сè</Button>
        <Button variant="secondary" onClick={() => choose({ analytics: false, marketing: false })}>Само неопходни</Button>
        {settingsOpen ? (
          <Button
            variant="ghost"
            onClick={() =>
              choose({
                analytics: (document.getElementById('c-analytics') as HTMLInputElement)?.checked ?? false,
                marketing: (document.getElementById('c-marketing') as HTMLInputElement)?.checked ?? false,
              })
            }
          >
            Зачувај избор
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => setSettingsOpen(true)}>Поставки</Button>
        )}
      </div>
    </div>
  );
}

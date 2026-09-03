import type { LinksFunction } from 'react-router';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from 'react-router';
import type { Route } from './+types/root';
import './app.css';
import { ConsentBanner } from './components/ConsentBanner';
import { LeadModalProvider } from './components/LeadModal';
import { api } from './lib/api.server';
import { useTemplate } from './templates/registry';

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: '/fonts' },
  { rel: 'preload', href: '/fonts/manrope-var.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
];

/** Safe fallback so the shell always renders even if the API is briefly unavailable. */
const DEFAULT_SETTINGS = {
  phones: ['076/676/819'],
  emails: [],
  social: {},
  activeTemplate: 'b1' as const,
  featureFlags: {},
};

/** Root loader runs on every request — loads the active template + public settings. */
export async function loader() {
  try {
    const settings = await api.settings();
    return { settings };
  } catch {
    // Never let a transient API hiccup turn every page into an error screen.
    return { settings: DEFAULT_SETTINGS as Awaited<ReturnType<typeof api.settings>> };
  }
}

/** Turn per-template token overrides into an inline style block (applied to :root). */
function tokenOverridesCss(tokens?: Record<string, string>): string | null {
  if (!tokens) return null;
  const map: Record<string, string> = {
    cta: '--color-cta',
    ink: '--color-ink',
    accent: '--color-accent',
    radius: '--radius-cta',
    font: '--font-display',
  };
  const decls = Object.entries(tokens)
    .filter(([k, v]) => map[k] && v)
    .map(([k, v]) => `${map[k]}: ${v};`)
    .join('');
  return decls ? `:root{${decls}}` : null;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>() as { settings: Awaited<ReturnType<typeof api.settings>> } | undefined;
  const settings = data?.settings;
  const template = settings?.activeTemplate ?? 'b1';
  const overrides = tokenOverridesCss(settings?.templateTokens);

  return (
    <html lang="mk" data-template={template}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {overrides ? <style dangerouslySetInnerHTML={{ __html: overrides }} /> : null}
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

export default function App() {
  const { settings } = useLoaderData<typeof loader>();
  const T = useTemplate();
  if (typeof window !== 'undefined' && settings.turnstileSiteKey) {
    (window as unknown as { __turnstileSiteKey?: string }).__turnstileSiteKey = settings.turnstileSiteKey;
  }
  return (
    <LeadModalProvider phones={settings.phones} viber={settings.viber}>
      <T.Header phones={settings.phones} />
      <main id="content">
        <Outlet />
      </main>
      <T.Footer settings={settings} />
      <T.StickyBar phones={settings.phones} viber={settings.viber} />
      <ConsentBanner text={settings.cookieBannerText} gtmId={settings.gtmId} />
      <ScrollRestoration />
      <Scripts />
    </LeadModalProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const status = (error as { status?: number })?.status;
  return (
    <main className="mx-auto max-w-2xl px-5 py-24 text-center">
      <div className="font-[family-name:var(--font-display)] text-[clamp(80px,14vw,180px)] font-light leading-none tracking-[-0.06em] text-[var(--color-brand-400)]">
        {status ?? '!'}
      </div>
      <h1 className="mt-5 text-[clamp(28px,3.4vw,42px)] font-medium text-[var(--color-foreground)]">
        {status === 404 ? 'Оваа страница не постои.' : 'Настана грешка.'}
      </h1>
      <p className="mt-4 text-[17px] text-[var(--color-muted)]">Пробајте од производите или почетната страница.</p>
      <div className="mt-8 flex justify-center gap-3">
        <a href="/" className="rounded-[var(--radius-cta)] bg-[var(--color-cta)] px-7 py-3.5 font-bold text-[var(--color-cta-fg)]">Почетна страница</a>
      </div>
    </main>
  );
}

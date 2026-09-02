import { Link, data, redirect } from 'react-router';
import { api } from '../lib/api.server';
import type { Route } from './+types/not-found';

export function meta() {
  return [
    { title: 'Страницата не постои | filtervoda.mk' },
    { name: 'robots', content: 'noindex' },
  ];
}

/** Apply the legacy 301 redirect map (Прилог Ѓ); otherwise render the 404 inside the shell. */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const map = await api.redirects().catch(() => []);
  const hit = map.find((r) => r.fromPath === url.pathname || r.fromPath === url.pathname + '/');
  if (hit) throw redirect(hit.toPath, hit.statusCode ?? 301);
  return data(null, { status: 404 });
}

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-24 text-center">
      <div className="font-[family-name:var(--font-display)] text-[clamp(80px,14vw,180px)] font-light leading-none tracking-[-0.06em] text-[var(--color-brand-400)]">404</div>
      <h1 className="mt-5 text-[clamp(28px,3.4vw,42px)] font-medium text-[var(--color-foreground)]">Оваа страница не постои.</h1>
      <p className="mt-4 text-[17px] text-[var(--color-muted)]">Пробајте од производите или почетната страница.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/" className="rounded-[var(--radius-cta)] bg-[var(--color-cta)] px-7 py-3.5 font-bold text-[var(--color-cta-fg)]">Почетна страница</Link>
        <Link to="/proizvodi" className="rounded-[var(--radius-cta)] border border-[var(--color-border)] px-7 py-3.5 font-bold text-[var(--color-foreground)]">Производи</Link>
      </div>
    </main>
  );
}

import type { PublicSettings } from '@filtervoda/shared';
import { Link } from 'react-router';

export function Footer({ settings }: { settings: PublicSettings }) {
  return (
    <footer className="mt-16 border-t border-[var(--color-border)] bg-[var(--color-trust-bg)] text-[var(--color-trust-fg)]">
      <div className="mx-auto grid max-w-[var(--content-max)] gap-8 px-4 py-12 md:grid-cols-4 md:px-6">
        <div>
          <div className="font-[family-name:var(--font-display)] text-lg font-semibold">SPAR Company</div>
          {settings.phones.map((p) => (
            <a key={p} href={`tel:${p}`} className="mt-2 block text-sm">
              {p}
            </a>
          ))}
        </div>
        <nav aria-label="Производи">
          <div className="text-sm font-semibold">Производи</div>
          <Link to="/proizvodi" className="mt-2 block text-sm">Каталог</Link>
          <Link to="/za-biznis" className="mt-1 block text-sm">За фирми</Link>
          <Link to="/soveti" className="mt-1 block text-sm">Совети</Link>
        </nav>
        <nav aria-label="Информации">
          <div className="text-sm font-semibold">Информации</div>
          <Link to="/za-nas" className="mt-2 block text-sm">За нас</Link>
          <Link to="/kontakt" className="mt-1 block text-sm">Контакт</Link>
          <Link to="/pravni/privatnost" className="mt-1 block text-sm">Политика за приватност</Link>
          <Link to="/pravni/kolacinja" className="mt-1 block text-sm">Колачиња</Link>
        </nav>
        <div>
          <div className="text-sm font-semibold">Следете нè</div>
          {settings.social.facebook && <a href={settings.social.facebook} className="mt-2 block text-sm">Facebook</a>}
          {settings.social.instagram && <a href={settings.social.instagram} className="mt-1 block text-sm">Instagram</a>}
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] px-4 py-4 text-center text-xs opacity-80">
        © {new Date().getFullYear()} SPAR Company · filtervoda.mk
      </div>
    </footer>
  );
}

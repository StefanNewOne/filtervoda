import { Link } from 'react-router';
import type { PostCard } from '../types';

/** „За вашата фирма" home B2B teaser — shared, themed via tokens. Copy is editable from admin
 * (Страници и копи → Почетна), with the shipped defaults as fallback. */
export function B2bTeaser({ title, bullets, cta, image }: { title?: string; bullets?: string[]; cta?: string; image?: string } = {}) {
  const items = bullets && bullets.length ? bullets : ['Апарат за топла и ладна вода', 'Бесплатна монтажа и сервис', 'Редовна замена на филтри', 'Фиксен месечен износ — без инвестиција'];
  return (
    <section className="mx-auto max-w-[1200px] px-5 pt-[90px]">
      <div className="grid gap-10 rounded-[var(--radius-card)] border border-[var(--color-border)] p-11 md:grid-cols-2 md:items-center [background:linear-gradient(180deg,var(--color-trust-bg),var(--color-chip-bg))]">
        <div>
          <div className="font-[family-name:var(--font-mono)] text-[12px] tracking-[0.14em] text-[var(--color-cta)]">ЗА ВАШАТА ФИРМА</div>
          <h2 className="mt-3.5 text-[clamp(26px,2.8vw,38px)] font-medium text-[var(--color-foreground)]">{title || 'Неограничена чиста вода за вашиот тим.'}</h2>
          <ul className="mt-6 space-y-3">
            {items.map((b) => (
              <li key={b} className="flex items-baseline gap-3 text-[16px] text-[var(--color-muted)]">
                <span className="font-extrabold text-[#16803B]">·</span> {b}
              </li>
            ))}
          </ul>
          <Link to="/za-biznis" className="mt-7 inline-block rounded-[var(--radius-cta)] bg-[var(--color-cta)] px-6 py-4 text-[16px] font-bold text-[var(--color-cta-fg)]">
            {cta || 'Побарај понуда за фирма'}
          </Link>
        </div>
        <img
          src={image || '/img/products/dispenzer.jpg'}
          alt="Диспензер за топла и ладна вода за фирми"
          className="w-full rounded-[var(--radius-card)] object-cover"
          style={{ aspectRatio: '4 / 3' }}
          loading="lazy"
        />
      </div>
    </section>
  );
}

/** „Совети за чиста вода" home articles preview — shared. */
export function ArticlesSection({ posts, title }: { posts: PostCard[]; title?: string }) {
  if (posts.length === 0) return null;
  return (
    <section className="mx-auto max-w-[1200px] px-5 pt-[90px]">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-[clamp(30px,3.4vw,46px)] font-medium text-[var(--color-foreground)]">{title || 'Совети за чиста вода'}</h2>
        <Link to="/soveti" className="text-[16px] font-bold text-[var(--color-cta)]">Сите совети →</Link>
      </div>
      <div className="mt-[34px] grid gap-[18px] md:grid-cols-3">
        {posts.map((p) => (
          <Link key={p.slug} to={`/soveti/${p.slug}`} className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] transition hover:border-[var(--color-cta)]">
            {p.coverUrl ? (
              <img src={p.coverUrl} alt={p.title} loading="lazy" className="aspect-[16/10] w-full bg-[var(--color-neutral-100)] object-cover" />
            ) : (
              <div className="aspect-[16/10] bg-[var(--color-neutral-100)]" aria-hidden />
            )}
            <div className="p-[22px]">
              <div className="font-[family-name:var(--font-mono)] text-[12px] font-extrabold tracking-[0.04em] text-[var(--color-cta)]">СОВЕТ</div>
              <h3 className="mt-2.5 text-[18px] font-medium text-[var(--color-foreground)]">{p.title}</h3>
              {p.excerpt && <p className="mt-2.5 text-[14px] leading-[1.55] text-[var(--color-muted)]">{p.excerpt}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

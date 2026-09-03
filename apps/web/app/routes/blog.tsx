import { Link } from 'react-router';
import { PageHeader, PageWrap, useSkin } from '../components/PageShell';
import { api } from '../lib/api.server';
import type { Route } from './+types/blog';

export function meta() {
  return [
    { title: 'Совети за чиста вода | filtervoda.mk' },
    { name: 'description', content: 'Едукативни статии за реверзна осмоза, алкална вода, бигор и вода за фирми.' },
  ];
}

export async function loader() {
  return { posts: await api.posts() };
}

/** Post as exposed by the public API (cover image temporary until CMS holds real covers). */
type PostListItem = { slug: string; title: string; excerpt?: string; coverUrl?: string | null };

export default function Blog({ loaderData }: Route.ComponentProps) {
  const posts = loaderData.posts as PostListItem[];
  const s = useSkin();

  return (
    <PageWrap>
      <PageHeader
        crumbs={[{ label: 'Почетна', to: '/' }, { label: 'Совети' }]}
        title="Совети за чиста вода"
        intro="Едукативни текстови за реверзна осмоза, бигор, алкална вода и вода на работно место."
        s={s}
      />

      {/* Category filter chips (no category data on the DTO yet — render „Сите" active). */}
      <div className={`mt-[30px] flex flex-wrap gap-2 border-b ${s.border} pb-[18px]`}>
        <button
          type="button"
          className={`min-h-[44px] rounded-full border border-[var(--color-cta)] bg-[var(--color-neutral-100)] px-[18px] py-[11px] text-[14px] font-bold ${s.ink}`}
          aria-pressed="true"
        >
          Сите
        </button>
      </div>

      {posts.length === 0 ? (
        <p className={`mt-[30px] ${s.muted}`}>Наскоро додаваме статии.</p>
      ) : (
        <div
          className="mt-[30px] grid gap-[18px]"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' }}
        >
          {posts.map((p) => (
            <Link
              key={p.slug}
              to={`/soveti/${p.slug}`}
              className={`group block overflow-hidden border bg-[var(--color-background)] text-left ${s.border} ${s.cardR} transition hover:border-[var(--color-cta)]`}
            >
              {p.coverUrl ? (
                <img src={p.coverUrl} alt={p.title} loading="lazy" className={`aspect-[16/10] w-full border-b ${s.border} bg-[var(--color-neutral-100)] object-cover`} />
              ) : (
                <div className={`aspect-[16/10] border-b ${s.border} bg-[var(--color-neutral-100)]`} aria-hidden="true" />
              )}
              <div className="p-[22px]">
                <span className={`text-[12px] font-extrabold tracking-[0.04em] ${s.accent} ${s.mono}`}>СОВЕТ</span>
                <h3 className={`${s.display} ${s.ink} mt-[10px] text-[18px] font-medium ${s.headingUpper ? 'uppercase' : ''}`}>
                  {p.title}
                </h3>
                {p.excerpt && <p className={`mt-[10px] text-[14px] leading-[1.55] ${s.muted}`}>{p.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pager — only when there is more than one page worth of posts. */}
      {posts.length > 9 && (
        <div className="mt-[44px] flex justify-center gap-2">
          {[1, 2].map((n) => (
            <button
              key={n}
              type="button"
              className={`h-[44px] w-[44px] rounded-[12px] border text-[15px] font-bold ${
                n === 1 ? 'border-[var(--color-cta)] bg-[var(--color-neutral-100)] ' + s.ink : `${s.border} bg-[var(--color-background)] ${s.muted}`
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </PageWrap>
  );
}

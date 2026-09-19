import { Link } from 'react-router';
import { PageWrap, useSkin } from '../components/PageShell';
import { api } from '../lib/api.server';
import type { Route } from './+types/post';

export async function loader({ params }: Route.LoaderArgs) {
  const post = await api.post(params.slug);
  if (!post) throw new Response('Not found', { status: 404 });
  const siteUrl = (process.env.PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
  return { post, siteUrl };
}

export function meta({ data }: Route.MetaArgs) {
  const post = data?.post as PostDetail | undefined;
  if (!post) return [{ title: 'Статија | Совети' }];
  const site = data?.siteUrl ?? '';
  const title = post.seoTitle ?? `${post.title} | Совети`;
  const desc = post.seoDescription ?? post.excerpt ?? '';
  const canonical = site && post.slug ? `${site}/soveti/${post.slug}` : undefined;
  const abs = (u?: string | null) => (!u ? undefined : /^https?:\/\//.test(u) ? u : `${site}${u}`);
  const ogImg = abs(post.coverUrl);
  return [
    { title },
    ...(desc ? [{ name: 'description', content: desc }] : []),
    ...(canonical ? [{ tagName: 'link', rel: 'canonical', href: canonical }] : []),
    { property: 'og:title', content: post.title },
    ...(desc ? [{ property: 'og:description', content: desc }] : []),
    { property: 'og:type', content: 'article' },
    ...(canonical ? [{ property: 'og:url', content: canonical }] : []),
    ...(ogImg ? [{ property: 'og:image', content: ogImg }] : []),
  ];
}

/** Single post as exposed by the public API (loosely typed content HTML). */
type PostDetail = {
  title: string;
  slug?: string;
  excerpt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  publishedAt?: string | null;
  content?: { html?: string } | null;
  coverUrl?: string | null;
};

export default function Post({ loaderData }: Route.ComponentProps) {
  const post = loaderData.post as PostDetail;
  const s = useSkin();
  const site = (loaderData as { siteUrl?: string }).siteUrl ?? '';
  const url = site && post.slug ? `${site}/soveti/${post.slug}` : undefined;
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: post.title,
        ...(post.excerpt ? { description: post.excerpt } : {}),
        ...(post.coverUrl ? { image: /^https?:\/\//.test(post.coverUrl) ? post.coverUrl : `${site}${post.coverUrl}` } : {}),
        ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
        ...(url ? { mainEntityOfPage: url } : {}),
        author: { '@type': 'Organization', name: 'SPAR Company' },
        publisher: { '@type': 'Organization', name: 'SPAR Company' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Почетна', ...(site ? { item: `${site}/` } : {}) },
          { '@type': 'ListItem', position: 2, name: 'Совети', ...(site ? { item: `${site}/soveti` } : {}) },
          { '@type': 'ListItem', position: 3, name: post.title, ...(url ? { item: url } : {}) },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
    <PageWrap>
      <nav className={`flex flex-wrap gap-2 pt-[26px] text-[13px] font-semibold ${s.muted}`} aria-label="Патека">
        <Link to="/" className="text-[var(--color-cta)]">
          Почетна
        </Link>
        <span>/</span>
        <Link to="/soveti" className="text-[var(--color-cta)]">
          Совети
        </Link>
        <span>/</span>
        <span>{post.title}</span>
      </nav>

      <div className="mt-[6px] grid items-start gap-[60px] lg:grid-cols-[1fr_300px]">
        <article>
          <span className={`text-[13px] font-extrabold tracking-[0.04em] ${s.accent} ${s.mono}`}>ЕДУКАТИВНО</span>
          <h1
            className={`${s.display} ${s.ink} mt-4 max-w-[24em] text-[clamp(32px,4vw,54px)] font-medium ${s.headingUpper ? 'uppercase' : ''}`}
          >
            {post.title}
          </h1>
          {post.coverUrl && (
            <img src={post.coverUrl} alt={post.title} className={`mt-8 aspect-[16/9] w-full bg-[var(--color-neutral-100)] object-cover ${s.cardR}`} />
          )}
          {post.content?.html && (
            <div
              className="mt-[34px] max-w-[34em] text-[17px] leading-[1.75] text-[var(--color-muted)] [&_blockquote]:my-[34px] [&_blockquote]:rounded-[18px] [&_blockquote]:bg-[var(--color-neutral-100)] [&_blockquote]:px-[28px] [&_blockquote]:py-[24px] [&_blockquote]:text-[19px] [&_blockquote]:font-medium [&_blockquote]:leading-[1.6] [&_blockquote]:text-[var(--color-foreground)] [&_h2]:mt-[40px] [&_h2]:text-[28px] [&_h2]:font-medium [&_h2]:text-[var(--color-foreground)] [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-4 [&_p]:text-[17px]"
              dangerouslySetInnerHTML={{ __html: post.content.html }}
            />
          )}
        </article>

        {/* Sticky sidebar */}
        <aside className="lg:sticky lg:top-[100px]">
          <div className={`border ${s.border} rounded-[18px] p-6`}>
            <span className={`text-[12px] font-extrabold tracking-[0.06em] ${s.muted} ${s.mono}`}>СОДРЖИНА</span>
            <p className={`mt-4 text-[15px] leading-[1.55] ${s.muted}`}>
              Не сте сигурни кој систем ви одговара? Оставете телефон — ќе ве советуваме бесплатно.
            </p>
            <Link
              to="/kontakt"
              className={`mt-4 inline-flex min-h-[44px] items-center rounded-[var(--radius-cta)] bg-[var(--color-cta)] px-5 py-3 text-[15px] font-bold text-[var(--color-cta-fg)]`}
            >
              Побарај консултација
            </Link>
          </div>

          <div className={`mt-4 border ${s.border} rounded-[18px] p-6`}>
            <span className={`text-[12px] font-extrabold tracking-[0.06em] ${s.muted} ${s.mono}`}>СПОДЕЛИ</span>
            <div className="mt-[14px] flex flex-wrap gap-2">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof document !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener"
                className={`inline-flex min-h-[44px] items-center rounded-[10px] border px-[14px] py-[10px] text-[13px] font-bold ${s.border} ${s.ink}`}
              >
                Facebook
              </a>
              <a
                href={`viber://forward?text=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                className={`inline-flex min-h-[44px] items-center rounded-[10px] border px-[14px] py-[10px] text-[13px] font-bold ${s.border} ${s.ink}`}
              >
                Viber
              </a>
            </div>
          </div>
        </aside>
      </div>
    </PageWrap>
    </>
  );
}

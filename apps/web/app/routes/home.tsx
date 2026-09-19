import { api } from '../lib/api.server';
import { useTemplate } from '../templates/registry';
import type { Route } from './+types/home';

const TITLE = 'filtervoda.mk — Чиста, алкална вода директно од вашата чешма';
const DESC =
  'Системи за филтрација со бесплатна монтажа и 10 години гаранција — низ цела Македонија. Реверзна осмоза, алкална и минерализирана вода.';

export function meta({ data }: Route.MetaArgs) {
  const site = data?.siteUrl ?? '';
  const canonical = site ? `${site}/` : undefined;
  const abs = (u?: string) => (!u ? undefined : /^https?:\/\//.test(u) ? u : `${site}${u}`);
  const ogImg = abs(data?.settings?.content?.heroImage);
  return [
    { title: TITLE },
    { name: 'description', content: DESC },
    ...(canonical ? [{ tagName: 'link', rel: 'canonical', href: canonical }] : []),
    { property: 'og:title', content: TITLE },
    { property: 'og:description', content: DESC },
    { property: 'og:type', content: 'website' },
    ...(canonical ? [{ property: 'og:url', content: canonical }] : []),
    ...(ogImg ? [{ property: 'og:image', content: ogImg }] : []),
  ];
}

export async function loader() {
  const [featured, settings, testimonials, faq, posts] = await Promise.all([
    api.featuredProducts(),
    api.settings(),
    api.testimonials().catch(() => []),
    api.faq('GLOBAL').catch(() => []),
    api.posts().catch(() => []),
  ]);
  const siteUrl = (process.env.PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
  return {
    featured,
    content: settings.content ?? {},
    testimonials,
    faq,
    posts: posts.slice(0, 3),
    settings,
    siteUrl,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const T = useTemplate();
  const { settings, siteUrl } = loaderData;
  const site = siteUrl ?? '';
  const phones = settings?.phones ?? [];
  const social = settings?.social ?? {};
  const sameAs = [social.facebook, social.instagram].filter((x): x is string => Boolean(x));
  // Organization + LocalBusiness structured data (brand + local SEO for an ad/share-driven site).
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        ...(site ? { '@id': `${site}/#org` } : {}),
        name: 'SPAR Company',
        ...(site ? { url: site } : {}),
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        '@type': 'LocalBusiness',
        name: 'SPAR Company — filtervoda.mk',
        ...(site ? { url: site } : {}),
        ...(phones[0] ? { telephone: phones[0] } : {}),
        areaServed: 'MK',
        ...(settings?.address ? { address: settings.address } : {}),
      },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <T.Home {...loaderData} />
    </>
  );
}

import { api } from '../lib/api.server';
import { useTemplate } from '../templates/registry';
import type { Route } from './+types/home';

export function meta() {
  return [
    { title: 'filtervoda.mk — Чиста, алкална вода директно од вашата чешма' },
    {
      name: 'description',
      content:
        'Системи за филтрација со бесплатна монтажа и 10 години гаранција — низ цела Македонија. Реверзна осмоза, алкална и минерализирана вода.',
    },
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
  return {
    featured,
    content: settings.content ?? {},
    testimonials,
    faq,
    posts: posts.slice(0, 3),
    settings,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const T = useTemplate();
  return <T.Home {...loaderData} />;
}

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
  const [products, settings, testimonials, faq] = await Promise.all([
    api.products(),
    api.settings(),
    api.testimonials().catch(() => []),
    api.faq('GLOBAL').catch(() => []),
  ]);
  return { featured: products.slice(0, 6), content: settings.content ?? {}, testimonials, faq, settings };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const T = useTemplate();
  return <T.Home {...loaderData} />;
}

import { Section } from '../components/ui';
import type { Route } from './+types/legal';

const PAGES: Record<string, { title: string; body: string }> = {
  privatnost: {
    title: 'Политика за приватност',
    body: 'SPAR Company ги обработува вашите податоци единствено за да одговори на вашето барање. Податоците се чуваат согласно закон и се анонимизираат по истек на рокот на чување.',
  },
  kolacinja: {
    title: 'Политика за колачиња',
    body: 'Користиме неопходни колачиња за функционирање на сајтот и, по ваша согласност, статистички и маркетинг колачиња за мерење на рекламите.',
  },
};

export function meta({ params }: Route.MetaArgs) {
  const page = PAGES[params.slug];
  return [{ title: page ? `${page.title} | filtervoda.mk` : 'Правна страница' }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const page = PAGES[params.slug];
  if (!page) throw new Response('Not found', { status: 404 });
  return { page };
}

export default function Legal({ loaderData }: Route.ComponentProps) {
  const { page } = loaderData;
  return (
    <Section title={page.title}>
      <p className="max-w-2xl text-[var(--color-muted)]">{page.body}</p>
    </Section>
  );
}

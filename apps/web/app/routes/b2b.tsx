import { B2bPage } from '../templates/shared/B2bPage';
import { api } from '../lib/api.server';
import type { Route } from './+types/b2b';

export function meta() {
  return [
    { title: 'За фирми — Неограничена чиста вода за вашиот тим | filtervoda.mk' },
    {
      name: 'description',
      content: 'Изнајмете апарат од SPAR со сè вклучено — монтажа, филтри, сервис — за фиксен месечен износ. Заборавете на галоните.',
    },
  ];
}

export async function loader() {
  const [packages, settings, faq] = await Promise.all([
    api.packages(),
    api.settings(),
    api.faq('B2B').catch(() => []),
  ]);
  return { packages, settings, faq };
}

export default function B2b({ loaderData }: Route.ComponentProps) {
  return <B2bPage packages={loaderData.packages} settings={loaderData.settings} faq={loaderData.faq} />;
}

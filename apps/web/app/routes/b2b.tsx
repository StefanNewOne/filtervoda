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
  const [packages, settings] = await Promise.all([api.packages(), api.settings()]);
  return { packages, settings };
}

export default function B2b({ loaderData }: Route.ComponentProps) {
  return <B2bPage packages={loaderData.packages} settings={loaderData.settings} />;
}

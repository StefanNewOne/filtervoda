import { B2bPage } from '../templates/shared/B2bPage';
import { stripLocale } from '../i18n/paths';
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

export async function loader({ request }: Route.LoaderArgs) {
  const locale = stripLocale(new URL(request.url).pathname).locale;
  const [packages, settings, faq] = await Promise.all([
    api.packages(locale),
    api.settings(locale),
    api.faq('B2B', locale).catch(() => []),
  ]);
  return { packages, settings, faq };
}

export default function B2b({ loaderData }: Route.ComponentProps) {
  return <B2bPage packages={loaderData.packages} settings={loaderData.settings} faq={loaderData.faq} />;
}

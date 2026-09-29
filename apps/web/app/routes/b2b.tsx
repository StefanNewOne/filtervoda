import { B2bPage } from '../templates/shared/B2bPage';
import { stripLocale } from '../i18n/paths';
import { api } from '../lib/api.server';
import { localeMeta, tm } from '../lib/meta';
import type { Route } from './+types/b2b';

export function meta({ data, location }: Route.MetaArgs) {
  const locale = stripLocale(location.pathname).locale;
  return localeMeta({
    locale,
    siteUrl: data?.siteUrl ?? '',
    path: '/za-biznis',
    title: tm(locale, 'meta.b2b.title'),
    description: tm(locale, 'meta.b2b.desc'),
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  const locale = stripLocale(new URL(request.url).pathname).locale;
  const [packages, settings, faq] = await Promise.all([
    api.packages(locale),
    api.settings(locale),
    api.faq('B2B', locale).catch(() => []),
  ]);
  const siteUrl = (process.env.PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
  return { packages, settings, faq, siteUrl };
}

export default function B2b({ loaderData }: Route.ComponentProps) {
  return <B2bPage packages={loaderData.packages} settings={loaderData.settings} faq={loaderData.faq} />;
}

import { Link } from 'react-router';
import type { Route } from './+types/legal';
import { useSkin, PageWrap } from '../components/PageShell';

type LegalSection = { heading: string; text: string };
type LegalPage = { title: string; lastModified: string; sections: LegalSection[] };

const LAST_MODIFIED = '01.09.2026';

const PAGES: Record<string, LegalPage> = {
  privatnost: {
    title: 'Политика за приватност',
    lastModified: LAST_MODIFIED,
    sections: [
      {
        heading: '1. Кои податоци ги собираме',
        text: 'Кога ќе испратите барање преку формите на овој сајт, SPAR Company ги собира вашето име и телефонски број, а опционално и email, град и пораката што ја пишувате. Дополнително, автоматски се зачувуваат страницата од која е испратено барањето, изворот на посетата (UTM параметри и препорачувач) и техничка ознака на вашата IP-адреса, која се чува исклучиво како шифриран (хеширан) запис, никогаш во оригинална форма.',
      },
      {
        heading: '2. Зошто ги обработуваме',
        text: 'Вашите податоци ги обработуваме единствено за да одговориме на вашето барање, да ве контактираме во врска со понуда за филтрационен систем или бесплатна монтажа и да ја измериме успешноста на нашите реклами. По ваша согласност, изворот на посетата се споделува со Meta Pixel и Google Analytics 4 во хеширана форма, за да ги пресметаме резултатите од кампањите. Не продаваме и не отстапуваме лични податоци на трети страни за нивни маркетинг цели.',
      },
      {
        heading: '3. Рок на чување и анонимизација',
        text: 'Барањата со лични податоци се чуваат 24 месеци, по што автоматски се анонимизираат — вашето име, телефон, email и порака се заменуваат, а остануваат само статистички податоци без можност за идентификација. Техничката ознака на IP-адресата се чува најмногу 30 дена. По истек на овие рокови податоците веќе не се поврзани со вас како поединец.',
      },
      {
        heading: '4. Ваши права и контакт',
        text: 'Имате право на пристап, исправка и бришење на вашите податоци, како и право да ја повлечете дадената согласност во секое време. Барањето можете да го упатите на телефонот или email-от наведени во делот Контакт. Контролор на податоците е SPAR Company [потврди правен субјект], со седиште во Скопје.',
      },
    ],
  },
  kolacinja: {
    title: 'Политика за колачиња',
    lastModified: LAST_MODIFIED,
    sections: [
      {
        heading: '1. Што се колачиња',
        text: 'Колачињата се мали текстуални датотеки што сајтот ги запишува во вашиот прелистувач за да функционира правилно и за да измери колку луѓе го посетуваат. Некои се неопходни за основната работа на сајтот, а други се вклучуваат само откако вие ќе ги дозволите.',
      },
      {
        heading: '2. Неопходни колачиња',
        text: 'Овие колачиња овозможуваат основните функции на сајтот — прикажување на страниците, безбедно испраќање на формите и заштита од спам. Тие се секогаш активни бидејќи без нив сајтот не може да работи, и за нив не е потребна ваша согласност.',
      },
      {
        heading: '3. Статистички и маркетинг колачиња',
        text: 'Статистичките колачиња (Google Analytics 4) ни помагаат да разбереме како посетителите го користат сајтот, а маркетинг колачињата (Meta Pixel) го мерат успехот на нашите реклами на Facebook и Instagram. Овие колачиња се вчитуваат само откако ќе ги прифатите преку банерот за согласност.',
      },
      {
        heading: '4. Управување со согласност',
        text: 'При првата посета добивате банер со опции „Прифати сè“, „Само неопходни“ и „Поставки“, каде што одбирате што дозволувате. Вашиот избор можете да го промените во секое време преку поставките за согласност. Колачето за согласност и за изворот на посетата се чува 30 дена, а траењето на останатите зависи од давателот на услугата.',
      },
    ],
  },
};

export function meta({ params }: Route.MetaArgs) {
  const page = PAGES[params.slug];
  return [{ title: page ? `${page.title} | filtervoda.mk` : 'Правна страница' }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const page = PAGES[params.slug];
  if (!page) throw new Response('Not found', { status: 404 });
  return { slug: params.slug, page };
}

export default function Legal({ loaderData }: Route.ComponentProps) {
  const { slug, page } = loaderData;
  const s = useSkin();

  const pills: { slug: string; label: string; to: string }[] = [
    { slug: 'privatnost', label: 'Приватност', to: '/pravni/privatnost' },
    { slug: 'kolacinja', label: 'Колачиња', to: '/pravni/kolacinja' },
  ];

  return (
    <PageWrap>
      <nav
        className="flex gap-2 pt-[26px] text-[13px] font-semibold text-[var(--color-muted)]"
        aria-label="Патека"
      >
        <Link to="/" className="text-[var(--color-cta)]">
          Почетна
        </Link>
        <span>/</span>
        <span>Правни</span>
        <span>/</span>
        <span>{page.title}</span>
      </nav>

      <div className="mt-6 flex flex-wrap gap-2">
        {pills.map((p) => {
          const active = p.slug === slug;
          return (
            <Link
              key={p.slug}
              to={p.to}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex min-h-[44px] items-center rounded-full border px-[18px] text-[14px] font-bold transition ${
                active
                  ? `${s.border} bg-[var(--color-cta)] text-white`
                  : `${s.border} bg-white ${s.ink} hover:border-[var(--color-cta)]`
              }`}
            >
              {p.label}
            </Link>
          );
        })}
      </div>

      <h1
        className={`${s.display} ${s.ink} mt-8 text-[clamp(32px,4vw,50px)] font-medium ${
          s.headingUpper ? 'uppercase' : ''
        }`}
      >
        {page.title}
      </h1>
      <p className="mt-4 text-[14px] text-[var(--color-muted)]">
        Последна измена: {page.lastModified}
      </p>

      <div className="mt-10 max-w-[44em]">
        {page.sections.map((sec) => (
          <div key={sec.heading} className="mt-9 first:mt-0">
            <h2 className={`${s.display} ${s.ink} text-[24px] font-medium`}>{sec.heading}</h2>
            <p className={`mt-3.5 text-[17px] leading-[1.75] ${s.muted}`}>{sec.text}</p>
          </div>
        ))}
        <p className="mt-9 text-[14px] text-[var(--color-muted)]">
          Текстот е нацрт за дизајн — финалната верзија ја обезбедува GoDigital со правник.
        </p>
      </div>
    </PageWrap>
  );
}

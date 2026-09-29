import type { PublicSettings } from '@filtervoda/shared';
import { telHref } from '@filtervoda/shared';
import { LocaleLink, useT } from '../../i18n/context';
import type { TKey } from '../../i18n/types';
import { useTemplateId } from '../context';
import { skinFor } from '../skin';

/** Footer — dark, themed per active template (b1 navy · b2 blue→navy gradient · b3 deep navy). */
const FOOTER_BG: Record<string, string> = {
  b1: 'bg-[#08182F]',
  b2: '[background:linear-gradient(160deg,#0B3C8C,#071A3A_70%)]',
  b3: 'bg-[#071A3A]',
};

const CATEGORY_LINKS: [string, TKey][] = [
  ['/proizvodi?cat=pod-mijalnik', 'footer.cat.underSink'],
  ['/proizvodi?cat=dispenzeri', 'footer.cat.dispensers'],
  ['/proizvodi?cat=cel-dom', 'footer.cat.wholeHome'],
  ['/proizvodi?cat=zastita-bigor', 'footer.cat.antiLimescale'],
  ['/proizvodi?cat=meraci', 'footer.cat.meters'],
  ['/proizvodi?cat=dodatoci', 'footer.cat.accessories'],
];

const SITE_LINKS: [string, TKey][] = [
  ['/za-nas', 'nav.about'],
  ['/kontakt', 'nav.contact'],
  ['/soveti', 'nav.blog'],
  ['/za-biznis', 'nav.b2b'],
];

const LEGAL_LINKS: [string, TKey][] = [
  ['/pravni/privatnost', 'legal.privacy'],
  ['/pravni/kolacinja', 'legal.cookies'],
];

export function Footer({ settings }: { settings: PublicSettings }) {
  const tid = useTemplateId();
  const s = skinFor(tid);
  const bg = FOOTER_BG[tid] ?? FOOTER_BG.b1;
  const t = useT();

  return (
    <footer className={`${bg} text-white`}>
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 pb-10 pt-[70px] md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className={`${s.display} text-lg font-semibold`}>SPAR Company</div>
          <p className="mt-4 max-w-[26em] text-[15px] leading-relaxed text-[#A9BFDC]">{t('footer.tagline')}</p>
          <div className="mt-4 flex flex-col gap-1">
            {settings.phones.map((p) => (
              <a key={p} href={telHref(p)} className={`${s.display} text-[19px] font-medium`}>{p}</a>
            ))}
          </div>
        </div>
        <FooterCol label={t('footer.products')} links={CATEGORY_LINKS} />
        <FooterCol label={t('footer.site')} links={SITE_LINKS} />
        <FooterCol label={t('footer.legal')} links={LEGAL_LINKS} social={settings.social} />
      </div>
      <div className="border-t border-[rgba(111,196,247,0.18)] px-5 py-[22px] text-center text-[13px] text-[#9BB0CC]">
        © {new Date().getFullYear()} SPAR Company · filtervoda.mk
      </div>
    </footer>
  );
}

function FooterCol({
  label,
  links,
  social,
}: {
  label: string;
  links: [string, TKey][];
  social?: { facebook?: string; instagram?: string };
}) {
  const t = useT();
  return (
    <nav aria-label={label}>
      <div className="text-[12px] font-extrabold tracking-[0.08em] text-[#6FC4F7]">{label}</div>
      <div className="mt-3 flex flex-col gap-2">
        {links.map(([to, key]) => (
          <LocaleLink key={`${to}-${key}`} to={to} className="text-[15px] text-[#A9BFDC] hover:text-white">
            {t(key)}
          </LocaleLink>
        ))}
        {social?.facebook && <a href={social.facebook} className="text-[15px] text-[#A9BFDC] hover:text-white">Facebook</a>}
        {social?.instagram && <a href={social.instagram} className="text-[15px] text-[#A9BFDC] hover:text-white">Instagram</a>}
      </div>
    </nav>
  );
}

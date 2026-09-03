import type { PublicSettings } from '@filtervoda/shared';
import { Link } from 'react-router';
import { useTemplateId } from '../context';
import { skinFor } from '../skin';

/** Footer — dark, themed per active template (b1 navy · b2 blue→navy gradient · b3 deep navy). */
const FOOTER_BG: Record<string, string> = {
  b1: 'bg-[#08182F]',
  b2: '[background:linear-gradient(160deg,#0B3C8C,#071A3A_70%)]',
  b3: 'bg-[#071A3A]',
};

const CATEGORY_LINKS: [string, string][] = [
  ['/proizvodi?cat=pod-mijalnik', 'Системи под мијалник'],
  ['/proizvodi?cat=dispenzeri', 'Диспензери'],
  ['/proizvodi?cat=cel-dom', 'Филтрација за цел дом'],
  ['/proizvodi?cat=zastita-bigor', 'Заштита од бигор'],
  ['/proizvodi?cat=meraci', 'Мерачи'],
  ['/proizvodi?cat=dodatoci', 'Додатоци'],
];

export function Footer({ settings }: { settings: PublicSettings }) {
  const tid = useTemplateId();
  const s = skinFor(tid);
  const bg = FOOTER_BG[tid] ?? FOOTER_BG.b1;

  return (
    <footer className={`${bg} text-white`}>
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 pb-10 pt-[70px] md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className={`${s.display} text-lg font-semibold`}>SPAR Company</div>
          <p className="mt-4 max-w-[26em] text-[15px] leading-relaxed text-[#A9BFDC]">
            Системи за филтрација на вода со бесплатна монтажа и 10 години гаранција — низ цела Македонија.
          </p>
          <div className="mt-4 flex flex-col gap-1">
            {settings.phones.map((p) => (
              <a key={p} href={`tel:${p}`} className={`${s.display} text-[19px] font-medium`}>{p}</a>
            ))}
          </div>
        </div>
        <FooterCol label="ПРОИЗВОДИ" links={CATEGORY_LINKS} />
        <FooterCol label="САЈТ" links={[['/za-nas', 'За нас'], ['/kontakt', 'Контакт'], ['/soveti', 'Совети'], ['/za-biznis', 'За фирми']]} />
        <FooterCol label="ПРАВНИ" links={[['/pravni/privatnost', 'Приватност'], ['/pravni/kolacinja', 'Колачиња']]} social={settings.social} />
      </div>
      <div className="border-t border-[rgba(111,196,247,0.18)] px-5 py-[22px] text-center text-[13px] text-[#9BB0CC]">
        © {new Date().getFullYear()} SPAR Company · filtervoda.mk
      </div>
    </footer>
  );
}

function FooterCol({ label, links, social }: { label: string; links: [string, string][]; social?: { facebook?: string; instagram?: string } }) {
  return (
    <nav aria-label={label}>
      <div className="text-[12px] font-extrabold tracking-[0.08em] text-[#6FC4F7]">{label}</div>
      <div className="mt-3 flex flex-col gap-2">
        {links.map(([to, txt]) => (
          <Link key={`${to}-${txt}`} to={to} className="text-[15px] text-[#A9BFDC] hover:text-white">{txt}</Link>
        ))}
        {social?.facebook && <a href={social.facebook} className="text-[15px] text-[#A9BFDC] hover:text-white">Facebook</a>}
        {social?.instagram && <a href={social.instagram} className="text-[15px] text-[#A9BFDC] hover:text-white">Instagram</a>}
      </div>
    </nav>
  );
}

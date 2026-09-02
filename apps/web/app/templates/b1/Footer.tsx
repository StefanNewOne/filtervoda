import type { PublicSettings } from '@filtervoda/shared';
import { Link } from 'react-router';

/** Б-1 footer: dark navy #08182F, Unbounded brand + phones, teal group labels. */
export function Footer({ settings }: { settings: PublicSettings }) {
  return (
    <footer className="bg-[#08182F] text-white">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 pb-10 pt-[70px] md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="font-[family-name:Unbounded] text-lg font-semibold">SPAR Company</div>
          <p className="mt-4 max-w-[26em] text-[15px] leading-relaxed text-[#A9BFDC]">
            Системи за филтрација на вода со бесплатна монтажа и 10 години гаранција — низ цела Македонија.
          </p>
          <div className="mt-4 flex flex-col gap-1">
            {settings.phones.map((p) => (
              <a key={p} href={`tel:${p}`} className="font-[family-name:Unbounded] text-[19px] font-medium">{p}</a>
            ))}
          </div>
        </div>
        <FooterCol label="ПРОДУКТИ" links={[['/proizvodi', 'Каталог'], ['/za-biznis', 'За фирми'], ['/soveti', 'Совети']]} />
        <FooterCol label="САЈТ" links={[['/za-nas', 'За нас'], ['/kontakt', 'Контакт']]} />
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
          <Link key={to} to={to} className="text-[15px] text-[#A9BFDC] hover:text-white">{txt}</Link>
        ))}
        {social?.facebook && <a href={social.facebook} className="text-[15px] text-[#A9BFDC] hover:text-white">Facebook</a>}
        {social?.instagram && <a href={social.instagram} className="text-[15px] text-[#A9BFDC] hover:text-white">Instagram</a>}
      </div>
    </nav>
  );
}

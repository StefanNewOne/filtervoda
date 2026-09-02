import type { TemplateId } from '@filtervoda/shared';

/**
 * Per-template visual "skin" for pages whose STRUCTURE is identical across the three
 * prototypes (Product, За фирми, Catalog, …) — only the styling differs. Home keeps its own
 * per-template components because its layout/motifs genuinely differ.
 */
export interface Skin {
  display: string; // heading font
  mono: string; // numbers / labels
  priceFont: string; // font for prices (Б-3 uses mono)
  headingUpper: boolean; // Б-2 uppercase headings
  ink: string; // heading text color
  muted: string; // secondary text color
  border: string; // border color class
  cardR: string; // card radius
  chip: string; // chip classes
  cta: string; // primary CTA classes
  outline: string; // secondary/outline CTA classes
  galleryBg: string; // gallery/image box background (arbitrary bg)
  specHead: string; // spec group header (dark band)
  badgeGreen: string;
  badgeDark: string;
  badgeOutline: string;
  accent: string; // accent text color
  heroDark: string; // dark hero background (B2B)
  panel: string; // dark result/calculator panel
  softBg: string; // light section background
}

const B1: Skin = {
  display: 'font-[family-name:Unbounded]',
  mono: 'font-[family-name:JetBrains_Mono]',
  priceFont: 'font-[family-name:Unbounded]',
  headingUpper: false,
  ink: 'text-[#08182F]',
  muted: 'text-[#46597A]',
  border: 'border-[#E4EDF9]',
  cardR: 'rounded-[20px]',
  chip: 'rounded-lg border border-[#E4EDF9] bg-[#F2F8FF] px-2.5 py-1.5 text-[13px] font-bold text-[#21375A]',
  cta: 'rounded-full bg-[#1156E0] px-7 py-[18px] text-[17px] font-bold text-white shadow-[0_10px_30px_rgba(17,86,224,0.3)] transition hover:bg-[#08182F]',
  outline: 'rounded-full border border-[#CFE2F7] bg-white px-7 py-[18px] text-[17px] font-bold text-[#08182F] transition hover:border-[#08182F]',
  galleryBg: '[background:radial-gradient(110%_90%_at_50%_25%,#FFFFFF,#F2F8FF)]',
  specHead: 'bg-[#08182F] text-white',
  badgeGreen: 'rounded-full bg-[#16803B] px-3 py-1.5 text-[12px] font-extrabold text-white',
  badgeDark: 'rounded-full bg-[#08182F] px-3 py-1.5 text-[12px] font-extrabold text-white',
  badgeOutline: 'rounded-full border border-[#D9E9FB] px-3 py-1.5 text-[12px] font-extrabold text-[#21375A]',
  accent: 'text-[#0E7490]',
  heroDark: 'bg-[#08182F]',
  panel: 'bg-[#08182F]',
  softBg: 'bg-[#F2F8FF]',
};

const B2: Skin = {
  ...B1,
  display: 'font-[family-name:Oswald]',
  priceFont: 'font-[family-name:Oswald]',
  headingUpper: true, // Б-2 uses uppercase headings
  cardR: 'rounded-[26px]',
  chip: 'rounded-full border border-[#E4EDF9] bg-[#F2F8FF] px-3 py-[7px] text-[13px] font-bold text-[#21375A]',
  cta: 'rounded-full bg-[#16803B] px-7 py-[18px] text-[17px] font-bold text-white shadow-[0_10px_30px_rgba(22,128,59,0.34)] transition hover:brightness-110',
  outline: 'rounded-full border border-[#CFE2F7] bg-white px-7 py-[18px] text-[17px] font-bold text-[#08182F] transition hover:border-[#08182F]',
  galleryBg: '[background:radial-gradient(110%_90%_at_50%_25%,#FFFFFF,#F2F8FF)]',
  accent: 'text-[#0B6076]',
  heroDark: '[background:linear-gradient(150deg,#071A3A_0%,#0B3C8C_52%,#1E6FE8_100%)]',
  panel: 'bg-[#08182F]',
};

const B3: Skin = {
  ...B1,
  display: 'font-[family-name:Onest]',
  priceFont: 'font-[family-name:JetBrains_Mono]',
  ink: 'text-[#071A3A]',
  border: 'border-[#DCE4EE]',
  cardR: 'rounded-[10px]',
  chip: 'rounded-lg border border-[#DCE4EE] bg-[#F4F7FB] px-2.5 py-1.5 text-[13px] font-bold text-[#21375A]',
  cta: 'rounded-[10px] bg-[#0E7490] px-7 py-[18px] text-[17px] font-bold text-white shadow-[0_10px_30px_rgba(14,116,144,0.32)] transition hover:brightness-110',
  outline: 'rounded-[10px] border border-[#CFD9E6] bg-white px-7 py-[18px] text-[17px] font-bold text-[#071A3A] transition hover:bg-[#F4F7FB]',
  galleryBg: '[background:radial-gradient(110%_90%_at_50%_25%,#FFFFFF,#F4F7FB)]',
  specHead: 'bg-[#071A3A] text-white',
  badgeGreen: 'rounded-[6px] bg-[#16803B] px-3 py-1.5 text-[12px] font-extrabold text-white',
  badgeDark: 'rounded-[6px] bg-[#071A3A] px-3 py-1.5 text-[12px] font-extrabold text-white',
  badgeOutline: 'rounded-[6px] border border-[#CFD9E6] px-3 py-1.5 text-[12px] font-extrabold text-[#21375A]',
  accent: 'text-[#0E7490]',
  heroDark: 'bg-[#051227]',
  panel: 'bg-[#071A3A]',
  softBg: 'bg-[#F4F7FB]',
};

const SKINS: Record<TemplateId, Skin> = { b1: B1, b2: B2, b3: B3 };
export function skinFor(id: TemplateId): Skin {
  return SKINS[id] ?? B1;
}

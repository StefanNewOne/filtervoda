import type { ProductCardDto, PublicSettings } from '@filtervoda/shared';

export interface Testimonial {
  id: string;
  name: string;
  company?: string;
  city?: string;
  text: string;
  rating: number;
}
export interface PostCard {
  slug: string;
  title: string;
  excerpt?: string;
  coverUrl?: string | null;
}

export interface HomeProps {
  featured: ProductCardDto[];
  content: NonNullable<PublicSettings['content']>;
  testimonials: Testimonial[];
  posts: PostCard[];
  faq: { question: string; answer: string }[];
  settings: PublicSettings;
}

export const HERO_H1_DEFAULT = 'Чиста, алкална вода директно од вашата чешма.';
export const HERO_H2_DEFAULT = 'Системи за филтрација со бесплатна монтажа и 10 години гаранција — низ цела Македонија.';

/** Split H1 to colour the word „директно" like the prototypes. */
export function heroParts(h1: string): [string, string, string] {
  const word = 'директно';
  const i = h1.indexOf(word);
  if (i < 0) return [h1, '', ''];
  return [h1.slice(0, i), word, h1.slice(i + word.length)];
}

export const WHY_ITEMS = [
  { n: '01', title: 'Без хлор и мирис', text: 'Свежа вода без вкус на хлор.' },
  { n: '02', title: 'Без бигор на апаратите', text: 'Помалку кварови и трошок.' },
  { n: '03', title: 'Помалку пластика и трошок', text: 'Крај на галоните и шишињата.' },
  { n: '04', title: 'Алкална и минерализирана', text: 'pH 8.5+ со додадени минерали.' },
];

export const STAGES = [
  { n: 1, name: 'Седимент филтер (5 микрони)', text: 'Ги задржува песокот, ’рѓата и прашината.' },
  { n: 2, name: 'Гранулиран активен јаглен', text: 'Апсорбира хлор, мириси и хемикалии.' },
  { n: 3, name: 'Карбон блок', text: 'Дополнително ги чисти преостанатите хлориди.' },
  { n: 4, name: 'RO мембрана', text: 'Отстранува 95–99% растворени соли, бактерии, вируси.' },
  { n: 5, name: 'Пост-карбон (кокосов)', text: 'Свежина и вкус.' },
  { n: 6, name: 'Алкализатор / минерализатор', text: 'Калциум, магнезиум, pH 8.5+.' },
];

export function fmtPrice(denari?: number): string {
  if (denari == null) return '';
  // Deterministic MK grouping (dot thousands) — ICU for mk-MK varies between
  // SSR Node and the browser, so format manually to keep prices identical.
  return `${Math.round(denari).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} ден.`;
}

export type { ProductCardDto };

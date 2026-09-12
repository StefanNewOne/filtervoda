/**
 * Shared TypeScript types (CLAUDE.md Category 7). Domain entity shapes and DTOs
 * that both API and frontends use. Prisma is the DB source of truth; these are the
 * transport/UI shapes. Enum unions derive from constants.ts (kept in sync with Prisma).
 */
import type {
  FAQ_SCOPES,
  LEAD_STATUSES,
  LEAD_TYPES,
  PRODUCT_AUDIENCES,
  PUBLISH_STATUSES,
  TEMPLATE_IDS,
  USER_ROLES,
} from './constants.js';

export type LeadType = (typeof LEAD_TYPES)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type ProductAudience = (typeof PRODUCT_AUDIENCES)[number];
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];
export type UserRole = (typeof USER_ROLES)[number];
export type FaqScope = (typeof FAQ_SCOPES)[number];
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export interface ImageVariant {
  width: number;
  format: 'avif' | 'webp' | 'jpg' | 'png';
  url: string;
}

export interface MediaDto {
  id: string;
  url: string;
  variants: ImageVariant[];
  width: number;
  height: number;
  alt: string;
}

export interface ProductChip {
  text: string;
}

export interface ProductStageDto {
  order: number;
  name: string;
  removes: string;
  whyItMatters: string;
  icon?: string;
}

export interface ProductSpecDto {
  group: string;
  label: string;
  value: string;
  unit?: string;
}

export interface ProductCardDto {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  chips: string[];
  priceRegular?: number;
  priceSale?: number;
  showPrice: boolean;
  badges: string[];
  image?: MediaDto;
  audience: ProductAudience;
  categorySlug?: string;
}

export interface ProductDetailDto extends ProductCardDto {
  shortDescription?: string;
  description?: unknown;
  categorySlug: string;
  idealFor: string[];
  features: { icon?: string; text: string }[];
  includedInPrice: string[];
  maintenanceNote?: string;
  warrantyYears: number;
  gallery: MediaDto[];
  stages: ProductStageDto[];
  specs: ProductSpecDto[];
  related: ProductCardDto[];
  faqs: { question: string; answer: string }[];
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: MediaDto;
}

export interface B2bPackageDto {
  id: string;
  name: string;
  priceFrom: number;
  description?: string;
  includes: string[];
  employeesMin?: number;
  employeesMax?: number;
}

export interface LeadListItemDto {
  id: string;
  type: LeadType;
  name: string;
  phone: string;
  productName?: string;
  source?: string;
  status: LeadStatus;
  city?: string;
  createdAt: string;
  isDuplicate: boolean;
}

/** Public settings safe to expose to the storefront (subset of Setting). */
export interface PublicSettings {
  phones: string[];
  viber?: string;
  emails: string[];
  social: { facebook?: string; instagram?: string };
  address?: string;
  workingHours?: string;
  activeTemplate: TemplateId;
  templateTokens?: Record<string, string>;
  cookieBannerText?: string;
  featureFlags: Record<string, boolean>;
  gtmId?: string;
  ga4Id?: string;
  metaPixelId?: string;
  turnstileSiteKey?: string;
  trustLogos?: string[]; // B2B „ИМ ВЕРУВААТ ФИРМИ" logo image URLs
  b2b?: {
    problems?: string[];
    included?: string[];
    industries?: string[];
    heroLabel?: string;
    heroH1?: string;
    heroSubhead?: string;
    heroCta?: string;
    heroTrust?: string;
    logosTitle?: string;
    problemsTitle?: string;
    includedTitle?: string;
    calcTitle?: string;
    stepsTitle?: string;
    packagesTitle?: string;
    industriesTitle?: string;
    comparisonTitle?: string;
    faqTitle?: string;
    formTitle?: string;
    formText?: string;
    steps?: { title: string; desc: string }[];
    comparison?: { label: string; gallons: string; buy: string; rent: string }[];
  };
  content?: {
    heroH1?: string;
    heroH2?: string;
    heroCta?: string;
    heroBadge?: string;
    heroChips?: string[];
    whyTitle?: string;
    whyItems?: { title: string; text: string }[];
    featuredTitle?: string;
    stagesTitle?: string;
    stages?: { name: string; text: string }[];
    testimonialsTitle?: string;
    articlesTitle?: string;
    b2bTeaserTitle?: string;
    b2bTeaserBullets?: string[];
    b2bTeaserCta?: string;
    advisorTitle?: string;
    advisorText?: string;
    thankyouTitle?: string;
    thankyouText?: string;
  };
}

export interface ApiError {
  error: string; // generic client-facing message (MK)
  correlationId: string;
}

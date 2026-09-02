/**
 * Sidebar modules — grouped and accent-coloured exactly like the handoff admin (moduleDefs).
 * `roles` gates visibility; CLIENT_VIEWER only sees Lead-ови. Accent dots never mix across
 * modules (CLAUDE.md Category 13).
 */
import type { UserRole } from '@filtervoda/shared';

export interface ModuleDef {
  to: string;
  label: string;
  dot: string; // accent
  group: string;
  roles?: UserRole[]; // undefined = all authenticated
  end?: boolean;
}

const ALL: UserRole[] = ['ADMIN', 'EDITOR', 'CLIENT_VIEWER'];
const EDITORS: UserRole[] = ['ADMIN', 'EDITOR'];
const ADMIN: UserRole[] = ['ADMIN'];

export const MODULES: ModuleDef[] = [
  { to: '/', label: 'Dashboard', dot: 'var(--color-accent-settings)', group: 'ПРЕГЛЕД', roles: EDITORS, end: true },
  { to: '/leads', label: 'Lead-ови', dot: 'var(--color-accent-leads)', group: 'ПРОДАЖБА', roles: ALL },
  { to: '/products', label: 'Производи', dot: 'var(--color-accent-products)', group: 'СОДРЖИНА', roles: EDITORS },
  { to: '/categories', label: 'Категории', dot: 'var(--color-accent-products)', group: 'СОДРЖИНА', roles: EDITORS },
  { to: '/content', label: 'Страници и копи', dot: 'var(--color-accent-blog)', group: 'СОДРЖИНА', roles: EDITORS },
  { to: '/posts', label: 'Совети', dot: 'var(--color-accent-blog)', group: 'СОДРЖИНА', roles: EDITORS },
  { to: '/faq', label: 'ЧПП', dot: 'var(--color-accent-blog)', group: 'СОДРЖИНА', roles: EDITORS },
  { to: '/b2b', label: 'За фирми', dot: 'var(--color-accent-b2b)', group: 'B2B', roles: EDITORS },
  { to: '/testimonials', label: 'Искуства', dot: 'var(--color-accent-b2b)', group: 'B2B', roles: EDITORS },
  { to: '/nav', label: 'Навигација и футер', dot: 'var(--color-accent-layout)', group: 'ИЗГЛЕД', roles: EDITORS },
  { to: '/templates', label: 'Дизајн и темплејти', dot: 'var(--color-accent-layout)', group: 'ИЗГЛЕД', roles: EDITORS },
  { to: '/media', label: 'Медиуми', dot: 'var(--color-accent-media)', group: 'ИЗГЛЕД', roles: EDITORS },
  { to: '/tracking', label: 'Tracking и интеграции', dot: 'var(--color-accent-outbox)', group: 'МЕРЕЊЕ', roles: EDITORS },
  { to: '/seo', label: 'SEO', dot: 'var(--color-accent-outbox)', group: 'МЕРЕЊЕ', roles: EDITORS },
  { to: '/redirects', label: 'Редирекции', dot: 'var(--color-accent-outbox)', group: 'МЕРЕЊЕ', roles: EDITORS },
  { to: '/settings', label: 'Поставки', dot: 'var(--color-accent-settings)', group: 'СИСТЕМ', roles: EDITORS },
  { to: '/users', label: 'Корисници', dot: 'var(--color-accent-settings)', group: 'СИСТЕМ', roles: ADMIN },
  { to: '/outbox', label: 'Проблеми со испорака', dot: 'var(--color-accent-outbox)', group: 'СИСТЕМ', roles: EDITORS },
  { to: '/audit', label: 'Audit лог', dot: 'var(--color-accent-settings)', group: 'СИСТЕМ', roles: EDITORS },
];

export function visibleModules(role: UserRole): ModuleDef[] {
  return MODULES.filter((m) => !m.roles || m.roles.includes(role));
}

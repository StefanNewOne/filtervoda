/**
 * Conventional Commits config — filtervoda.mk (CLAUDE.md Category 1).
 * Scopes mirror the constitution; keep in sync with CLAUDE.md.
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'api',
        'web',
        'admin',
        'shared',
        'db',
        'infra',
        'docs',
        'auth',
        'products',
        'catalog',
        'leads',
        'b2b',
        'calculator',
        'blog',
        'media',
        'seo',
        'redirects',
        'tracking',
        'email',
        'cron',
        'settings',
        'templates',
      ],
    ],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'header-max-length': [2, 'always', 100],
  },
};

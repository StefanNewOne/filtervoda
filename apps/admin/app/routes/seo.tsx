import { SettingsGroup } from '../components/SettingsGroup';

export default function Seo() {
  return (
    <SettingsGroup
      title="SEO"
      subtitle="Мета податоци, default шаблони и Search Console"
      fields={[
        { key: 'seo.defaultTitle', label: 'Default title шаблон', hint: 'пр. {page} — filtervoda.mk' },
        { key: 'seo.defaultDescription', label: 'Default опис', type: 'textarea' },
        { key: 'seo.searchConsole', label: 'Search Console верификација (meta tag)' },
      ]}
    />
  );
}

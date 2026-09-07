import { SettingsGroup } from '../components/SettingsGroup';

export default function Content() {
  return (
    <SettingsGroup
      title="Страници и копи"
      subtitle="Секој текст на сајтот — hero, секции, правни страници"
      fields={[
        { key: 'content.hero.h1', label: 'Почетна — наслов (H1)', hint: 'Празно = стандарден текст' },
        { key: 'content.hero.h2', label: 'Почетна — поднаслов', type: 'textarea' },
        { key: 'content.hero.cta', label: 'Почетна — CTA копче' },
        { key: 'content.why.title', label: 'Почетна — наслов „Зошто филтрирана вода?"' },
        { key: 'content.featured.title', label: 'Почетна — наслов „Најбарани системи"' },
        { key: 'content.stages.title', label: 'Почетна — наслов „Како функционира"' },
        { key: 'content.testimonials.title', label: 'Почетна — наслов „Што велат клиентите"' },
        { key: 'content.articles.title', label: 'Почетна — наслов „Совети"' },
        { key: 'content.advisor.title', label: 'Советник — наслов' },
        { key: 'content.advisor.text', label: 'Советник — текст', type: 'textarea' },
        { key: 'content.thankyou.title', label: 'Благодариме — наслов' },
        { key: 'content.thankyou.text', label: 'Благодариме — текст', type: 'textarea' },
      ]}
    />
  );
}

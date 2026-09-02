import { SettingsGroup } from '../components/SettingsGroup';

export default function Nav() {
  return (
    <SettingsGroup
      title="Навигација и футер"
      subtitle="Контакти, социјални мрежи, работно време и sticky лента"
      fields={[
        { key: 'contact.phones', label: 'Телефони', type: 'list', hint: 'одделено со запирки' },
        { key: 'contact.viber', label: 'Viber број' },
        { key: 'contact.emails', label: 'Email адреси', type: 'list' },
        { key: 'contact.address', label: 'Адреса' },
        { key: 'contact.workingHours', label: 'Работно време' },
      ]}
    />
  );
}

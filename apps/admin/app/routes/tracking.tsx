import { SettingsGroup } from '../components/SettingsGroup';

export default function Tracking() {
  return (
    <SettingsGroup
      title="Tracking и интеграции"
      subtitle="GTM, GA4, Meta Pixel + Conversions API, Consent Mode v2"
      fields={[
        { key: 'tracking.gtmId', label: 'GTM Container ID', hint: 'пр. GTM-XXXXXX' },
        { key: 'tracking.ga4Id', label: 'GA4 Measurement ID', hint: 'пр. G-XXXXXXX' },
        { key: 'tracking.metaPixelId', label: 'Meta Pixel ID', hint: 'постоечки: 1957593378149639' },
        { key: 'cookie.bannerText', label: 'Текст на банерот за колачиња', type: 'textarea' },
      ]}
    />
  );
}
